"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import type { Icon } from "@phosphor-icons/react";

export type MorphLink = { href: string; label: string; icon: Icon; active?: boolean };

type Props = {
  links: MorphLink[];
  cta?: { href: string; label: string; icon: Icon };
  /** Shown beside the CTA in the full bar only (e.g. the wallet button). */
  extra?: React.ReactNode;
};

const SPRING = { type: "spring", stiffness: 300, damping: 28, mass: 0.8 } as const;

/**
 * Morphing header, the same component as Gameboy's MorphNav (from RewampUI "hero-morph-navbar"):
 * a full bar at the top of the page that springs into a floating icon pill once the page scrolls.
 * Scroll state comes from Motion's useScroll. Always rendered and visible.
 */
export default function MorphNav({ links, cta, extra }: Props) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));
  const s = scrolled ? " is-pill" : "";

  return (
    <div className="mnav">
      <motion.nav
        layout={!reduce}
        transition={SPRING}
        aria-label="Main"
        className={`mnav-bar${s}`}
        style={{ borderRadius: scrolled ? 999 : 22 }}
      >
        <a href="#top" className="mnav-brand" aria-label="Portal Canary, top">
          <motion.span layout={!reduce} transition={SPRING} className="mnav-word">
            <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
              <path className="m-a" d="M3 8.5h5.5l1.8-4.5 3 9 1.7-4.5H21"></path>
              <path className="m-b" d="M3 16h5.5l1.8-2.5 1.8 2.5H21"></path>
            </svg>
            <span>PORTAL CANARY</span>
          </motion.span>
        </a>

        <ul className={`mnav-links${s}`}>
          {links.map(({ href, label, icon: I, active }) => (
            <li key={href}>
              <a href={href} aria-current={active ? "page" : undefined} title={label} className={`mnav-link${s}${active ? " is-on" : ""}`}>
                {active && <motion.span layoutId="morph-nav-active" transition={SPRING} className="mnav-active" />}
                <span className="mnav-in">{scrolled ? <I size={20} weight={active ? "fill" : "bold"} /> : label}</span>
                {scrolled && <span className="sr-only">{label}</span>}
              </a>
            </li>
          ))}
        </ul>

        <div className="mnav-right">
          {!scrolled && extra}
          {cta && (
            <a href={cta.href} className={`mnav-cta${s}`} title={cta.label}>
              {!scrolled && <span>{cta.label}</span>}
              <cta.icon size={18} weight="bold" className="mnav-cta-i" />
              {scrolled && <span className="sr-only">{cta.label}</span>}
            </a>
          )}
        </div>
      </motion.nav>
    </div>
  );
}
