import DashboardPlaceholderPage from "@/components/DashboardPlaceholderPage";

const categoryConfig: Record<string, { title: string; description: string }> = {
  stocks: {
    title: "Stocks & ETFs",
    description: "Consultez vos actions et ETF, leurs performances et leur poids dans votre portefeuille global.",
  },
  etf: {
    title: "ETF",
    description: "Suivez vos ETF par zone geographique, secteur et exposition pour garder un portefeuille equilibre.",
  },
  crypto: {
    title: "Crypto",
    description: "Visualisez vos positions crypto, leur volatilite et leur contribution a la performance totale.",
  },
  savings: {
    title: "Savings Accounts",
    description: "Suivez l'evolution de vos comptes d'epargne et l'impact des interets sur votre patrimoine.",
  },
  checking: {
    title: "Checking Accounts",
    description: "Gardez une vue claire de vos liquidites disponibles pour vos depenses courantes.",
  },
  other: {
    title: "Other Assets",
    description: "Regroupez vos actifs alternatifs et suivez leur valorisation au meme endroit.",
  },
  metals: {
    title: "Precious Metals",
    description: "Suivez vos positions en or, argent et autres metaux precieux dans votre allocation globale.",
  },
};

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const selected = categoryConfig[category];

  if (!selected) {
    return (
      <DashboardPlaceholderPage
        title="Categorie Portfolio"
        description="Cette categorie n'est pas encore configuree. Vous pouvez deja ajouter un actif pour commencer."
      />
    );
  }

  return <DashboardPlaceholderPage title={selected.title} description={selected.description} />;
}
