import Image from "next/image";

const SIZES = {
  hero: {
    width: 140,
    height: 140,
    title: "text-2xl mt-6",
    rotate: "rotate-2 group-hover:rotate-6",
  },
  md: {
    width: 72,
    height: 72,
    title: "text-base mt-3",
    rotate: "rotate-1",
  },
  compact: {
    width: 88,
    height: 88,
    title: "text-xs sm:text-sm mt-3",
    rotate: "rotate-1",
  },
  sm: {
    width: 48,
    height: 48,
    title: "text-xs mt-2",
    rotate: "",
  },
  xs: {
    width: 40,
    height: 40,
    title: "text-[10px] mt-1",
    rotate: "",
  },
};

export default function BrandMark({
  size = "md",
  showTitle = false,
  interactive = false,
  className = "",
}) {
  const cfg = SIZES[size] || SIZES.md;
  const wrap = interactive ? "group cursor-pointer" : "";

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${wrap} ${className}`.trim()}
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm border border-stone-100 ${
          interactive
            ? `${cfg.rotate} transition-transform duration-500 group-hover:shadow-md group-hover:border-primary/20`
            : cfg.rotate
        }`}
        style={{ width: cfg.width, height: cfg.height }}
      >
        <Image 
          src="/varnox-logo.png" 
          alt="Varnox Logo" 
          fill
          sizes={`${cfg.width}px`}
          className="object-contain p-2"
          priority={size === 'hero' || size === 'compact'}
        />
      </div>
      {showTitle ? (
        <p
          className={`flex items-center gap-1.5 font-black tracking-[0.15em] text-stone-900 ${cfg.title}`}
        >
          VARNOX
        </p>
      ) : null}
    </div>
  );
}
