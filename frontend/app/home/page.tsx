"use client";

import DccOptions from "@/components/ui/options";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Home | DiCCA";
  }, []);

  return (
    <ProtectedRoute>
      <DccOptions />
    </ProtectedRoute>
  );
}