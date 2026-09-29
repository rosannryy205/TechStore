import Loading from "../../components/loading";

/**
 * A lightweight route-level loading gate to keep the Loading UI visible
 * for minDurationMs~maxDurationMs across navigation.
 *
 * Usage (in page):
 *   <RouteLoadingGate when={isLoading} />
 */
export default function RouteLoadingGate({
  when,
  variant = "fullscreen",
  size = "medium",
  text = "Loading...",
  minDurationMs = 500,
  maxDurationMs = 1500,
}) {
  return (
    <Loading
      variant={variant}
      size={size}
      text={text}
      shouldShow={when}
      minDurationMs={minDurationMs}
      maxDurationMs={maxDurationMs}
    />
  );
}
