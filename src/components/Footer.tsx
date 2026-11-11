import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-slate-500">
      <span>
        © {new Date().getFullYear()} FinTrack · Suivi patrimonial personnel
      </span>
      <Link href="/privacy" className="ml-4 hover:text-white">
        Confidentialité
      </Link>
    </footer>
  );
}
