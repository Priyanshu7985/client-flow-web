import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

const sizeMap = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-semibold text-accent-soft-foreground ring-1 ring-border",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {src ? (
        <Image src={src} alt="" fill className="object-cover" sizes="44px" />
      ) : (
        initials(name) || "?"
      )}
    </span>
  );
}
