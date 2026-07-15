"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../theme";

import { translations, type Language } from "../translations";


export default function AboutPage() {
  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");

  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  useEffect(() => {
    const savedWheelTheme = localStorage.getItem(
      "awake-wheel-theme"
    );
    
    if (savedWheelTheme && isWheelTheme(savedWheelTheme)) {
      setWheelTheme(savedWheelTheme);
    }

    const savedLanguage = localStorage.getItem(
      "awake-language"
    ) as Language | null;

    if (savedLanguage) {
      setLanguage(savedLanguage);
  }
  }, []);

  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);
  

  const cardClass = `rounded-3xl border px-6 py-7 transition-colors ${
    isDark
      ? "border-white/10 bg-slate-800/70"
      : "border-stone-200 bg-white/80"
  }`;

  const bodyTextClass = isDark
    ? "text-slate-300"
    : "text-stone-500";

  return (
    <main
      className={`min-h-screen px-5 py-8 transition-[background] duration-500 ${
        isDark ? "text-stone-100" : "text-stone-800"
      }`}
      style={{ background: activeTheme.pageBackground }}
    >
      <article className="mx-auto max-w-2xl">
        <Link
          href="/"
          className={`text-sm transition ${
            isDark
              ? "text-slate-400 hover:text-stone-100"
              : "text-stone-400 hover:text-stone-700"
          }`}
        >
          ← Awake
        </Link>

        <header className="mt-12 text-center">
          <p
            className={`text-xs lowercase tracking-[0.4em] ${
              isDark ? "text-slate-400" : "text-stone-400"
            }`}
          >
            {t.aboutLabel}
          </p>

          <h1
            className={`mt-4 text-3xl font-light ${
              isDark ? "text-stone-100" : "text-stone-800"
            }`}
          >
            {t.aboutTitle}
          </h1>

          <p
            className={`mx-auto mt-5 max-w-lg text-sm leading-7 ${bodyTextClass}`}
          >
            {t.aboutIntro}
          </p>
        </header>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className={cardClass}>
            <p className="text-xl" aria-hidden="true">
              ◉
            </p>

            <h2
              className={`mt-3 text-lg font-light ${
                isDark ? "text-stone-100" : "text-stone-700"
              }`}
            >
              {t.aboutObserveTitle}
            </h2>

            <p
              className={`mt-3 text-sm leading-6 ${bodyTextClass}`}
            >
              {t.aboutObserveText}
            </p>
          </div>

          <div className={cardClass}>
            <p className="text-xl" aria-hidden="true">
              ◇
            </p>

            <h2
              className={`mt-3 text-lg font-light ${
                isDark ? "text-stone-100" : "text-stone-700"
              }`}
            >
              {t.aboutChooseTitle}
            </h2>

            <p
              className={`mt-3 text-sm leading-6 ${bodyTextClass}`}
            >
              {t.aboutChooseText}
            </p>
          </div>

          <div className={cardClass}>
            <p className="text-xl" aria-hidden="true">
              ✦
            </p>

            <h2
              className={`mt-3 text-lg font-light ${
                isDark ? "text-stone-100" : "text-stone-700"
              }`}
            >
              {t.aboutGrowTitle}
            </h2>

            <p
              className={`mt-3 text-sm leading-6 ${bodyTextClass}`}
            >
              {t.aboutGrowText}
            </p>
          </div>
        </section>

        <section className={`mt-8 ${cardClass}`}>
          <h2
            className={`text-xl font-light ${
              isDark ? "text-stone-100" : "text-stone-700"
            }`}
          >
            {t.whatAwakeIs}
          </h2>

          <div
            className={`mt-5 space-y-3 text-sm leading-6 ${bodyTextClass}`}
          >
            <p>{t.awakeIsMirror}</p>
            <p>{t.awakeIsCompass}</p>
            <p>{t.awakeIsReflection}</p>
            <p>{t.awakeIsChoice}</p>
          </div>
        </section>

        <section className={`mt-4 ${cardClass}`}>
          <h2
            className={`text-xl font-light ${
              isDark ? "text-stone-100" : "text-stone-700"
            }`}
          >
            {t.whatAwakeIsNot}
          </h2>

          <div
            className={`mt-5 space-y-3 text-sm leading-6 ${bodyTextClass}`}
          >
            <p>{t.noStreaks}</p>
            <p>{t.noShame}</p>
            <p>{t.noPressure}</p>
            <p>{t.noJudgment}</p>
          </div>
        </section>

        <section
          className={`mt-8 rounded-3xl border px-6 py-7 ${
            isDark
              ? "border-white/10 bg-slate-800/70"
              : "border-stone-200 bg-stone-50/70"
          }`}
        >
          <h2
            className={`text-xl font-light ${
              isDark ? "text-stone-100" : "text-stone-700"
            }`}
          >
            {t.thoughtsBelongToYou}
          </h2>

          <p
            className={`mt-4 text-sm leading-7 ${bodyTextClass}`}
          >
            {t.aboutPrivacyText}
          </p>

          <Link
            href="/privacy"
            className={`mt-5 inline-flex rounded-full border px-4 py-2 text-sm transition ${
              isDark
                ? "border-white/15 text-slate-300 hover:bg-white/5 hover:text-white"
                : "border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            {t.privacyPromise}
          </Link>
        </section>

        <blockquote
          className={`mx-auto mt-12 max-w-lg border-l-2 pl-5 text-lg font-light leading-8 ${
            isDark
              ? "border-slate-600 text-slate-200"
              : "border-stone-200 text-stone-600"
          }`}
        >
          {t.aboutQuote}
        </blockquote>

        <footer className="mt-14 text-center">
          <p
            className={`text-xs uppercase tracking-[0.24em] ${
              isDark ? "text-slate-400" : "text-stone-400"
            }`}
          >
            {t.awakeVersion}
          </p>

          <p
            className={`mt-3 text-xs ${
              isDark ? "text-slate-500" : "text-stone-300"
            }`}
          >
            {t.madeWithCuriosity}
          </p>

          <Link
            href="/"
            className={`mt-8 inline-flex rounded-full border px-5 py-2.5 text-sm transition ${
              isDark
                ? "border-white/15 text-slate-300 hover:bg-white/5 hover:text-white"
                : "border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            {t.returnToWheel}
          </Link>
        </footer>
      </article>
    </main>
  );
}