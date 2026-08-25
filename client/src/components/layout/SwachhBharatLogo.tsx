export function SwachhBharatLogo({ className = 'h-10' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 90"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Swachh Bharat - Ek Kadam Swachhata Ki Ore"
        role="img"
      >
        {/* Spectacle Frames */}
        {/* Left Lens */}
        <circle cx="70" cy="40" r="28" stroke="#1F2937" strokeWidth="3.5" fill="#FFFFFF" />
        {/* Right Lens */}
        <circle cx="170" cy="40" r="28" stroke="#1F2937" strokeWidth="3.5" fill="#FFFFFF" />

        {/* Bridge connecting lenses */}
        <path d="M98 36 Q120 22 142 36" stroke="#1F2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Left Temple Arm */}
        <path d="M42 36 Q22 30 10 18" stroke="#1F2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Right Temple Arm */}
        <path d="M198 36 Q218 30 230 18" stroke="#1F2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Hindi Text inside lenses */}
        {/* Left: स्वच्छ */}
        <text
          x="70"
          y="47"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fontFamily="'Noto Sans Devanagari', sans-serif"
          fill="#1F2937"
        >
          स्वच्छ
        </text>

        {/* Right: भारत */}
        <text
          x="170"
          y="47"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fontFamily="'Noto Sans Devanagari', sans-serif"
          fill="#1F2937"
        >
          भारत
        </text>

        {/* Subtitle: एक कदम स्वच्छता की ओर */}
        <text
          x="120"
          y="82"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fontFamily="'Noto Sans Devanagari', sans-serif"
          fill="#1F2937"
          letterSpacing="0.02em"
        >
          एक कदम स्वच्छता की ओर
        </text>
      </svg>
    </div>
  );
}
