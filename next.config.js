// Cabeçalhos aplicados a todas as rotas. A CSP aqui é a parte que não quebra o Next
// (clickjacking, <base>, <form>, plugins); uma CSP completa de scripts exige nonce
// por requisição — ver docs/ESCOPO-FASE2.md e as sugestões de melhoria.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
  }
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

module.exports = nextConfig;
