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
        : document.getElementById(source).value || document.getElementById(source).textContent;
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
