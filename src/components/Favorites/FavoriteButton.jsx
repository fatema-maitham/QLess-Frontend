import { useContext, useEffect, useState } from "react";
import { Heart } from "@phosphor-icons/react";
import { UserContext } from "../../contexts/UserContext";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../../services/favoriteService";
import "./Favorites.css";

export default function FavoriteButton({ businessId }) {
  const { user } = useContext(UserContext);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const isCustomer = user?.role === "customer";

  useEffect(() => {
    if (!isCustomer) {
      setChecking(false);
      return;
    }

    const controller = new AbortController();

    getFavorites({ signal: controller.signal })
      .then((favorites) => {
        const exists = favorites.some(
          (favorite) => Number(favorite.business_id) === Number(businessId)
        );

        setIsFavorite(exists);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        setChecking(false);
      });

    return () => controller.abort();
  }, [businessId, isCustomer]);

  if (!isCustomer) return null;

  async function handleFavorite() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      if (isFavorite) {
        await removeFavorite(businessId);
        setIsFavorite(false);
      } else {
        await addFavorite(businessId);
        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="favorite-action">
      <button
        type="button"
        className={`favorite-btn ${isFavorite ? "favorite-btn--active" : ""
          }`}
        onClick={handleFavorite}
        disabled={loading || checking}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite ? "Remove from favorites" : "Add to favorites"
        }
      >
        <Heart
          size={22}
          weight={isFavorite ? "fill" : "regular"}
        />

        <span>
          {checking
            ? "Checking..."
            : loading
              ? "Saving..."
              : isFavorite
                ? "Saved"
                : "Save"}
        </span>
      </button>

      {error && (
        <p className="favorite-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}