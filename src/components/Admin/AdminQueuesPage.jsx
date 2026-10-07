import { Fragment, useCallback, useEffect, useState } from "react";

import { getAdminQueues } from "../../services/adminService";
import { getAdminBranches } from "../../services/adminManageService";
import { initial } from "../Owner/ownerSetup";
import { SearchBox, Tabs } from "../AdminPanel/AdminParts";
import { matches } from "../AdminPanel/adminUtils";
import { Kpi } from "./AdminBits";
import { clock, plural } from "./adminHelpers";
import "./Admin.css";

const REFRESH_MS = 30000;

const STATUS = {
  open: { text: "Open", cls: "open" },
  paused: { text: "Paused", cls: "warn" },
  closed: { text: "Closed", cls: "off" },
};

const byName = (a, b) => a.name.localeCompare(b.name);

const waitingIn = (queues) =>
  queues.reduce(
    (sum, queue) => sum + (queue.waiting_count || 0),
    0
  );

// Business -> branches -> queues
function groupByBusiness(queues, branches) {
  const businesses = new Map();
  const branchById = new Map();

  // Keep the business logo too
  const addBusiness = (id, name, image = null) => {
    if (!businesses.has(id)) {
      businesses.set(id, {
        id,
        name,
        image,
        branches: [],
      });
    } else if (image) {
      businesses.get(id).image = image;
    }

    return businesses.get(id);
  };

  // Add all branches, including branches without queues
  branches.forEach((branch) => {
    const business = addBusiness(
      branch.business?.id ?? branch.business_id,
      branch.business?.name || "Business",
      branch.business?.image || null
    );

    const row = {
      id: branch.id,
      name: branch.name,
      is_active: branch.is_active,
      queues: [],
    };

    business.branches.push(row);
    branchById.set(branch.id, row);
  });

  // Add queues
  queues.forEach((queue) => {
    // Also get logo directly from queue response
    addBusiness(
      queue.business_id,
      queue.business_name,
      queue.business_image || null
    );

    let branch = branchById.get(queue.branch_id);

    if (!branch) {
      branch = {
        id: queue.branch_id,
        name: queue.branch_name,
        is_active: true,
        queues: [],
      };

      addBusiness(
        queue.business_id,
        queue.business_name,
        queue.business_image || null
      ).branches.push(branch);

      branchById.set(queue.branch_id, branch);
    }

    branch.queues.push(queue);
  });

  return [...businesses.values()].map((business) => {
    business.branches.sort(byName);

    business.branches.forEach((branch) =>
      branch.queues.sort(
        (a, b) => b.waiting_count - a.waiting_count
      )
    );

    return business;
  });
}

export default function AdminQueuesPage() {
  const [queues, setQueues] = useState(null);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [openIds, setOpenIds] = useState([]);

  const load = useCallback((signal) => {
    return getAdminQueues({ signal })
      .then((data) => {
        if (signal?.aborted) return;

        setQueues(data);
        setUpdatedAt(new Date());
        setError("");
      })
      .catch((err) => {
        if (
          err.name !== "AbortError" &&
          !signal?.aborted
        ) {
          setError(err.message);
        }
      });
  }, []);

  // Queues now and every 30 seconds.
  // Branches only need to load once.
  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal);

    getAdminBranches({
      signal: controller.signal,
    })
      .then(setBranches)
      .catch(() => { });

    const id = setInterval(
      () => load(controller.signal),
      REFRESH_MS
    );

    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [load]);

  if (error && !queues) {
    return (
      <div className="empty">
        <b>Couldn't load the queues</b>
        <p>{error}</p>
      </div>
    );
  }

  if (!queues) {
    return null;
  }

  const all = groupByBusiness(queues, branches);

  const byStatus = (status) =>
    queues.filter(
      (queue) => queue.status === status
    );

  const open = byStatus("open");

  const branchCount = all.reduce(
    (sum, business) =>
      sum + business.branches.length,
    0
  );

  const tabs = [
    {
      key: "all",
      label: "All",
      count: queues.length,
    },
    {
      key: "open",
      label: "Open",
      count: open.length,
    },
    {
      key: "paused",
      label: "Paused",
      count: byStatus("paused").length,
    },
    {
      key: "closed",
      label: "Closed",
      count: byStatus("closed").length,
    },
  ];

  const filtering =
    tab !== "all" || q.trim() !== "";

  const shown = all
    .map((business) => {
      const businessHit = matches(
        business.name,
        q
      );

      const list = business.branches
        .map((branch) => {
          const branchHit =
            businessHit ||
            matches(branch.name, q);

          const queuesShown = branch.queues
            .filter(
              (queue) =>
                tab === "all" ||
                queue.status === tab
            )
            .filter(
              (queue) =>
                branchHit ||
                matches(
                  `${queue.name} ${queue.service_name}`,
                  q
                )
            );

          return {
            ...branch,
            queues: queuesShown,
            hit: branchHit,
          };
        })
        .filter(
          (branch) =>
            !filtering ||
            branch.queues.length ||
            (tab === "all" && branch.hit)
        );

      return {
        ...business,
        branches: list,
      };
    })
    .filter(
      (business) =>
        business.branches.length
    )
    .sort(
      (a, b) =>
        waitingIn(
          b.branches.flatMap(
            (x) => x.queues
          )
        ) -
        waitingIn(
          a.branches.flatMap(
            (x) => x.queues
          )
        ) ||
        byName(a, b)
    );

  const isOpen = (id) =>
    filtering || openIds.includes(id);

  const toggle = (id) =>
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );

  return (
    <section className="am-page">

      <div className="page-h">
        <h1>Live queues</h1>

        <span className="sp" />

        {updatedAt && (
          <span className="am-updated">
            Updated {clock(updatedAt)}
          </span>
        )}

        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search business or queue"
        />

        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={() => load()}
        >
          Refresh
        </button>
      </div>

      <div className="am-kpis">
        <Kpi
          icon="businesses"
          value={all.length}
          label="Businesses"
          note={plural(
            branchCount,
            "branch",
            "branches"
          )}
        />

        <Kpi
          icon="queues"
          value={open.length}
          label="Open queues"
          note={`of ${queues.length} in total`}
        />

        <Kpi
          icon="users"
          value={waitingIn(queues)}
          label="People waiting"
          note="across every branch"
        />

        <Kpi
          icon="overview"
          value={queues.reduce(
            (sum, queue) =>
              sum +
              (queue.called_count || 0),
            0
          )}
          label="Called, not served yet"
          note="at the counter now"
        />
      </div>

      <Tabs
        tabs={tabs}
        active={tab}
        onChange={setTab}
      />

      {shown.length ? (
        <div className="list">

          {shown.map((business) => {
            const businessQueues =
              business.branches.flatMap(
                (branch) => branch.queues
              );

            const waiting =
              waitingIn(businessQueues);

            const openHere =
              businessQueues.filter(
                (queue) =>
                  queue.status === "open"
              ).length;

            const expanded =
              isOpen(business.id);

            return (
              <Fragment key={business.id}>

                <button
                  type="button"
                  className={`li am-li am-biz${expanded
                      ? " is-open"
                      : ""
                    }`}
                  aria-expanded={expanded}
                  onClick={() =>
                    toggle(business.id)
                  }
                >

                  {/* BUSINESS LOGO */}
                  <span className="ic am-image-icon">
                    {business.image ? (
                      <img
                        src={business.image}
                        alt={`${business.name} logo`}
                        className="am-list-image"
                      />
                    ) : (
                      initial(business.name)
                    )}
                  </span>

                  <div>
                    <b>{business.name}</b>

                    <small>
                      {plural(
                        business.branches.length,
                        "branch",
                        "branches"
                      )}
                      {" · "}
                      {plural(
                        businessQueues.length,
                        "queue"
                      )}

                      {openHere > 0 &&
                        ` · ${openHere} open`}
                    </small>
                  </div>

                  <span
                    className={`st ${waiting
                        ? "warn"
                        : "off"
                      }`}
                  >
                    {waiting
                      ? `${waiting} waiting`
                      : "No one waiting"}
                  </span>

                  <span
                    className="am-chev"
                    aria-hidden="true"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>

                </button>

                {expanded && (
                  <div className="am-sub">

                    <div
                      className="am-qrow am-qrow--head"
                      aria-hidden="true"
                    >
                      <span>Queue</span>
                      <span>Status</span>
                      <span>Waiting</span>
                      <span>Called</span>
                      <span>Serving</span>
                      <span>Limit</span>
                    </div>

                    {business.branches.map(
                      (branch) => (
                        <div
                          className="am-branch"
                          key={branch.id}
                        >
                          <p className="am-branch__name">
                            {branch.name}

                            {!branch.is_active && (
                              <span className="st off">
                                Inactive
                              </span>
                            )}
                          </p>

                          {branch.queues.length ? (
                            branch.queues.map(
                              (queue) => {
                                const st =
                                  STATUS[
                                  queue.status
                                  ] ||
                                  STATUS.closed;

                                const full =
                                  queue.max_capacity &&
                                  queue.waiting_count >=
                                  queue.max_capacity;

                                return (
                                  <div
                                    className={`am-qrow${queue.status ===
                                        "closed"
                                        ? " off"
                                        : ""
                                      }`}
                                    key={queue.id}
                                  >
                                    <span>
                                      <b>
                                        {
                                          queue.name
                                        }
                                      </b>

                                      <small>
                                        {queue.service_name ||
                                          "Any service"}
                                      </small>
                                    </span>

                                    <span>
                                      <span
                                        className={`st ${full
                                            ? "bad"
                                            : st.cls
                                          }`}
                                      >
                                        {full
                                          ? "Full"
                                          : st.text}
                                      </span>
                                    </span>

                                    <span
                                      className="num"
                                      data-label="Waiting"
                                    >
                                      {
                                        queue.waiting_count
                                      }
                                    </span>

                                    <span
                                      className="num"
                                      data-label="Called"
                                    >
                                      {
                                        queue.called_count
                                      }
                                    </span>

                                    <span
                                      className="num"
                                      data-label="Serving"
                                    >
                                      {queue.current_number
                                        ? `#${queue.current_number}`
                                        : "—"}
                                    </span>

                                    <span
                                      className="num"
                                      data-label="Limit"
                                    >
                                      {queue.max_capacity ??
                                        "—"}
                                    </span>
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <p className="am-none">
                              No queues at this
                              branch yet.
                            </p>
                          )}
                        </div>
                      )
                    )}

                  </div>
                )}

              </Fragment>
            );
          })}

        </div>
      ) : (
        <div className="empty">
          <b>
            {filtering
              ? "Nothing matches"
              : "No queues yet"}
          </b>

          <p>
            {filtering
              ? "Try another tab or search."
              : "Businesses and their queues show up here when owners create them."}
          </p>
        </div>
      )}

      {error && (
        <p className="am-note">
          Couldn't refresh ({error}). These
          are the last numbers we got.
        </p>
      )}

    </section>
  );
}