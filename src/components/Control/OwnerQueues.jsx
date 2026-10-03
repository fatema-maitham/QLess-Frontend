import { useCallback, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { ChartBar } from "@phosphor-icons/react";
import ControlPage from "./ControlPage";

export default function OwnerQueues() {
  const { business, branches } = useOutletContext();
  const [currentQueue, setCurrentQueue] = useState(null);

  const handleQueueChange = useCallback((queue) => {
    setCurrentQueue(queue);
  }, []);

  return (
    <div>
      {currentQueue && (
        <div className="cp-owner-tools">
          <Link
            className="btn btn--outline cp-owner-tools__analytics"
            to={`/owner/queues/${currentQueue.id}/analytics`}
          >
            <ChartBar size={18} weight="duotone" />
            View analytics
          </Link>
        </div>
      )}

      <ControlPage
        branches={branches}
        title="Live queues"
        subtitle={`Call people, check them in and keep ${business?.name || "your"
          } lines moving.`}
        onQueueChange={handleQueueChange}
      />
    </div>
  );
}