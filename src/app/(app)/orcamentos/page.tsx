import { FileText } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function OrcamentosPage() {
  return (
    <PagePlaceholder
      eyebrow="Orçamentos"
      title="Seus orçamentos"
      description="Crie orçamentos por evento com itens do catálogo, taxas e observações — e acompanhe o status de cada um, do rascunho ao aceito."
      icon={FileText}
    />
  );
}
