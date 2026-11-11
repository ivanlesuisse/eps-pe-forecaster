import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
export default async function Header(){const {userId}=await auth();return <header className="demo-header"><Link href="/" className="brand"><span>F</span>FinTrack <small>CH</small></Link><div className="heading-actions"><Link href="/demo" className="secondary-button">Démo</Link>{userId?<><Link href="/dashboard" className="primary-button">Mon patrimoine</Link><UserButton afterSignOutUrl="/"/></>:<><Link href="/sign-in" className="secondary-button">Connexion</Link><Link href="/sign-up" className="primary-button">Créer un compte</Link></>}</div></header>;}
