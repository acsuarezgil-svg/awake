import type { ReactNode } from "react";

type Props = {
  header: ReactNode;
  world: ReactNode;
  leading?: ReactNode;
  supporting?: ReactNode;
  primaryAction: ReactNode;
  overlay?: ReactNode;
};

export default function ResponsiveLayout({
  header,
  world,
  leading,
  supporting,
  primaryAction,
  overlay,
}: Props) {
  return (
    <div className="awake-responsive-shell mx-auto w-full max-w-[64rem]">
      <div className="awake-responsive-header">{header}</div>
      {overlay && <div className="awake-responsive-overlay">{overlay}</div>}
      <div className="awake-responsive-grid">
        {leading && (
          <aside
            className="awake-responsive-leading"
            aria-label="Today at a glance"
          >
            {leading}
          </aside>
        )}
        <section className="awake-responsive-world" aria-label="Your World">
          {world}
        </section>
        <aside className="awake-responsive-rail" aria-label="World support">
          <div className="awake-responsive-action">{primaryAction}</div>
          {supporting && (
            <div className="awake-responsive-supporting">{supporting}</div>
          )}
        </aside>
      </div>
    </div>
  );
}
