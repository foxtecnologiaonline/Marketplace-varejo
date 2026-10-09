import { SupportForm } from "@/components/support-form";

export const metadata = { title: "Central de Atendimento" };

export default function SupportPage() {
  return (
    <div className="container-page py-12">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Central de Atendimento</h1>
      <SupportForm />
    </div>
  );
}
