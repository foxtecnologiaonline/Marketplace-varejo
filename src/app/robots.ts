import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Carrinho/checkout/conta são por essência não-indexáveis (conteúdo
        // transacional e privado por usuário) e nunca devem aparecer em busca.
        disallow: ["/carrinho", "/checkout", "/conta", "/api/"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
