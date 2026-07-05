import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SiteShellProps = {
  children: ReactNode;
  transparentHeader?: boolean;
};

export function SiteShell({ children, transparentHeader }: SiteShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader transparent={transparentHeader} />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <SiteFooter />
    </div>
  );
}
