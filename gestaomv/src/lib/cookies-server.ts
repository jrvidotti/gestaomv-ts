export const SIDEBAR_COOKIE_NAME = "sidebar_state";

/**
 * Lê o estado da sidebar dos cookies no servidor
 * Para uso em Server Components e Server Functions
 */
export async function getSidebarStateServer(): Promise<boolean> {
	try {
		// Verificar se estamos no servidor
		if (typeof window !== "undefined") {
			// Se estivermos no cliente, usar método client-side
			return getSidebarStateClient();
		}

		// Importação dinâmica apenas no servidor
		const { getWebRequest } = await import("@tanstack/react-start/server");
		const request = getWebRequest();
		const cookieHeader = request.headers.get("cookie");

		if (!cookieHeader) {
			return true; // Estado padrão
		}

		const cookies = cookieHeader.split(";");
		const sidebarCookie = cookies.find((cookie) =>
			cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`),
		);

		if (sidebarCookie) {
			const value = sidebarCookie.split("=")[1]?.trim();
			return value === "true";
		}

		return true; // Estado padrão
	} catch (error) {
		// Fallback para caso de erro no servidor
		console.warn("Erro ao ler estado da sidebar no servidor:", error);
		return true;
	}
}

/**
 * Versão client-side para fallback
 */
function getSidebarStateClient(): boolean {
	if (typeof document !== "undefined") {
		const cookies = document.cookie.split(";");
		const sidebarCookie = cookies.find((cookie) =>
			cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`),
		);

		if (sidebarCookie) {
			const value = sidebarCookie.split("=")[1]?.trim();
			return value === "true";
		}
	}

	return true; // Estado padrão
}
