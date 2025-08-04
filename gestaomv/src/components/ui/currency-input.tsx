import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as React from "react";

interface CurrencyInputProps
	extends Omit<InputProps, "value" | "onChange" | "type"> {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	currency?: string;
	locale?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
	(
		{
			className,
			value,
			onChange,
			min = 0,
			max,
			currency = "BRL",
			locale = "pt-BR",
			disabled,
			...props
		},
		ref,
	) => {
		const [displayValue, setDisplayValue] = React.useState("");
		const [isFocused, setIsFocused] = React.useState(false);

		// Formatar número para exibição com símbolo de moeda
		const formatCurrency = (num: number): string => {
			return new Intl.NumberFormat(locale, {
				style: "currency",
				currency,
				minimumFractionDigits: 2,
			}).format(num);
		};

		// Formatar número para input (sem símbolos, apenas vírgula decimal)
		const formatForInput = (num: number): string => {
			return num.toFixed(2).replace(".", ",");
		};

		// Converter string para número
		const parseStringToNumber = (str: string): number => {
			if (!str || str.trim() === "") return 0;

			// Remove tudo exceto dígitos, vírgula e ponto
			let cleanStr = str.replace(/[^\d,.]/g, "");

			if (!/\d/.test(cleanStr)) return 0;

			// Lógica de parsing para formato brasileiro
			if (cleanStr.includes(",") && cleanStr.includes(".")) {
				const lastCommaIndex = cleanStr.lastIndexOf(",");
				const lastDotIndex = cleanStr.lastIndexOf(".");

				if (lastCommaIndex > lastDotIndex) {
					// Formato brasileiro: 123.456,01
					cleanStr = cleanStr.replace(/\./g, "").replace(",", ".");
				} else {
					// Formato internacional: 123,456.01
					cleanStr = cleanStr.replace(/,/g, "");
				}
			} else if (cleanStr.includes(",")) {
				const parts = cleanStr.split(",");
				if (parts.length === 2) {
					// Uma vírgula - sempre tratar como decimal brasileiro
					// Limitar a 2 casas decimais se necessário
					const decimalPart = parts[1].substring(0, 2);
					cleanStr = parts[0] + "." + decimalPart;
				} else {
					// Múltiplas vírgulas - separador de milhares
					cleanStr = cleanStr.replace(/,/g, "");
				}
			}

			const num = Number.parseFloat(cleanStr);
			return Number.isNaN(num) ? 0 : num;
		};

		// Sincronizar displayValue com value prop apenas quando não focado
		React.useEffect(() => {
			if (!isFocused) {
				setDisplayValue(formatCurrency(value));
			}
		}, [value, isFocused, locale, currency]);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setDisplayValue(newValue);

			// Parse e propagar valor
			const numericValue = parseStringToNumber(newValue);
			onChange(numericValue);
		};

		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(true);

			// Mostrar valor limpo para digitação
			const cleanValue = formatForInput(value);
			setDisplayValue(cleanValue);

			// Selecionar tudo após um tick
			setTimeout(() => e.target.select(), 0);

			props.onFocus?.(e);
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(false);

			// Parse do valor digitado
			const numericValue = parseStringToNumber(displayValue);
			let finalValue = numericValue;

			// Aplicar limites
			if (min !== undefined && finalValue < min) {
				finalValue = min;
			}
			if (max !== undefined && finalValue > max) {
				finalValue = max;
			}

			// Propagar valor final
			onChange(finalValue);

			// Formatar para exibição
			setDisplayValue(formatCurrency(finalValue));

			props.onBlur?.(e);
		};

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
				className={cn("text-right font-mono", className)}
				placeholder={formatCurrency(0)}
			/>
		);
	},
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput, type CurrencyInputProps };
