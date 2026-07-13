import { cn } from "@/lib/utils";
import type { AISurface } from "@/lib/surfaces";

export function SurfacePill({
  surface,
  size = "md",
  showName = true,
  className,
}: {
  surface: AISurface;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: "h-5 gap-1 pl-0.5 pr-1.5 text-[10px]",
    md: "h-6 gap-1.5 pl-1 pr-2 text-[11px]",
    lg: "h-7 gap-1.5 pl-1 pr-2.5 text-[12px]",
  }[size];
  const glyphSizes = {
    sm: "h-4 px-1 text-[8px]",
    md: "h-4.5 px-1 text-[9px]",
    lg: "h-5 px-1.5 text-[10px]",
  }[size];

  return (
    <span
      className={cn("inline-flex items-center rounded-full border font-semibold", sizes, className)}
      style={{
        borderColor: `${surface.color}40`,
        background: `${surface.color}14`,
        color: surface.dark,
      }}
      title={`${surface.name} · ${surface.category === "chatbot" ? "Chatbot surface" : "Google Search AI feature"}`}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full font-mono font-bold text-white",
          glyphSizes,
        )}
        style={{ background: surface.color }}
      >
        {surface.glyph}
      </span>
      {showName && surface.name}
    </span>
  );
}
