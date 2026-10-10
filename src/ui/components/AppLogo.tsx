/* ============================================================
 * THEY WERE HERE — Official Brand Logo & Wordmark
 * Vector Origami Compass Plane with Hanko Red Seal Stamp
 * Designed for Light Dusk Postcard Theme
 * ============================================================ */

import React from 'react';
import { APP_NAME } from '@/contracts/types';

interface AppLogoProps {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  variant?: 'vector' | 'image';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 32,
  showWordmark = false,
  subtitle,
  className = '',
  variant = 'vector',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {variant === 'image' ? (
        <img
          src="/logo.png"
          alt={APP_NAME}
          width={size}
          height={size}
          className="rounded-lg object-cover border border-[#14143A]/15 shadow-xs"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="relative flex-shrink-0 flex items-center justify-center rounded-xl bg-[#FFF3D6] border-2 border-[#14143A] shadow-xs overflow-hidden"
          style={{ width: size, height: size }}
        >
          {/* Origami Vector Plane & Compass Needle */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1"
          >
            {/* Left Main Wing */}
            <path
              d="M14 62 L88 20 L48 76 Z"
              fill="#FFFFFF"
              stroke="#14143A"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Right Fold Wing */}
            <path
              d="M48 76 L88 20 L38 86 Z"
              fill="#FFF3D6"
              stroke="#14143A"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Keel Shadow Fold */}
            <path
              d="M38 86 L48 76 L30 72 Z"
              fill="#F2DDB0"
              stroke="#14143A"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Compass Spine Needle */}
            <path
              d="M62 36 L78 26 L56 54 Z"
              fill="#E8264C"
              stroke="#14143A"
              strokeWidth="2.5"
            />
            {/* Hanko Vermilion Red Seal Stamp */}
            <rect
              x="24"
              y="54"
              width="14"
              height="14"
              rx="2.5"
              fill="#E8264C"
              stroke="#14143A"
              strokeWidth="2"
            />
            <circle cx="31" cy="61" r="3.5" stroke="#FFFFFF" strokeWidth="1.8" />
          </svg>
        </div>
      )}

      {showWordmark && (
        <div className="flex flex-col text-left">
          <span className="font-display font-black text-sm tracking-widest text-[var(--ink-900)] uppercase leading-none">
            {APP_NAME}
          </span>
          {subtitle ? (
            <span className="font-mono text-[9px] text-[var(--ink-500)] uppercase tracking-wider mt-0.5">
              {subtitle}
            </span>
          ) : (
            <span className="font-mono text-[9px] text-[var(--ink-500)] uppercase tracking-wider mt-0.5">
              POSTCARD DISCOVERY
            </span>
          )}
        </div>
      )}
    </div>
  );
};
