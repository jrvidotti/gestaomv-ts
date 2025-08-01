"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseUploadState {
	isUploading: boolean;
	progress: number;
	error: string | null;
}

interface UseUploadOptions {
	maxSizeInMB?: number;
	acceptedTypes?: string[];
	onSuccess?: (url: string) => void;
	onError?: (error: string) => void;
}

interface UseUploadReturn extends UseUploadState {
	uploadFile: (file: File) => Promise<string | null>;
	resetState: () => void;
}

export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
	const {
		maxSizeInMB = 5,
		acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
		onSuccess,
		onError,
	} = options;

	const [state, setState] = useState<UseUploadState>({
		isUploading: false,
		progress: 0,
		error: null,
	});

	const validateFile = useCallback(
		(file: File): string | null => {
			// Validar tipo de arquivo
			if (!acceptedTypes.includes(file.type)) {
				return `Tipo de arquivo não suportado. Aceitos: ${acceptedTypes
					.map((type) => type.split("/")[1])
					.join(", ")}`;
			}

			// Validar tamanho do arquivo
			const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
			if (file.size > maxSizeInBytes) {
				return `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`;
			}

			return null;
		},
		[acceptedTypes, maxSizeInMB],
	);

	const uploadFile = useCallback(
		async (file: File): Promise<string | null> => {
			// Validar arquivo
			const validationError = validateFile(file);
			if (validationError) {
				setState((prev) => ({ ...prev, error: validationError }));
				onError?.(validationError);
				toast.error(validationError);
				return null;
			}

			// Resetar estado e iniciar upload
			setState({
				isUploading: true,
				progress: 0,
				error: null,
			});

			try {
				const formData = new FormData();
				formData.append("file", file);

				// Criar XMLHttpRequest para monitorar progresso
				const xhr = new XMLHttpRequest();

				return new Promise<string | null>((resolve, reject) => {
					// Monitorar progresso do upload
					xhr.upload.addEventListener("progress", (event) => {
						if (event.lengthComputable) {
							const progress = Math.round((event.loaded / event.total) * 100);
							setState((prev) => ({ ...prev, progress }));
						}
					});

					// Resposta do servidor
					xhr.addEventListener("load", () => {
						if (xhr.status === 200) {
							try {
								const response = JSON.parse(xhr.responseText);
								setState({
									isUploading: false,
									progress: 100,
									error: null,
								});
								onSuccess?.(response.url);
								toast.success("Upload concluído com sucesso!");
								resolve(response.url);
							} catch (parseError) {
								const errorMsg = "Erro ao processar resposta do servidor";
								setState((prev) => ({
									...prev,
									isUploading: false,
									error: errorMsg,
								}));
								onError?.(errorMsg);
								toast.error(errorMsg);
								resolve(null);
							}
						} else {
							let errorMsg = "Erro no upload do arquivo";
							try {
								const errorResponse = JSON.parse(xhr.responseText);
								errorMsg = errorResponse.error || errorMsg;
							} catch {
								// Manter erro padrão se não conseguir parsear
							}

							setState((prev) => ({
								...prev,
								isUploading: false,
								error: errorMsg,
							}));
							onError?.(errorMsg);
							toast.error(errorMsg);
							resolve(null);
						}
					});

					// Erro de rede
					xhr.addEventListener("error", () => {
						const errorMsg = "Erro de conexão durante o upload";
						setState((prev) => ({
							...prev,
							isUploading: false,
							error: errorMsg,
						}));
						onError?.(errorMsg);
						toast.error(errorMsg);
						resolve(null);
					});

					// Timeout
					xhr.addEventListener("timeout", () => {
						const errorMsg = "Timeout durante o upload";
						setState((prev) => ({
							...prev,
							isUploading: false,
							error: errorMsg,
						}));
						onError?.(errorMsg);
						toast.error(errorMsg);
						resolve(null);
					});

					// Iniciar requisição
					xhr.open("POST", "/api/upload");
					xhr.timeout = 60000; // 60 segundos
					xhr.send(formData);
				});
			} catch (error) {
				const errorMsg =
					error instanceof Error
						? error.message
						: "Erro desconhecido no upload";
				setState((prev) => ({
					...prev,
					isUploading: false,
					error: errorMsg,
				}));
				onError?.(errorMsg);
				toast.error(errorMsg);
				return null;
			}
		},
		[validateFile, onSuccess, onError],
	);

	const resetState = useCallback(() => {
		setState({
			isUploading: false,
			progress: 0,
			error: null,
		});
	}, []);

	return {
		...state,
		uploadFile,
		resetState,
	};
}
