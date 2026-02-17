import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum (Platzhalter)",
  description: "Platzhalter für Impressumsangaben von Daphni Georgolidis."
};

export default function ImpressumPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-16 text-teal md:px-8">
      <h1 className="font-display text-5xl uppercase tracking-[0.08em] md:text-7xl">Impressum</h1>

      <section className="mt-8 border-2 border-teal bg-yellow p-6">
        <h2 className="font-display text-2xl uppercase tracking-[0.08em] md:text-4xl">Platzhalter</h2>
        <p className="mt-4 leading-relaxed">
          Die rechtlich erforderlichen Angaben werden nachgereicht. Bis dahin bitte alle geschäftlichen Anfragen
          über das Kontaktformular auf der Startseite stellen.
        </p>
      </section>

      <section className="mt-6 border-2 border-teal bg-white p-6">
        <h2 className="font-display text-2xl uppercase tracking-[0.08em] md:text-4xl">Hinweis</h2>
        <p className="mt-4 leading-relaxed">
          Diese Struktur dient nur als vorbereitete Fläche für finale Impressumsdaten. Es wurden bewusst keine
          erfundenen Rechtsdaten eingetragen.
        </p>
      </section>

      <Link href="/" className="mt-10 inline-flex border-2 border-teal bg-white px-4 py-2 text-xs uppercase tracking-[0.16em]">
        Zur Startseite
      </Link>
    </main>
  );
}
