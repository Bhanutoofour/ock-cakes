// Party decorations layered over the home hero banners. Everything is drawn in
// SVG/CSS so it stays sharp at any size and colours can be set per slide.

export type HeroDecor = {
  bunting?: string[];
  balloons?: string[];
  confetti: string[];
};

const FLAG_COUNT = 6;

function Bunting({ colors }: { colors: string[] }) {
  // Flags hang from a curved string: M0,8 Q300,64 600,8
  const flags = Array.from({ length: FLAG_COUNT }, (_, index) => {
    const t = (index + 0.5) / FLAG_COUNT;
    const x = 2 * (1 - t) * t * 300 + t * t * 600;
    const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 64 + t * t * 8;
    const slope = Math.atan2(56 * (1 - 2 * t), 300) * (180 / Math.PI);
    return { x, y, slope, color: colors[index % colors.length] };
  });

  return (
    <svg viewBox="0 0 600 150" className="h-full w-full overflow-visible" aria-hidden="true">
      <path d="M0,8 Q300,64 600,8" fill="none" stroke="#b9a48a" strokeWidth="2" />
      {flags.map((flag) => (
        <g key={flag.x} transform={`translate(${flag.x} ${flag.y}) rotate(${flag.slope})`}>
          <path d="M-34,0 L34,0 L0,80 Z" fill={flag.color} />
          <path d="M-34,0 L34,0 L0,80 Z" fill="url(#flag-sheen)" />
        </g>
      ))}
      <defs>
        <linearGradient id="flag-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const BALLOON_POSITIONS = [
  { cx: 62, cy: 74, scale: 1 },
  { cx: 138, cy: 58, scale: 1.08 },
  { cx: 100, cy: 140, scale: 0.92 },
];

function Balloons({ colors }: { colors: string[] }) {
  return (
    <svg viewBox="0 0 200 320" className="h-full w-full overflow-visible" aria-hidden="true">
      {BALLOON_POSITIONS.map((balloon, index) => {
        const rx = 40 * balloon.scale;
        const ry = 48 * balloon.scale;
        const bottom = balloon.cy + ry;
        return (
          <g key={balloon.cx}>
            <path
              d={`M${balloon.cx},${bottom + 6} C${balloon.cx - 12},${bottom + 70} ${108},${250} ${104},${318}`}
              fill="none"
              stroke="#c8b9a6"
              strokeWidth="1.4"
            />
            <ellipse
              cx={balloon.cx}
              cy={balloon.cy}
              rx={rx}
              ry={ry}
              fill={colors[index % colors.length]}
              stroke="rgba(0,0,0,0.06)"
            />
            <ellipse
              cx={balloon.cx - rx * 0.38}
              cy={balloon.cy - ry * 0.42}
              rx={rx * 0.22}
              ry={ry * 0.3}
              fill="#fff"
              opacity="0.45"
              transform={`rotate(-24 ${balloon.cx - rx * 0.38} ${balloon.cy - ry * 0.42})`}
            />
            <path
              d={`M${balloon.cx - 5},${bottom + 7} L${balloon.cx + 5},${bottom + 7} L${balloon.cx},${bottom - 1} Z`}
              fill={colors[index % colors.length]}
            />
          </g>
        );
      })}
    </svg>
  );
}

// Fixed positions (percent of the banner) so the layout is identical on every render.
const CONFETTI = [
  { left: 4, top: 14, size: 8, round: true },
  { left: 11, top: 82, size: 6, round: false },
  { left: 22, top: 9, size: 5, round: true },
  { left: 31, top: 88, size: 9, round: false },
  { left: 38, top: 30, size: 6, round: true },
  { left: 43, top: 70, size: 7, round: true },
  { left: 47, top: 12, size: 6, round: false },
  { left: 52, top: 52, size: 5, round: true },
  { left: 2, top: 55, size: 6, round: false },
];

export function HeroDecorations({ decor }: { decor: HeroDecor }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {CONFETTI.map((piece, index) => (
        <span
          key={`${piece.left}-${piece.top}`}
          className={`absolute hidden sm:block ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{
            left: `${piece.left}%`,
            top: `${piece.top}%`,
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 1.8,
            backgroundColor: decor.confetti[index % decor.confetti.length],
            transform: piece.round ? undefined : `rotate(${(index * 37) % 90 - 45}deg)`,
            opacity: 0.8,
          }}
        />
      ))}

      {decor.bunting ? (
        <div className="absolute left-[46%] top-0 h-[20%] w-[34%] sm:left-[27%] sm:h-[30%] sm:w-[32%]">
          <Bunting colors={decor.bunting} />
        </div>
      ) : null}

      {decor.balloons ? (
        <div className="absolute right-1 top-[4%] h-[56%] w-[24%] sm:right-[84px] sm:top-[2%] sm:h-[96%] sm:w-[17%]">
          <Balloons colors={decor.balloons} />
        </div>
      ) : null}
    </div>
  );
}
