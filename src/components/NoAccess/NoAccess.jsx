import { useContext } from "react";
import { Link } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import { getRole, homeFor } from "../../lib/helpers/roles";
import "../NotFound/NotFound.css";

// Shown when someone opens a page their role can't use
export default function NoAccess() {
  const { user } = useContext(UserContext);

  return (
    <main className="not-found">
      <div className="not-found__box">
        <p className="not-found__code">Error 403</p>
        <h1 className="not-found__title">You can't open this page</h1>

        {user ? (
          <>
            <p className="not-found__text">
              You're signed in as {user.name} ({getRole(user)}). This page is for a
              different kind of account.
            </p>
            <Link to={homeFor(user)} className="btn btn--primary">
              Go to my home page
            </Link>
          </>
        ) : (
          <>
            <p className="not-found__text">Sign in with the right account to see this page.</p>
            <Link to="/sign-in" className="btn btn--primary">
              Sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}