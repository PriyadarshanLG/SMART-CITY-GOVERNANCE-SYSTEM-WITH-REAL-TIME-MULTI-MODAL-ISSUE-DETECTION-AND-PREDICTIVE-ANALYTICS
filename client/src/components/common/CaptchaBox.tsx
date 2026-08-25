import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

interface CaptchaBoxProps {
  onCodeChange: (code: string) => void;
  className?: string;
}

export function CaptchaBox({ onCodeChange, className = '' }: CaptchaBoxProps) {
  const [captchaCode, setCaptchaCode] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    onCodeChange(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Captcha Canvas / Box */}
      <div className="relative flex h-10 w-32 items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white px-2 shadow-inner">
        {/* Anti-bot Noise Lines */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40">
          <line x1="0" y1="8" x2="120" y2="32" stroke="#ef4444" strokeWidth="1.2" />
          <line x1="10" y1="35" x2="110" y2="10" stroke="#3b82f6" strokeWidth="1" />
          <line x1="20" y1="20" x2="100" y2="25" stroke="#10b981" strokeWidth="1" />
          <line x1="5" y1="28" x2="125" y2="18" stroke="#f59e0b" strokeWidth="1" />
        </svg>

        {/* Captcha Characters with individual random styles */}
        <div className="flex items-center justify-around w-full relative z-10">
          {captchaCode.split('').map((char, index) => {
            const rotations = [-12, 8, -6, 14, -8];
            const colors = ['#0f172a', '#1e293b', '#0A2540', '#1e3a8a', '#047857'];
            const rot = rotations[index % rotations.length];
            const col = colors[index % colors.length];

            return (
              <span
                key={index}
                style={{
                  transform: `rotate(${rot}deg)`,
                  color: col,
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '17px',
                  letterSpacing: '1px',
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Refresh Button */}
      <button
        type="button"
        onClick={generateCaptcha}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition shadow-sm"
        title="Refresh Captcha Code"
        aria-label="Refresh Captcha"
      >
        <RotateCw className="h-4 w-4" />
      </button>
    </div>
  );
}
