"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createAwakeFocusArea,
  type AwakeSystem,
} from "../../systems";

import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../../systemStorage";

import { getSystemTemplates } from "../../systemTemplates";

export default function SystemPage() {
  const params = useParams<{ id: string }>();
  const systemId = params.id;

  const [system, setSystem] =
    useState<AwakeSystem | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedSystems = loadAwakeSystems();

    const selectedSystem =
      storedSystems.find(
        (item) => item.id === systemId
      ) ?? null;

    if (!selectedSystem) {
      setSystem(null);
      setLoaded(true);
      return;
    }

    let updatedSystem = selectedSystem;

    if (!selectedSystem.focusAreasInitialized) {
      const templates = getSystemTemplates(
        selectedSystem.title
      );

      updatedSystem = {
        ...selectedSystem,

        focusAreas: templates.map((title) =>
          createAwakeFocusArea(title)
        ),

        focusAreasInitialized: true,
        updatedAt: new Date().toISOString(),
      };

      const updatedSystems = storedSystems.map(
        (item) =>
          item.id === selectedSystem.id
            ? updatedSystem
            : item
      );

      saveAwakeSystems(updatedSystems);
    }

    setSystem(updatedSystem);
    setLoaded(true);
  }, [systemId]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-800">
        <div className="mx-auto max-w-xl">
          <p className="text-sm text-stone-400">
            Loading…
          </p>
        </div>
      </main>
    );
  }

  if (!system) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-800">
        <div className="mx-auto max-w-xl">
          <Link
            href="/systems"
            className="text-sm text-stone-500 transition hover:text-stone-800"
          >
            ← Systems
          </Link>

          <div className="mt-12 rounded-3xl border border-stone-200 bg-white p-6">
            <h1 className="text-xl font-medium">
              System not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              This system may have been removed.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-800">
      <div className="mx-auto max-w-xl">
        <Link
          href="/systems"
          className="text-sm text-stone-500 transition hover:text-stone-800"
        >
          ← Systems
        </Link>

        <header className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            System
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {system.title}
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
            Choose an area to understand, experiment
            with, and shape over time.
          </p>
        </header>

        <section className="mt-8 space-y-3">
          {system.focusAreas.length > 0 ? (
            system.focusAreas.map((focusArea) => (
              <Link
                key={focusArea.id}
                href={`/systems/${system.id}/${focusArea.id}`}
                className="group flex items-center justify-between rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
              >
                <div>
                  <h2 className="text-base font-medium text-stone-800">
                    {focusArea.title}
                  </h2>

                  <p className="mt-1 text-xs text-stone-400">
                    Foundation · Experiments · Lessons
                  </p>
                </div>

                <span className="text-lg text-stone-300 transition group-hover:translate-x-1 group-hover:text-stone-500">
                  →
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-6 text-center">
              <p className="text-sm text-stone-500">
                No focus areas have been added yet.
              </p>
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-xs leading-5 text-stone-400">
          A system does not need to be perfected.
          <br />
          It only needs to become more supportive.
        </p>
      </div>
    </main>
  );
}