import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 48 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      className={`${className} select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Off-white paper background inside the circle */}
      <circle cx="250" cy="250" r="230" fill="#EFF6FF" />
      
      {/* Elegant Blue Outer Circle Border */}
      <circle cx="250" cy="250" r="230" stroke="#2563EB" strokeWidth="8" />
      <circle cx="250" cy="250" r="222" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />

      {/* 1. VILLA HOUSE - Central main element */}
      <g id="villa-house">
        {/* House Roof - Elegant Dark Navy sloping roof */}
        <path
          d="M100 240 L250 100 L400 240 Z"
          fill="#1E3A8A"
        />
        {/* Roof Border trim for high-end definition */}
        <path
          d="M100 240 L250 100 L400 240"
          stroke="#3B82F6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* House Body / Walls - Solid and grounded */}
        <path
          d="M130 240 L370 240 L370 395 L130 395 Z"
          fill="#2563EB"
          opacity="0.95"
        />
        {/* Bottom base floor footing line */}
        <rect x="110" y="395" width="280" height="12" rx="4" fill="#1E3A8A" />
      </g>

      {/* 2. SKELETON KEY OVERLAY - Placed precisely in the upper-center of the house */}
      <g id="key-overlay">
        {/* Key Head / Bow - Hollow circular blue ring overlayed in middle-upper house */}
        <circle cx="250" cy="205" r="28" fill="#3B82F6" stroke="#FCFAF2" strokeWidth="5" />
        <circle cx="250" cy="205" r="11" fill="#FCFAF2" />

        {/* Key Shaft / Stem extending downwards */}
        <path
          d="M245 233 L245 315 C245 318, 255 318, 255 315 L255 233 Z"
          fill="#3B82F6"
          stroke="#FCFAF2"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Key Bits / Teeth pointing to the right */}
        <path
          d="M255 272 H278 V285 H255 Z"
          fill="#3B82F6"
          stroke="#FCFAF2"
          strokeWidth="3"
        />
        <path
          d="M255 292 H278 V305 H255 Z"
          fill="#3B82F6"
          stroke="#FCFAF2"
          strokeWidth="3"
        />
      </g>

      {/* 3. HANDSHAKE OVERLAY - Rendered beautifully at the bottom segment of the house */}
      <g id="handshake-overlay">
        {/* Semi-transparent dark overlay for handshake contrast */}
        <path d="M140 330 H360 V388 H140 Z" fill="#1E40AF" opacity="0.4" rx="8" />

        {/* Left Sleeve (Light coming from inside) */}
        <path
          d="M100 375 L155 338 L165 352 L120 390 Z"
          fill="#EFF6FF"
          opacity="0.5"
        />
        {/* Right Sleeve (Blue coming from inside) */}
        <path
          d="M400 375 L345 338 L335 352 L380 390 Z"
          fill="#60A5FA"
          opacity="0.5"
        />

        {/* Left Arm / Hand coming from modern angle */}
        <path
          d="M140 370 L195 335 L220 355 L165 390 Z"
          fill="#1E3A8A"
          stroke="#FCFAF2"
          strokeWidth="3"
        />

        {/* Right Arm / Hand interlocking */}
        <path
          d="M360 370 L305 335 L280 355 L335 390 Z"
          fill="#3B82F6"
          stroke="#FCFAF2"
          strokeWidth="3"
        />

        {/* Clenched shaking fingers and thumb representing trust */}
        {/* Interlocking wrist clasp and knuckle shapes */}
        <path
          d="M225 342 C232 338, 245 340, 248 348 C250 354, 258 358, 264 353"
          stroke="#FCFAF2"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Success Checkmark or center glow above hands for deal completion */}
        <circle cx="250" cy="358" r="16" fill="#3B82F6" stroke="#FCFAF2" strokeWidth="4" />
        <path
          d="M244 358 L248 362 L256 354"
          stroke="#FCFAF2"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
