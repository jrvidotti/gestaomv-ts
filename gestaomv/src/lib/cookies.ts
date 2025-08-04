export const SIDEBAR_COOKIE_NAME = "sidebar_state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

/**
 * Lê o estado da sidebar dos cookies (apenas cliente)
 * Para uso em componentes client
 */
export function getSidebarState(): boolean {
	// Apenas para o lado do cliente
	if (typeof document !== "undefined") {
		const cookies = document.cookie.split(";");
		const sidebarCookie = cookies.find((cookie) =>
			cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`),
		);

		if (sidebarCookie) {
			const value = sidebarCookie.split("=")[1];
			return value === "true";
		}
	}

	return true; // Estado padrão
}

/**
 * Define o estado da sidebar nos cookies (apenas cliente)
 */
export function setSidebarState(isOpen: boolean): void {
	if (typeof document !== "undefined") {
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${isOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	}
}
