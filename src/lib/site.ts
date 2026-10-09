// Config central do site: URL pública, nome da marca e redes sociais. Usado por
// metadata, sitemap.ts, robots.ts, JSON-LD e pelo rodapé — um único lugar para
// trocar quando o domínio definitivo ou as redes sociais da Blue Malharia existirem.
export const SITE_NAME = "Blue Malharia";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bluemalharia.com.br").replace(
  /\/$/,
  ""
);

// Cada rede social só aparece no rodapé se a URL real existir (mesma lógica já
// usada para o botão de WhatsApp): nunca linkamos um "#" morto como se fosse real.
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL
} as const;
