import "@testing-library/dom";
import React from "react";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

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
