-- Corrige as fotos do catálogo (seed de 0002_catalog_and_stock.sql): toda
-- categoria e todo produto usava as duas mesmas duas fotos genéricas (um
-- parâmetro "sig" no fim da URL, que o Unsplash ignora — não muda a imagem
-- de verdade), então o visual não batia com o item (ex.: a "Camiseta Manga
-- Curta Marista" mostrava a mesma foto de uma calça ou de um colete). Usa
-- UPDATE em vez de reescrever 0002 porque migração já aplicada não se edita
-- — ver o mesmo raciocínio em 0003_coupons.sql.

update categories set image = 'https://images.unsplash.com/photo-1720514496333-2c552e9ee5f2?q=80&w=600&auto=format&fit=crop' where slug = 'camisetas';
update categories set image = 'https://images.unsplash.com/photo-1789110520164-2389992e5d0f?q=80&w=600&auto=format&fit=crop' where slug = 'calcas';
update categories set image = 'https://images.unsplash.com/photo-1789110520350-db58d2271c63?q=80&w=600&auto=format&fit=crop' where slug = 'bermudas';
update categories set image = 'https://images.unsplash.com/photo-1780396508935-94e234affc92?q=80&w=600&auto=format&fit=crop' where slug = 'agasalhos';
update categories set image = 'https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=600&auto=format&fit=crop' where slug = 'kit-maternidade';

update products set images = array[
  'https://images.unsplash.com/photo-1720514496333-2c552e9ee5f2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1720514496505-d6756368b0b3?q=80&w=800&auto=format&fit=crop'
] where id = 'p1';

update products set images = array[
  'https://images.unsplash.com/photo-1789110520164-2389992e5d0f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1789110853719-2920fe512117?q=80&w=800&auto=format&fit=crop'
] where id = 'p2';

update products set images = array[
  'https://images.unsplash.com/photo-1789110520350-db58d2271c63?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1789110853613-4ace8d4041e3?q=80&w=800&auto=format&fit=crop'
] where id = 'p3';

update products set images = array[
  'https://images.unsplash.com/photo-1780396508935-94e234affc92?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592741159459-5f0549acad47?q=80&w=800&auto=format&fit=crop'
] where id = 'p4';

update products set images = array[
  'https://images.unsplash.com/photo-1693683224122-0a8e206f248d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1720514496194-6544164b4043?q=80&w=800&auto=format&fit=crop'
] where id = 'p5';

update products set images = array[
  'https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1627859846191-39012f247980?q=80&w=800&auto=format&fit=crop'
] where id = 'p6';

update products set images = array[
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618354691551-44de113f0164?q=80&w=800&auto=format&fit=crop'
] where id = 'p7';

update products set images = array[
  'https://images.unsplash.com/photo-1626354796188-5e5e293fe168?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1694447814836-c93ab70f7398?q=80&w=800&auto=format&fit=crop'
] where id = 'p8';
