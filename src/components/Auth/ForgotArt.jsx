// The small line pictures on the forgot / reset password pages
const ForgotArt = ({ name }) => (
  <svg className="fp-art" viewBox="0 0 150 120" fill="none" stroke="#1B191A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'lock' && (
      <>
        <circle cx="78" cy="62" r="48" fill="#FCEBD3" stroke="none" />
        <rect x="44" y="52" width="62" height="48" rx="10" fill="#fff" />
        <path d="M58 52V40a17 17 0 0 1 34 0v12" />
        <circle cx="75" cy="73" r="6" fill="#F8713A" stroke="none" />
        <path d="M75 79v8" />
        <path d="M118 30l6-6M124 40h8M114 22v-8" stroke="#E2572A" />
        <text x="28" y="40" fontFamily="Manrope" fontWeight="800" fontSize="22" fill="#E2572A" stroke="none">?</text>
      </>
    )}
    {name === 'mail' && (
      <>
        <circle cx="75" cy="62" r="48" fill="#FCEBD3" stroke="none" />
        <rect x="32" y="46" width="78" height="52" rx="8" fill="#fff" />
        <path d="M32 50l39 28 39-28" />
        <circle cx="108" cy="44" r="16" fill="#F8713A" stroke="none" />
        <path d="M101 44l5 5 9-10" stroke="#fff" strokeWidth="3" />
        <path d="M126 22l6-6M130 32h8" stroke="#E2572A" />
      </>
    )}
    {name === 'key' && (
      <>
        <circle cx="75" cy="62" r="48" fill="#FCEBD3" stroke="none" />
        <circle cx="58" cy="62" r="20" fill="#fff" />
        <circle cx="58" cy="62" r="7" fill="#F8713A" stroke="none" />
        <path d="M78 62h40M106 62v12M116 62v8" />
        <path d="M30 28l6 6M24 42h8" stroke="#E2572A" />
      </>
    )}
    {name === 'done' && (
      <>
        <circle cx="75" cy="62" r="48" fill="#FCEBD3" stroke="none" />
        <circle cx="75" cy="62" r="30" fill="#fff" />
        <path d="M62 62l9 9 17-18" stroke="#E2572A" strokeWidth="4" />
        <path d="M24 30l6 6M120 26l-6 6M126 92h8M18 88h8" stroke="#E2572A" />
      </>
    )}
  </svg>
);

export const BackArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

export const Steps = ({ on }) => (
  <div className="fp-steps" aria-hidden="true">
    {[1, 2, 3, 4].map((n) => <i key={n} className={n <= on ? 'on' : ''} />)}
  </div>
);

export default ForgotArt;