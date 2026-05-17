import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceDisplay } from './BalanceDisplay';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  value: number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'danger';
}

const variantStyles = {
  default: '',
  success: 'border-green-300 bg-green-50 dark:bg-green-950/30',
  danger: 'border-red-300 bg-red-50 dark:bg-red-950/30',
};

export function ReportSummaryCard({ title, value, subtitle, variant = 'default' }: Props) {
  return (
    <Card className={cn(variantStyles[variant])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          <BalanceDisplay value={value} />
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}