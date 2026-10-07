import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categoryService";

import { getAdminBusinesses } from "../../services/adminManageService";
import ColorIcon from "../Landing/ColorIcon";
import { SearchBox } from "../AdminPanel/AdminParts";
import { matches } from "../AdminPanel/adminUtils";
import { plural } from "./adminHelpers";
import "./Admin.css";

const EMPTY_FORM = {
  name: "",
  description: "",
};

const byName = (a, b) => a.name.localeCompare(b.name);

/* ---------------------------------------------------------
   Match admin categories with the same industry icons
   used on the Landing page
--------------------------------------------------------- */
function categoryIcon(name = "") {
  const value = name.toLowerCase().trim();

  if (value.includes("government")) {
    return "government";
  }

  if (
    value.includes("bank") ||
    value.includes("banking") ||
    value.includes("finance") ||
    value.includes("money")
  ) {
    return "banks";
  }

  if (
    value.includes("health") ||
    value.includes("clinic") ||
    value.includes("hospital")
  ) {
    return "healthcare";
  }

  if (
    value.includes("pharmacy") ||
    value.includes("pharmacies")
  ) {
    return "pharmacies";
  }

  if (
    value.includes("telecom") ||
    value.includes("mobile") ||
    value.includes("internet")
  ) {
    return "telecom";
  }

  if (
    value.includes("university") ||
    value.includes("universities") ||
    value.includes("education")
  ) {
    return "universities";
  }

  if (
    value.includes("restaurant") ||
    value.includes("cafe") ||
    value.includes("food")
  ) {
    return "restaurants";
  }

  if (
    value.includes("salon") ||
    value.includes("barber") ||
    value.includes("spa")
  ) {
    return "salons";
  }

  if (
    value.includes("lab") ||
    value.includes("laboratory")
  ) {
    return "labs";
  }

  if (
    value.includes("veterinary") ||
    value.includes("vet")
  ) {
    return "veterinary";
  }

  if (
    value.includes("utility") ||
    value.includes("utilities")
  ) {
    return "utilities";
  }

  if (
    value.includes("car") ||
    value.includes("automotive")
  ) {
    return "car";
  }

  if (
    value.includes("post") ||
    value.includes("postal")
  ) {
    return "post";
  }

  return "business";
}

export default function AdminCategoriesPage() {
  const { toast } = useOutletContext();

  const [list, setList] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const formDialog = useRef(null);
  const deleteDialog = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    getCategories({ signal: controller.signal })
      .then((data) => {
        setList([...data].sort(byName));
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      });

    // Used only to count businesses in each category
    getAdminBusinesses({ signal: controller.signal })
      .then(setBusinesses)
      .catch(() => { });

    return () => controller.abort();
  }, []);

  /* ---------------------------------------------------------
     Add / Edit
  --------------------------------------------------------- */
  function openForm(category) {
    setEditing(category || {});

    setForm(
      category
        ? {
          name: category.name,
          description: category.description || "",
        }
        : EMPTY_FORM
    );

    setFormError("");
    formDialog.current?.showModal();
  }

  function closeForm() {
    formDialog.current?.close();
    setEditing(null);
  }

  async function saveForm(event) {
    event.preventDefault();

    const values = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    };

    setBusy(true);
    setFormError("");

    try {
      if (editing.id) {
        const saved = await updateCategory(editing.id, values);

        setList((prev) =>
          prev
            .map((row) => (row.id === saved.id ? saved : row))
            .sort(byName)
        );

        toast(`${saved.name} was updated`);
      } else {
        const created = await createCategory(values);

        setList((prev) =>
          [...prev, created].sort(byName)
        );

        toast(`${created.name} was added`);
      }

      closeForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  /* ---------------------------------------------------------
     Delete
  --------------------------------------------------------- */
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

      setList((prev) =>
        prev.filter((row) => row.id !== category.id)
      );

      toast(`${category.name} was deleted`);

      closeDelete();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  /* ---------------------------------------------------------
     Loading / Error
  --------------------------------------------------------- */
  if (error) {
    return (
      <div className="empty">
        <b>Couldn't load categories</b>
        <p>{error}</p>
      </div>
    );
  }

  if (!list) {
    return null;
  }

  /* ---------------------------------------------------------
     Category data
  --------------------------------------------------------- */
  const countFor = (category) =>
    businesses.filter(
      (business) => business.category_id === category.id
    ).length;

  const shown = list.filter((category) =>
    matches(
      `${category.name} ${category.description || ""}`,
      q
    )
  );

  return (
    <section className="am-page">

      {/* Header */}
      <div className="page-h">
        <h1>Categories</h1>

        <span className="sp" />

        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search categories"
        />

        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => openForm(null)}
        >
          + Add category
        </button>
      </div>

      {/* Categories */}
      {shown.length ? (
        <div className="list">
          {shown.map((category) => {
            const n = countFor(category);

            return (
              <div
                className="li am-li"
                key={category.id}
              >

                {/* SAME ICON STYLE AS LANDING */}
                <span className="ic am-category-icon">
                  <ColorIcon
                    name={categoryIcon(category.name)}
                    size={42}
                  />
                </span>

                <div>
                  <b>{category.name}</b>

                  <small>
                    {category.description || "No description"}
                  </small>
                </div>

                <span
                  className={`st ${n ? "open" : "off"}`}
                >
                  {plural(
                    n,
                    "business",
                    "businesses"
                  )}
                </span>

                <span className="am-acts">
                  <button
                    className="edit"
                    type="button"
                    onClick={() =>
                      openForm(category)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="no"
                    type="button"
                    onClick={() =>
                      askDelete(category)
                    }
                  >
                    Delete
                  </button>
                </span>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <b>
            {q
              ? "Nothing matches your search"
              : "No categories yet"}
          </b>

          <p>
            {q
              ? "Try another name."
              : "Add the first one so owners can pick it for their business."}
          </p>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <dialog
        className="am-dlg"
        ref={formDialog}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={saveForm}>

          <h2>
            {editing?.id
              ? `Edit ${editing.name}`
              : "Add a category"}
          </h2>

          <p>
            Owners pick a category for their business,
            and visitors filter by it on Browse.
          </p>

          {formError && (
            <p
              className="form-error"
              role="alert"
            >
              {formError}
            </p>
          )}

          <div className="am-fields">

            <div className="f">
              <label htmlFor="am-cat-name">
                Name
              </label>

              <input
                id="am-cat-name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Banking"
                required
              />
            </div>

            <div className="f">
              <label htmlFor="am-cat-desc">
                Description (optional)
              </label>

              <input
                id="am-cat-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="e.g. Banks and money services"
              />
            </div>

          </div>

          <div className="fa">

            <button
              className="btn btn-ghost"
              type="button"
              onClick={closeForm}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={
                busy ||
                !form.name.trim()
              }
            >
              {editing?.id
                ? "Save changes"
                : "Add category"}
            </button>

          </div>
        </form>
      </dialog>

      {/* Delete Dialog */}
      <dialog
        className="am-dlg"
        ref={deleteDialog}
        onClose={() => setDeleting(null)}
      >
        <form onSubmit={confirmDelete}>

          <h2>
            Delete {deleting?.name}?
          </h2>

          <p>
            {deleting && countFor(deleting)
              ? `${plural(
                countFor(deleting),
                "business",
                "businesses"
              )} will stay, but without a category until the owner picks a new one.`
              : "No businesses use this category."}
          </p>

          <div className="fa">

            <button
              className="btn btn-ghost"
              type="button"
              onClick={closeDelete}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={busy}
            >
              Delete category
            </button>

          </div>
        </form>
      </dialog>

    </section>
  );
}