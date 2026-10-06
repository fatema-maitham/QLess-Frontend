import { useEffect, useState } from "react";
import { BellRinging } from "@phosphor-icons/react";
import { getBusinessAnnouncements } from "../../services/businessService";

export default function TicketAnnouncements({
  businessId,
  branchId,
  businessName,
  branchName,
}) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!businessId || !branchId) return;

    const controller = new AbortController();
    let active = true;

    const load = () => {
      getBusinessAnnouncements(businessId, {
        branchId,
        signal: controller.signal,
      })
        .then((items) => {
          if (active) {
            setAnnouncements(
              items.filter((item) => item.is_active !== false)
            );
          }
        })
        .catch(() => {
          // Keep existing announcements if a refresh fails.
        });
    };

    load();

    const interval = window.setInterval(load, 30000);

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [businessId, branchId]);

  if (!announcements.length) return null;

  return (
    <section
      className="tk-branch-updates"
      aria-labelledby="branch-updates-title"
    >
      <div className="tk-branch-updates__heading">
        <span className="tk-branch-updates__icon">
          <BellRinging size={22} />
        </span>

        <div>
          <h2 id="branch-updates-title">Updates from your branch</h2>
          <p>Announcements from {businessName}</p>
        </div>
      </div>

      {announcements.map((announcement) => (
        <article className="tk-branch-update" key={announcement.id}>
          <div className="tk-branch-update__meta">
            <span>
              {announcement.branch_id ? branchName : "All branches"}
            </span>

            {announcement.created_at && (
              <small>
                {new Date(announcement.created_at).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short" }
                )}
              </small>
            )}
          </div>

          <h3>{announcement.title}</h3>
          <p>{announcement.body}</p>
        </article>
      ))}
    </section>
  );
}