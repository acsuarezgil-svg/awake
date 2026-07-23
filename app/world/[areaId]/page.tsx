import Link from "next/link";
import { notFound } from "next/navigation";

import { lifeAreas } from "@/app/data/lifeAreas";
import { lifeMaps } from "@/app/data/lifeMaps";

type AreaPageProps = {
  params: Promise<{
    areaId: string;
  }>;
};

export default async function AreaPage({ params }: AreaPageProps) {
  const { areaId } = await params;

  const area = lifeAreas.find((item) => item.id === areaId);

  if (!area) {
    notFound();
  }

  const maps = lifeMaps.filter((map) => map.areaId === area.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-emerald-50/40 px-5 py-8 text-stone-800">
      <div className="mx-auto max-w-4xl">
        <header>
          <Link
            href="/world"
            className="text-sm text-stone-400 transition hover:text-stone-700"
          >
            ← Your World
          </Link>

          <div className="mt-8 flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white bg-gradient-to-br from-white via-stone-50 to-emerald-50/70 text-5xl shadow-[0_0_34px_rgba(52,211,153,0.16)]">
              <span aria-hidden="true">{area.icon}</span>
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.28em] text-emerald-700/70">
              Life Area
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {area.name}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
              {area.description}
            </p>
          </div>
        </header>

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-stone-800">
              Maps to explore
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              These are starting points, not rules. Open one to explore common
              challenges and ideas you may want to try.
            </p>
          </div>

          {maps.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {maps.map((map) => (
                <Link
                  key={map.id}
                  href={`/world/${area.id}/${map.id}`}
                  className="group rounded-[1.75rem] border border-stone-200/70 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                      <span aria-hidden="true">{map.icon ?? "🗺️"}</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-stone-800">
                        {map.name}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        {map.purpose}
                      </p>

                      <span className="mt-4 inline-flex items-center text-xs font-medium text-emerald-700">
                        Explore map
                        <span
                          aria-hidden="true"
                          className="ml-1 transition group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center">
              <p className="text-sm text-stone-500">
                Maps for this area are still growing.
              </p>

              <p className="mt-2 text-xs text-stone-400">
                You will eventually be able to create your own starting point
                here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}