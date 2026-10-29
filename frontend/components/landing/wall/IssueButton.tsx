"use client";

// "open an issue": opens the repository's issue tracker in a new tab.
export default function IssueButton() {
  return (
    <button
      className="px-5 bg-body-light-bg-ghost rounded-6 transition-all hover:bg-body-light-bg-muted"
      onClick={(e) => { e.preventDefault(); window.open("https://github.com/Venkat5599/portalcanary/issues", "_blank", "noopener"); }}
    >
      <div className="text-14/22 font-500 tracking-[-0.14px] text-body-light-loud">open an issue</div>
    </button>
  );
}
