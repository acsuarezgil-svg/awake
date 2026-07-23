type WorldHeaderProps = {
  subtitle?: string;
};

export default function WorldHeader({
  subtitle = "Observe. Choose. Grow.",
}: WorldHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="text-5xl font-light tracking-tight">
        🌎
      </h1>

      <h2 className="mt-4 text-3xl font-semibold text-stone-800">
        Your World
      </h2>

      <p className="mt-3 text-stone-500">
        {subtitle}
      </p>
    </header>
  );
}