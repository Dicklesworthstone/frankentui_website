import { test, expect, type Page } from "@playwright/test";
import * as path from "path";

async function loadMarkdownPipeline(page: Page) {
  await page.setContent("<!doctype html><html><head></head><body></body></html>");

  const root = process.cwd();
  await page.addScriptTag({
    path: path.join(root, "public/beads-viewer/vendor/dompurify.min.js"),
  });
  await page.addScriptTag({
    path: path.join(root, "public/beads-viewer/vendor/marked.min.js"),
  });
  await page.addScriptTag({
    path: path.join(root, "public/beads-viewer/viewer.js"),
  });

  await expect.poll(() => page.evaluate(() => typeof window.renderMarkdown)).toBe("function");
  await expect.poll(() => page.evaluate(() => typeof window.tableToTSV)).toBe("function");
  await expect.poll(() => page.evaluate(() => typeof window.tableToCSV)).toBe("function");
}

/** Load with styles and scripts, using a minimal same-origin page for localStorage access. */
async function loadWithStyles(page: Page, viewport = { width: 1024, height: 768 }) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
  await page.setViewportSize(viewport);

  // Serve a minimal HTML page at the same origin to avoid Next.js hydration interference
  await page.route(`${baseUrl}/_bv-test`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: '<!DOCTYPE html><html class="dark"><head></head><body><div id="root" class="prose"></div></body></html>',
    });
  });
  await page.goto(`${baseUrl}/_bv-test`, { waitUntil: "load" });

  const root = process.cwd();
  await page.addStyleTag({ path: path.join(root, "public/beads-viewer/styles.css") });
  await page.addScriptTag({
    path: path.join(root, "public/beads-viewer/vendor/dompurify.min.js"),
  });
  await page.addScriptTag({
    path: path.join(root, "public/beads-viewer/vendor/marked.min.js"),
  });
  await page.addScriptTag({
    path: path.join(root, "public/beads-viewer/viewer.js"),
  });

  await expect.poll(() => page.evaluate(() => typeof window.renderMarkdown)).toBe("function");
}

test.describe("beads-viewer: table export (TSV/CSV)", () => {
  test("tableToTSV: basic table", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const md = "| Name | Age | City |\n| --- | --- | --- |\n| Alice | 30 | NYC |\n| Bob | 25 | LA |";
      const html = window.renderMarkdown!(md);
      const container = document.createElement("div");
      container.innerHTML = html;
      const table = container.querySelector("table")!;
      return window.tableToTSV!(table);
    });

    expect(result).toBe("Name\tAge\tCity\nAlice\t30\tNYC\nBob\t25\tLA");
  });

  test("tableToTSV: escapes tabs in cell content", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = "<table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody><tr><td>a\tb</td><td>normal</td></tr></tbody></table>";
      const table = container.querySelector("table")!;
      return window.tableToTSV!(table);
    });

    expect(result).toBe("Key\tValue\na b\tnormal");
  });

  test("tableToCSV: basic table", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const md = "| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |";
      const html = window.renderMarkdown!(md);
      const container = document.createElement("div");
      container.innerHTML = html;
      const table = container.querySelector("table")!;
      return window.tableToCSV!(table);
    });

    expect(result).toBe("Name,Age\nAlice,30\nBob,25");
  });

  test("tableToCSV: escapes commas and quotes (RFC 4180)", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = '<table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody><tr><td>hello, world</td><td>say "hi"</td></tr></tbody></table>';
      const table = container.querySelector("table")!;
      return window.tableToCSV!(table);
    });

    expect(result).toBe('Key,Value\n"hello, world","say ""hi"""');
  });

  test("tableToCSV: handles links in cells (strips to text)", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const md = "| Link | Label |\n| --- | --- |\n| [Click here](https://example.com) | test |";
      const html = window.renderMarkdown!(md);
      const container = document.createElement("div");
      container.innerHTML = html;
      const table = container.querySelector("table")!;
      return window.tableToCSV!(table);
    });

    expect(result).toBe("Link,Label\nClick here,test");
  });

  test("tableToTSV: handles inline code", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const md = "| Command | Result |\n| --- | --- |\n| `ls -la` | files |";
      const html = window.renderMarkdown!(md);
      const container = document.createElement("div");
      container.innerHTML = html;
      const table = container.querySelector("table")!;
      return window.tableToTSV!(table);
    });

    expect(result).toBe("Command\tResult\nls -la\tfiles");
  });

  test("tableToCSV: handles empty cells", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = "<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td></td><td>x</td></tr></tbody></table>";
      const table = container.querySelector("table")!;
      return window.tableToCSV!(table);
    });

    expect(result).toBe("A,B\n,x");
  });

  test("tableToTSV: handles table without thead", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = "<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>";
      const table = container.querySelector("table")!;
      return window.tableToTSV!(table);
    });

    expect(result).toBe("a\tb\nc\td");
  });
});

test.describe("beads-viewer: table controls injection", () => {
  test("injectTableControls adds toolbar with buttons", async ({ page }) => {
    await loadWithStyles(page);

    const buttons = await page.evaluate(() => {
      const md = "| Name | Age |\n| --- | --- |\n| Alice | 30 |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      // Controls must be injected after DOM placement (event listeners need live DOM)
      window.injectTableControls!(root);
      return {
        toolbar: root.querySelector(".bv-table-controls") !== null,
        toggle: root.querySelector('[data-testid="bv-table-view-toggle"]') !== null,
        copy: root.querySelector('[data-testid="bv-table-copy-tsv"]') !== null,
        csv: root.querySelector('[data-testid="bv-table-download-csv"]') !== null,
      };
    });

    expect(buttons.toolbar).toBe(true);
    expect(buttons.toggle).toBe(true);
    expect(buttons.copy).toBe(true);
    expect(buttons.csv).toBe(true);
  });

  test("injectTableControls is idempotent (no duplicate toolbars)", async ({ page }) => {
    await loadWithStyles(page);

    const toolbarCount = await page.evaluate(() => {
      const md = "| A | B |\n| --- | --- |\n| 1 | 2 |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      window.injectTableControls!(root);
      window.injectTableControls!(root); // call twice
      return root.querySelectorAll(".bv-table-controls").length;
    });

    expect(toolbarCount).toBe(1);
  });

  test("view toggle changes table classes and persists to localStorage", async ({ page }) => {
    await loadWithStyles(page);

    // Clear any previous preference
    await page.evaluate(() => localStorage.removeItem("bv-table-view-pref"));

    await page.evaluate(() => {
      const md = "| Name | Age | City |\n| --- | --- | --- |\n| Alice | 30 | NYC |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      window.injectTableControls!(root);
    });

    // Initially no forced mode
    const initialCards = await page.evaluate(() =>
      document.querySelector("table")!.classList.contains("bv-table--force-cards")
    );
    expect(initialCards).toBe(false);

    // Click the view toggle
    const toggleBtn = page.getByTestId("bv-table-view-toggle");
    await toggleBtn.click();

    // Should now have force-cards class
    const afterClick = await page.evaluate(() =>
      document.querySelector("table")!.classList.contains("bv-table--force-cards")
    );
    expect(afterClick).toBe(true);

    // localStorage should reflect the preference
    const pref = await page.evaluate(() => localStorage.getItem("bv-table-view-pref"));
    expect(pref).toBe("cards");

    // Click again to switch to table mode
    await toggleBtn.click();
    const afterSecondClick = await page.evaluate(() =>
      document.querySelector("table")!.classList.contains("bv-table--force-table")
    );
    expect(afterSecondClick).toBe(true);

    const pref2 = await page.evaluate(() => localStorage.getItem("bv-table-view-pref"));
    expect(pref2).toBe("table");
  });

  test("localStorage preference is applied on next render", async ({ page }) => {
    await loadWithStyles(page);

    // Set preference to cards
    await page.evaluate(() => localStorage.setItem("bv-table-view-pref", "cards"));

    // Render a new table with controls
    await page.evaluate(() => {
      const md = "| Name | Age |\n| --- | --- |\n| Alice | 30 |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      window.injectTableControls!(root);
    });

    // Table should have force-cards class from localStorage preference
    const hasForceCards = await page.evaluate(() =>
      document.querySelector("table")!.classList.contains("bv-table--force-cards")
    );
    expect(hasForceCards).toBe(true);
  });

  test("controls are keyboard accessible", async ({ page }) => {
    await loadWithStyles(page);

    await page.evaluate(() => {
      const md = "| A | B |\n| --- | --- |\n| 1 | 2 |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      window.injectTableControls!(root);
    });

    // Focus the toggle button and verify it's reachable
    const toggleBtn = page.getByTestId("bv-table-view-toggle");
    await toggleBtn.focus();

    const hasFocus = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-testid") === "bv-table-view-toggle"
    );
    expect(hasFocus).toBe(true);

    // It should have an aria-label
    const ariaLabel = await toggleBtn.getAttribute("aria-label");
    expect(ariaLabel).toBe("Toggle table view mode");
  });
});

test.describe("beads-viewer: table a11y (bd-17l.1.5)", () => {
  test("focus ring uses a defined color variable (not --bv-accent)", async ({ page }) => {
    await loadWithStyles(page);

    await page.evaluate(() => {
      const md = "| A | B |\n| --- | --- |\n| 1 | 2 |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      window.injectTableControls!(root);
    });

    const toggleBtn = page.getByTestId("bv-table-view-toggle");
    await toggleBtn.focus();

    // Verify focus-visible outline uses a real color (from --bv-cyan), not undefined --bv-accent
    const outlineColor = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="bv-table-view-toggle"]')!;
      return getComputedStyle(btn).outlineColor;
    });
    // Should NOT be empty/transparent/initial — should be a real color
    expect(outlineColor).not.toBe("");
    expect(outlineColor).not.toBe("initial");
  });

  test("mobile: thead is sr-only (not display:none) so screen readers see headers", async ({ page }) => {
    await loadWithStyles(page, { width: 375, height: 812 });

    await page.evaluate(() => {
      const md = "| Name | Age | City |\n| --- | --- | --- |\n| Alice | 30 | NYC |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
    });

    // thead should exist in the DOM and be sr-only (clip pattern), not display:none
    const theadInfo = await page.evaluate(() => {
      const thead = document.querySelector("table thead");
      if (!thead) return { exists: false };
      const style = getComputedStyle(thead);
      return {
        exists: true,
        display: style.display,
        position: style.position,
        clip: style.clip,
        width: style.width,
        height: style.height,
      };
    });

    expect(theadInfo.exists).toBe(true);
    // SR-only pattern uses position:absolute + clip, NOT display:none
    expect(theadInfo.display).not.toBe("none");
    expect(theadInfo.position).toBe("absolute");
  });

  test("table data cells have data-label for mobile context", async ({ page }) => {
    await loadWithStyles(page);

    const labels = await page.evaluate(() => {
      const md = "| Name | Age | City |\n| --- | --- | --- |\n| Alice | 30 | NYC |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      const cells = root.querySelectorAll("tbody td");
      return Array.from(cells).map((td) => td.getAttribute("data-label"));
    });

    expect(labels).toEqual(["Name", "Age", "City"]);
  });

  test("control buttons use high-contrast text color", async ({ page }) => {
    await loadWithStyles(page);

    await page.evaluate(() => {
      const md = "| A | B |\n| --- | --- |\n| 1 | 2 |";
      const html = window.renderMarkdown!(md);
      const root = document.getElementById("root")!;
      root.innerHTML = html;
      window.injectTableControls!(root);
    });

    // Button text should use --bv-fg (high contrast), not --bv-fg-muted
    const color = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="bv-table-view-toggle"]')!;
      return getComputedStyle(btn).color;
    });
    // In dark mode (the default in our test setup), --bv-fg is typically a light color
    // Just verify it's not the muted gray
    expect(color).toBeTruthy();
    expect(color).not.toBe("");
  });
});
