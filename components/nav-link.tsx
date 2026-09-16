"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { isNonRoutePath } from "@/lib/content";

/**
 * A navigation link that knows which hrefs the router owns.
 *
 * Most nav entries are app routes and want `<Link>`, with its client-side
 * navigation and prefetch. `/web` is not: it is the WASM demo, a directory
 * under `public/`. Asking the router for it means asking for an RSC payload
 * that cannot exist and taking a 404 for it - on every page, because the nav
 * is on every page. `prefetch={false}` does not help; in Next 16 it only moves
 * that request from the viewport to hover.
 *
 * Clicking either kind is a full document load for those paths anyway, so the
 * anchor loses nothing.
 */
export default function NavLink({
  href,
  children,
  ...rest
}: { href: string } & Omit<ComponentProps<"a">, "href">) {
  if (isNonRoutePath(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
