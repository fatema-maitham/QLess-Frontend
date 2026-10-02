const BusinessArt = () => (
  <svg
    viewBox="20 16 380 218"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    stroke="#1E1A18"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="20" y="16" width="380" height="218" fill="#FCEBD3" stroke="none" />
    {/* queue screen */}
    <rect x="250" y="34" width="120" height="74" rx="10" fill="#fff" />
    <text x="310" y="58" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="10" fill="#8A827B" stroke="none" letterSpacing="1.5">NOW SERVING</text>
    <text x="310" y="92" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="28" fill="#F26B3A" stroke="none">A107</text>
    {/* plant */}
    <path d="M44 214v-34" />
    <path d="M44 196c-10-4-14-14-12-22 9 2 13 10 12 22zM44 188c9-4 14-13 12-22-9 2-13 11-12 22z" fill="#F7C98B" />
    <rect x="34" y="208" width="20" height="18" rx="3" fill="#fff" />
    {/* counter */}
    <path d="M150 150h200v70H150z" fill="#fff" />
    <path d="M140 150h220" strokeWidth="3" />
    {/* staff */}
    <circle cx="250" cy="110" r="14" fill="#fff" />
    <path d="M240 104c2-8 18-10 22-1" fill="#1E1A18" />
    <path d="M226 150c0-18 10-26 24-26s24 8 24 26" fill="#F26B3A" />
    <rect x="196" y="132" width="34" height="18" rx="3" fill="#fff" />
    {/* visitor with phone */}
    <circle cx="104" cy="92" r="13" fill="#fff" />
    <path d="M92 88c0-10 22-12 25 2" fill="#1E1A18" />
    <path d="M86 150c0-28 6-42 18-42s18 14 18 42z" fill="#F7C98B" />
    <path d="M92 150l-4 66M116 150l4 66" />
    <path d="M120 122l14 6" />
    <rect x="132" y="118" width="12" height="20" rx="3" fill="#fff" />
    <path d="M84 216h12M114 216h12" strokeWidth="3" />
    {/* visitor sitting */}
    <path d="M330 200h46v-30" />
    <circle cx="352" cy="148" r="11" fill="#fff" />
    <path d="M342 148c0-12 20-12 20 0" fill="#1E1A18" />
    <path d="M338 196c0-22 4-34 14-34s14 12 14 34z" fill="#fff" />
    {/* bubble */}
    <rect x="44" y="34" width="112" height="34" rx="10" fill="#fff" />
    <circle cx="62" cy="51" r="8" fill="#F26B3A" stroke="none" />
    <path d="M58 51l3 3 5-6" stroke="#fff" strokeWidth="2" />
    <text x="76" y="55" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="11" fill="#1E1A18" stroke="none">You're next!</text>
  </svg>
);

export default BusinessArt;