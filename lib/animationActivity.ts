import { onIntroPhase } from "./intro";

/** Stop expensive render loops outside the viewport, in background tabs, and during the intro. */
export function observeAnimationActivity(element: Element, onChange: (active: boolean) => void) {
  let visible = false;
  let ready = false;
  let active = false;
  const update = () => {
    const next = visible && ready && !document.hidden;
    if (next === active) return;
    active = next;
    onChange(active);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  observer.observe(element);
  const cancelIntro = onIntroPhase("done", () => {
    ready = true;
    update();
  });
  document.addEventListener("visibilitychange", update);
  return () => {
    observer.disconnect();
    cancelIntro();
    document.removeEventListener("visibilitychange", update);
    if (active) onChange(false);
  };
}
