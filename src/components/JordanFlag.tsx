import React from 'react';

interface JordanFlagProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
}

export const JordanFlag: React.FC<JordanFlagProps> = ({
  className = '',
  width = 24,
  height = 16,
  rounded = true,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      width={width}
      height={height}
      className={`inline-block shadow-xs shrink-0 ${rounded ? 'rounded-xs overflow-hidden border border-black/20' : ''} ${className}`}
      role="img"
      aria-label="علم المملكة الأردنية الهاشمية"
    >
      {/* Top Black Stripe */}
      <rect width="60" height="10" y="0" fill="#000000" />
      {/* Middle White Stripe */}
      <rect width="60" height="10" y="10" fill="#FFFFFF" />
      {/* Bottom Green Stripe */}
      <rect width="60" height="10" y="20" fill="#007A3D" />
      {/* Red Triangle Chevron on Left (Hoist) */}
      <polygon points="0,0 20,15 0,30" fill="#CE1126" />
      {/* Seven-pointed White Star (النجمة السباعية) */}
      {/* Center at (6.67, 15) with 7 points */}
      <g transform="translate(7.5, 15)">
        <polygon
          points="
            0,-3.2 0.8,-1.2 2.8,-1.5 1.6,0.2 3.1,1.5 1.1,1.7 0.7,3.2 
            -0.7,2.1 -2.1,3.1 -1.6,1.2 -3.1,0 -1.2,-0.9 -1.5,-2.8 -0.2,-1.5
          "
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
};
