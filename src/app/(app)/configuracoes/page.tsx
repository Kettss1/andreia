import { Settings } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function ConfiguracoesPage() {
  return (
    <PagePlaceholder
      eyebrow="Configurações"
      title="Configurações"
      description="Preferências da sua conta e do seu negócio."
      icon={Settings}
    />
  );
}
