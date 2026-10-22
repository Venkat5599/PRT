"use client";

import { ArrowUpRight, Broadcast, GitBranch, GithubLogo, Hexagon } from "@phosphor-icons/react";
import MorphNav from "./MorphNav";
import WalletButton from "./WalletButton";

export default function LandingNav() {
  return (
    <MorphNav
      links={[
        { href: "#live", label: "Live", icon: Broadcast },
        { href: "#flow", label: "Upgrade flow", icon: GitBranch },
        { href: "#v3", label: "V3 testnet", icon: Hexagon },
        { href: "https://github.com/Venkat5599/PRT", label: "GitHub", icon: GithubLogo },
      ]}
      cta={{ href: "/dashboard", label: "Open dashboard", icon: ArrowUpRight }}
      extra={<WalletButton />}
    />
  );
}
