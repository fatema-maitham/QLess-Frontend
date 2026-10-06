import { useContext, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router";

import { UserContext } from "../../contexts/UserContext";
import { removeToken } from "../../lib/helpers/jwt-helpers";
import { ROLES, getRole, homeFor } from "../../lib/helpers/roles";
import NotificationBell from "../Notifications/NotificationBell";
import logo from "../../assets/qless-logo.png";
import "./NavBar.css";

const linkClass = ({ isActive }) =>
  `qnav__link ${isActive ? "is-active" : ""}`;

// How far the page is scrolled. Owner.css makes #root scroll instead of
// the window, so check every place the page can scroll from.
const getScrollTop = () =>
  Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
    document.getElementById("root")?.scrollTop || 0,
  );

// True on phones and tablets
const PHONE_QUERY = "(max-width: 1100px)";

const useIsPhone = () => {
  const [isPhone, setIsPhone] = useState(() =>
    window.matchMedia(PHONE_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY);
    const onChange = () => setIsPhone(media.matches);

    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, []);

  return isPhone;
};

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const role = getRole(user);
  const isPhone = useIsPhone();

  // Close the phone menu when the page changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Turn the bar white after scrolling down a little
  useEffect(() => {
    const onScroll = () => setScrolled(getScrollTop() > 10);

    onScroll();

    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });

    return () =>
      document.removeEventListener("scroll", onScroll, {
        capture: true,
      });
  }, [location.pathname]);

  const handleSignOut = () => {
    removeToken();
    setUser(null);
    navigate("/", { replace: true });
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <header className={`qnav ${scrolled || open ? "is-scrolled" : ""}`}>
      <div className="qnav__inner">
        <Link
          to={user ? homeFor(user) : "/"}
          className="qnav__logo"
          aria-label="QLess home"
        >
          <img
            src={logo}
            alt="QLess logo"
            className="qnav__logo-img"
          />
        </Link>

        {/* On phones the bell stays in the top bar */}
        {user && isPhone && (
          <div className="qnav__bell">
            <NotificationBell />
          </div>
        )}

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

        <nav
          className={`qnav__menu ${open ? "is-open" : ""}`}
          aria-label="Main"
        >
          {user ? (
            <>
              <ul className="qnav__links">
                {/* Customers reach their dashboard from the logo */}
                {role !== ROLES.CUSTOMER && (
                  <li>
                    <NavLink
                      to={homeFor(user)}
                      end
                      className={linkClass}
                    >
                      Dashboard
                    </NavLink>
                  </li>
                )}

                {role === ROLES.CUSTOMER && (
                  <>
                    <li>
                      <NavLink
                        to="/businesses"
                        className={linkClass}
                      >
                        Browse
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/my-tickets"
                        className={linkClass}
                      >
                        My Queues
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/my-bookings"
                        className={linkClass}
                      >
                        My Bookings
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/favorites"
                        className={linkClass}
                      >
                        Favorites
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/profile"
                        className={linkClass}
                      >
                        My profile
                      </NavLink>
                    </li>


                                        <li>
                      <NavLink
                        to="/settings"
                        className={linkClass}
                      >
                        Settings
                      </NavLink>
                    </li>
                  </>
                )}

                {role === ROLES.ADMIN && (
                  <>
                    <li>
                      <NavLink
                        to="/admin/queues"
                        className={linkClass}
                      >
                        Queues
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/admin/reviews"
                        className={linkClass}
                      >
                        Reviews
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/admin/suspicious-activity"
                        className={linkClass}
                      >
                        Suspicious activity
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/admin/categories"
                        className={linkClass}
                      >
                        Categories
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>

              <div className="qnav__actions">
                {!isPhone && <NotificationBell />}

                <span className="qnav__user">
                  <span
                    className="qnav__avatar"
                    aria-hidden="true"
                  >
                    {firstName.charAt(0).toUpperCase()}
                  </span>

                  Hello {firstName}
                </span>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="qnav__btn qnav__btn--ghost"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <ul className="qnav__links">
                <li>
                  <NavLink
                    to="/"
                    end
                    className={linkClass}
                  >
                    Home
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/businesses"
                    className={linkClass}
                  >
                    Browse
                  </NavLink>
                </li>

                <li>
                  <Link
                    to="/#how"
                    className="qnav__link"
                  >
                    How it works
                  </Link>
                </li>
              </ul>

              <div className="qnav__actions">
                <Link
                  to="/sign-in"
                  className="qnav__btn qnav__btn--ghost"
                >
                  Sign In
                </Link>

                <Link
                  to="/sign-up"
                  className="qnav__btn qnav__btn--primary"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;