import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Remove acentos de uma string e converte para lowercase
 * Exemplo: "Júnior" -> "junior", "São Paulo" -> "sao paulo"
 */
export function removeAccents(str: string): string {
	return str
		.normalize("NFD") // Decompor caracteres Unicode (separar acentos)
		.replace(/\p{Diacritic}/gu, "") // Remover marcas diacríticas usando propriedade Unicode
		.toLowerCase(); // Converter para minúsculas
}
