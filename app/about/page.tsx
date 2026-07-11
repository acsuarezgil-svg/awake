import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-8">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-stone-400 transition hover:text-stone-700"
        >
          ← Awake
        </Link>

        <header className="mt-12 text-center">
          <p className="text-xs lowercase tracking-[0.4em] text-stone-400">
            awake
          </p>

          <h1 className="mt-4 text-3xl font-light text-stone-800">
            Observe. Choose. Grow.
          </h1>
        </header>

        <section className="mt-12 space-y-5 text-center text-base leading-7 text-stone-500">
          <p>Awake was created to help us notice before we react.</p>

          <p>
            Not to judge ourselves. Not to become perfect. Simply to become
            aware.
          </p>

          <p>
            Awareness creates space. In that space, we can choose. Those
            choices become growth.
          </p>
        </section>

        <section className="mt-14 rounded-3xl bg-stone-50 px-6 py-8 text-center">
          <h2 className="text-lg font-light text-stone-700">
            What to notice
          </h2>

          <div className="mt-6 space-y-4 text-stone-500">
            <p>Notice what gives you energy.</p>
            <p>Notice what takes it.</p>
            <p>Notice what keeps returning.</p>
            <p>Notice what matters.</p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-center text-lg font-light text-stone-700">
            The Awake principles
          </h2>

          <div className="mx-auto mt-7 max-w-md space-y-4 text-sm leading-6 text-stone-500">
            <p>Awareness before reaction.</p>
            <p>Curiosity over judgment.</p>
            <p>Progress over perfection.</p>
            <p>Your data belongs to you.</p>
            <p>Reflection is optional.</p>
            <p>Share only if you choose.</p>
          </div>
        </section>

        <blockquote className="mx-auto mt-14 max-w-lg border-l-2 border-stone-200 pl-5 text-lg font-light leading-8 text-stone-600">
          Awareness is not about becoming perfect. It is about noticing.
        </blockquote>

        <div className="mt-14 text-center">
          <Link
            href="/"
            className="inline-flex rounded-full border border-stone-200 px-5 py-2.5 text-sm text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
          >
            Return to the wheel
          </Link>
        </div>
      </article>
    </main>
  );
}