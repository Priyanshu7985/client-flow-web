/**
 * Inline script that applies the persisted theme before first paint, avoiding a
 * flash. It renders as executable JS on the server and inert `text/plain` on the
 * client so React doesn't warn about a `<script>` in a component tree. Pairs with
 * `suppressHydrationWarning` on <html>. See:
 * https://nextjs.org/docs/app/guides/preventing-flash-before-hydration
 */
const THEME_SCRIPT = `(function(){try{var m=localStorage.getItem("clientflow-theme")||"system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function NoFlashThemeScript() {
  return (
    <script
      // executable during SSR/HTML parse; inert after hydration
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
