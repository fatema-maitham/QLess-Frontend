import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import { removeToken } from "../../lib/helpers/jwt-helpers";
import { ROLES, getRole, homeFor } from "../../lib/helpers/roles";
import NotificationBell from "../Notifications/NotificationBell";
import logo from "../../assets/qless-logo.png";
import "./NavBar.css";

const linkClass = ({ isActive }) => `qnav__link ${isActive ? "is-active" : ""}`;

// How far the page is scrolled. Owner.css makes #root scroll instead of
// the window, so check every place the page can scroll from.
const getScrollTop = () =>
  Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
    document.getElementById("root")?.scrollTop || 0
  );

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const role = getRole(user);

  // Close the phone menu when the page changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Turn the bar white after scrolling down a little
  useEffect(() => {
    const onScroll = () => setScrolled(getScrollTop() > 10);
    onScroll();
    // "capture: true" catches scrolling from #root too, not only the window
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [location.pathname]);

  const handleSignOut = () => {
    removeToken();
    setUser(null);
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <header className={`qnav ${scrolled || open ? "is-scrolled" : ""}`}>
      <div className="qnav__inner">
        <Link to={user ? homeFor(user) : "/"} className="qnav__logo" aria-label="QLess home">
          <img src={logo} alt="QLess logo" className="qnav__logo-img" />
        </Link>

        <button
          type="button"
          className={`qnav__toggle ${open ? "is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`qnav__menu ${open ? "is-open" : ""}`} aria-label="Main">
          {user ? (
            <>
              <ul className="qnav__links">
                <li>
                  <NavLink to={homeFor(user)} end className={linkClass}>
                    Dashboard
                  </NavLink>
                </li>

                {role === ROLES.CUSTOMER && (
                  <>
                    <li>
                      <NavLink to="/businesses" className={linkClass}>Browse</NavLink>
                    </li>
                    <li>
                      <NavLink to="/my-tickets" className={linkClass}>My Queues</NavLink>
                    </li>
                    <li>
                      <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>
                    </li>
                    <li>
                      <NavLink to="/favorites" className={linkClass}>Favorites</NavLink>
                    </li>
                  </>
                )}

                {role === ROLES.ADMIN && (
                  <>
                    <li>
                      <NavLink to="/admin/queues" className={linkClass}>Queues</NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/reviews" className={linkClass}>Reviews</NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/suspicious-activity" className={linkClass}>
                        Suspicious activity
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/categories" className={linkClass}>Categories</NavLink>
                    </li>
                  </>
                )}
              </ul>

              <div className="qnav__actions">
                <NotificationBell />

                <span className="qnav__user">
                  <span className="qnav__avatar" aria-hidden="true">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                  Hello {firstName}
                </span>

                <Link to="/" onClick={handleSignOut} className="qnav__btn qnav__btn--ghost">
                  Sign Out
                </Link>
              </div>
            </>
          ) : (
            <>
              <ul className="qnav__links">
                <li>
                  <NavLink to="/" end className={linkClass}>Home</NavLink>
                </li>
                <li>
                  <NavLink to="/businesses" className={linkClass}>Businesses</NavLink>
                </li>
                <li>
                  <a href="/#how" className="qnav__link">How it works</a>
                </li>
              </ul>

              <div className="qnav__actions">
                <Link to="/sign-in" className="qnav__btn qnav__btn--ghost">Sign In</Link>
                <Link to="/sign-up" className="qnav__btn qnav__btn--primary">Sign Up</Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;