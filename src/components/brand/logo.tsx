import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark";
  width?: number;
  height?: number;
}

export function Logo({
  variant = "light",
  width = 170,
  height = 20,
  className,
  ...props
}: LogoProps) {
  const src =
    variant === "dark"
      ? "/brand/Baptist-Logo-White-Horizontal.svg"
      : "/brand/Baptist-Logo-Blue-Horizontal.svg";

  return (
    <div
      className={cn("inline-flex shrink-0 items-center", className)}
      {...props}
    >
      <Image
        src={src}
        alt="Baptist"
        width={width}
        height={height}
        priority
        className="h-auto w-auto"
      />
    </div>
  );
}

export function Mark({
  size = 24,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Baptist"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        className="fill-primary"
      />
      <path
        d="M8 8h8v8H8z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}
