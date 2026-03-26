const SIZES = {
  hero: {
    outer: "w-40 h-40 rounded-[2rem]",
    text: "text-5xl",
    badge: "w-14 h-14 border-[#f6faf9] border-4 -bottom-3 -end-3",
    svg: 20,
    title: "text-2xl mt-8",
    rotate: "rotate-3 group-hover:rotate-6",
  },
  md: {
    outer: "w-[4.5rem] h-[4.5rem] rounded-2xl",
    text: "text-2xl",
    badge: "w-10 h-10 border-white border-[3px] -bottom-2 -end-2",
    svg: 14,
    title: "text-base mt-3",
    rotate: "rotate-2",
  },
  compact: {
    outer: "w-[4.75rem] h-[4.75rem] sm:w-[5.5rem] sm:h-[5.5rem] rounded-2xl",
    text: "text-3xl sm:text-4xl",
    badge: "w-9 h-9 sm:w-10 sm:h-10 border-[#f6faf9] border-[3px] -bottom-2 -end-2",
    svg: 14,
    title: "text-xs sm:text-sm mt-3",
    rotate: "rotate-2",
  },
  sm: {
    outer: "w-12 h-12 rounded-2xl",
    text: "text-lg",
    badge: "w-7 h-7 border-white border-2 -bottom-1.5 -end-1.5",
    svg: 11,
    title: "text-xs mt-2",
    rotate: "",
  },
  xs: {
    outer: "w-10 h-10 rounded-2xl",
    text: "text-sm",
    badge: "w-5 h-5 border-white border-2 -bottom-1 -end-1",
    svg: 9,
    title: "text-[10px] mt-1",
    rotate: "",
  },
};

const BagIcon = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

/**
 * Same visual language as the homepage hero mark (MA lockup + bag badge).
 */
export default function BrandMark({
  size = "md",
  showTitle = false,
  interactive = false,
  className = "",
}) {
  const cfg = SIZES[size] || SIZES.md;
  const wrap = interactive ? "group cursor-default" : "";

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${wrap} ${className}`.trim()}
    >
      <div
        className={`relative flex items-center justify-center bg-stone-900 shadow-xl ${cfg.outer} ${
          interactive
            ? `${cfg.rotate} transition-transform duration-500`
            : cfg.rotate
        }`}
      >
        <span
          className={`font-black tracking-tighter text-white mix-blend-overlay opacity-90 ${cfg.text}`}
        >
          MA
        </span>
        <div
          className={`absolute flex items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30 ${cfg.badge} ${
            interactive ? "transition-transform duration-500 group-hover:scale-110" : ""
          }`}
        >
          <BagIcon size={cfg.svg} />
        </div>
      </div>
      {showTitle ? (
        <p
          className={`flex items-center gap-1.5 font-black tracking-[0.18em] text-stone-900 ${cfg.title}`}
        >
          MA-AP{" "}
          <span className="font-light tracking-normal text-stone-400">STORE</span>
        </p>
      ) : null}
    </div>
  );
}
