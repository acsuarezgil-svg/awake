import Link from "next/link";
import { notFound } from "next/navigation";

import { lifeAreas } from "@/app/data/lifeAreas";
import { lifeMaps } from "@/app/data/lifeMaps";

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
    (m) => m.id === mapId && m.areaId === areaId
  );

  if (!area || !map) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <Link
          href={`/world/${area.id}`}
          className="text-sm text-stone-400 hover:text-stone-700"
        >
          ← {area.name}
        </Link>

        <div className="mt-10 text-center">

          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-5xl">
            {map.icon}
          </div>

          <h1 className="mt-6 text-4xl font-semibold">
            {map.name}
          </h1>

          <p className="mt-4 text-stone-600">
            {map.purpose}
          </p>

        </div>

        <section className="mt-14">

          <h2 className="text-xl font-semibold">
            Common Challenges
          </h2>

          <ul className="mt-4 space-y-3">
            {map.commonChallenges.map((item) => (
              <li
                key={item}
                className="rounded-xl bg-stone-50 p-4"
              >
                {item}
              </li>
            ))}
          </ul>

        </section>

        <section className="mt-12">

          <h2 className="text-xl font-semibold">
            Ideas to Try
          </h2>

          <ul className="mt-4 space-y-3">
            {map.ideasToTry.map((item) => (
              <li
                key={item}
                className="rounded-xl bg-emerald-50 p-4"
              >
                {item}
              </li>
            ))}
          </ul>

        </section>

        <div className="mt-14">

          <button className="w-full rounded-2xl bg-emerald-600 px-6 py-4 font-medium text-white transition hover:bg-emerald-700">
            Start an Experiment
          </button>

        </div>

      </div>
    </main>
  );
}