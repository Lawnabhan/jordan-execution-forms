import React from 'react';

interface JusticeEmblemProps {
  className?: string;
  size?: number;
  variant?: 'gold' | 'emerald' | 'crimson' | 'dark';
}

export const JusticeEmblem: React.FC<JusticeEmblemProps> = ({
  className = '',
  size = 40,
  variant = 'gold',
}) => {
  const gradientId = `justice-grad-${variant}`;
  const strokeColor = variant === 'gold' ? '#d97706' : variant === 'emerald' ? '#047857' : '#0f172a';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 drop-shadow-sm ${className}`}
      fill="none"
      role="img"
      aria-label="شعار العدالة وميزان الحق"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {variant === 'gold' && (
            <>
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </>
          )}
          {variant === 'emerald' && (
            <>
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </>
          )}
          {variant === 'crimson' && (
            <>
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </>
          )}
          {variant === 'dark' && (
            <>
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </>
          )}
        </linearGradient>
      </defs>

      {/* Decorative Outer Ring / Laurel Wreath */}
      <circle cx="50" cy="50" r="46" stroke={`url(#${gradientId})`} strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="50" cy="50" r="42" stroke={`url(#${gradientId})`} strokeWidth="1.5" />

      {/* Laurel Wreath Leaves Left */}
      <path
        d="M20,65 C15,50 18,35 28,24 M18,52 C12,48 14,42 20,44 M22,38 C18,32 24,28 28,32 M24,60 C18,58 20,52 26,54"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Laurel Wreath Leaves Right */}
      <path
        d="M80,65 C85,50 82,35 72,24 M82,52 C88,48 86,42 80,44 M78,38 C82,32 76,28 72,32 M76,60 C82,58 80,52 74,54"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Central Pillar & Base */}
      {/* Base Steps */}
      <path d="M36,80 L64,80 M40,76 L60,76 M44,72 L56,72" stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Main Vertical Column */}
      <line x1="50" y1="22" x2="50" y2="72" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
      
      {/* Top Finial / Crown Sphere */}
      <circle cx="50" cy="18" r="3.5" fill={`url(#${gradientId})`} />

      {/* Horizontal Balance Beam */}
      <path
        d="M26,30 Q50,26 74,30"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Balance Beam Center Joint */}
      <circle cx="50" cy="28" r="2.5" fill={`url(#${gradientId})`} />

      {/* Left Scale Suspension Strings */}
      <line x1="26" y1="30" x2="20" y2="48" stroke={`url(#${gradientId})`} strokeWidth="1.2" />
      <line x1="26" y1="30" x2="32" y2="48" stroke={`url(#${gradientId})`} strokeWidth="1.2" />
      {/* Left Pan (Bowl) */}
      <path
        d="M18,48 C18,55 34,55 34,48 Z"
        fill={`url(#${gradientId})`}
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
      />

      {/* Right Scale Suspension Strings */}
      <line x1="74" y1="30" x2="68" y2="48" stroke={`url(#${gradientId})`} strokeWidth="1.2" />
      <line x1="74" y1="30" x2="80" y2="48" stroke={`url(#${gradientId})`} strokeWidth="1.2" />
      {/* Right Pan (Bowl) */}
      <path
        d="M66,48 C66,55 82,55 82,48 Z"
        fill={`url(#${gradientId})`}
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
      />

      {/* Small Sword / Point of Justice behind scale tip */}
      <path d="M50,14 L50,18" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
