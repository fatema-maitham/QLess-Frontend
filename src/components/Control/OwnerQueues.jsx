import { useOutletContext } from "react-router";
import ControlPage from "./ControlPage";

// Owner dashboard → "Live queues". Uses the branches the dashboard already loaded.
export default function OwnerQueues() {
  const { business, branches } = useOutletContext();

  return (
    <ControlPage
      branches={branches}
      title="Live queues"
      subtitle={`Call people, check them in and keep ${business?.name || "your"} lines moving.`}
    />
  );
}