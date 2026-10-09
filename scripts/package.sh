#!/usr/bin/env bash
# Compila o projeto e gera dois pacotes em dist/:
#   marketplace-varejo-build.tar.gz   -> servidor Next.js "standalone" (sem node_modules; pronto p/ rodar)
#   marketplace-varejo-source.tar.gz  -> código-fonte (sem node_modules/.next/.env), inclui alterações não commitadas
# Uso: npm run package
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=dist
rm -rf "$OUT"
mkdir -p "$OUT/stage"

echo "==> Build de produção (standalone)"
BUILD_STANDALONE=1 npx next build

echo "==> Montando pacote de execução"
cp -r .next/standalone/. "$OUT/stage/"
mkdir -p "$OUT/stage/.next"
cp -r .next/static "$OUT/stage/.next/static"
cp -r public "$OUT/stage/public"
cp .env.example "$OUT/stage/.env.example"
cat > "$OUT/stage/LEIA-ME.txt" <<'TXT'
Blue Malharia — pacote de produção (Next.js standalone)

Requisitos: Node.js 20.9+ (sem npm install: as dependências já estão embutidas).

1. Copie .env.example para .env e preencha (ou exporte as variáveis no servidor).
   Obrigatórias p/ vender de verdade: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
   MERCADOPAGO_ACCESS_TOKEN, NEXT_PUBLIC_SITE_URL.
2. Inicie:   PORT=3000 HOSTNAME=0.0.0.0 node server.js
3. Coloque atrás de HTTPS (proxy reverso). Webhook: <SITE_URL>/api/webhooks/mercadopago

Observação: NEXT_PUBLIC_* é embutida no momento do build (npm run package), não em runtime.
TXT

echo "==> Compactando"
tar -C "$OUT/stage" -cf - . | gzip -9 > "$OUT/marketplace-varejo-build.tar.gz"
git ls-files -z --cached --others --exclude-standard | tar --null -T - --transform 's,^,marketplace-varejo/,' -cf - | gzip -9 > "$OUT/marketplace-varejo-source.tar.gz"
rm -rf "$OUT/stage"

(cd "$OUT" && sha256sum *.tar.gz > SHA256SUMS)
echo "==> Pronto:"
ls -lh "$OUT"
cat "$OUT/SHA256SUMS"
