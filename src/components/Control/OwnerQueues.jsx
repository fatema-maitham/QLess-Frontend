import { useOutletContext } from "react-router";
import ControlPage from "./ControlPage";

export default function OwnerQueues() {
  const { branches } = useOutletContext();

  return (
    <ControlPage
      branches={branches}
      title="Live Queues"
    />
  );
}