export const colors = {
  brand: "#005699",
  brandHover: "#004c87",
  brandLight: "#e6f0f7",
  cta: "#0061e5",
  ctaHover: "#0751b7",
  ink: "#0f1f2e",
  slate: "#596e80",
  surface: "#ffffff",
  background: "#f7f8fa",
  border: "#e1e6ed",
  success: "#1f8a3a",
  error: "#c92a2a",
  warning: "#b87400",
  info: "#005699",
  navy: "#01305e",
} as const;

export type ColorToken = keyof typeof colors;
