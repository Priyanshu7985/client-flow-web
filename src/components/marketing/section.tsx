import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  center,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:py-24", className)}>
      {(eyebrow || title || description) && (
        <Reveal className={cn("max-w-2xl", center && "mx-auto text-center")}>
          {eyebrow && (
            <p className="text-[13px] font-semibold uppercase tracking-wide text-accent">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-[2.35rem]">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
          )}
        </Reveal>
      )}
      {children && <div className={cn(eyebrow || title ? "mt-12" : "")}>{children}</div>}
    </section>
  );
}
