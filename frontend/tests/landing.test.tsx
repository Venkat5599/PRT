// The landing page was ported from a static build to React components. Each interactive
// component must still render, on the server, exactly the markup the original page served
// (captured in tests/fixtures/landing). A diff here means the first paint changed.
import { test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement, type ComponentType } from "react";

const CASES: [string, string, Record<string, unknown>[]][] = [
  ["Header", "header", [{}]],
  ["HeroStage", "hero", [{}]],
  ["Wall", "wall", [{}, { noIndicators: true }]],
  ["FaqList", "wall", [{}]],
  ["IssueButton", "wall", [{}]],
  ["SmokeChecks", "features", [{}]],
  ["BuildCards", "features", [{}]],
  ["MeasureChart", "features", [{}]],
  ["AutoUpgrade", "features2", [{}]],
  ["SignatureGrid", "features2", [{}]],
  ["SignaturePen", "features2", [{}]],
  ["DistributionStrip", "features2", [{}]],
  ["SupplyGauge", "features2", [{}]],
  ["FeatureDashboard", "features2", [{}]],
];

// React and the original build differ only in how they serialise an empty style attribute
// and attribute quotes; neither changes the DOM.
const norm = (h: string) => h.replace(/ style=""/g, "").replace(/='([^']*)'/g, '="$1"').replace(/\n\s*/g, "");

for (const [name, dir, variants] of CASES) {
  for (const props of variants) {
    test(`${name} ${JSON.stringify(props)} renders the original markup`, async () => {
      const Original: ComponentType<Record<string, unknown>> = (await import(`./fixtures/landing/${name}.tsx`)).default;
      const Port: ComponentType<Record<string, unknown>> = (await import(`../components/landing/${dir}/${name}.tsx`)).default;
      const want = norm(renderToStaticMarkup(createElement(Original, props)));
      const got = norm(renderToStaticMarkup(createElement(Port, props)));
      expect(want.length).toBeGreaterThan(0);
      expect(got).toBe(want);
    });
  }
}
