import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const institucional = [
  { href: "/sobre", label: "Sobre a Blue Malharia" },
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/trocas-devolucoes", label: "Trocas e Devoluções" },
  { href: "/regulamento", label: "Regulamento" }
];

const atendimento = [
  { href: "/atendimento", label: "Central de Atendimento" },
  { href: "/conta/pedidos", label: "Meus Pedidos" },
  { href: "/conta", label: "Minha Conta" },
  { href: "/cotacao", label: "Cotação Institucional" }
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/brand/logo.jpg"
            alt="Blue Malharia"
            width={56}
            height={56}
            className="h-14 w-14 rounded-md object-cover"
          />
          <p className="mt-3 text-sm text-slate-600">
            Blue Malharia — uniformes escolares, esportivos e personalizados direto da
            malharia, com frete para todo o Brasil.
          </p>
          <div className="mt-4 flex gap-3 text-slate-500">
            <a href="#" aria-label="Instagram" className="hover:text-brand-600">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-brand-600">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-brand-600">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Institucional</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {institucional.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Atendimento</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {atendimento.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Formas de pagamento</h3>
          <p className="mt-3 text-sm text-slate-600">
            Cartão de crédito em até 6x, Pix e boleto bancário. Compra 100% segura e dados
            protegidos.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Blue Malharia. CNPJ 00.000.000/0001-00. Todos os direitos reservados.
      </div>
    </footer>
  );
}
