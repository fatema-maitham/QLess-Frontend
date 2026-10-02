const font = 'Montserrat,sans-serif';

export const BenchArt = () => (
  <svg viewBox="0 0 420 300" fill="none" aria-hidden="true">
    <ellipse cx="210" cy="276" rx="190" ry="14" fill="#2A2522" />
    <circle cx="330" cy="70" r="34" fill="#F7C98B" opacity=".9" />
    {/* lamp */}
    <rect x="60" y="60" width="7" height="214" rx="3" fill="#3A3431" />
    <path d="M48 62h31l-5-26H53z" fill="#3A3431" />
    <circle cx="63" cy="72" r="16" fill="#F26B3A" opacity=".25" />
    <circle cx="63" cy="70" r="6" fill="#F7C98B" />
    {/* plant */}
    <path d="M358 274c-4-30 4-52 18-66-2 22-4 44-8 66" fill="#F26B3A" opacity=".8" />
    <path d="M368 274c8-22 22-34 38-38-10 14-18 26-26 38" fill="#F7C98B" opacity=".8" />
    {/* bench */}
    <rect x="120" y="196" width="200" height="12" rx="4" fill="#F5F2EE" />
    <rect x="120" y="172" width="200" height="11" rx="4" fill="#F5F2EE" opacity=".85" />
    <rect x="120" y="150" width="200" height="11" rx="4" fill="#F5F2EE" opacity=".7" />
    <path d="M136 208v66M304 208v66" stroke="#F5F2EE" strokeWidth="5" strokeLinecap="round" />
    {/* person */}
    <path d="M178 196c0-24 4-54 15-72 8-12 40-12 50 0 9 14 11 46 9 72z" fill="#F26B3A" />
    <path d="M186 196l-6 40h32l8 38h18l-5-56c-1-8-6-14-14-14z" fill="#F5F2EE" opacity=".9" />
    <path d="M232 196l10 38 26 2 3 38h18l-3-54c-1-10-8-16-18-16z" fill="#D9D1C9" />
    <path d="M228 274h24l5 8h-31zM270 274h22l5 8h-29z" fill="#F5F2EE" />
    <circle cx="216" cy="98" r="22" fill="#F2C4A0" />
    <path d="M194 95c-2-20 13-30 27-29 15 2 24 12 22 25-8-7-21-10-32-5-6 3-11 7-17 9z" fill="#1E1A18" />
    <path d="M200 148c-10 12-11 28 0 38l38-10" stroke="#C9481F" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="232" y="150" width="22" height="36" rx="5" fill="#F5F2EE" transform="rotate(-12 243 168)" />
    <rect x="237" y="158" width="12" height="9" rx="2" fill="#F26B3A" transform="rotate(-12 243 162)" />
    {/* floating bubble */}
    <g className="bub">
      <rect x="262" y="96" width="118" height="40" rx="14" fill="#FFFFFF" />
      <path d="M276 136l-6 12 16-12z" fill="#FFFFFF" />
      <circle cx="282" cy="116" r="9" fill="#F26B3A" />
      <path d="M278 116l3 3 5-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="297" y="120" fontFamily={font} fontSize="12" fontWeight="700" fill="#1E1A18">You're next!</text>
    </g>
    {/* cup */}
    <path d="M150 186h18l-3 10h-12z" fill="#F7C98B" />
  </svg>
);

export const PhoneArt = () => (
  <svg viewBox="0 0 420 300" fill="none" aria-hidden="true">
    <ellipse cx="210" cy="280" rx="170" ry="12" fill="#2A2522" />
    <g transform="translate(-40 0)">
      <circle cx="210" cy="150" r="118" fill="#F26B3A" opacity=".10" />
      <circle cx="210" cy="150" r="84" fill="#F26B3A" opacity=".10" />
      {/* phone */}
      <rect x="150" y="18" width="120" height="252" rx="26" fill="#F5F2EE" />
      <rect x="158" y="26" width="104" height="236" rx="19" fill="#2A2522" />
      <rect x="192" y="32" width="36" height="8" rx="4" fill="#1E1A18" />
      <text x="210" y="74" textAnchor="middle" fontFamily={font} fontSize="9" fontWeight="700" letterSpacing="1.2" fill="#A99F97">YOUR NUMBER</text>
      <text x="210" y="110" textAnchor="middle" fontFamily={font} fontSize="30" fontWeight="800" fill="#F7C98B">A107</text>
      <circle cx="210" cy="160" r="30" stroke="#3A3431" strokeWidth="7" />
      <circle cx="210" cy="160" r="30" stroke="#F26B3A" strokeWidth="7" strokeLinecap="round" strokeDasharray="188" strokeDashoffset="40" transform="rotate(-90 210 160)" />
      <text x="210" y="166" textAnchor="middle" fontFamily={font} fontSize="16" fontWeight="800" fill="#FFFFFF">1</text>
      <text x="210" y="208" textAnchor="middle" fontFamily={font} fontSize="10" fontWeight="600" fill="#C9C1BA">person ahead</text>
      <rect x="164" y="224" width="92" height="22" rx="11" fill="#F26B3A" />
      <text x="210" y="239" textAnchor="middle" fontFamily={font} fontSize="10" fontWeight="700" fill="#FFFFFF">I'm on my way</text>
    </g>
    {/* notification */}
    <g className="bub">
      <rect x="238" y="40" width="180" height="54" rx="16" fill="#FFFFFF" />
      <rect x="248" y="52" width="30" height="30" rx="9" fill="#1E1A18" />
      <text x="263" y="72" textAnchor="middle" fontFamily={font} fontSize="14" fontWeight="800" fill="#F7C98B">Q</text>
      <text x="286" y="64" fontFamily={font} fontSize="10.5" fontWeight="800" fill="#1E1A18">It's almost your turn</text>
      <text x="286" y="80" fontFamily={font} fontSize="10" fontWeight="500" fill="#5A524C">Head to counter 2</text>
    </g>
    {/* wait card */}
    <g>
      <rect x="262" y="176" width="110" height="44" rx="14" fill="#2A2522" stroke="#3A3431" />
      <circle cx="282" cy="198" r="8" fill="#F7C98B" />
      <text x="296" y="195" fontFamily={font} fontSize="9" fontWeight="700" fill="#FFFFFF">~4 min</text>
      <text x="296" y="208" fontFamily={font} fontSize="8" fontWeight="500" fill="#A99F97">left to wait</text>
    </g>
  </svg>
);