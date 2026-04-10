/**
 * Shared utility functions for tool pages.
 * Loaded on tool pages to avoid duplicating copy/paste button logic.
 */

/**
 * Attach a copy-to-clipboard handler to a button.
 * @param {string} btnId - Button element ID
 * @param {string|function} source - Element ID to copy from, or a function returning text
 * @param {string} [label] - Button label to restore after "Copied!" (default: icon + " Copy")
 */
function attachCopyBtn(btnId, source, label) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  var defaultLabel = label || btn.innerHTML;
  btn.addEventListener("click", function () {
    var text =
      typeof source === "function"
        ? source()
        : document.getElementById(source).value || document.getElementById(source).textContent;
    navigator.clipboard.writeText(text).then(function () {
      btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
      setTimeout(function () {
        btn.innerHTML = defaultLabel;
      }, 2000);
    });
  });
}

/**
 * Attach a paste-from-clipboard handler to a button.
 * @param {string} btnId - Button element ID
 * @param {string} targetId - Element ID to paste into
 */
function attachPasteBtn(btnId, targetId) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", function () {
    navigator.clipboard.readText().then(function (text) {
      document.getElementById(targetId).value = text;
    });
  });
}
