/**
 * Shared utility functions for tool pages.
 * Loaded on tool pages to avoid duplicating copy/paste button logic.
 */

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} s - Raw string
 * @returns {string} Escaped string safe for innerHTML
 */
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Hide error and success message boxes.
 * Expects elements with IDs "errorBox" and "successBox" (both optional).
 */
function hideMessages() {
  const errorBox = document.getElementById("errorBox");
  const successBox = document.getElementById("successBox");
  if (errorBox) errorBox.style.display = "none";
  if (successBox) successBox.style.display = "none";
}

/**
 * Show an error message in the standard error alert box.
 * @param {string} msg - Error message text
 */
function showError(msg) {
  hideMessages();
  const errorBox = document.getElementById("errorBox");
  const errorMsg = document.getElementById("errorMsg");
  if (errorMsg) errorMsg.textContent = msg;
  if (errorBox) errorBox.style.display = "block";
}

/**
 * Show a success message in the standard success alert box.
 * @param {string} msg - Success message text
 */
function showSuccess(msg) {
  hideMessages();
  const successBox = document.getElementById("successBox");
  const successMsg = document.getElementById("successMsg");
  if (successMsg) successMsg.textContent = msg;
  if (successBox) successBox.style.display = "block";
}

/**
 * Syntax-highlight a JSON string with span wrappers for CSS theming.
 * @param {string} json - JSON string to highlight
 * @returns {string} HTML with .json-key, .json-string, .json-number, .json-boolean, .json-null spans
 */
function syntaxHighlight(json) {
  json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    function (match) {
      let cls = "json-number";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "json-key" : "json-string";
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

/**
 * Attach a copy-to-clipboard handler to a button.
 * @param {string} btnId - Button element ID
 * @param {string|function} source - Element ID to copy from, or a function returning text
 * @param {string} [label] - Button label to restore after feedback (default: current innerHTML)
 */
function attachCopyBtn(btnId, source, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const defaultLabel = label || btn.innerHTML;
  btn.addEventListener("click", () => {
    const text =
      typeof source === "function"
        ? source()
        : document.getElementById(source)?.value || document.getElementById(source)?.textContent;
    navigator.clipboard.writeText(text).then(
      () => {
        btn.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i> Copied!';
        setTimeout(() => {
          btn.innerHTML = defaultLabel;
        }, 2000);
      },
      () => {
        btn.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i> Failed';
        setTimeout(() => {
          btn.innerHTML = defaultLabel;
        }, 2000);
      }
    );
  });
}

/**
 * Attach a paste-from-clipboard handler to a button.
 * @param {string} btnId - Button element ID
 * @param {string} targetId - Element ID to paste into
 */
function attachPasteBtn(btnId, targetId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const defaultLabel = btn.innerHTML;
  btn.addEventListener("click", () => {
    navigator.clipboard.readText().then(
      (text) => {
        document.getElementById(targetId).value = text;
      },
      () => {
        btn.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i> Denied';
        setTimeout(() => {
          btn.innerHTML = defaultLabel;
        }, 2000);
      }
    );
  });
}
