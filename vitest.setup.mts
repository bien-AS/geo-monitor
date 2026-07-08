import "@testing-library/dom";
import React from "react";
import { vi } from "vitest";

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
