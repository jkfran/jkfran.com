#!/usr/bin/env node
// CSS dead-code audit — reports unused selectors from our custom SCSS.
//
// Usage: node scripts/audit-css.cjs          (after npm run audit:build-css)
//    or: npm run audit:css                   (builds + audits in one step)
//
// Output: .audit/rejected.css   — full CSS of unused rules
//         stdout                — summary table

const { PurgeCSS } = require("purgecss");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const config = require(path.join(ROOT, "purgecss.config.cjs"));

// Known false positives: selectors that only appear in Jekyll-generated or
// third-party-injected HTML that PurgeCSS can't see in source templates.
const FALSE_POSITIVES = new Set([
  // Markdown content generates these elements (blockquote, iframe, img.shadow)
  "blockquote",
  "iframe",
  ".article-post blockquote",
  ".article-post img.shadow",

  // Pseudo-selectors — PurgeCSS can't detect usage
  ":focus-visible",

  // Rouge syntax highlighter — generated at Jekyll build time
  "td.rouge-code",
  "pre.lineno",

  // Goodreads widget — HTML injected by external async script
  'div[class^="gr_custom_container_"]',
  "div[class^=gr_custom_container_]",
  'div[class^="gr_custom_container_"] > br',
  "div[class^=gr_custom_container_] > br",
  'div[class^="gr_custom_container_"] > center',
  "div[class^=gr_custom_container_] > center",
  'h2[class^="gr_custom_header_"]',
  "h2[class^=gr_custom_header_]",
  'h2[class^="gr_custom_header_"] > a',
  "h2[class^=gr_custom_header_] > a",
  'div[class^="gr_custom_each_container_"]',
  "div[class^=gr_custom_each_container_]",
  'div[class^="gr_custom_book_container_"]',
  "div[class^=gr_custom_book_container_]",
  'div[class^="gr_custom_title_"]',
  "div[class^=gr_custom_title_]",
  'div[class^="gr_custom_author_"]',
  "div[class^=gr_custom_author_]",
  'div[class^="gr_custom_rating_"]',
  "div[class^=gr_custom_rating_]",
  'div[class^="gr_custom_rating_"] img',
  "div[class^=gr_custom_rating_] img",
  'div[class^="gr_custom_review_"]',
  "div[class^=gr_custom_review_]",
]);

async function main() {
  const results = await new PurgeCSS().purge(config);

  let totalRejected = 0;
  let totalFalsePositive = 0;
  let allRejectedCss = "";
  const realFindings = [];

  for (const result of results) {
    const file = path.relative(ROOT, result.file);
    const rejected = result.rejected || [];

    for (const selector of rejected) {
      const trimmed = selector.trim().replace(/\n/g, " ");
      if (FALSE_POSITIVES.has(trimmed)) {
        totalFalsePositive++;
      } else {
        totalRejected++;
        realFindings.push({ file, selector: trimmed });
      }
    }

    if (result.rejectedCss) {
      allRejectedCss += `/* === ${file} === */\n${result.rejectedCss}\n\n`;
    }
  }

  // Write full rejected CSS for manual review
  const outPath = path.join(ROOT, ".audit", "rejected.css");
  fs.writeFileSync(outPath, allRejectedCss);

  // Summary
  console.log("\n=== CSS Dead Code Audit ===\n");

  if (realFindings.length === 0) {
    console.log(
      "No unused selectors found (after filtering %d known false positives).",
      totalFalsePositive
    );
  } else {
    console.log("Potentially unused selectors:\n");
    for (const f of realFindings) {
      console.log("  " + f.file.padEnd(22) + f.selector);
    }
    console.log(
      "\n%d potentially unused  |  %d false positives filtered",
      totalRejected,
      totalFalsePositive
    );
  }

  console.log("\nFull rejected CSS written to .audit/rejected.css");
  console.log(
    "Review false positives list in scripts/audit-css.cjs if results seem wrong.\n"
  );

  process.exit(realFindings.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
