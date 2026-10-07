import { useOutletContext } from "react-router";
import ControlPage from "./ControlPage";
import "./Control.css";

// Staff: only the queue assigned to them by the owner.
// The staff member also uses their assigned counter.
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
        canManageStatus={false}
        fixedCounter={me.counter_number}
        allowedQueueId={me.queue_id}
        canServe={Boolean(me.queue_id)}
      />
    </div>
  );
}