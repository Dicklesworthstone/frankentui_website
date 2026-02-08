import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "60+ searchable terminal UI terms — from ANSI escape sequences to zero-width joiners",
};

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
