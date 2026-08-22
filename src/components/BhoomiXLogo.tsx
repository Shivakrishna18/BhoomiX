import React from 'react';

interface BhoomiXLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showTagline?: boolean;
  className?: string;
  badgeText?: string;
}

export const BhoomiXLogo: React.FC<BhoomiXLogoProps> = ({
  size = 'md',
  showBadge = true,
  showTagline = true,
  className = '',
  badgeText = 'Telangana',
}) => {
  const sizeConfig = {
    sm: {
      icon: 'w-7 h-7',
      text: 'text-lg',
      tagline: 'text-[9px]',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    md: {
      icon: 'w-9 h-9 sm:w-10 sm:h-10',
      text: 'text-xl sm:text-2xl',
      tagline: 'text-[10px] sm:text-[11px]',
      badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      icon: 'w-12 h-12 sm:w-14 sm:h-14',
      text: 'text-2xl sm:text-3xl',
      tagline: 'text-xs',
      badge: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      icon: 'w-16 h-16 sm:w-20 sm:h-20',
      text: 'text-3xl sm:text-4xl',
      tagline: 'text-sm',
      badge: 'text-xs px-3 py-1',
    },
  };

  const current = sizeConfig[size];

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* 3D Isometric Geometric Land Parcel Icon with Liquid Glass Highlight */}
      <div className={`relative ${current.icon} shrink-0 group perspective-500`}>
        <div className="absolute inset-0 bg-indigo-500/15 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 pointer-events-none -z-10" />
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(79,70,229,0.18)] transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5"
        >
          <defs>
            {/* Top Surface Gradient - Vibrant Indigo/Cyan Land Layer */}
            <linearGradient id="bx-top-surface" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="45%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Left 3D Face Gradient - Deep Indigo Shading */}
            <linearGradient id="bx-left-face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3730A3" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>

            {/* Right 3D Face Gradient - Rich Emerald/Teal Depth */}
            <linearGradient id="bx-right-face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#065F46" />
            </linearGradient>

            {/* Accent Glowing Pin Gradient */}
            <linearGradient id="bx-accent-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>

            {/* Specular Glass Sheen */}
            <linearGradient id="bx-glass-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Bottom Isometric Base Layer Shadow */}
          <path
            d="M50 78 L18 60 L18 48 L50 66 L82 48 L82 60 Z"
            fill="#0F172A"
            opacity="0.25"
          />

          {/* Left Isometric 3D Extrusion */}
          <path
            d="M18 48 L50 66 L50 82 L18 64 Z"
            fill="url(#bx-left-face)"
          />

          {/* Right Isometric 3D Extrusion */}
          <path
            d="M50 66 L82 48 L82 64 L50 82 Z"
            fill="url(#bx-right-face)"
          />

          {/* Top Diamond / Land Boundary Plane */}
          <path
            d="M50 20 L82 38 L50 56 L18 38 Z"
            fill="url(#bx-top-surface)"
          />

          {/* Top Glass Specular Refraction Overlay */}
          <path
            d="M50 20 L82 38 L50 42 L18 38 Z"
            fill="url(#bx-glass-sheen)"
          />

          {/* Cadastral Land Grid Lines on Top Surface */}
          <path
            d="M50 20 L50 56 M18 38 L82 38"
            stroke="white"
            strokeWidth="1.6"
            strokeOpacity="0.45"
            strokeDasharray="2 2"
          />

          {/* 3D Geometric Floating Marker / Verified Pin */}
          <circle cx="50" cy="38" r="6.5" fill="white" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.25))" />
          <circle cx="50" cy="38" r="4" fill="url(#bx-accent-glow)" />

          {/* Modern Geometric 'X' Accent on the Corner */}
          <path
            d="M72 26 L78 32 M78 26 L72 32"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text Block */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5 leading-none">
          <span className={`font-black tracking-tight text-slate-900 ${current.text}`}>
            Bhoomi<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500">X</span>
          </span>
          {showBadge && (
            <span className={`inline-flex items-center font-bold rounded-full bg-white/80 text-indigo-700 border border-indigo-200/90 shadow-[0_2px_6px_rgba(79,70,229,0.08)] backdrop-blur-md ${current.badge}`}>
              {badgeText}
            </span>
          )}
        </div>
        {showTagline && (
          <p className={`text-slate-500 font-medium tracking-wide mt-0.5 ${current.tagline}`}>
            Verified Direct Land Platform
          </p>
        )}
      </div>
    </div>
  );
};
