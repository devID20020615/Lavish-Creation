import React from 'react';

interface JaapiProps {
  className?: string;
  size?: number;
  color?: string;
}

export const JaapiMotif: React.FC<JaapiProps> = ({
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
      {/* Outer circular brim */}
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="2" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="42" stroke="#8C1D18" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="38" stroke={color} strokeWidth="1" />
      
      {/* Intricate Jaapi Diamond Weave Patterns */}
      <path d="M50 8 L50 92 M8 50 L92 50" stroke={color} strokeWidth="0.8" opacity="0.6" />
      <path d="M20 20 L80 80 M80 20 L20 80" stroke={color} strokeWidth="0.8" opacity="0.6" />

      {/* Decorative Red Flowers / Diamonds (Khingkhap Motifs on Jaapi) */}
      <polygon points="50,14 54,20 50,26 46,20" fill="#8C1D18" />
      <polygon points="50,74 54,80 50,86 46,80" fill="#8C1D18" />
      <polygon points="14,50 20,54 26,50 20,46" fill="#8C1D18" />
      <polygon points="74,50 80,54 86,50 80,46" fill="#8C1D18" />

      <polygon points="25,25 30,28 28,33 23,30" fill={color} />
      <polygon points="75,25 77,30 72,33 70,28" fill={color} />
      <polygon points="25,75 23,70 28,67 30,72" fill={color} />
      <polygon points="75,75 70,72 72,67 77,70" fill={color} />

      {/* Central Conical Crown */}
      <circle cx="50" cy="50" r="22" fill="#FAF8F5" stroke="#8C1D18" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="14" fill="#F7F2EA" stroke={color} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="6" fill="#8C1D18" />
      <circle cx="50" cy="50" r="2" fill="#FAF8F5" />
    </svg>
  );
};
