"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Language } from "../../translations";
import VoiceDictationButton from "./VoiceDictationButton";

type VoiceCustomizationProps = {
  language: Language;
  onClose: () => void;
};

const copy = {
  en: {
    title: "Shape your Awake",
    intro: "Tell Awake what you want help with.",
    example:
      "For example: I want help exercising, cooking at home, and saving for repairs.",
    label: "Tell Awake what you want help with",
    privacy:
      "Voice input uses your browser or device’s speech-recognition service. Review the words before adding anything to Awake.",
    choose: "Choose systems",
    close: "Back to my World",
  },
  es: {
    title: "Da forma a tu Awake",
    intro: "Cuéntale a Awake con qué te gustaría recibir apoyo.",
    example:
      "Por ejemplo: Quiero ayuda para hacer ejercicio, cocinar en casa y ahorrar para reparaciones.",
    label: "Cuéntale a Awake con qué te gustaría recibir apoyo",
    privacy:
      "La entrada de voz usa el servicio de reconocimiento de voz de tu navegador o dispositivo. Revisa las palabras antes de agregar algo a Awake.",
    choose: "Elegir sistemas",
    close: "Volver a mi Mundo",
  },
} as const;

export default function VoiceCustomization({
  language,
  onClose,
}: VoiceCustomizationProps) {
  const [value, setValue] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const t = copy[language];

  useEffect(() => {
    dialogRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/20 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-customization-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="awake-card mx-auto w-full max-w-xl outline-none"
      >
        <p className="awake-eyebrow">Speak. Edit. Choose.</p>
        <h2 id="voice-customization-title" className="mt-2">
          {t.title}
        </h2>
        <p className="awake-supporting mt-2">{t.intro}</p>
        <p className="awake-supporting mt-3 text-sm">{t.example}</p>

        <label htmlFor="awake-customization-thoughts" className="mt-6 block font-medium">
          {t.label}
        </label>
        <textarea
          id="awake-customization-thoughts"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={7}
          className="awake-input mt-2 w-full resize-y"
        />
        <div className="mt-4">
          <VoiceDictationButton
            value={value}
            onChange={setValue}
            language={language === "es" ? "es-US" : "en-US"}
          />
        </div>
        <p className="awake-supporting mt-5 text-xs">{t.privacy}</p>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="awake-button awake-button-quiet"
          >
            {t.close}
          </button>
          <Link
            href="/systems"
            className="awake-button awake-button-primary"
            aria-disabled={!value.trim()}
            tabIndex={value.trim() ? undefined : -1}
            onClick={(event) => {
              if (!value.trim()) event.preventDefault();
            }}
          >
            {t.choose}
          </Link>
        </div>
      </div>
    </div>
  );
}
