import { Operator } from '@/types/appointment';
import { cn } from '@/lib/utils';

interface OperatorSelectorProps {
  operators: Operator[];
  selectedOperator: Operator | null;
  onSelect: (operator: Operator) => void;
}

export function OperatorSelector({ operators, selectedOperator, onSelect }: OperatorSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-muted-foreground">
        Selecciona tu operadora
      </label>
      <div className="flex gap-2 flex-wrap">
        {operators.map((operator) => (
          <button
            key={operator.id}
            onClick={() => onSelect(operator)}
            className={cn(
              'px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200',
              operator.colorClass,
              selectedOperator?.id === operator.id
                ? 'ring-2 ring-offset-2 ring-primary scale-105'
                : 'hover:scale-102 opacity-70 hover:opacity-100'
            )}
          >
            {operator.name}
          </button>
        ))}
      </div>
    </div>
  );
}
