import Link from "next/link";

const philosophy = [
  {
    title: "Observe",
    text: "Notice what is supporting you and what is asking to change.",
  },
  {
    title: "Build",
    text: "Shape a simple system around the life you are actually living.",
  },
  {
    title: "Experiment",
    text: "Try it gently. A system is a working theory, not a permanent rule.",
  },
  {
    title: "Review",
    text: "Ask whether it supported your life, then keep, change, or pause it.",
  },
];

export default function AboutPage() {
  return (
    <main className="awake-page min-h-screen px-5 py-8">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="awake-button awake-button-quiet -ml-4"
        >
          ← Return to Foundations
        </Link>

        <header className="mx-auto mt-10 max-w-xl text-center">
          <p className="awake-eyebrow">About Awake</p>
          <h1 className="mt-4">Systems that can change with you</h1>
          <p className="awake-supporting mt-5 text-base">
            Awake is a calm place to build systems that support your life.
            It helps you observe, experiment, review, and keep what works.
          </p>
        </header>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          {philosophy.map((item) => (
            <div key={item.title} className="awake-card">
              <h2 className="text-lg">{item.title}</h2>
              <p className="awake-supporting mt-3">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="awake-surface mt-8">
          <p className="awake-eyebrow">The philosophy of Awake</p>
          <div className="mt-5 space-y-3 text-sm">
            <p>Keep what works. Change what doesn’t.</p>
            <p>Life changes. Your systems can too.</p>
            <p>
              There are no streaks, scores, or perfect routines to protect.
              Reflection matters more than performance.
            </p>
            <p>
              A paused or unfinished system has not failed. It has given you
              something to notice.
            </p>
          </div>
        </section>

        <section className="awake-card mt-6">
          <h2>Your thoughts belong to you.</h2>
          <p className="awake-supporting mt-4">
            Awake keeps its core experience local to your device. You remain
            in control of what you save and when you remove it.
          </p>
          <Link
            href="/privacy"
            className="awake-button awake-button-secondary mt-5"
          >
            Read the privacy promise
          </Link>
        </section>

        <blockquote className="mx-auto mt-10 max-w-lg border-l-2 pl-5 text-lg leading-8">
          Observe. Build. Experiment. Review. Keep what works. Change what
          doesn’t.
        </blockquote>

        <footer className="mt-12 text-center">
          <p className="awake-supporting">
            Life changes. Your systems can too.
          </p>
          <Link
            href="/"
            className="awake-button awake-button-primary mt-6"
          >
            Return to Foundations
          </Link>
        </footer>
      </article>
    </main>
  );
}
