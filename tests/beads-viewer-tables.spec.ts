import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

declare global {
  interface Window {
    renderMarkdown?: (markdown: string) => string;
    enhanceTables?: (root: ParentNode) => void;
  }
}

async function loadMarkdownPipeline(page: Page) {
  // Pure, offline unit-style tests: load the vendored scripts directly from disk.
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
  await expect.poll(() => page.evaluate(() => typeof window.enhanceTables)).toBe("function");
}

async function loadBeadsViewerStyles(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.setContent(
    "<!doctype html><html class='dark'><head></head><body style='margin:0'><div id='root' class='prose'></div></body></html>",
  );
  await page.addStyleTag({ path: path.join(process.cwd(), "public/beads-viewer/styles.css") });
}

test.describe("beads-viewer: markdown table enhancement", () => {
  test("renderMarkdown(): adds data-label + shape class for 3+ col tables", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const md = ["| Alpha | Beta | Gamma |", "|---|---|---|", "| a1 | b1 | c1 |"].join("\n");

      const html = window.renderMarkdown!(md);
      const container = document.createElement("div");
      container.innerHTML = html;
      const table = container.querySelector("table");
      if (!table) return { ok: false, reason: "no table" };

      const tds = Array.from(table.querySelectorAll("tbody td"));
      return {
        ok: true,
        hasMarker: table.getAttribute("data-bv-table") === "1",
        classes: Array.from(table.classList).sort(),
        labels: tds.map((td) => td.getAttribute("data-label")),
      };
    });

    expect(result).toEqual({
      ok: true,
      hasMarker: true,
      classes: expect.arrayContaining(["bv-table", "bv-table--ncol"]),
      labels: ["Alpha", "Beta", "Gamma"],
    });
  });

  test("renderMarkdown(): tags 2-col tables for key/value card styling", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const md = [
        "| Key | Value |",
        "|---|---|",
        "| Name | FrankenTUI |",
        "| Version | 0.1.1 |",
      ].join("\n");

      const html = window.renderMarkdown!(md);
      const container = document.createElement("div");
      container.innerHTML = html;
      const table = container.querySelector("table");
      if (!table) return { ok: false, reason: "no table" };

      const tds = Array.from(table.querySelectorAll("tbody td"));
      return {
        ok: true,
        has2Col: table.classList.contains("bv-table--2col"),
        labels: tds.map((td) => td.getAttribute("data-label")),
        values: tds.map((td) => (td.textContent || "").trim()),
      };
    });

    expect(result.ok).toBe(true);
    expect(result.has2Col).toBe(true);
    // Labels align with headers.
    expect(result.labels?.slice(0, 2)).toEqual(["Key", "Value"]);
    // Basic sanity: row data preserved.
    expect(result.values).toEqual(["Name", "FrankenTUI", "Version", "0.1.1"]);
  });

  test("enhanceTables(): handles missing thead gracefully (labels empty)", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = [
        "<table>",
        "  <tbody>",
        "    <tr><td>k</td><td>v</td></tr>",
        "  </tbody>",
        "</table>",
      ].join("\n");

      window.enhanceTables!(container);

      const table = container.querySelector("table");
      const tds = Array.from(container.querySelectorAll("tbody td"));
      return {
        marker: table?.getAttribute("data-bv-table") ?? null,
        classes: table ? Array.from(table.classList).sort() : [],
        labels: tds.map((td) => td.getAttribute("data-label")),
      };
    });

    expect(result.marker).toBe("1");
    expect(result.classes).toEqual(expect.arrayContaining(["bv-table", "bv-table--2col"]));
    expect(result.labels).toEqual(["", ""]);
  });

  test("enhanceTables(): mismatched column counts clamps labels safely", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = [
        "<table>",
        "  <thead><tr><th>A</th><th>B</th></tr></thead>",
        "  <tbody>",
        "    <tr><td>a1</td><td>b1</td><td>c1</td></tr>",
        "  </tbody>",
        "</table>",
      ].join("\n");

      window.enhanceTables!(container);

      const table = container.querySelector("table");
      const tds = Array.from(container.querySelectorAll("tbody td"));
      return {
        hasNCol: table?.classList.contains("bv-table--ncol") ?? false,
        labels: tds.map((td) => td.getAttribute("data-label")),
      };
    });

    expect(result.hasNCol).toBe(true);
    expect(result.labels).toEqual(["A", "B", ""]);
  });

  test("enhanceTables(): supports nested tables without breaking labeling", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = [
        "<table id='outer'>",
        "  <thead><tr><th>Outer A</th><th>Outer B</th></tr></thead>",
        "  <tbody>",
        "    <tr>",
        "      <td>oa1</td>",
        "      <td>",
        "        <table id='inner'>",
        "          <thead><tr><th>Inner X</th><th>Inner Y</th></tr></thead>",
        "          <tbody><tr><td>ix1</td><td>iy1</td></tr></tbody>",
        "        </table>",
        "      </td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
      ].join("\n");

      window.enhanceTables!(container);

      const outer = container.querySelector<HTMLTableElement>("#outer");
      const inner = container.querySelector<HTMLTableElement>("#inner");
      if (!outer || !inner) return { ok: false };

      const outerLabels = Array.from(outer.querySelectorAll("tbody td")).map((td) =>
        td.getAttribute("data-label"),
      );
      const innerLabels = Array.from(inner.querySelectorAll("tbody td")).map((td) =>
        td.getAttribute("data-label"),
      );

      return {
        ok: true,
        outerMarker: outer.getAttribute("data-bv-table"),
        innerMarker: inner.getAttribute("data-bv-table"),
        outerLabels,
        innerLabels,
      };
    });

    expect(result.ok).toBe(true);
    expect(result.outerMarker).toBe("1");
    expect(result.innerMarker).toBe("1");
    expect(result.outerLabels?.slice(0, 2)).toEqual(["Outer A", "Outer B"]);
    expect(result.innerLabels).toEqual(["Inner X", "Inner Y"]);
  });

  test("enhanceTables(): does not choke on empty cells", async ({ page }) => {
    await loadMarkdownPipeline(page);

    const result = await page.evaluate(() => {
      const container = document.createElement("div");
      container.innerHTML = [
        "<table>",
        "  <thead><tr><th>A</th><th>B</th><th>C</th></tr></thead>",
        "  <tbody>",
        "    <tr><td></td><td>b1</td><td></td></tr>",
        "  </tbody>",
        "</table>",
      ].join("\n");

      window.enhanceTables!(container);

      const tds = Array.from(container.querySelectorAll("tbody td"));
      return {
        labels: tds.map((td) => td.getAttribute("data-label")),
        values: tds.map((td) => (td.textContent ?? "").trim()),
      };
    });

    expect(result.labels).toEqual(["A", "B", "C"]);
    expect(result.values).toEqual(["", "b1", ""]);
  });
});

test.describe("beads-viewer: responsive table CSS", () => {
  test("mobile: 2-col table renders as stacked key/value cards", async ({ page }) => {
    await loadBeadsViewerStyles(page, { width: 390, height: 844 });

    const result = await page.evaluate(() => {
      const root = document.getElementById("root");
      if (!root) return { ok: false };

      root.innerHTML = [
        "<table class='bv-table bv-table--2col' data-bv-table='1'>",
        "  <thead><tr><th>Key</th><th>Value</th></tr></thead>",
        "  <tbody>",
        "    <tr><td>Name</td><td>FrankenTUI</td></tr>",
        "  </tbody>",
        "</table>",
      ].join("\n");

      const table = root.querySelector("table")!;
      const thead = table.querySelector("thead")!;
      const row = table.querySelector("tbody tr")!;
      const td = table.querySelector("tbody td")!;

      return {
        ok: true,
        theadPosition: getComputedStyle(thead).position,
        rowDisplay: getComputedStyle(row).display,
        tdDisplay: getComputedStyle(td).display,
        docOverflowPx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(result.ok).toBe(true);
    expect(result.theadPosition).toBe("absolute");
    expect(result.rowDisplay).toBe("block");
    expect(result.tdDisplay).toBe("block");
    expect(result.docOverflowPx).toBeLessThanOrEqual(2);
  });

  test("mobile: n-col tables show data-label via ::before", async ({ page }) => {
    await loadBeadsViewerStyles(page, { width: 390, height: 844 });

    const result = await page.evaluate(() => {
      const root = document.getElementById("root");
      if (!root) return { ok: false };

      root.innerHTML = [
        "<table class='bv-table bv-table--ncol' data-bv-table='1'>",
        "  <thead><tr><th>Alpha</th><th>Beta</th><th>Gamma</th></tr></thead>",
        "  <tbody>",
        "    <tr>",
        "      <td data-label='Alpha'>a1</td>",
        "      <td data-label='Beta'>b1</td>",
        "      <td data-label='Gamma'>c1</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
      ].join("\n");

      const td = root.querySelector("tbody td")!;
      const before = getComputedStyle(td, "::before").content || "";
      return {
        ok: true,
        tdDisplay: getComputedStyle(td).display,
        beforeContent: before.replace(/^['"]|['"]$/g, ""),
      };
    });

    expect(result.ok).toBe(true);
    expect(result.tdDisplay).toBe("grid");
    expect(result.beforeContent).toBe("Alpha");
  });

  test("desktop: keeps classic table layout", async ({ page }) => {
    await loadBeadsViewerStyles(page, { width: 1024, height: 768 });

    const result = await page.evaluate(() => {
      const root = document.getElementById("root");
      if (!root) return { ok: false };

      root.innerHTML = [
        "<table class='bv-table bv-table--ncol' data-bv-table='1'>",
        "  <thead><tr><th>A</th><th>B</th><th>C</th></tr></thead>",
        "  <tbody><tr><td data-label='A'>a1</td><td data-label='B'>b1</td><td data-label='C'>c1</td></tr></tbody>",
        "</table>",
      ].join("\n");

      const table = root.querySelector("table")!;
      const td = root.querySelector("tbody td")!;
      return {
        ok: true,
        tableDisplay: getComputedStyle(table).display,
        tdDisplay: getComputedStyle(td).display,
      };
    });

    expect(result.ok).toBe(true);
    expect(result.tableDisplay).toBe("table");
    // Should not use the mobile grid layout.
    expect(result.tdDisplay).toBe("table-cell");
  });
});
