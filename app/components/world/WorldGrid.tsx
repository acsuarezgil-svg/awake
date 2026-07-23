import { lifeAreas } from "@/app/data/lifeAreas";
import WorldOrb from "./WorldOrb";

export default function WorldGrid() {
  return (
    <section className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3">
      {lifeAreas.map((area) => (
        <WorldOrb
          key={area.id}
          href={`/world/${area.id}`}
          icon={area.icon}
          title={area.name}
          description={area.description}
          accent={area.accent}
          background={area.background}
        />
      ))}
    </section>
  );
}