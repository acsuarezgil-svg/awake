import Link from "next/link";
import type { AwakeFocusArea } from "../../systems";
import {
  foundationExperienceTranslations,
  type Language,
} from "../../translations";
import {
  getLastSupportedText,
  getSystemPreview,
} from "./foundationExperience";

type Props = {
  foundationId: string;
  system: AwakeFocusArea;
  language: Language;
  onClose: () => void;
};

export default function SystemQuickPreview({
  foundationId,
  system,
  language,
  onClose,
}: Props) {
  const preview = getSystemPreview(system);
  const text = foundationExperienceTranslations[language];

  return (
    <aside
      className="foundation-preview mx-auto w-full max-w-md rounded-[2rem] border p-5 backdrop-blur-xl"
      aria-live="polite"
      aria-label={`${system.title} ${text.preview}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="awake-eyebrow">{text.system}</p>
          <h2 className="mt-1 text-2xl">{system.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="awake-button awake-button-quiet h-11 w-11 rounded-full p-0"
          aria-label={text.closePreview}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {preview.description && (
        <p className="awake-supporting mt-3 leading-6">{preview.description}</p>
      )}
      <p className="mt-3 text-xs font-medium">
        {getLastSupportedText(system, language)}
      </p>
      {preview.care.length > 0 && (
        <div className="mt-4">
          <p className="awake-eyebrow">{text.care}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {preview.care.map((action) => (
              <li key={action.id}>• {action.title}</li>
            ))}
          </ul>
        </div>
      )}
      <Link
        href={`/systems/${foundationId}/${system.id}`}
        className="awake-button awake-button-primary mt-5 w-full"
      >
        {text.openSystem}
      </Link>
    </aside>
  );
}
