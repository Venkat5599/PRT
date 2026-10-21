"use client";

import { useEffect } from "react";
import { initSite } from "@/lib/site";
import { initLive } from "@/lib/live";
import { initMotion } from "@/lib/motion";

// The page is static markup; its behaviour attaches once on the client.
// Module-level guard: StrictMode runs effects twice in development.
let started = false;

export default function Behaviors() {
  useEffect(() => {
    if (started) return;
    started = true;
    initSite();
    initLive();
    initMotion();
  }, []);
  return null;
}
