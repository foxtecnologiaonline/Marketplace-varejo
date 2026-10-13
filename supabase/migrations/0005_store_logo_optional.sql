-- As 4 lojas do seed (0002_catalog_and_stock.sql) usavam fotos aleatórias do
-- Unsplash (pessoas numa biblioteca, roupas numa cama) como "logo" — nenhuma
-- delas é de fato um logo. src/components/store-logo.tsx agora mostra um
-- monograma com as iniciais quando não há logo real cadastrado, então o
-- campo deixa de ser obrigatório e os valores falsos são limpos.

alter table stores alter column logo drop not null;

update stores set logo = null;
