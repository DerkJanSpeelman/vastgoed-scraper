export function getTargetingScript(): string {
  return `
(function() {
  var activeFieldKey = null;
  var highlighted = null;

  function cssSelector(el) {
    var parts = [];
    var current = el;
    for (var i = 0; i < 4 && current && current !== document.body; i++) {
      var tag = current.tagName.toLowerCase();
      if (current.id) {
        parts.unshift('#' + current.id);
        break;
      }
      var cls = Array.from(current.classList).filter(function(c) { return !/^js-/.test(c); }).slice(0, 2).join('.');
      parts.unshift(cls ? tag + '.' + cls : tag);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  function clearHighlight() {
    if (highlighted) {
      highlighted.style.outline = '';
      highlighted.style.cursor = '';
      highlighted = null;
    }
  }

  function onMouseOver(e) {
    if (!activeFieldKey) return;
    clearHighlight();
    e.target.style.outline = '2px solid #3b82f6';
    e.target.style.cursor = 'crosshair';
    highlighted = e.target;
  }

  function onClick(e) {
    if (!activeFieldKey) return;
    e.preventDefault();
    e.stopPropagation();
    var selector = cssSelector(e.target);
    window.parent.postMessage({ type: 'element-selected', fieldKey: activeFieldKey, selector: selector }, '*');
    clearHighlight();
    activeFieldKey = null;
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('click', onClick, true);
  }

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'enable-targeting') return;
    activeFieldKey = e.data.fieldKey;
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('click', onClick, true);
  });
})();
`;
}
