"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { AwakeSystem } from "../../systems";
import { loadAwakeSystems } from "../../systemStorage";

export default function SystemDetailPage() {
  const params = useParams();
  const systemId = params.id as string;

  const [system, setSystem] =
    useState<AwakeSystem | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const systems = loadAwakeSystems();

    const selectedSystem =
      systems.find(
        (item) => item.id === systemId
      ) ?? null;

    setSystem(selectedSystem);
    setLoaded(true);
  }, [systemId]);

  if (!loaded) {
    return null;
  }

  if (!system) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-800">
        <section className="mx-auto max-w-md">
          <a
            href="/systems"
            className="text-sm text-stone-500"
          >
            ← Systems
          </a>

          <h1 className="mt-8 text-3xl font-semibold">
            System not found
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-800">
      <section className="mx-auto max-w-md">
        <a
          href="/systems"
          className="text-sm text-stone-500"
        >
          ← Systems
        </a>

        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-stone-400">
          Living system
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          {system.title}
        </h1>

        <div className="mt-8 rounded-3xl border border-stone-200 bg-white/75 p-6">
          <p className="text-sm text-stone-500">
            This is where Understanding,
            Observations, Experiments, Lessons,
            and Gratitude will live.
          </p>
        </div>
      </section>
    </main>
  );
}