const base = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round',
};

export const UserIcon = ({ color = '#8A827B', size = 18, className }) => (
  <svg {...base} width={size} height={size} stroke={color} className={className} aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const MailIcon = ({ className }) => (
  <svg {...base} stroke="#8A827B" className={className} aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
  </svg>
);

export const PhoneIcon = ({ className }) => (
  <svg {...base} stroke="#8A827B" className={className} aria-hidden="true">
    <rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" />
  </svg>
);

export const LockIcon = ({ className }) => (
  <svg {...base} stroke="#8A827B" className={className} aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const EyeIcon = ({ open }) => (
  <svg {...base} stroke="#5A524C" aria-hidden="true">
    {open ? (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
      </>
    ) : (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export const BuildingIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} stroke="#1E1A18" aria-hidden="true">
    <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
  </svg>
);

export const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F7C98B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9481F" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
  </svg>
);