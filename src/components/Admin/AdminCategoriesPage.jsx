import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../services/categoryService";
import { getAdminBusinesses } from "../../services/adminManageService";
import { initial } from "../Owner/ownerSetup";
import { SearchBox } from '../AdminPanel/AdminParts';
import { matches } from '../AdminPanel/adminUtils';
import { plural } from "./adminHelpers";
import "./Admin.css";

const EMPTY_FORM = { name: "", description: "" };
const byName = (a, b) => a.name.localeCompare(b.name);

export default function AdminCategoriesPage() {
  const { toast } = useOutletContext();
  const [list, setList] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, category = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const formDialog = useRef(null);
  const deleteDialog = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    getCategories({ signal: controller.signal })
      .then((data) => { setList([...data].sort(byName)); setError(""); })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); });

    // Only used to count businesses per category, so a failure here is fine
    getAdminBusinesses({ signal: controller.signal })
      .then(setBusinesses)
      .catch(() => { });

    return () => controller.abort();
  }, []);

  // ---------- add / edit ----------
  function openForm(category) {
    setEditing(category || {});
    setForm(category ? { name: category.name, description: category.description || "" } : EMPTY_FORM);
    setFormError("");
    formDialog.current?.showModal();
  }

  function closeForm() {
    formDialog.current?.close();
    setEditing(null);
  }

  async function saveForm(event) {
    event.preventDefault();
    const values = { name: form.name.trim(), description: form.description.trim() || null };
    setBusy(true);
    setFormError("");
    try {
      if (editing.id) {
        const saved = await updateCategory(editing.id, values);
        setList((prev) => prev.map((row) => (row.id === saved.id ? saved : row)).sort(byName));
        toast(`${saved.name} was updated`);
      } else {
        const created = await createCategory(values);
        setList((prev) => [...prev, created].sort(byName));
        toast(`${created.name} was added`);
      }
      closeForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // ---------- delete ----------
  function askDelete(category) {
    setDeleting(category);
    deleteDialog.current?.showModal();
  }

  function closeDelete() {
    deleteDialog.current?.close();
    setDeleting(null);
  }

  async function confirmDelete(event) {
    event.preventDefault();
    const category = deleting;
    setBusy(true);
    try {
      await deleteCategory(category.id);
      setList((prev) => prev.filter((row) => row.id !== category.id));
      toast(`${category.name} was deleted`);
      closeDelete();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="empty"><b>Couldn't load categories</b><p>{error}</p></div>;
  if (!list) return null;

  const countFor = (category) => businesses.filter((business) => business.category_id === category.id).length;
  const shown = list.filter((category) => matches(`${category.name} ${category.description}`, q));

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Categories</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search categories" />
        <button className="btn btn-primary btn-sm" type="button" onClick={() => openForm(null)}>
          + Add category
        </button>
      </div>

      {shown.length ? (
        <div className="list">
          {shown.map((category) => {
            const n = countFor(category);
            return (
              <div className="li am-li" key={category.id}>
                <span className="ic">{initial(category.name)}</span>
                <div>
                  <b>{category.name}</b>
                  <small>{category.description || "No description"}</small>
                </div>
                <span className={`st ${n ? "open" : "off"}`}>{plural(n, "business", "businesses")}</span>
                <span className="am-acts">
                  <button className="edit" type="button" onClick={() => openForm(category)}>Edit</button>
                  <button className="no" type="button" onClick={() => askDelete(category)}>Delete</button>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? "Nothing matches your search" : "No categories yet"}</b>
          <p>{q ? "Try another name." : "Add the first one so owners can pick it for their business."}</p>
        </div>
      )}

      {/* Add or edit */}
      <dialog className="am-dlg" ref={formDialog} onClose={() => setEditing(null)}>
        <form onSubmit={saveForm}>
          <h2>{editing?.id ? `Edit ${editing.name}` : "Add a category"}</h2>
          <p>Owners pick a category for their business, and visitors filter by it on Browse.</p>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="am-fields">
            <div className="f">
              <label htmlFor="am-cat-name">Name</label>
              <input
                id="am-cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Banking"
                required
              />
            </div>
            <div className="f">
              <label htmlFor="am-cat-desc">Description (optional)</label>
              <input
                id="am-cat-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Banks and money services"
              />
            </div>
          </div>
          <div className="fa">
            <button className="btn btn-ghost" type="button" onClick={closeForm}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={busy || !form.name.trim()}>
              {editing?.id ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      </dialog>

      {/* Delete */}
      <dialog className="am-dlg" ref={deleteDialog} onClose={() => setDeleting(null)}>
        <form onSubmit={confirmDelete}>
          <h2>Delete {deleting?.name}?</h2>
          <p>
            {deleting && countFor(deleting)
              ? `${plural(countFor(deleting), "business", "businesses")} will stay, but without a category until the owner picks a new one.`
              : "No businesses use this category."}
          </p>
          <div className="fa">
            <button className="btn btn-ghost" type="button" onClick={closeDelete}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={busy}>Delete category</button>
          </div>
        </form>
      </dialog>
    </section>
  );
}