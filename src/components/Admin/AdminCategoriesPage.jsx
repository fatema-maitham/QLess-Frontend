import { useEffect, useState } from "react";
import { PencilSimple, Plus, Tag, Trash } from "@phosphor-icons/react";
import AdminTabs from "./AdminTabs";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categoryService";
import "./Admin.css";

const EMPTY_FORM = { name: "", description: "" };

const byName = (a, b) => a.name.localeCompare(b.name);

// One category row: view, edit or delete (delete asks first)
function CategoryCard({ category, busy, onSave, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({
    name: category.name,
    description: category.description || "",
  });

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const saved = await onSave(category, form);
    if (saved) setEditing(false);
  }

  if (editing) {
    return (
      <li className="ad-card">
        <form className="ad-actions" onSubmit={handleSubmit}>
          <label className="ad-field">
            <span>Name</span>
            <input
              className="ad-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label className="ad-field">
            <span>Description</span>
            <input
              className="ad-input"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>
          <div className="ad-actions__buttons">
            <button type="submit" className="ad-btn ad-btn--primary" disabled={busy}>
              Save
            </button>
            <button type="button" className="ad-btn" disabled={busy} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="ad-card">
      <div className="ad-card__top">
        <div>
          <h2 className="ad-card__title">{category.name}</h2>
          <p className="ad-card__sub">{category.description || "No description"}</p>
        </div>
      </div>

      <div className="ad-actions__buttons">
        {confirming ? (
          <>
            <span className="ad-confirm">
              Delete this category? Its businesses stay, but lose their category.
            </span>
            <button
              type="button"
              className="ad-btn ad-btn--primary"
              disabled={busy}
              onClick={() => onRemove(category)}
            >
              Yes, delete
            </button>
            <button type="button" className="ad-btn" disabled={busy} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" className="ad-btn" onClick={() => setEditing(true)}>
              <PencilSimple size={16} /> Edit
            </button>
            <button type="button" className="ad-btn" onClick={() => setConfirming(true)}>
              <Trash size={16} /> Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default function AdminCategoriesPage() {
  const [page, setPage] = useState({ status: "loading", list: [], error: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getCategories({ signal: controller.signal })
      .then((list) => setPage({ status: "ready", list: [...list].sort(byName), error: "" }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPage({ status: "error", list: [], error: err.message });
      });

    return () => controller.abort();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleCreate(event) {
    event.preventDefault();
    setBusyId("new");
    setActionError("");

    try {
      const created = await createCategory({
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
      setPage((prev) => ({ ...prev, list: [...prev.list, created].sort(byName) }));
      setForm(EMPTY_FORM);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  // Returns true when saved, so the card can close its form
  async function save(category, values) {
    setBusyId(category.id);
    setActionError("");

    try {
      const saved = await updateCategory(category.id, {
        name: values.name.trim(),
        description: values.description.trim() || null,
      });
      setPage((prev) => ({
        ...prev,
        list: prev.list.map((row) => (row.id === saved.id ? saved : row)).sort(byName),
      }));
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function remove(category) {
    setBusyId(category.id);
    setActionError("");

    try {
      await deleteCategory(category.id);
      setPage((prev) => ({ ...prev, list: prev.list.filter((row) => row.id !== category.id) }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const count = page.list.length;

  return (
    <main className="ad-page">
      <header className="ad-head">
        <p className="ad-eyebrow">Admin</p>
        <h1 className="ad-title">Categories</h1>
        <p className="ad-sub">The categories visitors use to filter businesses on the Browse page.</p>
      </header>

      <AdminTabs />

      <form className="ad-filters" onSubmit={handleCreate}>
        <label className="ad-field ad-field--inline">
          <span>Name</span>
          <input
            className="ad-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Banking"
            required
          />
        </label>
        <label className="ad-field ad-field--inline">
          <span>Description</span>
          <input
            className="ad-input"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional"
          />
        </label>
        <button type="submit" className="ad-btn ad-btn--primary" disabled={busyId === "new"}>
          <Plus size={16} /> Add category
        </button>
      </form>

      {actionError && (
        <p className="ad-error" role="alert">
          {actionError}
        </p>
      )}

      {page.status === "loading" && <p className="ad-empty">Loading categories…</p>}

      {page.status === "error" && (
        <div className="ad-empty" role="alert">
          <b>Could not load categories</b>
          <p>{page.error}</p>
        </div>
      )}

      {page.status === "ready" && count === 0 && (
        <div className="ad-empty">
          <Tag size={32} weight="duotone" />
          <b>No categories yet</b>
          <p>Add the first one above.</p>
        </div>
      )}

      {page.status === "ready" && count > 0 && (
        <ul className="ad-list">
          {page.list.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              busy={busyId === category.id}
              onSave={save}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
    </main>
  );
}