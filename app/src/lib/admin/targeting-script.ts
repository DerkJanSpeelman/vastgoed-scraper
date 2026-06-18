export function getTargetingScript(): string {
  return `
(function() {
  var activeFieldKey = null;
  var highlighted = null;

  function xpathSelector(el) {
    if (el.id) return '//*[@id="' + el.id + '"]';
    var tag = el.tagName.toLowerCase();
    var classes = Array.from(el.classList).filter(function(c) { return !/^js-/.test(c); });
    if (classes.length > 0) {
      return '//' + tag + '[contains(@class, "' + classes[0] + '")]';
    }
    var parts = [];
    var current = el;
    for (var i = 0; i < 4 && current && current !== document.body; i++) {
      var t = current.tagName.toLowerCase();
      if (current.id) { parts.unshift('//*[@id="' + current.id + '"]'); break; }
      var cls = Array.from(current.classList).filter(function(c) { return !/^js-/.test(c); });
      parts.unshift(cls.length ? t + '[contains(@class, "' + cls[0] + '")]' : t);
      current = current.parentElement;
    }
    return '//' + parts.join('/');
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
    var selector = xpathSelector(e.target);
    window.parent.postMessage({ type: 'element-selected', fieldKey: activeFieldKey, selector: selector }, '*');
    clearHighlight();
    activeFieldKey = null;
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('click', onClick, true);
  }

  function extractValue(el, attribute) {
    if (!el) return '';
    if (el.nodeType === 2) return el.value || '';
    if (el.nodeType === 3) return (el.nodeValue || '').trim();
    if (attribute === 'text') return (el.textContent || '').trim();
    if (attribute === 'outerHTML') {
      var tag = el.cloneNode(false);
      return tag.outerHTML || '';
    }
    if (el.getAttribute) return el.getAttribute(attribute) || '';
    return '';
  }

  window.addEventListener('message', function(e) {
    if (!e.data) return;

    if (e.data.type === 'enable-targeting') {
      activeFieldKey = e.data.fieldKey;
      document.addEventListener('mouseover', onMouseOver);
      document.addEventListener('click', onClick, true);
      return;
    }

    if (e.data.type === 'disable-targeting') {
      clearHighlight();
      activeFieldKey = null;
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('click', onClick, true);
      return;
    }

    if (e.data.type === 'evaluate-selector') {
      var selector = e.data.selector;
      var attribute = e.data.attribute;
      var fieldKey = e.data.fieldKey;
      var values = [];
      var count = 0;
      try {
        var scopeEls = [];
        if (e.data.scopeSelector) {
          var sr = document.evaluate(e.data.scopeSelector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          for (var i = 0; i < sr.snapshotLength; i++) scopeEls.push(sr.snapshotItem(i));
        } else {
          scopeEls = [document];
        }
        for (var si = 0; si < scopeEls.length; si++) {
          var scope = scopeEls[si];
          var scopedSelector = (e.data.scopeSelector && scope !== document && selector.startsWith('//')) ? '.' + selector : selector;
          var xr = document.evaluate(scopedSelector, scope, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          count += xr.snapshotLength;
          for (var xi = 0; xi < xr.snapshotLength && values.length < 10; xi++) values.push(extractValue(xr.snapshotItem(xi), attribute));
        }
      } catch (_) {}
      window.parent.postMessage({ type: 'selector-result', fieldKey: fieldKey, values: values, count: count }, '*');
    }
  });
})();
`;
}
