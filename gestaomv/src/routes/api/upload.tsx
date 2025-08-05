import { storageService } from "@/modules/core/services/storage.service";
import { createServerFileRoute } from "@tanstack/react-start/server";

async function handler({ request }: { request: Request }) {
	// Apenas POST é permitido
	if (request.method !== "POST") {
		return new Response(JSON.stringify({ error: "Método não permitido" }), {
			status: 405,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		// Verificar se o storage está configurado
		if (!storageService.isConfigurado()) {
			return new Response(
				JSON.stringify({ error: "Serviço de storage não configurado" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Obter FormData da requisição
		const formData = await request.formData();
		const file = formData.get("file") as File;

		// Validar se o arquivo foi enviado
		if (!file) {
			return new Response(
				JSON.stringify({ error: "Nenhum arquivo foi enviado" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Validar tipo de arquivo
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (!allowedTypes.includes(file.type)) {
			return new Response(
				JSON.stringify({
					error: `Tipo de arquivo não suportado. Aceitos: ${allowedTypes
						.map((type) => type.split("/")[1])
						.join(", ")}`,
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Validar tamanho do arquivo (5MB máximo)
		const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSizeInBytes) {
			return new Response(
				JSON.stringify({
					error: "Arquivo muito grande. Tamanho máximo: 5MB",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Converter File para Buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Fazer upload usando o StorageService
		const urlPublica = await storageService.fazerUploadArquivo(
			buffer,
			file.name,
			"materiais", // pasta específica para materiais
		);

		// Retornar URL pública do arquivo
		return new Response(
			JSON.stringify({
				url: urlPublica,
				message: "Upload realizado com sucesso",
				originalName: file.name,
				size: file.size,
				type: file.type,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Erro no upload de arquivo:", error);

		// Verificar se é erro conhecido do StorageService
		const errorMessage =
			error instanceof Error ? error.message : "Erro interno no servidor";

		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export const ServerRoute = createServerFileRoute("/api/upload").methods({
	POST: handler,
});
