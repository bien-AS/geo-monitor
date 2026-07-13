"use client";

import * as React from "react";
import { gsap } from "gsap";

/**
 * Shared GSAP entrance-animation helpers. Conventions per GSAP's React
 * guidance: every reveal runs inside a gsap.context() scoped to a ref and is
 * cleaned up with ctx.revert(). Markup always renders the FINAL state — under
 * prefers-reduced-motion the reveal is skipped wholesale, leaving the
 * finished UI untouched. One entrance per mount; no loops, no ScrollTrigger.
 */

/** useLayoutEffect on the client (pre-paint), useEffect during SSR (no warning). */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** Synchronous reduced-motion check — safe inside effects and handlers. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Reactive flag for render-time decisions (false on the server/first paint). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirroring external media query state on mount is the intent
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Run `build` inside a gsap.context() scoped to `scope` (selector text inside
 * `build` only matches descendants of the scope element). Reverts on cleanup.
 * Skipped entirely under prefers-reduced-motion — the markup's final state
 * simply stands.
 */
export function useGsapReveal<T extends Element>(
  scope: React.RefObject<T | null>,
  build: () => void,
  deps: React.DependencyList = [],
): void {
  useIsomorphicLayoutEffect(() => {
    const el = scope.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(build, el);
    return () => ctx.revert();
    // deps are caller-owned; scope/build are stable refs/closures per render
  }, deps);
}

export interface RevealVars {
  duration?: number;
  delay?: number;
  ease?: string;
}

/**
 * Draw a fully-stroked SVG shape in from zero length (dashoffset technique,
 * getTotalLength() measured at mount). Only for shapes whose final state is a
 * complete stroke — dash props are cleared on completion so later data/`d`
 * changes render untrimmed.
 */
export function drawIn(el: SVGGeometryElement | null, vars: RevealVars = {}) {
  if (!el || typeof el.getTotalLength !== "function") return null;
  let len = 0;
  try {
    len = el.getTotalLength();
  } catch {
    return null;
  }
  if (!Number.isFinite(len) || len <= 0) return null;
  return gsap.fromTo(
    el,
    { strokeDasharray: len, strokeDashoffset: len },
    {
      strokeDashoffset: 0,
      duration: vars.duration ?? 1,
      delay: vars.delay ?? 0,
      ease: vars.ease ?? "power2.out",
      clearProps: "strokeDasharray,strokeDashoffset",
    },
  );
}

/**
 * Sweep an arc that positions itself with `stroke-dasharray "len gap"` (donut
 * segments, partial gauges): tweens the dash from 0 to `len` around a `total`
 * circumference without touching its dashoffset placement.
 */
export function sweepDash(el: Element | null, len: number, total: number, vars: RevealVars = {}) {
  if (!el || !Number.isFinite(len) || !Number.isFinite(total) || total <= 0) return null;
  const dash = Math.max(0, Math.min(len, total));
  return gsap.fromTo(
    el,
    { strokeDasharray: `0 ${total}` },
    {
      strokeDasharray: `${dash} ${total - dash}`,
      duration: vars.duration ?? 0.9,
      delay: vars.delay ?? 0,
      ease: vars.ease ?? "power2.out",
    },
  );
}

/**
 * Count a rendered number up from 0 by mutating textContent (no React state,
 * no re-render churn — the element keeps its num/mono classes). Ends exactly
 * on React's rendered text so the DOM never drifts from the vDOM.
 */
export function countUp(
  el: Element | null,
  to: number,
  vars: RevealVars & { decimals?: number } = {},
) {
  if (!el || !Number.isFinite(to)) return null;
  const decimals = vars.decimals ?? 0;
  const final = el.textContent;
  const state = { value: 0 };
  return gsap.to(state, {
    value: to,
    duration: vars.duration ?? 0.9,
    delay: vars.delay ?? 0,
    ease: vars.ease ?? "power2.out",
    onUpdate: () => {
      el.textContent = state.value.toFixed(decimals);
    },
    onComplete: () => {
      if (final != null) el.textContent = final;
    },
  });
}
