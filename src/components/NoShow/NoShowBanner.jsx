import { Prohibit, Warning } from "@phosphor-icons/react";
import { RESTRICTION_DAYS, timeLeftText, untilText } from "./noShowStatus";
import "./NoShowBanner.css";

/**
 * Shows the no-show warning or the restriction.
 * - status: from useNoShowStatus() or noShowStatus(user)
 * Shows nothing when everything is fine.
 */
export default function NoShowBanner({ status }) {
  if (!status || status.state === "ok") return null;

  if (status.state === "restricted") {
    return (
      <div className="ns ns--restricted" role="alert">
        <span className="ns__icon">
          <Prohibit size={22} weight="bold" />
        </span>
        <div className="ns__body">
          <strong>You can't join queues right now</strong>
          <p>
            You missed {status.count} turns, so joining is paused for {RESTRICTION_DAYS} days. You can join
            again on <b>{untilText(status.until)}</b> ({timeLeftText(status.until)}).
          </p>
        </div>
      </div>
    );
  }

  // warning: one more no-show means a restriction
  const missedText = status.count === 1 ? "1 turn" : `${status.count} turns`;
  return (
    <div className="ns ns--warning" role="status">
      <span className="ns__icon">
        <Warning size={22} weight="bold" />
      </span>
      <div className="ns__body">
        <strong>One more no-show and joining is paused</strong>
        <p>
          You've missed {missedText}. Every third missed turn pauses joining for{" "}
          {RESTRICTION_DAYS} days. If you can't make it, tap <b>Leave queue</b> instead. Leaving doesn't count
          as a no-show.
        </p>
      </div>
    </div>
  );
}