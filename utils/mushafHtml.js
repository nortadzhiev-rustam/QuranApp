/**
 * Builds the mushaf page as HTML for the reader's WebView.
 *
 * Native flex layout cannot justify a line: `space-between` spreads word gaps
 * but cannot stretch a line that is too long, so lines clipped. CSS can - a
 * block with `text-align-last: justify` fills the column exactly the way the
 * printed page does, and the DOM can measure a line reliably to scale the few
 * that still overflow. That justification is what puts لفظ الجلالة in a column.
 */

import { applyTajweedRules } from '@/utils/tajweed';
import {
  applyTajweedWithTawafuq,
  applyTawafuq,
  ALLAH_COLOR,
} from '@/utils/tawafuq';
import { sliceSegmentsByWord } from '@/utils/mushafLayout';

const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const toArabicNumerals = (number) =>
  number
    .toString()
    .split('')
    .map((digit) => ARABIC_NUMERALS[Number.parseInt(digit, 10)])
    .join('');

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Colour segments for a whole line, mirroring TajweedText's rule selection. */
const segmentsForLine = (text, tajweedEnabled, tawafuqEnabled) => {
  if (!text || (!tajweedEnabled && !tawafuqEnabled)) {
    return null;
  }
  if (tajweedEnabled && tawafuqEnabled) {
    return applyTajweedWithTawafuq(text, applyTajweedRules);
  }
  if (tawafuqEnabled) {
    return applyTawafuq(text).map((seg) => ({
      text: seg.text,
      color: null,
      isAllah: seg.isAllah,
    }));
  }
  return applyTajweedRules(text).map((seg) => ({ ...seg, isAllah: false }));
};

const wordHtml = (word, pieces) => {
  const attrs = `class="w" data-a="${word.ayahId}"`;

  if (!pieces || !pieces.length) {
    return `<span ${attrs}>${escapeHtml(word.text)}</span>`;
  }

  const inner = pieces
    .map((piece) => {
      const colour = piece.isAllah ? ALLAH_COLOR : piece.color;
      const text = escapeHtml(piece.text);
      return colour ? `<span style="color:${colour}">${text}</span>` : text;
    })
    .join('');

  return `<span ${attrs}>${inner}</span>`;
};

const lineHtml = (line, options) => {
  const { tajweedEnabled, tawafuqEnabled } = options;
  const text = line.words.map((w) => w.text).join(' ');
  const segments = segmentsForLine(text, tajweedEnabled, tawafuqEnabled);
  const perWord = segments ? sliceSegmentsByWord(segments, line.words) : null;

  const body = line.words
    .map((word, index) => {
      const span = wordHtml(word, perWord?.[index]);
      if (!word.endsAyah) {
        return span;
      }
      // The ayah number is part of the line and takes part in justification.
      return `${span} <span class="n">${toArabicNumerals(word.ayahId)}</span>`;
    })
    .join(' ');

  const cls = options.centred ? 'line center' : 'line';

  return (
    `<div class="${cls}" ` +
    `data-p="${line.page}" data-l="${line.line}" ` +
    `data-a="${line.words[0]?.ayahId ?? ''}">${body}</div>`
  );
};

/**
 * The page script does two things the native side could not: it measures each
 * line against the column and scales down only those that overflow, and it
 * reports the topmost visible line back so the reader can track position.
 */
const PAGE_SCRIPT = `
(function () {
  var post = function (msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  };

  function fit() {
    var t0 = window.performance ? performance.now() : 0;
    var lines = document.getElementsByClassName('line');
    var n = lines.length;
    var i;

    // Writes and reads are kept in separate passes. Interleaving them forces a
    // synchronous reflow per line, which on a 700-line surah is thousands of
    // layouts and takes seconds.
    for (i = 0; i < n; i++) {
      // Always measure from the stylesheet size: fit() may run twice and must
      // not compound its own shrinking.
      lines[i].style.fontSize = '';
      lines[i].style.whiteSpace = 'nowrap';
      lines[i].style.textAlignLast = 'initial';
    }

    var natural = new Array(n);
    var avail = new Array(n);
    for (i = 0; i < n; i++) {
      // The line's own content box is the target - #root's clientWidth would
      // include its padding and let lines overflow by that much.
      natural[i] = lines[i].scrollWidth;
      avail[i] = lines[i].clientWidth;
    }

    for (i = 0; i < n; i++) {
      lines[i].style.whiteSpace = '';
      lines[i].style.textAlignLast = '';
    }

    var shrunk = 0;
    var base = parseFloat(window.getComputedStyle(lines[0]).fontSize);
    for (i = 0; i < n; i++) {
      // scrollWidth is rounded to whole pixels, so a line needing 369.4px in a
      // 369px box reports as fitting and then wraps. Treat anything within a
      // pixel of the edge as overflowing.
      if (avail[i] > 0 && natural[i] > avail[i] - 1) {
        lines[i].style.fontSize =
          (base * (avail[i] / natural[i]) * 0.985).toFixed(2) + 'px';
        shrunk++;
      }
    }
    var veil = document.getElementById('loading');
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    window.__fitMs = window.performance ? Math.round(performance.now() - t0) : -1;
    post({ type: 'ready', shrunk: shrunk, total: n, ms: window.__fitMs });
  }

  // Measuring before the embedded face is actually in use gives fallback-font
  // widths, every line looks like it fits, and nothing is shrunk - then the
  // real font arrives and they all wrap. So force the load, then re-measure a
  // few times; fit() is idempotent.
  var fitted = false;
  function schedule() {
    if (fitted) return;
    fitted = true;
    fit();
  }

  if (document.fonts && document.fonts.load) {
    document.fonts
      .load('26px UthmanicHafs')
      .then(schedule)
      .catch(schedule);
  } else {
    schedule();
  }
  // Safety net if the font promise never settles.
  setTimeout(schedule, 1200);

  // Long press on a word selects its ayah, matching the native reader.
  var timer = null;
  var pressed = null;
  document.addEventListener('touchstart', function (e) {
    var el = e.target.closest ? e.target.closest('.w') : null;
    if (!el) return;
    pressed = el.getAttribute('data-a');
    timer = setTimeout(function () {
      timer = null;
      post({ type: 'longpress', ayah: Number(pressed) });
    }, 450);
  }, { passive: true });

  var cancel = function () {
    if (timer) { clearTimeout(timer); timer = null; }
  };
  document.addEventListener('touchend', cancel, { passive: true });
  document.addEventListener('touchmove', cancel, { passive: true });

  // Report the topmost visible line so the juz/hizb/page bar can follow.
  var last = null;
  var report = function () {
    var lines = document.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
      var box = lines[i].getBoundingClientRect();
      if (box.bottom > 0) {
        var key = lines[i].getAttribute('data-p') + ':' + lines[i].getAttribute('data-a');
        if (key !== last) {
          last = key;
          post({
            type: 'visible',
            page: Number(lines[i].getAttribute('data-p')),
            ayah: Number(lines[i].getAttribute('data-a')),
          });
        }
        return;
      }
    }
  };
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; report(); });
  }, { passive: true });

  window.setBookmarks = function (ayahs) {
    var marked = {};
    for (var i = 0; i < ayahs.length; i++) marked[ayahs[i]] = true;
    var words = document.getElementsByClassName('w');
    for (var j = 0; j < words.length; j++) {
      var on = marked[words[j].getAttribute('data-a')];
      words[j].classList.toggle('bk', !!on);
    }
  };

  window.scrollToAyah = function (ayah) {
    var lines = document.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
      if (Number(lines[i].getAttribute('data-a')) >= ayah) {
        lines[i].scrollIntoView({ block: 'start' });
        return;
      }
    }
  };
})();
`;

export const buildMushafHtml = ({
  lines,
  fontSize,
  lineHeight,
  colors,
  tajweedEnabled,
  tawafuqEnabled,
  fontBase64,
  header,
}) => {
  const headerHtml = header
    ? `<div class="banner" style="background-image:url(data:image/jpeg;base64,${header.bannerBase64})">` +
      `<div class="bname">سُورَةٌ ${escapeHtml(header.nameArabic || '')}</div>` +
      `<div class="btype">${header.type === 'meccan' ? 'مَكِّيَّاتٌ' : 'مَدَنِيَّاتٌ'}</div>` +
      `</div>` +
      (header.showBismillah ? `<div class="bism">\uFDFD</div>` : '')
    : '';

  const body = lines
    .map((line, index) =>
      lineHtml(line, {
        tajweedEnabled,
        tawafuqEnabled,
        // Only genuinely short lines are centred: the end of the surah, and
        // the end of the mushaf's opening pages. Everything else is justified
        // across the full column width.
        centred:
          index === lines.length - 1 ||
          (line.page <= 2 && lines[index + 1]?.page !== line.page),
      }),
    )
    .join('');

  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
@font-face{font-family:UthmanicHafs;src:url(data:font/woff2;base64,${fontBase64}) format('woff2');font-display:block}
html,body{margin:0;padding:0;background:${colors.background};color:${colors.text};-webkit-text-size-adjust:100%;-webkit-user-select:none;user-select:none}
#root{padding:0 12px 120px}
.line{font-family:UthmanicHafs,serif;font-size:${fontSize}px;line-height:${lineHeight}px;text-align:justify;-webkit-text-align-last:justify;text-align-last:justify;overflow:hidden}
.line.center{text-align:center;-webkit-text-align-last:center;text-align-last:center}
.bk{color:${colors.brand}}
.banner{margin:0 -12px 10px;height:104px;background-size:cover;background-position:center;display:flex;flex-direction:column;align-items:center;justify-content:center;color:${colors.surahName || '#fff'}}
.bname,.btype{font-family:UthmanicHafs,serif;line-height:1.35}
.bname{font-size:${Math.round(fontSize * 1.05)}px}
.btype{font-size:${Math.round(fontSize * 0.8)}px}
#loading{position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:${colors.background};z-index:9}
#loading i{width:34px;height:34px;border-radius:50%;border:3px solid ${colors.brand}33;border-top-color:${colors.brand};animation:spin .8s linear infinite;display:block}
@keyframes spin{to{transform:rotate(360deg)}}
.bism{font-family:UthmanicHafs,serif;text-align:center;color:${colors.brand};font-size:${Math.round(fontSize * 1.5)}px;line-height:1.6;margin:0 0 6px}
.n{color:${colors.text}}
</style></head><body>
<div id="loading"><i></i></div>\n<div id="root">${headerHtml}${body}</div>
<script>${PAGE_SCRIPT}</script>
</body></html>`;
};
