"use client";

export function GbpMarker({
  name,
  address,
  size = 34,
}: {
  name: string;
  address: string;
  size?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/google-my-business-icon.svg"
      alt={`Google Business Profile — ${name}, ${address}`}
      width={size}
      height={Math.round(size * (107.25 / 122.88))}
      style={{
        pointerEvents: "none",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
      }}
    />
  );
}
