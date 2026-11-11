"use client";
import { UserProfile } from "@clerk/nextjs";
import { useState } from "react";
export default function Settings() {
  const [profile, setProfile] = useState(false);
  return (
    <div className="wealth-page">
      <p className="eyebrow">VOTRE ESPACE</p>
      <h1>Compte & sécurité.</h1>
      <p className="muted">
        Chaque compte dispose de ses propres actifs, objectifs et relevés.
      </p>
      <section className="wealth-panel">
        <h2>Votre profil</h2>
        <p className="muted">
          Gérez votre adresse e-mail, votre mot de passe et vos sessions.
        </p>
        <button
          className="primary-button mt-6"
          onClick={() => setProfile(!profile)}
        >
          {profile ? "Fermer le profil" : "Gérer mon compte"}
        </button>
        {profile && (
          <div className="mt-6 overflow-x-auto">
            <UserProfile routing="hash" />
          </div>
        )}
      </section>
      <section className="wealth-panel">
        <h2>Vos données</h2>
        <p className="muted">
          Exportez vos actifs au format CSV depuis Mes actifs. Les valorisations
          sont manuelles. Les relevés et objectifs ne sont pas des transactions
          bancaires.
        </p>
      </section>
    </div>
  );
}
