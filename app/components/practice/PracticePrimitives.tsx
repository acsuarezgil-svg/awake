import Link from "next/link";
import type { ReactNode } from "react";

export function PracticeHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header>
      {eyebrow && <p className="awake-eyebrow">{eyebrow}</p>}
      <h1 className="mt-2">{title}</h1>
      <p className="awake-supporting mt-2 max-w-xl leading-6">{subtitle}</p>
    </header>
  );
}

export function SectionTitle({
  title,
  supporting,
}: {
  title: string;
  supporting?: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-medium">{title}</h2>
      {supporting && (
        <p className="awake-supporting mt-1 text-sm">{supporting}</p>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="awake-empty-state rounded-3xl border border-dashed p-6 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="awake-supporting mx-auto mt-2 max-w-sm text-sm leading-6">
        {children}
      </div>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}

export function GentleLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="awake-button awake-button-secondary">
      {children}
    </Link>
  );
}

