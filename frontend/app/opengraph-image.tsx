import { ImageResponse } from "next/og";

// Social preview for links shared in Discord, X, email: the real result, not a logo.
export const alt = "Portal Canary: runtime upgrade testing for Portaldot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const stat = (n: string, label: string, color = "#ededed") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 64, color, letterSpacing: -2 }}>{n}</div>
      <div style={{ fontSize: 22, color: "#8f8f8f" }}>{label}</div>
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#111111", color: "#ededed" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, letterSpacing: 3 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5h5.5l1.8-4.5 3 9 1.7-4.5H21" stroke="#bdbdbd" />
            <path d="M3 16h5.5l1.8-2.5 1.8 2.5H21" stroke="#ededed" opacity="0.7" />
          </svg>
          PORTAL CANARY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 76, lineHeight: 1.05, letterSpacing: -2 }}>
          <div>Upgrade the runtime.</div>
          <div style={{ display: "flex" }}>Know what&nbsp;<span style={{ color: "#bdbdbd" }}>breaks.</span></div>
        </div>
        <div style={{ display: "flex", gap: 72, borderTop: "1px solid #262626", paddingTop: 36 }}>
          {stat("Upgrade", "on a fresh chain")}
          {stat("Compare", "any two runtimes", "#ffffff")}
          {stat("Prove", "on-chain, per run", "#8a8a8a")}
        </div>
      </div>
    ),
    size,
  );
}
