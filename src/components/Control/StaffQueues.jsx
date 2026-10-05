import { useOutletContext } from "react-router";
import ControlPage from "./ControlPage";
import "./Control.css";

// Staff: the live queues of the branch they work at.
// It sits inside the staff dashboard, so the branch comes from StaffLayout
// (no second loading screen and no page inside a page).
export default function StaffQueues() {
  const { me } = useOutletContext();

  return (
    <div className="st-queues">
      <ControlPage
        branches={[me.branch]}
        title="Live queues"
        subtitle={`${me.branch.name} · ${me.business.name}`}
        bookingsTo="/staff/bookings"
        showAnalytics={false}
      />
    </div>
  );
}
