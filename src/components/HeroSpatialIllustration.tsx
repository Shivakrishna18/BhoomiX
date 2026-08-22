import React from 'react';

export const HeroSpatialIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none pointer-events-none">
      {/* Background Spatial CAD Grid */}
      <div className="absolute inset-0 spatial-grid-pattern opacity-40 [mask-image:radial-gradient(circle,white_40%,transparent_70%)]" />

      {/* Atmospheric Soft Light Glows */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500/25 via-sky-400/20 to-emerald-400/20 blur-3xl animate-pulse -z-10" />
      <div className="absolute w-56 h-56 rounded-full bg-cyan-400/20 blur-2xl top-1/4 right-1/4 -z-10" />

      {/* Floating Glass Spheres / Water Orbs */}
      <div className="absolute top-6 right-10 w-8 h-8 rounded-full bg-gradient-to-br from-white/80 to-white/10 backdrop-blur-md border border-white/90 shadow-[0_8px_16px_rgba(99,102,241,0.15)] animate-bounce [animation-duration:6s]" />
      <div className="absolute bottom-12 left-8 w-6 h-6 rounded-full bg-gradient-to-br from-white/70 to-white/10 backdrop-blur-md border border-white/80 shadow-[0_6px_12px_rgba(99,102,241,0.12)] animate-bounce [animation-duration:8s]" />
      <div className="absolute bottom-6 right-20 w-4 h-4 rounded-full bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-xs border border-white/90 shadow-sm" />
      <div className="absolute top-1/2 left-2 w-5 h-5 rounded-full bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xs border border-white/70 shadow-sm" />

      {/* Outer Spatial Glass Refraction Ring */}
      <div className="absolute inset-4 rounded-full border border-white/60 shadow-[0_20px_50px_rgba(99,102,241,0.12),inset_0_1px_4px_rgba(255,255,255,0.8)] [mask-image:radial-gradient(ellipse_at_center,transparent_45%,black_70%)]" />

      {/* Central 3D Isometric Layered Glass Parcel Artwork */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 drop-shadow-[0_25px_45px_rgba(79,70,229,0.22)]">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform hover:scale-105 transition-transform duration-700 ease-out"
        >
          <defs>
            {/* Top Plate Radiant Liquid Gradient (Blue to Cyan) */}
            <linearGradient id="hero-top-plate" x1="50" y1="90" x2="350" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="45%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Middle Glass Plate */}
            <linearGradient id="hero-mid-plate" x1="50" y1="140" x2="350" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
            </linearGradient>

            {/* Bottom Foundation Layer */}
            <linearGradient id="hero-bot-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="hero-bot-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="100%" stopColor="#022C22" />
            </linearGradient>

            {/* Specular Glass Sheen */}
            <linearGradient id="hero-specular-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Green 3D Accent Pin Gradient */}
            <linearGradient id="hero-emerald-pin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Shadow beneath block */}
          <ellipse cx="200" cy="330" rx="140" ry="40" fill="#0F172A" opacity="0.18" />

          {/* Layer 3 - Base Extrusion (Bottom Dark Layer) */}
          <path d="M200 240 L80 170 L80 230 L200 300 Z" fill="url(#hero-bot-left)" />
          <path d="M200 300 L320 230 L320 170 L200 240 Z" fill="url(#hero-bot-right)" />

          {/* Layer 2 - Intermediate Translucent Glass Layer */}
          <path d="M80 160 L200 230 L320 160 L200 90 Z" fill="url(#hero-mid-plate)" />
          {/* Glass thickness bevel */}
          <path d="M80 160 L200 230 L200 245 L80 175 Z" fill="#1E1B4B" opacity="0.9" />
          <path d="M200 230 L320 160 L320 175 L200 245 Z" fill="#064E3B" opacity="0.8" />

          {/* Separation Floating Space */}
          {/* Layer 1 - Top Radiant Blue/Cyan Liquid Glass Land Surface */}
          <g transform="translate(0, -25)">
            {/* Left 3D Thickness */}
            <path d="M80 150 L200 220 L200 240 L80 170 Z" fill="#1D4ED8" />
            {/* Right 3D Thickness */}
            <path d="M200 220 L320 150 L320 170 L200 240 Z" fill="#0E7490" />

            {/* Top Plane */}
            <path d="M200 80 L320 150 L200 220 L80 150 Z" fill="url(#hero-top-plate)" />

            {/* Specular Refraction Top Sheen */}
            <path d="M200 80 L320 150 L200 170 L80 150 Z" fill="url(#hero-specular-sheen)" />

            {/* Cadastral Cross Lines */}
            <path d="M200 80 L200 220 M80 150 L320 150" stroke="white" strokeWidth="2.5" strokeOpacity="0.4" strokeDasharray="4 4" />

            {/* Central Verified Spatial Ring Marker */}
            <g transform="translate(200, 150)">
              <circle cx="0" cy="0" r="26" fill="none" stroke="white" strokeWidth="9" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.3))" />
              <circle cx="0" cy="0" r="14" fill="#1E40AF" />
              <circle cx="0" cy="0" r="7" fill="white" />
            </g>

            {/* 3D Geometric Green Corner 'X' / Cross Token */}
            <g transform="translate(305, 105)">
              <path
                d="M-10 -4 L-4 -10 L10 4 L4 10 Z"
                fill="url(#hero-emerald-pin)"
                filter="drop-shadow(0px 4px 10px rgba(5,150,105,0.4))"
              />
              <path
                d="M4 -10 L10 -4 L-4 10 L-10 4 Z"
                fill="url(#hero-emerald-pin)"
                filter="drop-shadow(0px 4px 10px rgba(5,150,105,0.4))"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
