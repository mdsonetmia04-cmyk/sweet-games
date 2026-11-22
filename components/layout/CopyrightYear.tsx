"use client";

import { useEffect, useState } from "react";

/** Copyright year, rendered on the client so static prerendering stays
 * deterministic. */
export default function CopyrightYear() {
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year}</>;
}
