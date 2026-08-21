"use client";

import { useEffect } from "react";
import { sendTelemetry } from "./telemetry";

export function LandingTelemetry() {
  useEffect(() => {
    sendTelemetry({ name: "landing_view", source: "landing" });
  }, []);

  return null;
}
