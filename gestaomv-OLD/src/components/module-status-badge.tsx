import { Badge } from '@/components/ui/badge';
import { MODULES_DATA, ModuleType } from '@/shared';

interface ModuleStatusBadgeProps {
  module: ModuleType;
  className?: string;
}

export function ModuleStatusBadge({ module, className }: ModuleStatusBadgeProps) {
  const moduleData = MODULES_DATA.find((m) => m.module === module);

  if (!moduleData) {
    return (
      <Badge variant="secondary" className={className}>
        Unknown
      </Badge>
    );
  }

  const getVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'development':
        return 'secondary';
      case 'planned':
        return 'outline';
      case 'disabled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge
      variant={getVariant(moduleData!.status ?? '')}
      className={className}
      title={`${moduleData.title} - ${moduleData.description}`}
    >
      {moduleData.status}
    </Badge>
  );
}
