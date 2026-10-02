import "./ColorIcon.css";

/*
  Colourful outlined icons, drawn in code (no image files).
  Every icon is 80 x 80. Fill colours come from classes in ColorIcon.css:
  fo orange · fp peach · fw paper · fm mist · fi ink
  fb blue · fg green · fy yellow · fr red · fv purple
  "ns" = no outline (small details like cheeks and dots)
*/
const SHAPES = {
  bell: (
    <>
      <path d="M14 26c-3 4-4 8-4 12M66 26c3 4 4 8 4 12" />
      <circle cx="40" cy="13" r="4" className="fo" />
      <path d="M40 17c-11 0-18 8-18 19v11l-6 8h48l-6-8V36c0-11-7-19-18-19z" className="fy" />
      <circle cx="40" cy="62" r="6" className="fo" />
      <path d="M28 34c1-5 4-8 8-9" />
    </>
  ),
  calendar: (
    <>
      <rect x="12" y="18" width="56" height="50" rx="8" className="fw" />
      <path d="M12 26a8 8 0 0 1 8-8h40a8 8 0 0 1 8 8v8H12z" className="fo" />
      <path d="M28 11v13M52 11v13" />
      <circle cx="40" cy="51" r="11" className="fg" />
      <path d="m34 51 5 5 8-9" />
    </>
  ),
  buildings: (
    <>
      <rect x="14" y="18" width="28" height="48" rx="3" className="fb" />
      <rect x="40" y="34" width="26" height="32" rx="3" className="fp" />
      <rect x="20" y="26" width="6" height="6" className="fw" />
      <rect x="30" y="26" width="6" height="6" className="fw" />
      <rect x="20" y="38" width="6" height="6" className="fw" />
      <rect x="30" y="38" width="6" height="6" className="fw" />
      <rect x="20" y="50" width="6" height="6" className="fw" />
      <rect x="30" y="50" width="6" height="6" className="fw" />
      <rect x="46" y="41" width="6" height="6" className="fw" />
      <rect x="56" y="41" width="6" height="6" className="fw" />
      <rect x="48" y="54" width="10" height="12" className="fo" />
      <path d="M8 66h64" />
    </>
  ),
  users: (
    <>
      <circle cx="54" cy="27" r="9" className="fp" />
      <path d="M40 60c0-10 6-17 14-17s14 7 14 17z" className="fv" />
      <circle cx="30" cy="30" r="10" className="fy" />
      <path d="M10 66c0-12 9-20 20-20s20 8 20 20z" className="fb" />
    </>
  ),
  megaphone: (
    <>
      <path d="M24 46l5 18h9l-4-18z" className="fw" />
      <path d="M12 32h14l30-14v44L26 48H12z" className="fo" />
      <ellipse cx="56" cy="40" rx="5" ry="22" className="fy" />
      <path d="M68 30l5-4M68 40h6M68 50l5 4" />
    </>
  ),
  star: (
    <>
      <path d="M40 12l8.6 17.4 19.2 2.8-13.9 13.6 3.3 19.1L40 55.9l-17.2 9 3.3-19.1-13.9-13.6 19.2-2.8z" className="fy" />
      <circle cx="40" cy="40" r="4" className="fo ns" />
      <path d="M66 10v8M62 14h8M14 60v6M11 63h6" />
    </>
  ),
  smile: (
    <>
      <circle cx="40" cy="40" r="28" className="fy" />
      <circle cx="30" cy="35" r="3.5" className="fi" />
      <circle cx="50" cy="35" r="3.5" className="fi" />
      <circle cx="24" cy="47" r="4.5" className="fr ns" />
      <circle cx="56" cy="47" r="4.5" className="fr ns" />
      <path d="M29 47c4 8 18 8 22 0" />
    </>
  ),
  scales: (
    <>
      <path d="M40 16v46" />
      <rect x="24" y="62" width="32" height="7" rx="3.5" className="fm" />
      <path d="M14 24h52" />
      <circle cx="40" cy="15" r="5" className="fo" />
      <path d="M14 24 7 44M14 24l7 20M66 24l-7 20M66 24l7 20" />
      <path d="M4 44a10 10 0 0 0 20 0z" className="fp" />
      <path d="M56 44a10 10 0 0 0 20 0z" className="fb" />
    </>
  ),
  stack: (
    <>
      <path d="M10 52 40 66l30-14-30-14z" className="fb" />
      <path d="M10 40 40 54l30-14-30-14z" className="fg" />
      <path d="M10 28 40 42l30-14L40 14z" className="fo" />
    </>
  ),
  chat: (
    <>
      <path d="M36 38h28a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6h-2v8l-9-8H42a6 6 0 0 1-6-6z" className="fp" />
      <path d="M10 18a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H28l-10 9v-9h-2a6 6 0 0 1-6-6z" className="fb" />
      <circle cx="24" cy="29" r="2.5" className="fi ns" />
      <circle cx="34" cy="29" r="2.5" className="fi ns" />
      <circle cx="44" cy="29" r="2.5" className="fi ns" />
    </>
  ),
  government: (
    <>
      <path d="M40 15V7" />
      <path d="M40 7h10l-2.5 3.5L50 14H40z" className="fo" />
      <path d="M26 29a14 14 0 0 1 28 0z" className="fy" />
      <rect x="14" y="29" width="52" height="7" className="fw" />
      <path d="M21 36v19M33 36v19M47 36v19M59 36v19" />
      <rect x="10" y="55" width="60" height="9" rx="2" className="fm" />    </>
  ),
  banks: (
    <>
      <path d="M10 30 40 12l30 18z" className="fo" />
      <circle cx="40" cy="23" r="4" className="fy" />
      <rect x="14" y="30" width="52" height="6" className="fw" />
      <path d="M20 36v18M33 36v18M47 36v18M60 36v18" />
      <rect x="10" y="54" width="60" height="9" rx="2" className="fm" />    </>
  ),
  healthcare: (
    <>
      <rect x="18" y="14" width="44" height="54" rx="6" className="fw" />
      <rect x="30" y="9" width="20" height="10" rx="3" className="fb" />
      <path d="M36 30h8v8h8v8h-8v8h-8v-8h-8v-8h8z" className="fr" />
    </>
  ),
  pharmacies: (
    <>
      <g transform="rotate(-35 40 40)">
        <rect x="13" y="28" width="54" height="24" rx="12" className="fw" />
        <path d="M40 28H25a12 12 0 0 0 0 24h15z" className="fr" />
        <path d="M22 35a5 5 0 0 0-3 4" />
      </g>
    </>
  ),
  telecom: (
    <>
      <path d="M27 18a18 18 0 0 0 0 22M53 18a18 18 0 0 1 0 22M19 11a28 28 0 0 0 0 36M61 11a28 28 0 0 1 0 36" />
      <path d="M40 34 28 66M40 34l12 32M32 56h16" />
      <circle cx="40" cy="29" r="6" className="fo" />
      <rect x="22" y="64" width="36" height="6" rx="3" className="fb" />
    </>
  ),
  universities: (
    <>
      <path d="M22 38v12c0 4 8 8 18 8s18-4 18-8V38" className="fw" />
      <path d="M8 32 40 18l32 14-32 14z" className="fb" />
      <path d="M64 34v16" />
      <circle cx="64" cy="54" r="4" className="fy" />
    </>
  ),
  car: (
    <>
      <path d="m16 46 6-14c1-3 4-5 7-5h22c3 0 6 2 7 5l6 14z" className="fb" />
      <path d="M40 27v19" />
      <rect x="10" y="44" width="60" height="14" rx="5" className="fo" />
      <circle cx="64" cy="50" r="2.5" className="fy ns" />
      <circle cx="24" cy="58" r="6" className="fi" />
      <circle cx="56" cy="58" r="6" className="fi" />
    </>
  ),
  restaurants: (
    <>
      <path d="M32 18c-2-3 2-5 0-8M48 18c-2-3 2-5 0-8" />
      <circle cx="40" cy="24" r="3.5" className="fo" />
      <path d="M18 50a22 22 0 0 1 44 0z" className="fy" />
      <path d="M26 42c2-5 6-9 11-10" />
      <rect x="12" y="50" width="56" height="7" rx="3.5" className="fm" />
    </>
  ),
  labs: (
    <>
      <path d="M35 12v18L18 60a6 6 0 0 0 5 9h34a6 6 0 0 0 5-9L45 30V12z" className="fw" />
      <path d="M23.7 50h32.6L62 60a6 6 0 0 1-5 9H23a6 6 0 0 1-5-9z" className="fg" />
      <circle cx="36" cy="59" r="2.5" className="fw" />
      <circle cx="46" cy="63" r="2" className="fw" />
      <path d="M30 12h20" />
    </>
  ),
  veterinary: (
    <>
      <ellipse cx="40" cy="50" rx="14" ry="12" className="fo" />
      <ellipse cx="24" cy="34" rx="6" ry="8" className="fp" />
      <ellipse cx="34" cy="24" rx="6" ry="8" className="fp" />
      <ellipse cx="46" cy="24" rx="6" ry="8" className="fp" />
      <ellipse cx="56" cy="34" rx="6" ry="8" className="fp" />
    </>
  ),
  salons: (
    <>
      <path d="M30 47 53 13M50 47 27 13" />
      <circle cx="40" cy="30" r="3" className="fi ns" />
      <circle cx="24" cy="54" r="9" className="fy" />
      <circle cx="56" cy="54" r="9" className="fy" />
      <circle cx="24" cy="54" r="3.5" className="fw" />
      <circle cx="56" cy="54" r="3.5" className="fw" />
    </>
  ),
  post: (
    <>
      <path d="M14 28 40 16l26 12v28L40 68 14 56z" className="fp" />
      <path d="M14 28l26 12 26-12M40 40v28" />
      <path d="m27 22 26 12v8" className="fy" />
    </>
  ),
  utilities: (
    <>
      <circle cx="40" cy="40" r="28" className="fb" />
      <path d="M46 10 22 44h16l-4 26 24-34H42z" className="fy" />
    </>
  ),
  visitor: (
    <>
      <circle cx="36" cy="24" r="12" className="fp" />
      <path d="M12 68c0-14 11-24 24-24s24 10 24 24z" className="fo" />
      <path d="M46 46h24v5a3.5 3.5 0 0 0 0 7v5H46v-5a3.5 3.5 0 0 0 0-7z" className="fy" />
      <path d="M54 47v15" strokeDasharray="3 4" />
    </>
  ),
  business: (
    <>
      <rect x="14" y="32" width="52" height="34" className="fw" />
      <rect x="22" y="44" width="14" height="22" className="fb" />
      <rect x="42" y="44" width="18" height="12" rx="2" className="fb" />
      <path d="M16 14h48l6 16H10z" className="fo" />
      <path d="M10 30h60a7.5 7 0 0 1-15 0 7.5 7 0 0 1-15 0 7.5 7 0 0 1-15 0 7.5 7 0 0 1-15 0z" className="fp" />
      <path d="M6 66h68" />
    </>
  ),
};

export default function ColorIcon({ name, size = 56, className = "" }) {
  const shape = SHAPES[name];
  if (!shape) return null;

  return (
    <svg
      className={`cicon ${className}`}
      viewBox="0 0 80 80"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  );
}