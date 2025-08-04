import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardIndicadoresProps {
  titulo: string;
  valor: string | number;
  icone: LucideIcon;
  corTitulo?: string;
  corIcone?: string;
  corValor?: string;
  className?: string;
}

export function CardStats({
  titulo,
  valor,
  icone: Icone,
  corTitulo = 'text-sm font-medium',
  corIcone = 'text-muted-foreground',
  corValor = 'text-2xl font-bold',
  className,
}: CardIndicadoresProps) {
  return (
    <Card className={cn('py-4', className)}>
      <CardContent>
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={corTitulo}>{titulo}</CardTitle>
          <Icone className={cn('h-4 w-4', corIcone)} />
        </div>
        <div className={corValor}>{valor}</div>
      </CardContent>
    </Card>
  );
}
