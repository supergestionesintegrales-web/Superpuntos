import React from 'react';

export interface CoinIconProps {
  className?: string;
  size?: number | string;
  title?: string;
  alt?: string;
}

/**
 * Realistic Minted Superpuntos Medallion Coin
 * Features high-fidelity bullion metallic textures, milled reeded rim,
 * physical 3D struck relief with directional light specular highlights,
 * and authentic coin depth without cartoonish animations or sparkles.
 */
export const CoinIcon: React.FC<CoinIconProps> = ({ 
  className = 'w-5 h-5', 
  size,
  title = 'Superpuntos',
  alt = 'Moneda Superpuntos'
}) => {
  const idPrefix = React.useId().replace(/:/g, '');
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle select-none ${className}`}
      style={style}
      role="img"
      aria-label={alt || title}
    >
      <title>{title}</title>
      <defs>
        {/* Soft realistic cast shadow beneath the physical coin disc */}
        <filter id={`${idPrefix}-coin-depth`} x="-20%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.8" floodColor="#1e1402" floodOpacity="0.45" />
        </filter>

        {/* Outer Minted Bullion Rim Gradient (24k Gold) */}
        <linearGradient id={`${idPrefix}-rim-grad`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="22%" stopColor="#E5A823" />
          <stop offset="46%" stopColor="#965604" />
          <stop offset="68%" stopColor="#F9D468" />
          <stop offset="86%" stopColor="#B27008" />
          <stop offset="100%" stopColor="#5E3502" />
        </linearGradient>

        {/* Outer Reed Milled Teeth Sheen */}
        <radialGradient id={`${idPrefix}-reed-sheen`} cx="24" cy="24" r="23" gradientUnits="userSpaceOnUse">
          <stop offset="80%" stopColor="#E5A823" />
          <stop offset="92%" stopColor="#FFF0B0" />
          <stop offset="100%" stopColor="#7A4502" />
        </radialGradient>

        {/* Realistic Concave Minted Field Gradient */}
        <radialGradient id={`${idPrefix}-field-disc`} cx="17" cy="15" r="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE885" />
          <stop offset="30%" stopColor="#F5B82A" />
          <stop offset="68%" stopColor="#C97F0C" />
          <stop offset="88%" stopColor="#965604" />
          <stop offset="100%" stopColor="#663602" />
        </radialGradient>

        {/* Raised Inner Rim Bevel */}
        <linearGradient id={`${idPrefix}-bevel-ring`} x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#F9D468" />
          <stop offset="70%" stopColor="#7A4502" />
          <stop offset="100%" stopColor="#2E1700" />
        </linearGradient>

        {/* 3D Struck Relief S Emblem Bevel */}
        <linearGradient id={`${idPrefix}-struck-relief`} x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="20%" stopColor="#FFF2A1" />
          <stop offset="60%" stopColor="#E5A31E" />
          <stop offset="100%" stopColor="#874D02" />
        </linearGradient>

        {/* Metallic Surface Specular Light Arc */}
        <linearGradient id={`${idPrefix}-specular-arc`} x1="12" y1="10" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FFEBAA" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Coin Physical Disc with Depth Shadow */}
      <circle cx="24" cy="24" r="22" fill={`url(#${idPrefix}-rim-grad)`} filter={`url(#${idPrefix}-coin-depth)`} />

      {/* Milled Reeded Teeth (Realistic Minting Rim) */}
      <circle cx="24" cy="24" r="21.2" stroke={`url(#${idPrefix}-reed-sheen)`} strokeWidth="1.6" strokeDasharray="1.2 1.2" opacity="0.85" />

      {/* Raised Outer Bevel Ring */}
      <circle cx="24" cy="24" r="19.8" stroke={`url(#${idPrefix}-bevel-ring)`} strokeWidth="1.2" fill="none" />

      {/* Recessed Coin Field (Center Disc) */}
      <circle cx="24" cy="24" r="18.5" fill={`url(#${idPrefix}-field-disc)`} />

      {/* Minted Beaded Pearl Ring */}
      <circle cx="24" cy="24" r="16.6" stroke="#FFEBAA" strokeWidth="0.8" strokeDasharray="0.9 1.5" strokeLinecap="round" opacity="0.75" />

      {/* Concentric Precision Groove */}
      <circle cx="24" cy="24" r="14.8" stroke="#7A4502" strokeWidth="0.5" fill="none" opacity="0.4" />

      {/* Embossed Struck 3D Relief Emblem ("S" of Superpuntos) */}
      {/* 1. Recessed Shadow of Struck Relief */}
      <path 
        d="M27.8 16.5 C27.8 15.2 26.5 14.2 24.2 14.2 C21.6 14.2 19.8 15.3 19.6 17.1 C19.4 18.8 20.8 19.9 23.2 20.6 L24.8 21.1 C27.5 21.9 29.2 23.4 29 26.2 C28.7 29.2 26.2 30.8 23.4 30.8 C20.1 30.8 18.2 29.2 17.9 26.8 L20.7 26.4 C20.9 27.8 22.1 28.6 23.6 28.6 C25.2 28.6 26.3 27.8 26.5 26.4 C26.7 25.1 25.8 24.2 23.7 23.6 L22 23.1 C18.8 22.2 17.1 20.5 17.4 17.6 C17.7 14.6 20.4 12.2 24.2 12.2 C28 12.2 30.1 14.1 30.3 16.8 Z" 
        fill="#4A2600"
        transform="translate(0.6, 1)"
        opacity="0.6"
      />
      {/* 2. Primary 3D Embossed Relief */}
      <path 
        d="M27.8 16.5 C27.8 15.2 26.5 14.2 24.2 14.2 C21.6 14.2 19.8 15.3 19.6 17.1 C19.4 18.8 20.8 19.9 23.2 20.6 L24.8 21.1 C27.5 21.9 29.2 23.4 29 26.2 C28.7 29.2 26.2 30.8 23.4 30.8 C20.1 30.8 18.2 29.2 17.9 26.8 L20.7 26.4 C20.9 27.8 22.1 28.6 23.6 28.6 C25.2 28.6 26.3 27.8 26.5 26.4 C26.7 25.1 25.8 24.2 23.7 23.6 L22 23.1 C18.8 22.2 17.1 20.5 17.4 17.6 C17.7 14.6 20.4 12.2 24.2 12.2 C28 12.2 30.1 14.1 30.3 16.8 Z" 
        fill={`url(#${idPrefix}-struck-relief)`} 
        stroke="#FFF8C4"
        strokeWidth="0.4"
      />

      {/* Curved Specular Reflection (Physical Metal Light Sheen) */}
      <path 
        d="M8 20 C10 13 16 8 24 8 C30 8 35 11 38 15 C32 12 24 13 17 18 C13 21 10 25 8 20 Z" 
        fill={`url(#${idPrefix}-specular-arc)`} 
      />
    </svg>
  );
};
