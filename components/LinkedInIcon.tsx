import React from 'react';

// Official LinkedIn brand mark paths (24×24 viewBox) — the "in" glyph.
const IN_N = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z';
const IN_I = 'M5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z';

interface IconProps {
  size?: number;
  className?: string;
}

/** Full official LinkedIn logo: brand-blue rounded square with white "in". */
export const LinkedInMark: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    role="img"
    aria-label="LinkedIn"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
    <path d={IN_N} fill="#FFFFFF" />
    <path d={IN_I} fill="#FFFFFF" />
  </svg>
);

/** Just the "in" glyph in the current text color — for use on a colored button. */
export const LinkedInGlyph: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    role="img"
    aria-label="LinkedIn"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={IN_N} />
    <path d={IN_I} />
  </svg>
);
