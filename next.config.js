// Cabeçalhos aplicados a todas as rotas.
//
// Decisão sobre a CSP de scripts (testada, não só lida na doc): tentei primeiro
// script-src 'self' estrito + Subresource Integrity (experimental.sri) sem nonce,
// pensando que SRI cobriria a lacuna. Não cobre: SRI só se aplica a <script src>
// externo — o próprio Next injeta em TODA página um <script> inline com o payload
// de hidratação (RSC flight data), e isso sempre existiu, SRI ou não. Confirmado
// rodando a suíte: o navegador bloqueava esse script inline em 100% das páginas
// ("Refused to execute inline script... script-src 'self'"), quebrando até a home.
//
// O caminho sem 'unsafe-inline' é nonce por requisição via proxy.ts — mas a doc do
// Next é explícita que isso desliga geração estática NO SITE INTEIRO (toda rota
// passa a renderizar no servidor a cada request, sem cache de CDN), porque o nonce
// muda por request e uma página estática é montada uma vez, sem request. Este
// catálogo é majoritariamente estático de propósito (produtos/lojas via
// generateStaticParams); pagar esse custo em todo o site para travar um payload de
// hidratação que não é controlado por usuário não compensa. Mantemos 'unsafe-inline'
// em script-src (mesmo ponto de partida de qualquer app Next sem nonce) e travamos
// tudo o que não exige isso: object-src, base-uri, form-action, frame-ancestors,
// e connect-src/img-src restritos aos domínios que o site de fato usa.
const isDev = process.env.NODE_ENV === "development";

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://images.unsplash.com data:",
  "font-src 'self'",
  "connect-src 'self' https://viacep.com.br",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "Content-Security-Policy", value: cspHeader }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Só no empacotamento (npm run package): gera .next/standalone, um servidor mínimo
  // com apenas os arquivos necessários. Fora disso `next start`/Vercel seguem normais.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    formats: ["image/avif", "image/webp"]
  },
  experimental: {
    // Hashes de integridade nos scripts do próprio Next, verificados pelo navegador
    // sem exigir nonce nem desligar a geração estática (ver comentário acima).
    sri: { algorithm: "sha256" }
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

module.exports = nextConfig;
