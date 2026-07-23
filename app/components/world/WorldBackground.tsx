type WorldBackgroundProps = {
  children: React.ReactNode;
};

export default function WorldBackground({
  children,
}: WorldBackgroundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-emerald-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {children}
      </div>
    </div>
  );
}