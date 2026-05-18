import { UtensilsCrossed } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function CardapiosPage() {
  return (
    <PagePlaceholder
      eyebrow="Cardápios"
      title="Seus cardápios"
      description="Monte cardápios a partir do seu catálogo e gere PDFs prontos para enviar a clientes em potencial."
      icon={UtensilsCrossed}
    />
  );
}
