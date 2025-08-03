import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input, type InputProps } from '@/components/ui/input'

interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  currency?: string
  locale?: string
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, min = 0, max, currency = 'BRL', locale = 'pt-BR', disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    // Formatar valor para exibição
    const formatCurrency = (num: number): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(num)
    }

    // Converter string para número
    const parseStringToNumber = (str: string): number => {
      // Remove todos os caracteres exceto dígitos e vírgula/ponto
      const cleanStr = str.replace(/[^\d,.-]/g, '')
      
      // Se estiver vazio, retorna 0
      if (!cleanStr) return 0

      // Substitui vírgula por ponto para conversão
      const normalizedStr = cleanStr.replace(',', '.')
      
      // Converte para número
      const num = parseFloat(normalizedStr)
      
      // Se não for um número válido, retorna 0
      return isNaN(num) ? 0 : num
    }

    // Atualizar display quando o valor prop mudar
    React.useEffect(() => {
      setDisplayValue(formatCurrency(value))
    }, [value, currency, locale])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Permitir edição livre durante a digitação
      setDisplayValue(inputValue)
      
      // Converter para número e chamar onChange
      const numericValue = parseStringToNumber(inputValue)
      
      // Aplicar limites
      let finalValue = numericValue
      if (min !== undefined && finalValue < min) {
        finalValue = min
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max
      }
      
      onChange(finalValue)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Ao perder o foco, formatar o valor
      const numericValue = parseStringToNumber(e.target.value)
      let finalValue = numericValue
      
      // Aplicar limites
      if (min !== undefined && finalValue < min) {
        finalValue = min
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max
      }
      
      setDisplayValue(formatCurrency(finalValue))
      onChange(finalValue)
      
      // Chamar onBlur se fornecido
      props.onBlur?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Ao focar, mostrar apenas o número para facilitar edição
      setDisplayValue(value.toString().replace('.', ','))
      
      // Chamar onFocus se fornecido
      props.onFocus?.(e)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        className={cn('text-right font-mono', className)}
        placeholder={formatCurrency(0)}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput, type CurrencyInputProps }