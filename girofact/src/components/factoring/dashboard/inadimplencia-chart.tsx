import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InadimplenciaData {
  data: string;
  compensados: number;
  devolvidos: number;
  pendentes: number;
}

interface InadimplenciaChartProps {
  data: InadimplenciaData[];
  isLoading?: boolean;
}

export function InadimplenciaChart({ data, isLoading }: InadimplenciaChartProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posição de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posição de Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="data"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(label) => formatDate(label)}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend />
            <Bar
              dataKey="compensados"
              stackId="a"
              fill="#22c55e"
              name="Compensados"
            />
            <Bar
              dataKey="pendentes"
              stackId="a"
              fill="#eab308"
              name="Pendentes"
            />
            <Bar
              dataKey="devolvidos"
              stackId="a"
              fill="#ef4444"
              name="Devolvidos"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}