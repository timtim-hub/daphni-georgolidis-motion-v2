import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice (Placeholder)",
  description: "Placeholder legal notice structure for Daphni Georgolidis."
};

export default function LegalPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-16 text-teal md:px-8" lang="en">
      <h1 className="font-display text-5xl uppercase tracking-[0.08em] md:text-7xl">Legal Notice</h1>

      <section className="mt-8 border-2 border-teal bg-yellow p-6">
        <h2 className="font-display text-2xl uppercase tracking-[0.08em] md:text-4xl">Placeholder</h2>
        <p className="mt-4 leading-relaxed">
          Required legal details will be provided later. Until then, please use the contact form on the homepage for
          booking and media requests.
        </p>
      </section>

      <section className="mt-6 border-2 border-teal bg-white p-6">
        <h2 className="font-display text-2xl uppercase tracking-[0.08em] md:text-4xl">Note</h2>
        <p className="mt-4 leading-relaxed">
          This page intentionally contains no invented legal information and only keeps the final structure ready.
        </p>
      </section>

      <Link
        href="/en"
        className="mt-10 inline-flex border-2 border-teal bg-white px-4 py-2 text-xs uppercase tracking-[0.16em]"
      >
        Back to home
      </Link>
    </main>
  );
}
