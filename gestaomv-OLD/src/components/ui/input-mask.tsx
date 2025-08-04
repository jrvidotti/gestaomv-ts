import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, InputProps } from './input';

export interface InputMaskProps extends Omit<InputProps, 'onChange'> {
  mask: string;
  replacement?: { [key: string]: RegExp };
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

const defaultReplacement = {
  _: /[a-zA-Z0-9]/,
};

/*
Exemplo de uso:

<InputMask
  id="cpf"
  mask="___.___.___-__"
  replacement={{ _: /\d/ }}
  value={cpf}
  onChange={(e) => setCpf(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (stepVerificacao === "cpf") {
        handleBuscarClientePorCpf();
      }
    }
  }}
  placeholder="000.000.000-00"
  className="w-full"
  required
  disabled={isLoadingCpfQuery}
/>
*/

export function InputMask({
  mask,
  replacement = defaultReplacement,
  onChange,
  value,
  className,
  ...props
}: InputMaskProps) {
  const processInput = (input: string, mask: string): string => {
    let result = '';
    let inputIndex = 0;

    for (let i = 0; i < mask.length && inputIndex < input.length; i++) {
      const maskChar = mask[i];
      const inputChar = input[inputIndex];

      if (replacement[maskChar]) {
        if (replacement[maskChar].test(inputChar)) {
          result += inputChar;
          inputIndex++;
        }
      } else {
        result += maskChar;
        if (inputChar === maskChar) {
          inputIndex++;
        }
      }
    }

    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    const maskedValue = processInput(input, mask);

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue,
      },
    };

    onChange?.(syntheticEvent);
  };

  return <Input {...props} value={value} onChange={handleChange} className={cn(className)} />;
}
