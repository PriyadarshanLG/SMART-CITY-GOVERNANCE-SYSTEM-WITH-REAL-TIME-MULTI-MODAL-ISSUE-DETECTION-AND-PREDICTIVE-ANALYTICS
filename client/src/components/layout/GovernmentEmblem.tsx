export function GovernmentEmblem({
  className = 'h-12 w-12',
  showText = false,
  inverted = false,
}: {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
}) {
  const primaryColor = inverted ? '#FFFFFF' : '#0A2540';
  const goldColor = inverted ? '#FCD34D' : '#D97706';

  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        viewBox="0 0 120 140"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="National Emblem of India - Satyameva Jayate"
        role="img"
      >
        {/* Outer Halo / Sunburst Ring */}
        <circle cx="60" cy="55" r="50" stroke={goldColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        
        {/* Ashoka Lion Heads Stylized Crest */}
        {/* Central Lion Head */}
        <path
          d="M60 12 C52 12, 46 18, 46 26 C46 32, 50 36, 52 40 C54 44, 52 48, 50 52 C56 50, 64 50, 70 52 C68 48, 66 44, 68 40 C70 36, 74 32, 74 26 C74 18, 68 12, 60 12 Z"
          fill={primaryColor}
        />
        {/* Crown / Top Knot */}
        <path d="M57 7 L63 7 L60 12 Z" fill={goldColor} />

        {/* Left Lion Head */}
        <path
          d="M44 22 C37 20, 31 24, 29 32 C27 38, 30 43, 33 47 C36 51, 35 55, 34 58 C40 56, 46 54, 50 58 C48 53, 46 48, 45 44 C43 40, 42 34, 44 22 Z"
          fill={primaryColor}
          opacity="0.9"
        />

        {/* Right Lion Head */}
        <path
          d="M76 22 C83 20, 89 24, 91 32 C93 38, 90 43, 87 47 C84 51, 85 55, 86 58 C80 56, 74 54, 70 58 C72 53, 74 48, 75 44 C77 40, 78 34, 76 22 Z"
          fill={primaryColor}
          opacity="0.9"
        />

        {/* Lion Eyes and Facial features */}
        <circle cx="56" cy="28" r="1.5" fill={goldColor} />
        <circle cx="64" cy="28" r="1.5" fill={goldColor} />
        <path d="M58 35 L62 35 L60 38 Z" fill={goldColor} />
        <path d="M54 44 Q60 48 66 44" stroke={goldColor} strokeWidth="1.5" strokeLinecap="round" />

        {/* Abacus / Base Platform */}
        <rect x="22" y="66" width="76" height="12" rx="2" fill={primaryColor} />
        <rect x="20" y="70" width="80" height="4" fill={goldColor} />

        {/* Ashoka Dharma Chakra (Wheel of Law) on the Abacus */}
        <circle cx="60" cy="72" r="7" fill={inverted ? '#061626' : '#FFFFFF'} stroke={goldColor} strokeWidth="1.5" />
        <circle cx="60" cy="72" r="2" fill={goldColor} />
        {/* Spokes of the Chakra */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="60"
            y1="72"
            x2={60 + 5.5 * Math.cos((deg * Math.PI) / 180)}
            y2={72 + 5.5 * Math.sin((deg * Math.PI) / 180)}
            stroke={goldColor}
            strokeWidth="0.8"
          />
        ))}

        {/* Galloping Horse (Left) & Bull (Right) silhouettes */}
        <path d="M30 73 C33 70, 37 71, 40 73" stroke={goldColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M80 73 C83 70, 87 71, 90 73" stroke={goldColor} strokeWidth="1.5" strokeLinecap="round" />

        {/* Lotus Base / Pedestal */}
        <path
          d="M26 82 Q60 92 94 82 L96 90 Q60 98 24 90 Z"
          fill={primaryColor}
        />
        <path d="M32 86 Q60 94 88 86" stroke={goldColor} strokeWidth="1" />

        {/* Satyameva Jayate (सत्यमेव जयते) Inscription Banner */}
        <rect x="18" y="104" width="84" height="20" rx="3" fill={inverted ? '#0f2942' : '#F1F5F9'} stroke={primaryColor} strokeWidth="1.2" />
        <text
          x="60"
          y="118"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="'Noto Sans Devanagari', sans-serif"
          fill={goldColor}
          letterSpacing="0.05em"
        >
          सत्यमेव जयते
        </text>
        <text
          x="60"
          y="132"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          fill={primaryColor}
          letterSpacing="0.12em"
        >
          SMART CITY MISSION
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#D97706] uppercase">
            भारत सरकार · Govt. of India
          </span>
          <span className="text-xs font-black tracking-tight text-[#0A2540] dark:text-white uppercase">
            Smart City Municipal Corporation
          </span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
            स्मार्ट सिटी लोक शिकायत निवारण प्रणाली
          </span>
        </div>
      )}
    </div>
  );
}
