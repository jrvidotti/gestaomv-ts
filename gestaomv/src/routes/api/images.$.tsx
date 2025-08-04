import { authenticateRequest } from "@/lib/auth";
import { StorageService } from "@/modules/core/services/storage.service";
import { createServerFileRoute } from "@tanstack/react-start/server";

// Instanciar o serviço de storage
const storageService = new StorageService();

async function handler({ request }: { request: Request }) {
	try {
		// Verificar se o storage está configurado
		if (!storageService.isConfigurado()) {
			return Response.json(
				{ error: "Serviço de storage não configurado" },
				{ status: 500 },
			);
		}

		// Verificar autenticação JWT
		const user = authenticateRequest(request);
		if (!user) {
			return Response.json(
				{ error: "Usuário não autenticado" },
				{ status: 401 },
			);
		}

		// Construir chave do arquivo
		const chave = request.url.split("api/images/").pop();

		if (!chave) {
			return Response.json(
				{ error: "Caminho do arquivo não especificado" },
				{ status: 400 },
			);
		}

		// Baixar arquivo do storage
		const buffer = await storageService.baixarArquivo(chave);

		// Determinar tipo MIME baseado na extensão
		const extensao = chave.substring(chave.lastIndexOf("."));
		const tiposMime: Record<string, string> = {
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".webp": "image/webp",
			".svg": "image/svg+xml",
		};
		const contentType =
			tiposMime[extensao.toLowerCase()] || "application/octet-stream";

		// Retornar arquivo com headers apropriados
		return new Response(buffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", // Cache por 1 dia, revalidar por 1 semana
				"Content-Length": buffer.length.toString(),
			},
		});
	} catch (error) {
		console.error("Erro ao servir imagem:", error);

		// Verificar se é erro de arquivo não encontrado
		if (error instanceof Error && error.message.includes("não encontrado")) {
			return Response.json(
				{ error: "Arquivo não encontrado" },
				{ status: 404 },
			);
		}

		return Response.json(
			{ error: "Erro interno no servidor" },
			{ status: 500 },
		);
	}
}

export const ServerRoute = createServerFileRoute("/api/images/$").methods({
	GET: handler,
});
