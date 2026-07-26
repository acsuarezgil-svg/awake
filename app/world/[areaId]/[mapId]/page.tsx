import Link from "next/link";
import { notFound } from "next/navigation";

import { lifeAreas } from "@/app/data/lifeAreas";
import { lifeMaps } from "@/app/data/lifeMaps";

import SystemExperience from "./SystemExperience";

type Props = {
  params: Promise<{
    areaId: string;
    mapId: string;
  }>;
};

export default async function MapPage({ params }: Props) {
  const { areaId, mapId } = await params;

  const area = lifeAreas.find((a) => a.id === areaId);

  const map = lifeMaps.find(
    (m) => m.id === mapId && m.areaId === areaId,
  );

  if (!area || !map) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white px-6 py-10 text-stone-800">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/world/${area.id}`}
          className="text-sm text-stone-400 transition hover:text-stone-700"
        >
          ← {area.name}
        </Link>

        <header className="mt-10 text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-5xl">
            <span aria-hidden="true">{map.icon}</span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold">
            {map.name}
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-stone-600">
            {map.purpose}
          </p>
        </header>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">
            Common challenges
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            Things that may make this system harder to support.
          </p>

          <ul className="mt-4 space-y-3">
            {map.commonChallenges.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm leading-6 text-stone-600"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <SystemExperience
            areaId={area.id}
            mapId={map.id}
            mapName={map.name}
            actions={map.actions}
            />
            {map.knowledge && map.knowledge.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-xl font-semibold text-stone-800">
                    Worth knowing
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-stone-500">
                    A little context to help you shape this system.
                    </p>

                    <div className="mt-4 space-y-3">
                    {map.knowledge.map((item) => (
                        <p
                        key={item}
                        className="rounded-2xl border border-stone-200/70 bg-white p-4 text-sm leading-6 text-stone-600"
                        >
                        {item}
                        </p>
                    ))}
                    </div>
                </section>
                )}
      </div>
    </main>
  );
}