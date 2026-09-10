import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-mono text-[13px] text-subtle-foreground">404</p>
      <h1 className="mt-2 text-xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-[13px] text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
