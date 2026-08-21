import React from 'react';

interface XoraiProps {
  className?: string;
  size?: number;
  color?: string;
}

export const XoraiMotif: React.FC<XoraiProps> = ({
  className = "w-12 h-12",
  size = 48,
  color = "#B68C4A"
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Cover / Crown Pin */}
      <path d="M50 8 L52 16 L48 16 Z" fill={color} />
      <circle cx="50" cy="18" r="3" fill="#8C1D18" />
      
      {/* Dome Top Lid */}
      <path d="M50 20 C38 20 32 30 30 36 L70 36 C68 30 62 20 50 20 Z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M30 36 C32 40 40 42 50 42 C60 42 68 40 70 36" stroke={color} strokeWidth="1.5" fill="none" />
      
      {/* Main Container Bowl */}
      <path d="M22 42 Q20 56 50 56 Q80 56 78 42 Z" stroke={color} strokeWidth="2" fill="#FAF8F5" />
      <line x1="22" y1="42" x2="78" y2="42" stroke="#8C1D18" strokeWidth="2" />
      
      {/* Decorative Rim Band */}
      <circle cx="50" cy="49" r="2" fill="#8C1D18" />
      <circle cx="36" cy="48" r="1.5" fill={color} />
      <circle cx="64" cy="48" r="1.5" fill={color} />

      {/* Stem / Pillar */}
      <path d="M46 56 L46 72 L54 72 L54 56 Z" fill={color} opacity="0.9" />
      <path d="M42 64 L58 64" stroke="#8C1D18" strokeWidth="1.5" />

      {/* Flared Pedestal Stand Base */}
      <path d="M46 72 Q30 78 20 86 Q20 90 50 90 Q80 90 80 86 Q70 78 54 72 Z" fill="#FAF8F5" stroke={color} strokeWidth="2" />
      <line x1="22" y1="86" x2="78" y2="86" stroke="#8C1D18" strokeWidth="1.5" />
    </svg>
  );
};
