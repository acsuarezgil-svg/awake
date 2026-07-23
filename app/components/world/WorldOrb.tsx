import Link from "next/link";

type WorldOrbProps = {
  href: string;
  icon: string;
  title: string;
  description: string;
  accent: string;
  background: string;
};

export default function WorldOrb({
  href,
  icon,
  title,
  description,
  accent,
  background,
}: WorldOrbProps) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        flex-col
        items-center
        gap-3
        rounded-3xl
        border
        border-white/80
        bg-white/70
        p-5
        backdrop-blur-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div
        className={`
          ${background}
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          shadow-sm
          transition-transform
          duration-300
          group-hover:scale-105
        `}
      >
        <span className="text-5xl">
          {icon}
        </span>
      </div>

      <h2 className={`text-lg font-semibold ${accent}`}>
        {title}
      </h2>

      <p className="text-center text-sm leading-6 text-stone-500">
        {description}
      </p>
    </Link>
  );
}