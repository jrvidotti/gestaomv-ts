import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

interface DocumentoStats {
  status: string;
  count: number;
  valor: number;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ComponentType<{ className?: string }>;
}

interface CarteiraDocumentosProps {
  documentos: {
    pendentes: { count: number; valor: number };
    compensados: { count: number; valor: number };
    devolvidos: { count: number; valor: number };
    protestados: { count: number; valor: number };
    vencidos: { count: number; valor: number };
    total: { count: number; valor: number };
  };
  isLoading?: boolean;
}

export function CarteiraDocumentos({ documentos, isLoading }: CarteiraDocumentosProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const stats: DocumentoStats[] = [
    {
      status: "pendentes",
      count: documentos.pendentes.count,
      valor: documentos.pendentes.valor,
      label: "Pendentes",
      variant: "outline",
      icon: Clock,
    },
    {
      status: "compensados", 
      count: documentos.compensados.count,
      valor: documentos.compensados.valor,
      label: "Compensados",
      variant: "default",
      icon: CheckCircle,
    },
    {
      status: "devolvidos",
      count: documentos.devolvidos.count,
      valor: documentos.devolvidos.valor,
      label: "Devolvidos",
      variant: "destructive",
      icon: XCircle,
    },
    {
      status: "protestados",
      count: documentos.protestados.count,
      valor: documentos.protestados.valor,
      label: "Protestados",
      variant: "destructive",
      icon: AlertTriangle,
    },
    {
      status: "vencidos",
      count: documentos.vencidos.count,
      valor: documentos.vencidos.valor,
      label: "Vencidos",
      variant: "secondary",
      icon: AlertTriangle,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Posição da Carteira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Posição da Carteira
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo Total */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Documentos</p>
              <p className="text-2xl font-bold">{documentos.total.count}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">{formatCurrency(documentos.total.valor)}</p>
            </div>
          </div>
        </div>

        {/* Detalhes por Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const percentage = documentos.total.count > 0 
              ? (stat.count / documentos.total.count) * 100 
              : 0;

            return (
              <div key={stat.status} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <Badge variant={stat.variant}>
                    {stat.count}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-lg font-semibold">
                    {formatCurrency(stat.valor)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% do total</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alertas para situações críticas */}
        {(documentos.vencidos.count > 0 || documentos.protestados.count > 0) && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Atenção necessária</h4>
                <div className="text-sm text-yellow-700 space-y-1 mt-1">
                  {documentos.vencidos.count > 0 && (
                    <p>• {documentos.vencidos.count} documento(s) vencido(s) no valor de {formatCurrency(documentos.vencidos.valor)}</p>
                  )}
                  {documentos.protestados.count > 0 && (
                    <p>• {documentos.protestados.count} documento(s) protestado(s) no valor de {formatCurrency(documentos.protestados.valor)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}