"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getSystemStatus } from "../../systemStatus";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../../systemStorage";
import { getSystemTemplates } from "../../systemTemplates";
import {
  createAwakeFocusArea,
  type AwakeSystem,
} from "../../systems";

export default function FoundationPage() {
  const params = useParams<{ id: string }>();
  const [foundation, setFoundation] =
    useState<AwakeSystem | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  useEffect(() => {
    const stored = loadAwakeSystems();
    const selected =
      stored.find((item) => item.id === params.id) ?? null;
    if (!selected) {
      // Hydrate the client-only store after mounting.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFoundation(null);
      setLoaded(true);
      return;
    }

    let initialized = selected;
    if (!selected.focusAreasInitialized) {
      initialized = {
        ...selected,
        focusAreas: getSystemTemplates(selected.title).map(
          createAwakeFocusArea,
        ),
        focusAreasInitialized: true,
        updatedAt: new Date().toISOString(),
      };
      saveAwakeSystems(
        stored.map((item) =>
          item.id === initialized.id ? initialized : item,
        ),
      );
    }

    setFoundation(initialized);
    setLoaded(true);
  }, [params.id]);

  function addSystem(title: string) {
    const cleanTitle = title.trim();
    if (!foundation || !cleanTitle) return;
    if (
      foundation.focusAreas.some(
        (focusArea) =>
          focusArea.title.toLowerCase() === cleanTitle.toLowerCase(),
      )
    ) {
      return;
    }

    const nextFoundation = {
      ...foundation,
      focusAreas: [
        ...foundation.focusAreas,
        createAwakeFocusArea(cleanTitle),
      ],
      focusAreasInitialized: true,
      updatedAt: new Date().toISOString(),
    };
    saveAwakeSystems(
      loadAwakeSystems().map((item) =>
        item.id === nextFoundation.id ? nextFoundation : item,
      ),
    );
    setFoundation(nextFoundation);
    setCustomTitle("");
    setShowAdd(false);
  }

  if (!loaded) return null;

  if (!foundation) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-800">
        <div className="mx-auto max-w-xl">
          <Link href="/" className="text-sm text-stone-500">
            ← Foundations
          </Link>
          <h1 className="mt-12 text-xl font-medium">
            Foundation not found
          </h1>
        </div>
      </main>
    );
  }

  const suggestions = getSystemTemplates(foundation.title).filter(
    (title) =>
      !foundation.focusAreas.some(
        (focusArea) =>
          focusArea.title.toLowerCase() === title.toLowerCase(),
      ),
  );

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-800">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="text-sm text-stone-500 transition hover:text-stone-800"
        >
          ← Foundations
        </Link>

        <header className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            Foundation
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {foundation.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            Systems supporting this foundation
          </p>
        </header>

        <section className="mt-8 space-y-3">
          {foundation.focusAreas.length > 0 ? (
            foundation.focusAreas.map((focusArea) => {
              const status = getSystemStatus(focusArea);
              return (
                <Link
                  key={focusArea.id}
                  href={`/systems/${foundation.id}/${focusArea.id}`}
                  className="group flex min-h-20 items-center justify-between rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300"
                >
                  <div>
                    <h2 className="text-base font-medium">
                      {focusArea.title}
                      {status.isMine ? " ★" : ""}
                    </h2>
                    <p className="mt-1 text-xs text-stone-400">
                      {status.label}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-lg text-stone-300 transition group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-6 text-center text-sm text-stone-500">
              No systems yet
            </p>
          )}
        </section>

        <section className="mt-5">
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="min-h-11 rounded-full border border-stone-200 bg-white px-5 text-sm font-medium text-stone-600"
            >
              Add system
            </button>
          ) : (
            <div className="rounded-3xl border border-stone-200 bg-white p-5">
              <p className="text-sm font-medium">
                Add to {foundation.title}
              </p>
              {suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((title) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => addSystem(title)}
                      className="min-h-10 rounded-full bg-stone-100 px-4 text-sm text-stone-600"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              )}
              <label className="mt-4 block text-sm text-stone-500">
                Or create a custom system
                <input
                  value={customTitle}
                  onChange={(event) =>
                    setCustomTitle(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addSystem(customTitle);
                  }}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-stone-200 px-4 outline-none focus:border-stone-400"
                  placeholder="System name"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setCustomTitle("");
                  }}
                  className="min-h-11 px-4 text-sm text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!customTitle.trim()}
                  onClick={() => addSystem(customTitle)}
                  className="min-h-11 rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white disabled:opacity-35"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
