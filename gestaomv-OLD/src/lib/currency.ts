/**
 * Utilitários para formatação e manipulação de valores monetários
 */

/**
 * Formatar valor numérico para moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Converter string de entrada monetária para número
 * @param value - String de entrada do usuário
 * @returns Valor numérico correspondente
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;

  // Remove todos os caracteres exceto dígitos, vírgula e ponto
  const cleanValue = value.replace(/[^\d,.]/g, '');

  // Se há vírgula, separar parte inteira e decimal
  if (cleanValue.includes(',')) {
    const parts = cleanValue.split(',');
    const integerPart = parts[0].replace(/\./g, ''); // Remove pontos da parte inteira
    const decimalPart = parts[1] || '0';

    // Limita a parte decimal a 2 dígitos
    const decimal = decimalPart.substring(0, 2).padEnd(2, '0');

    return parseFloat(`${integerPart}.${decimal}`);
  }

  // Se não há vírgula, remove pontos e trata como valor formatado
  const digitsOnly = cleanValue.replace(/\./g, '');
  const numValue = parseInt(digitsOnly) || 0;

  // Para valores vindos do maskCurrency, divide por 100 para obter o valor real
  return numValue / 100;
}

/**
 * Aplicar máscara monetária enquanto o usuário digita
 * @param value - Valor atual do input (apenas dígitos)
 * @returns String com máscara aplicada
 */
export function maskCurrency(value: string): string {
  if (!value) return '';

  // Remove tudo exceto dígitos
  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) return '';

  // Limitar a 12 dígitos para evitar overflow (máximo: R$ 9.999.999.999,99)
  const limitedDigits = digitsOnly.substring(0, 12);

  // Converte para centavos
  const cents = parseInt(limitedDigits);

  // Converte centavos para reais
  const reais = cents / 100;

  // Formatar usando Intl
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

/**
 * Converter número para string formatada para exibição
 * @param value - Valor numérico
 * @returns String formatada para display
 */
export function numberToDisplay(value: number): string {
  if (!value || value === 0) return '';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Validar se o valor monetário está dentro dos limites
 * @param value - Valor a ser validado
 * @param min - Valor mínimo (padrão: 0)
 * @param max - Valor máximo (opcional)
 * @returns true se válido, string de erro se inválido
 */
export function validateCurrencyValue(value: number, min: number = 0, max?: number): true | string {
  if (isNaN(value)) {
    return 'Valor inválido';
  }

  if (value < min) {
    return `Valor deve ser maior ou igual a ${formatCurrency(min)}`;
  }

  if (max !== undefined && value > max) {
    return `Valor deve ser menor ou igual a ${formatCurrency(max)}`;
  }

  return true;
}

/**
 * Remover formatação monetária e retornar apenas o valor numérico
 * @param formattedValue - Valor formatado (ex: "R$ 1.234,56")
 * @returns Valor numérico
 */
export function unformatCurrency(formattedValue: string): number {
  if (!formattedValue) return 0;

  // Remove símbolos de moeda e espaços
  const cleanValue = formattedValue
    .replace(/R\$?\s?/g, '')
    .replace(/\./g, '') // Remove pontos (separadores de milhares)
    .replace(',', '.'); // Converte vírgula decimal para ponto

  return parseFloat(cleanValue) || 0;
}
