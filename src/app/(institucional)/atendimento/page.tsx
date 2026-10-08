export const metadata = { title: "Central de Atendimento" };

export default function SupportPage() {
  return (
    <div className="container-page py-12">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Central de Atendimento</h1>
      <form className="card flex max-w-xl flex-col gap-4 p-6">
        <input required placeholder="Nome" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input required type="email" placeholder="E-mail" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <textarea required placeholder="Como podemos ajudar?" rows={4} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="btn-primary">
          Enviar mensagem
        </button>
      </form>
    </div>
  );
}
