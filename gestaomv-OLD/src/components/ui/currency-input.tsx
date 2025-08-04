'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { maskCurrency, parseCurrencyInput, validateCurrencyValue, numberToDisplay } from '@/lib/currency';

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value = 0, onChange, min = 0, max, onValidationChange, disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');

    // Inicializar display value quando value prop mudar
    React.useEffect(() => {
      if (value === 0) {
        setDisplayValue('');
      } else {
        // Converter número para string formatada para exibição
        setDisplayValue(numberToDisplay(value));
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Aplicar máscara (remove caracteres não-dígitos)
      const maskedValue = maskCurrency(inputValue);
      setDisplayValue(maskedValue);

      // Converter para número
      const numericValue = parseCurrencyInput(maskedValue);

      // Validar valor
      const validation = validateCurrencyValue(numericValue, min, max);
      const isValid = validation === true;
      const errorMessage = isValid ? '' : validation;

      setError(errorMessage);
      onValidationChange?.(isValid, errorMessage);

      // Chamar onChange apenas se válido ou se é o callback externo que deve lidar com validação
      onChange?.(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Quando foca, se estiver vazio, não mostra nada
      // Se tiver valor, mantém a formatação
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Quando perde o foco, garante que o valor está formatado corretamente
      if (!displayValue || displayValue === '0,00') {
        setDisplayValue('');
        onChange?.(0);
      }
      props.onBlur?.(e);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          R$
        </span>
        <Input
          {...props}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn('pl-10', error && 'border-destructive', className)}
          placeholder="0,00"
          disabled={disabled}
        />
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
