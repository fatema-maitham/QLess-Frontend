import { useEffect, useState } from "react";
import {
  Link,
  useOutletContext,
  useSearchParams,
} from "react-router";

import {
  CalendarBlank,
  CaretLeft,
  Clock,
  MapPin,
  User,
} from "@phosphor-icons/react";

import { getBranchBookings } from "../../services/bookingService";
import "./OwnerBookings.css";

const STATUSES = [
  { value: "", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No show" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(value) {
  if (!value) return "";

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "";

  const [hour, minute] = value
    .split(":")
    .map(Number);

  return new Date(
    2000,
    0,
    1,
    hour,
    minute
  ).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  if (status === "no_show") {
    return "No show";
  }

  if (!status) return "";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

export default function OwnerBookings() {
  const {
    business,
    branches = [],
  } = useOutletContext();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const branchFromUrl =
    searchParams.get("branch") || "";

  const [bookings, setBookings] =
    useState([]);

  const [pageStatus, setPageStatus] =
    useState("loading");

  const [error, setError] =
    useState("");

  const [branchId, setBranchId] =
    useState(branchFromUrl);

  const [statusFilter, setStatusFilter] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  useEffect(() => {
    setBranchId(branchFromUrl);
  }, [branchFromUrl]);

  function changeBranch(value) {
    setBranchId(value);

    const next = new URLSearchParams(
      searchParams
    );

    if (value) {
      next.set("branch", value);
    } else {
      next.delete("branch");
    }

    setSearchParams(next);
  }

  function clearFilters() {
    setBranchId("");
    setStatusFilter("");
    setDateFilter("");

    const next = new URLSearchParams(
      searchParams
    );

    next.delete("branch");
    setSearchParams(next);
  }

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadBookings() {
      setPageStatus("loading");
      setError("");

      try {
        const selectedBranches =
          branchId
            ? branches.filter(
              (branch) =>
                String(branch.id) ===
                String(branchId)
            )
            : branches;

        if (
          selectedBranches.length === 0
        ) {
          setBookings([]);
          setPageStatus("ready");
          return;
        }

        const results =
          await Promise.all(
            selectedBranches.map(
              async (branch) => {
                const rows =
                  await getBranchBookings(
                    branch.id,
                    {
                      status:
                        statusFilter ||
                        undefined,

                      bookingDate:
                        dateFilter ||
                        undefined,

                      signal:
                        controller.signal,
                    }
                  );

                /*
                 * Attach branch information here.
                 * This guarantees the owner can see
                 * the branch even if the booking API
                 * does not return branch_name.
                 */
                return rows.map(
                  (booking) => ({
                    ...booking,
                    _branchId: branch.id,
                    _branchName:
                      branch.name,
                  })
                );
              }
            )
          );

        const combined =
          results.flat();

        combined.sort((a, b) => {
          const first =
            `${a.booking_date}T${a.booking_time}`;

          const second =
            `${b.booking_date}T${b.booking_time}`;

          return first.localeCompare(
            second
          );
        });

        setBookings(combined);
        setPageStatus("ready");
      } catch (err) {
        if (
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err.message ||
          "Could not load bookings."
        );

        setPageStatus("error");
      }
    }

    loadBookings();

    return () =>
      controller.abort();
  }, [
    branches,
    branchId,
    statusFilter,
    dateFilter,
  ]);

  const hasFilters =
    branchId ||
    statusFilter ||
    dateFilter;

  return (
    <section className="owner-bookings">
      {/* Page header */}

      <div className="page-h owner-bookings__head">
        <div>
          <Link
            to="/owner/queues"
            className="owner-bookings__back"
          >
            <CaretLeft size={16} />
            Live queues
          </Link>

          <h1>Bookings</h1>
        </div>

        <span className="sp" />

        {pageStatus === "ready" && (
          <span className="owner-bookings__count">
            {bookings.length}
            {" "}
            {bookings.length === 1
              ? "booking"
              : "bookings"}
          </span>
        )}
      </div>

      {/* Filters */}

      <div className="owner-bookings__toolbar">
        <div className="owner-bookings__filter">
          <MapPin size={17} />

          <select
            value={branchId}
            aria-label="Choose branch"
            onChange={(event) =>
              changeBranch(
                event.target.value
              )
            }
          >
            <option value="">
              All branches
            </option>

            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div
          className="owner-bookings__tabs"
          role="group"
          aria-label="Booking status"
        >
          {STATUSES.map((item) => (
            <button
              key={item.value || "all"}
              type="button"
              className={
                statusFilter ===
                  item.value
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  item.value
                )
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="owner-bookings__filter owner-bookings__date">
          <CalendarBlank size={17} />

          <input
            type="date"
            aria-label="Booking date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            className="owner-bookings__clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error */}

      {pageStatus === "error" && (
        <div
          className="owner-bookings__message owner-bookings__message--error"
          role="alert"
        >
          <b>Could not load bookings</b>
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}

      {pageStatus === "loading" && (
        <div className="owner-bookings__loading">
          <div />
          <div />
          <div />
        </div>
      )}

      {/* Empty */}

      {pageStatus === "ready" &&
        bookings.length === 0 && (
          <div className="owner-bookings__empty">
            <div className="owner-bookings__empty-icon">
              <CalendarBlank
                size={25}
                weight="duotone"
              />
            </div>

            <b>No bookings found</b>

            <p>
              There are no appointments
              matching these filters.
            </p>
          </div>
        )}

      {/* Booking list */}

      {pageStatus === "ready" &&
        bookings.length > 0 && (
          <div className="owner-bookings__list">
            <div className="owner-bookings__labels">
              <span>Date & time</span>
              <span>Service</span>
              <span>Customer</span>
              <span>Branch</span>
              <span>Status</span>
            </div>

            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="owner-bookings__row"
              >
                <div className="owner-bookings__when">
                  <div className="owner-bookings__calendar">
                    <CalendarBlank
                      size={18}
                    />
                  </div>

                  <div>
                    <b>
                      {formatTime(
                        booking.booking_time
                      )}
                    </b>

                    <span>
                      {formatDate(
                        booking.booking_date
                      )}
                    </span>
                  </div>
                </div>

                <div className="owner-bookings__service">
                  <b>
                    {booking.service_name ||
                      "Service"}
                  </b>

                  <span>
                    Booking #{booking.id}
                  </span>
                </div>

                <div className="owner-bookings__info">
                  <User size={17} />

                  <span>
                    {booking.customer_name ||
                      "Customer"}
                  </span>
                </div>

                <div className="owner-bookings__info">
                  <MapPin size={17} />

                  <span>
                    {booking._branchName ||
                      booking.branch_name ||
                      "Branch"}
                  </span>
                </div>

                <div className="owner-bookings__status-cell">
                  <span
                    className={`owner-bookings__status owner-bookings__status--${booking.status}`}
                  >
                    {statusLabel(
                      booking.status
                    )}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

      {/* Owner intentionally has no booking actions. */}
    </section>
  );
}