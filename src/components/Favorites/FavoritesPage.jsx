import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Heart, MapPin, Star, Trash } from "@phosphor-icons/react";
import { getFavorites, removeFavorite } from "../../services/favoriteService";
import "./Favorites.css";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getFavorites({ signal: controller.signal })
      .then((data) => {
        setFavorites(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;

        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  async function handleRemove(businessId) {
    setRemovingId(businessId);
    setError("");

    try {
      await removeFavorite(businessId);

      setFavorites((current) =>
        current.filter((favorite) => Number(favorite.business_id) !== Number(businessId)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  if (status === "loading") {
    return (
      <main className="page favorites-page">
        <div className="page__container" aria-busy="true">
          <header className="page-head">
            <div>
              <h1>My favorites</h1>
              <p>The places you saved, ready when you need them.</p>
            </div>
          </header>
          <div className="page-skeleton" />
          <div className="page-skeleton" />
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="page favorites-page">
        <div className="page__container">
          <header className="page-head">
            <div>
              <h1>My favorites</h1>
              <p>The places you saved, ready when you need them.</p>
            </div>
          </header>
          <div className="page-empty" role="alert">
            <h2>We couldn't load your favorites</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page favorites-page">
      <div className="page__container">
        <header className="page-head">
          <div>
            <h1>My favorites</h1>
            <p>The places you saved, ready when you need them.</p>
          </div>
        </header>

        {error && (
          <p className="favorite-error" role="alert">
            {error}
          </p>
        )}

        {favorites.length === 0 ? (
          <section className="page-empty">
            <span className="page-empty__icon">
              <Heart size={28} weight="duotone" />
            </span>

            <h2>No favorites yet</h2>

            <p>Save businesses you visit often so you can find them quickly.</p>

            <Link to="/businesses" className="btn btn--primary">
              Browse places
            </Link>
          </section>
        ) : (
          <section className="favorites-grid" aria-label="Favorite businesses">
            {favorites.map((favorite) => {
              const business = favorite.business;

              return (
                <article className="favorite-card" key={favorite.id}>
                  <div className="favorite-card__top">
                    <span className="favorite-card__logo">
                      {business.image ? (
                        <img src={business.image} alt={`${business.name} logo`} />
                      ) : (
                        business.name.charAt(0).toUpperCase()
                      )}
                    </span>

                    <button
                      type="button"
                      className="favorite-card__remove"
                      onClick={() => handleRemove(favorite.business_id)}
                      disabled={removingId === favorite.business_id}
                      aria-label={`Remove ${business.name} from favorites`}
                    >
                      <Trash size={18} />
                    </button>
                  </div>

                  {business.category && (
                    <span className="favorite-card__category">{business.category.name}</span>
                  )}

                  <h2>{business.name}</h2>

                  {business.description && (
                    <p className="favorite-card__description">{business.description}</p>
                  )}

                  {business.address && (
                    <p className="favorite-card__meta">
                      <MapPin size={16} />
                      {business.address}
                    </p>
                  )}

                  {business.average_rating != null && (
                    <p className="favorite-card__rating">
                      <Star size={16} weight="fill" />
                      {Number(business.average_rating).toFixed(1)}
                    </p>
                  )}

                  <Link to={`/businesses/${business.id}`} className="favorite-card__link">
                    View place
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}