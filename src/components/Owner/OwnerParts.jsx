import { useState } from 'react';
import { initial } from './ownerSetup';

/* Business logo: shows the picture if the link works, otherwise the first letter */
export function BizLogo({ business, className = 'blogo' }) {
  const [broken, setBroken] = useState(false);
  const src = business?.image;
  const ok = src && /^https?:\/\//.test(src) && !broken;
  return (
    <span className={className}>
      {ok ? <img src={src} alt="" onError={() => setBroken(true)} /> : initial(business?.name)}
    </span>
  );
}

export function Empty({ title, text }) {
  return (
    <div className="empty">
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

export const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* the owner + shop drawing on the overview */
export function ShopDrawing() {
  return (
    <svg viewBox="0 0 300 170" fill="none" stroke="#1E1A18" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 164h280" strokeWidth="2.6" />
      <rect x="128" y="64" width="140" height="100" rx="6" fill="#fff" />
      <path d="M120 42h156l-6 24H126z" fill="#F7C98B" />
      <path d="M126 66q11 10 22 0q11 10 22 0q11 10 22 0q11 10 22 0q11 10 22 0q11 10 22 0q8 7 12 0" fill="#fff" />
      <path d="M142 42v24M168 42v24M194 42v24M220 42v24M246 42v24" strokeWidth="1.6" />
      <rect x="146" y="88" width="50" height="40" rx="4" fill="#FCEBD3" />
      <rect x="212" y="88" width="40" height="76" rx="4" fill="#F26B3A" />
      <circle cx="244" cy="128" r="2.6" fill="#1E1A18" stroke="none" />
      <rect x="152" y="96" width="38" height="14" rx="3" fill="#fff" />
      <text x="171" y="106.5" textAnchor="middle" fontFamily="Manrope" fontWeight="800" fontSize="8" fill="#1E1A18" stroke="none">OPEN</text>
      <circle cx="198" cy="24" r="14" fill="#fff" />
      <path d="M198 16v8l5 4" />
      <circle cx="66" cy="62" r="13" fill="#fff" />
      <path d="M54 58c1-10 22-12 25 0" fill="#1E1A18" />
      <path d="M46 118c0-26 8-40 20-40s20 14 20 40z" fill="#E2572A" />
      <path d="M54 118l-3 44M78 118l3 44" />
      <path d="M48 160h10M74 160h10" strokeWidth="3" />
      <path d="M82 96l14-6" />
      <rect x="92" y="74" width="26" height="34" rx="4" fill="#fff" transform="rotate(10 105 91)" />
      <path d="M98 86l5 5 8-9" stroke="#E2572A" strokeWidth="2.4" transform="rotate(10 105 91)" />
      <path d="M28 40c0-9 6-15 13-15s13 6 13 15c0 10-13 22-13 22S28 50 28 40z" fill="#F7C98B" />
      <circle cx="41" cy="39" r="4.5" fill="#fff" />
      <path d="M282 164v-24" />
      <path d="M282 150c-8-3-11-11-9-17 7 2 10 8 9 17zM282 144c7-3 10-10 9-17-7 2-10 9-9 17z" fill="#F7C98B" />
    </svg>
  );
}