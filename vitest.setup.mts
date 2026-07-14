import "@testing-library/dom";
import React from "react";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    ...props
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  }) =>
    React.createElement("img", {
      src,
      alt,
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      ...props,
    }),
}));
