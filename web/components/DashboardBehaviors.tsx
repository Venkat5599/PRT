"use client";

import { useEffect } from "react";
import { initLive } from "@/lib/live";
import { initMotion } from "@/lib/motion";

// /dashboard only carries the live compare, so it attaches just that.
let started = false;

export default function DashboardBehaviors() {
  useEffect(() => {
    if (started) return;
    started = true;
    initLive();
    initMotion();
  }, []);
  return null;
}
