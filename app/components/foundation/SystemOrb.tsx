"use client";

import type { CSSProperties } from "react";
import type { AwakeFocusArea } from "../../systems";
import {
  foundationExperienceTranslations,
  type Language,
} from "../../translations";
import { getLastSupportedText } from "./foundationExperience";

type Props = {
  system: AwakeFocusArea;
  index: number;
  selected: boolean;
  dimmed: boolean;
  colors: {
    main: string;
    highlight: string;
    glow: string;
    quiet: string;
  };
  language: Language;
  onSelect: () => void;
  orbitStyle?: CSSProperties;
};

export default function SystemOrb({
  system,
  index,
  selected,
  dimmed,
  colors,
  language,
  onSelect,
  orbitStyle,
}: Props) {
  const activity = getLastSupportedText(system, language);
  const text = foundationExperienceTranslations[language];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`foundation-orbit-item group flex min-h-32 w-full min-w-0 flex-col items-center justify-center rounded-[2.5rem] px-1 text-center outline-none transition-all duration-700 focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:duration-0 ${
        selected ? "is-selected" : ""
      } ${dimmed ? "opacity-35" : "opacity-100"}`}
      aria-label={`${text.openPreview} ${system.title}, ${activity}`}
      aria-pressed={selected}
      style={
        {
          "--orbit-index": index,
          ...orbitStyle,
        } as CSSProperties
      }
    >
      <span
        className="foundation-child-orb relative block h-[5.5rem] w-[5.5rem] rounded-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:duration-0 sm:h-24 sm:w-24"
        style={
          {
            "--orb-main": colors.main,
            "--orb-highlight": colors.highlight,
            "--orb-glow": colors.glow,
            "--orb-quiet": colors.quiet,
          } as CSSProperties
        }
        aria-hidden="true"
      />
      <span className="mt-3 max-w-32 text-sm font-semibold leading-tight">
        {system.title}
      </span>
      <span className="awake-supporting mt-1 max-w-36 text-[0.7rem] leading-4">
        {activity}
      </span>
    </button>
  );
}
