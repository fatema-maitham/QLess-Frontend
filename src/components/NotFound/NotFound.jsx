import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__box">
        <p className="not-found__code">Error 404</p>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__text">
          This page doesn't exist or may have moved. Check the address, or go
          back to the home page.
        </p>
        <Link to="/" className="btn btn--primary">
          Go to home page
        </Link>
      </div>
    </main>
  );
}