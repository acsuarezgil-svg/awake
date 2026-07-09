"use client";

import { useEffect, useState } from "react";
import AwarenessWheel from "../components/AwarenessWheel";

export default function WheelPage() {
  return (
    <main className="min-h-screen bg-white p-6 w-full max-w-md mx-auto">
      <a href="/" className="text-sm text-gray-500">
        ← Back
      </a>

      <AwarenessWheel />
    </main>
  );
}
