"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { translations, type Language } from "../translations";

import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../theme";

const awakeStorageKeys = [
  "awake-reflections",
  "awake-notice-events",
  "awake-counts",
  "awake-patterns",
  "awake-investments",
  "awake-values",
  "awake-boundaries",
  "awake-direction",
  "awake-directions",
  "awake-language",
  "awake-wheel-theme",
  "awake-wheel-view",
];

export default function PrivacyPage() {
    
    const [wheelTheme, setWheelTheme] =
        useState<WheelTheme>("roseSage");
    
    const [language, setLanguage] =
        useState<Language>("en");

    const t = translations[language];

    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState(false);
        
    const [journeyCleared, setJourneyCleared] =
        useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem(
            "awake-language"
        ) as Language | null;

        const savedWheelTheme = localStorage.getItem(
            "awake-wheel-theme"
        );

        if (savedLanguage) {
            setLanguage(savedLanguage);
        }

        if (savedWheelTheme && isWheelTheme(savedWheelTheme)) {
            setWheelTheme(savedWheelTheme);
        }
        }, []);

  function deleteEverything() {
    awakeStorageKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    setShowDeleteConfirmation(false);
    setJourneyCleared(true);
  }

  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  const cardClass = `rounded-3xl border px-5 py-6 transition-colors ${
    isDark
      ? "border-white/10 bg-slate-800/70"
      : "border-stone-200 bg-white/80"
  }`;

  const bodyTextClass = isDark
    ? "text-slate-300"
    : "text-stone-500";

  if (journeyCleared) {
    return (
      <main
        className={`min-h-screen px-5 py-8 transition-[background] duration-500 ${
          isDark ? "text-stone-100" : "text-stone-800"
        }`}
        style={{ background: activeTheme.pageBackground }}
      >
        <section className="mx-auto flex min-h-[75vh] w-full max-w-md flex-col items-center justify-center text-center">
          <p className="text-3xl" aria-hidden="true">
            ✨
          </p>

          <h1
            className={`mt-5 text-3xl font-light ${
              isDark ? "text-stone-100" : "text-stone-800"
            }`}
          >
            {t.privacyPage.clearedTitle}
          </h1>

          <p
            className={`mt-4 max-w-sm text-sm leading-7 ${bodyTextClass}`}
          >
            {t.privacyPage.clearedText}
          </p>

          <p
            className={`mt-6 text-sm leading-7 ${bodyTextClass}`}
          >
            {t.privacyPage.thankYou}
          </p>

          <p
            className={`mt-8 text-xs uppercase tracking-[0.24em] ${
              isDark ? "text-slate-400" : "text-stone-400"
            }`}
          >
            {t.privacyPage.tagline}
          </p>

          <Link
            href="/"
            className={`mt-8 rounded-full border px-6 py-3 text-sm transition ${
              isDark
                ? "border-white/15 bg-slate-700 text-stone-100 hover:bg-slate-600"
                : "border-stone-800 bg-stone-800 text-white hover:bg-stone-700"
            }`}
          >
            {t.privacyPage.beginAgain}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-5 py-8 transition-[background] duration-500 ${
        isDark ? "text-stone-100" : "text-stone-800"
      }`}
      style={{ background: activeTheme.pageBackground }}
    >
      <section className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className={`text-sm transition ${
            isDark
              ? "text-slate-400 hover:text-stone-100"
              : "text-stone-400 hover:text-stone-700"
          }`}
        >
          {t.back}
        </Link>

        <header className="mt-10 text-center">
          <p
            className={`text-xs lowercase tracking-[0.4em] ${
              isDark ? "text-slate-400" : "text-stone-400"
            }`}
          >
            {t.privacyPage.label}
          </p>

          <h1
            className={`mt-4 text-3xl font-light ${
              isDark ? "text-stone-100" : "text-stone-800"
            }`}
          >
            {t.privacyPage.title}
          </h1>

          <p
            className={`mx-auto mt-4 max-w-sm text-sm leading-7 ${bodyTextClass}`}
          >
            {t.privacyPage.intro}
          </p>
        </header>

        <div className="mt-10 space-y-4">
          <section className={cardClass}>
            <p className="text-xl" aria-hidden="true">
              🌱
            </p>

            <h2
              className={`mt-3 text-xl font-light ${
                isDark ? "text-stone-100" : "text-stone-700"
              }`}
            >
              {t.privacyPage.privateTitle}
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${bodyTextClass}`}
            >
              {t.privacyPage.privateText}
            </p>
          </section>

          <section className={cardClass}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-xl" aria-hidden="true">
                ☁️
              </p>

              <span
                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                  isDark
                    ? "border-white/10 bg-slate-900/50 text-slate-400"
                    : "border-stone-200 bg-stone-50 text-stone-400"
                }`}
              >
                {t.privacyPage.comingSoon}
              </span>
            </div>

            <h2
              className={`mt-3 text-xl font-light ${
                isDark ? "text-stone-100" : "text-stone-700"
              }`}
            >
              {t.privacyPage.cloudTitle}
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${bodyTextClass}`}
            >
              {t.privacyPage.cloudText}
            </p>
          </section>

          <section className={cardClass}>
            <p className="text-xl" aria-hidden="true">
              🤝
            </p>

            <h2
              className={`mt-3 text-xl font-light ${
                isDark ? "text-stone-100" : "text-stone-700"
              }`}
            >
              {t.privacyPage.choiceTitle}
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${bodyTextClass}`}
            >
              {t.privacyPage.choiceText}
            </p>
          </section>

          <section
            className={`rounded-3xl border px-5 py-6 transition-colors ${
              isDark
                ? "border-rose-400/15 bg-slate-800/70"
                : "border-rose-100 bg-rose-50/40"
            }`}
          >
            <p className="text-xl" aria-hidden="true">
              🗑
            </p>

            <h2
              className={`mt-3 text-xl font-light ${
                isDark ? "text-stone-100" : "text-stone-700"
              }`}
            >
              {t.privacyPage.deleteTitle}
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${bodyTextClass}`}
            >
              {t.privacyPage.deleteText}
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteConfirmation(true)}
              className={`mt-5 w-full rounded-2xl border px-4 py-3 text-sm transition ${
                isDark
                  ? "border-rose-300/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15"
                  : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
              }`}
            >
              {t.privacyPage.deleteTitle}
            </button>
          </section>
        </div>

        <section
          className={`mt-8 border-t pt-8 ${
            isDark ? "border-white/10" : "border-stone-200"
          }`}
        >
          <h2
            className={`text-xl font-light ${
              isDark ? "text-stone-100" : "text-stone-700"
            }`}
          >
            {t.privacyPage.aboutTitle}
          </h2>

          <p
            className={`mt-4 text-sm leading-7 ${bodyTextClass}`}
          >
            {t.privacyPage.aboutTextOne}
          </p>

          <p
            className={`mt-4 text-sm leading-7 ${bodyTextClass}`}
          >
            {t.privacyPage.aboutTextTwo}
          </p>

          <p
            className={`mt-7 text-xs uppercase tracking-[0.24em] ${
              isDark ? "text-slate-400" : "text-stone-400"
            }`}
          >
            {t.privacyPage.tagline}
          </p>
        </section>
      </section>

      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-everything-title"
        >
          <section
            className={`w-full max-w-sm rounded-3xl border p-6 ${
              isDark
                ? "border-white/10 bg-slate-800 text-stone-100"
                : "border-stone-200 bg-white text-stone-800"
            }`}
          >
            <h2
              id="delete-everything-title"
              className="text-2xl font-light"
            >
              {t.privacyPage.confirmTitle}
            </h2>

            <p
              className={`mt-4 text-sm leading-7 ${bodyTextClass}`}
            >
              {t.privacyPage.confirmText}
            </p>

            <p
              className={`mt-2 text-sm ${
                isDark ? "text-slate-400" : "text-stone-400"
              }`}
            >
              {t.privacyPage.cannotUndo}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isDark
                    ? "text-slate-300 hover:bg-white/5"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                {t.privacyPage.cancel}
              </button>

              <button
                type="button"
                onClick={deleteEverything}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isDark
                    ? "bg-rose-400/15 text-rose-200 hover:bg-rose-400/20"
                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                }`}
              >
                {t.privacyPage.deleteButton}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}