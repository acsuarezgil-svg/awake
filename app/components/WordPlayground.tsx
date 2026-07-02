"use client";

import { useEffect, useMemo, useState} from "react";

type WordPlaygroundProps = {
  patterns: string[];
  investments: string[];
};

type Area = "less" | "center" | "more";

type Word = {
  text: string;
  area: Area;
};



export default function WordPlayground({
  patterns,
  investments,
}: WordPlaygroundProps) {
  const initialWords = useMemo<Word[]>(() => {
    return [
      ...patterns.map((text) => ({ text, area: "less" as Area })),
      ...investments.map((text) => ({ text, area: "more" as Area })),
    ];
  }, [patterns, investments]);

  const [words, setWords] = useState(initialWords);

    useEffect(() => {
        setWords(initialWords);
    }, [initialWords]);

  function moveWord(text: string) {
    setWords((prev) =>
      prev.map((word) => {
        if (word.text !== text) return word;
        if (word.area === "less") return { ...word, area: "center" };
        if (word.area === "center") return { ...word, area: "more" };
        return { ...word, area: "less" };
      })
    );
  }

  function wordsFor(area: Area) {
    return words.filter((word) => word.area === area);
  }

  function Chip({ word }: { word: Word }) {
    return (
      <button
        onClick={() => moveWord(word.text)}
        className="rounded-full border bg-white px-3 py-2 text-sm shadow-sm"
      >
        {word.text}
      </button>
    );
  }

  return (
    <section className="mb-6 rounded-3xl border bg-green-50/40 p-5">
      <h2 className="text-2xl font-bold text-green-900">
        🌱 What you focus on grows
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Tap a word to move it around your focus.
      </p>

      <div className="relative mt-6 min-h-[430px] rounded-3xl bg-white/70 p-4">
        <div className="absolute left-4 top-6 h-44 w-44 rounded-full border border-purple-300 bg-purple-50/70 p-4">
          <p className="mb-2 text-sm font-semibold text-purple-800">
            Less Focus
          </p>
          <div className="flex flex-wrap gap-2">
            {wordsFor("less").map((word) => (
              <Chip key={word.text} word={word} />
            ))}
          </div>
        </div>

        <div className="absolute left-1/2 top-28 flex h-36 w-36 -translate-x-1/2 items-center justify-center rounded-full border border-green-400 bg-white text-center">
          <div>
            <p className="text-sm font-semibold text-green-900">You</p>
            <p className="text-xs text-gray-500">In focus</p>
          </div>
        </div>

        <div className="absolute bottom-6 right-4 h-52 w-44 rounded-full border border-green-400 bg-green-50/80 p-4">
          <p className="mb-2 text-sm font-semibold text-green-900">
            More Focus
          </p>
          <div className="flex flex-wrap gap-2">
            {wordsFor("more").map((word) => (
              <Chip key={word.text} word={word} />
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-4 max-w-[45%]">
          <p className="text-xs text-gray-500">
            The words are not good or bad. They are just what has your attention.
          </p>
        </div>

        <div className="absolute left-1/2 top-20 -translate-x-1/2">
          <div className="flex flex-wrap justify-center gap-2">
            {wordsFor("center").map((word) => (
              <Chip key={word.text} word={word} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}