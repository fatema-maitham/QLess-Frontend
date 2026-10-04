import { useContext } from "react";
import { Link } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import { ROLES, getRole } from "../../lib/helpers/roles";
import logo from "../../assets/qless-logo.png";
import "./Footer.css";

// What the footer shows for each kind of user
const FOOTER_CONTENT = {
  guest: {
    text: "Join queues from anywhere, track your turn live, and arrive just in time.",
    cta: { title: "Ready to skip the line?", button: "Create free account", to: "/sign-up" },
    columns: [
      {
        title: "Explore",
        links: [
          { to: "/", label: "Home" },
          { to: "/businesses", label: "Businesses" },
          { href: "/#how", label: "How it works" },
        ],
      },
      {
        title: "Get started",
        links: [
          { to: "/sign-up", label: "Sign Up" },
          { to: "/sign-in", label: "Sign In" },
          { to: "/businesses", label: "Find a queue" },
        ],
      },
    ],
  },
  [ROLES.CUSTOMER]: {
    text: "Your place in line, saved. Track your queues and bookings in one place.",
    cta: { title: "Need to be somewhere?", button: "Find a queue", to: "/businesses" },
    columns: [
      {
        title: "Explore",
        links: [
          { to: "/businesses", label: "Businesses" },
          { to: "/favorites", label: "Favorites" },
          { to: "/notifications", label: "Notifications" },
        ],
      },
      {
        title: "My QLess",
        links: [
          { to: "/my-tickets", label: "My Queues" },
          { to: "/my-bookings", label: "My Bookings" },
          { to: "/dashboard", label: "Dashboard" },
        ],
      },
    ],
  },
  [ROLES.OWNER]: {
    text: "Manage your branches, queues and staff, and keep customers moving.",
    cta: { title: "Keep your queues moving.", button: "Go to dashboard", to: "/owner/dashboard" },
    columns: [
      {
        title: "Manage",
        links: [
          { to: "/owner/dashboard", label: "Dashboard" },
          { to: "/owner/branches", label: "Branches" },
          { to: "/owner/queues", label: "Queues" },
        ],
      },
      {
        title: "Business",
        links: [
          { to: "/owner/staff", label: "Staff" },
          { to: "/owner/announcements", label: "Announcements" },
          { to: "/owner/profile", label: "Profile" },
        ],
      },
    ],
  },
  [ROLES.STAFF]: {
    text: "Call the next customer, check people in, and keep your branch on time.",
    cta: { title: "Customers are waiting.", button: "Open my queues", to: "/staff" },
    columns: [
      {
        title: "Work",
        links: [
          { to: "/staff", label: "My Queues" },
          { to: "/notifications", label: "Notifications" },
        ],
      },
      {
        title: "Explore",
        links: [{ to: "/businesses", label: "Businesses" }],
      },
    ],
  },
  [ROLES.ADMIN]: {
    text: "Keep the platform safe: watch queue activity and moderate reviews.",
    cta: { title: "Something look wrong?", button: "Review activity", to: "/admin/suspicious-activity" },
    columns: [
      {
        title: "Monitor",
        links: [
          { to: "/admin/queues", label: "Queues" },
          { to: "/admin/suspicious-activity", label: "Suspicious activity" },
        ],
      },
      {
        title: "Moderate",
        links: [
          { to: "/admin/reviews", label: "Reviews" },
          { to: "/notifications", label: "Notifications" },
        ],
      },
    ],
  },
};

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <>
        <path d="M6 9v9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="5.5" r="1.25" fill="currentColor" />
        <path d="M10 18v-5a4 4 0 0 1 8 0v5M10 9v9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: "Email",
    href: "mailto:hello@qless.com",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

function FooterLink({ link }) {
  // "href" is for links to a part of the landing page, like /#how
  if (link.href) return <a href={link.href}>{link.label}</a>;
  return <Link to={link.to}>{link.label}</Link>;
}

const Footer = () => {
  const { user } = useContext(UserContext);
  const content = FOOTER_CONTENT[getRole(user)] || FOOTER_CONTENT.guest;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="qfoot">
      <div className="qfoot__container">
        {/* Top strip: message + button for this user */}
        <div className="qfoot__cta">
          <p className="qfoot__cta-title">{content.cta.title}</p>
          <Link to={content.cta.to} className="qfoot__cta-btn">
            {content.cta.button}
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Middle: brand + link columns */}
        <div className="qfoot__main">
          <div className="qfoot__brand">
            <Link to="/" className="qfoot__logo" aria-label="QLess home">
              <img src={logo} alt="QLess" />
            </Link>

            <p>{content.text}</p>

            <div className="qfoot__socials">
              {SOCIALS.map((social) => (
                <a key={social.label} href={social.href} aria-label={social.label}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {content.columns.map((column) => (
            <nav key={column.title} className="qfoot__col" aria-label={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <FooterLink key={link.label} link={link} />
              ))}
            </nav>
          ))}
        </div>

        {/* Bottom row */}
        <div className="qfoot__bottom">
          <p>© 2026 QLess. All rights reserved.</p>
          <p className="qfoot__motto">Your place. Your time.</p>
          <button type="button" className="qfoot__top" onClick={scrollToTop}>
            Back to top
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;