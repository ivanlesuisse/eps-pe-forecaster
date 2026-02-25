import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-white mb-4">Swiss FinTrack</h3>
            <p className="text-sm text-zinc-400">
              Votre agrégateur de richesse personnel. Gérez tous vos actifs en un seul endroit.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <a href="mailto:privacy@swiss-fintrack.com" className="hover:text-cyan-400 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="text-xs">© 2026 Swiss FinTrack. Tous droits réservés.</li>
              <li className="text-xs">Pas un conseil financier. Utilisez à votre discrétion.</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
