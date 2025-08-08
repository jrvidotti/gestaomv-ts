import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VolumeData {
  data: string;
  volume: number;
  operacoes: number;
}

interface VolumeChartProps {
  data: VolumeData[];
  isLoading?: boolean;
}

export function VolumeChart({ data, isLoading }: VolumeChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Volume Operado</CardTitle>
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
        <CardTitle>Volume Operado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="data"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(label) => formatDate(label)}
              formatter={[
                (value: number) => [formatCurrency(value), "Volume"],
                (value: number) => [value.toString(), "Operações"],
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Volume (R$)"
            />
            <Line
              type="monotone"
              dataKey="operacoes"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Operações"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}