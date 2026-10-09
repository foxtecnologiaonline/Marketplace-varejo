import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TopBar } from "@/components/top-bar";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { CookieBanner } from "@/components/cookie-banner";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Blue Malharia — uniformes escolares, esportivos e personalizados direto da malharia, com frete para todo o Brasil.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Uniformes e moda em malha`,
    template: `%s | ${SITE_NAME}`
  },
  description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Uniformes e moda em malha`,
    description,
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Uniformes e moda em malha`,
    description
  }
};

function OrganizationJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.jpg`
  };
  // JSON-LD não pode conter closing tags HTML escapáveis vindas de dados externos,
  // mas aqui o conteúdo é só nosso (sem input de usuário), então JSON.stringify basta.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <OrganizationJsonLd />
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <CookieBanner />
      </body>
    </html>
  );
}
