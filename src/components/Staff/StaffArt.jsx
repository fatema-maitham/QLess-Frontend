// Line drawing for the staff Overview: a staff member at the counter calling the next visitor
const StaffArt = () => (
  <svg className="sart" viewBox="0 0 400 260" preserveAspectRatio="xMidYMax meet" fill="none" stroke="#1E1A18" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="300" cy="120" r="110" fill="#F7C98B" stroke="none" opacity=".55"/>
    <g transform="translate(70 40)"><circle r="24" fill="#fff"/><path d="M0-14V0l9 6"/></g>
    <rect x="236" y="30" width="120" height="70" rx="10" fill="#fff"/>
    <text x="296" y="52" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="10" fill="#8A827B" stroke="none" letterSpacing="1.5">NOW SERVING</text>
    <text x="296" y="86" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="28" fill="#F26B3A" stroke="none">A12</text>
    <circle cx="200" cy="118" r="17" fill="#fff"/>
    <path d="M184 112c3-11 25-13 31 0" fill="#1E1A18"/>
    <path d="M194 121c3 3 9 3 12 0"/>
    <path d="M168 176c0-24 13-36 32-36s32 12 32 36" fill="#F26B3A"/>
    <path d="M224 150l26-16" />
    <circle cx="254" cy="131" r="5" fill="#fff"/>
    <path d="M80 176h270" strokeWidth="3"/>
    <path d="M92 176h246v74H92z" fill="#fff"/>
    <path d="M120 176l8-30h46l8 30" fill="#FCEBD3"/>
    <path d="M136 154h22"/>
    <rect x="290" y="156" width="18" height="20" rx="4" fill="#fff"/>
    <path d="M308 162c6 0 6 9 0 9"/>
    <path d="M294 150c0-4 4-4 4-8M302 150c0-4 4-4 4-8"/>
    <g transform="translate(96 76)">
      <rect x="0" y="0" width="74" height="30" rx="10" fill="#fff"/>
      <path d="M60 30l6 10 2-10" fill="#fff"/>
      <text x="37" y="20" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="11" fill="#1E1A18" stroke="none">Next, please!</text>
    </g>
    <path d="M366 250v-30"/>
    <path d="M366 232c-10-4-14-14-12-22 9 2 13 10 12 22zM366 224c9-4 14-13 12-22-9 2-13 11-12 22z" fill="#F7C98B"/>
    <rect x="356" y="244" width="20" height="16" rx="3" fill="#fff"/>
  </svg>
);

export default StaffArt;