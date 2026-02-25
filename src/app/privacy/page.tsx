export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060b1a] to-[#0a0f23] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Politique de Confidentialité
        </h1>
        <p className="text-zinc-400 text-sm mb-8">Dernière mise à jour: 21 février 2026</p>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. Introduction</h2>
            <p className="text-zinc-300 leading-relaxed">
            Swiss-FinTrack (&laquo; l&apos;Application &raquo;) respecte votre vie priv&eacute;e. Cette Politique de Confidentialit&eacute; explique
            comment nous collectons, utilisons, stockons et prot&eacute;geons vos donn&eacute;es personnelles lorsque vous utilisez
              notre application de gestion de portefeuille.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. Données Que Nous Collectons</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">2.1 Donn&eacute;es d&apos;Authentification</h3>
                <p className="text-zinc-300">
                  Adresse email, identificateurs uniques fournis par Clerk, informations de profil basiques.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2.2 Données Financières</h3>
                <p className="text-zinc-300">
                  Informations de portefeuille, actifs détenus, quantités, valeurs, historique de transactions,
                  performances d&apos;investissement. Ces données sont traitées localement et ne sont jamais partagées.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2.3 Donn&eacute;es de Courtier</h3>
                <p className="text-zinc-300">
                  Lorsque vous connectez votre compte Interactive Brokers (ou autre courtier), nous stockons un token
                  OAuth chiffr&eacute;. <strong>Nous ne stockons JAMAIS vos identifiants ou mots de passe.</strong>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2.4 Donn&eacute;es Techniques</h3>
                <p className="text-zinc-300">
                  Adresse IP, user-agent, timestamps d&apos;acc&egrave;s, interactions avec l&apos;application. Utilis&eacute;es pour la s&eacute;curit&eacute;
                  et l&apos;audit.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. Comment Nous Utilisons Vos Données</h2>
            <ul className="space-y-3 text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-1">•</span>
                <span>Fournir les services de gestion de portefeuille</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-1">•</span>
                <span>Synchroniser avec votre courtier (lorsque autorisé)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-1">•</span>
                <span>Am&eacute;liorer et optimiser l&apos;application</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-1">•</span>
                <span>Assurer la s&eacute;curit&eacute; et pr&eacute;venir la fraude</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-1">•</span>
                <span>Se conformer aux obligations l&eacute;gales</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. S&eacute;curit&eacute; des Donn&eacute;es</h2>
            <div className="space-y-4">
              <p className="text-zinc-300">
                Nous impl&eacute;mentons des mesures de s&eacute;curit&eacute; strictes:
              </p>
              <ul className="space-y-2 text-zinc-300 border-l-2 border-cyan-400/50 pl-4">
                <li>✓ Chiffrement AES-256 pour les tokens OAuth et donn&eacute;es sensibles</li>
                <li>✓ HTTPS/TLS en transit</li>
                <li>✓ Base de donn&eacute;es s&eacute;curis&eacute;e avec authentification Clerk</li>
                <li>✓ Audit logging complet de tous les acc&egrave;s</li>
                <li>✓ Expiration automatique des tokens</li>
                <li>✓ Protection CSRF avec tokens d&apos;&eacute;tat</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">5. Partage de Données</h2>
            <p className="text-zinc-300 mb-4">
              <strong>Nous ne vendons JAMAIS vos donn&eacute;es.</strong> Nous partageons des donn&eacute;es uniquement avec:
            </p>
            <ul className="space-y-2 text-zinc-300 border-l-2 border-cyan-400/50 pl-4">
              <li>• <strong>Courtiers</strong>: Uniquement pour r&eacute;cup&eacute;rer vos propres donn&eacute;es de portefeuille (avec votre consentement OAuth)</li>
              <li>• <strong>Prestataires de services</strong>: Si n&eacute;cessaire pour h&eacute;berger ou s&eacute;curiser l&apos;application</li>
              <li>• <strong>Autorit&eacute;s l&eacute;gales</strong>: Uniquement si requis par la loi</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">6. Vos Droits</h2>
            <p className="text-zinc-300 mb-4">Vous avez le droit de:</p>
            <ul className="space-y-2 text-zinc-300 border-l-2 border-cyan-400/50 pl-4">
              <li>• Acc&eacute;der &agrave; vos donn&eacute;es personnelles</li>
              <li>• Corriger vos donn&eacute;es inexactes</li>
              <li>• Supprimer votre compte et toutes vos donn&eacute;es</li>
              <li>• R&eacute;voquer l&apos;acc&egrave;s des courtiers</li>
              <li>• Exporter vos donn&eacute;es</li>
            </ul>
            <p className="text-zinc-300 mt-4">
              Pour exercer ces droits, contactez-nous à: <span className="text-cyan-400">privacy@swiss-fintrack.com</span>
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">7. Rétention de Données</h2>
            <p className="text-zinc-300">
              Nous conservons vos données aussi longtemps que vous utilisez Swiss-FinTrack. Vous pouvez demander la
              suppression à tout moment. Les données supprimées sont effacées dans les 30 jours (sauf si requises légalement).
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">8. Cookies & Tracking</h2>
            <p className="text-zinc-300">
              Nous utilisons des cookies essentiels pour l&apos;authentification et la session. Nous n&apos;utilisons pas de
              tracking analytics ou publicit&eacute;s. Votre navigation n&apos;est pas trac&eacute;e.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">9. Modifications de Cette Politique</h2>
            <p className="text-zinc-300">
              Nous pouvons mettre &agrave; jour cette politique. Les modifications seront publi&eacute;es sur cette page avec une
              nouvelle date &laquo; Derni&egrave;re mise &agrave; jour &raquo;. Votre utilisation continue constitue une acceptation.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">10. Contact</h2>
            <p className="text-zinc-300">
              Pour toute question sur cette politique:
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded border border-cyan-400/30">
              <p className="text-white"><strong>Email</strong>: privacy@swiss-fintrack.com</p>
              <p className="text-zinc-300 text-sm mt-2">Nous r&eacute;pondons &agrave; toutes les demandes dans les 7 jours</p>
            </div>
          </section>

          {/* Compliance */}
          <section className="bg-gradient-to-r from-cyan-400/10 to-blue-400/10 border border-cyan-400/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Conformité</h2>
            <p className="text-zinc-300">
              Cette politique est conforme au RGPD (R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es) et aux lois
              suisses sur la protection des donn&eacute;es.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
