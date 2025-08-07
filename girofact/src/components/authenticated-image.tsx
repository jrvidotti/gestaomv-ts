import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AuthenticatedImageProps {
	src: string;
	alt: string;
	className?: string;
	fill?: boolean;
	sizes?: string;
	onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function AuthenticatedImage({
	src,
	alt,
	className,
	fill = false,
	sizes,
	onError,
}: AuthenticatedImageProps) {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!src) {
			setImageSrc(null);
			setError(false);
			setIsLoading(false);
			return;
		}

		const loadImage = async () => {
			try {
				setIsLoading(true);
				setError(false);
				// NÃO resetar imageSrc aqui para evitar fallback temporário

				// Se a imagem já é uma URL completa, usar diretamente
				if (src.startsWith("http") || src.startsWith("data:")) {
					setImageSrc(src);
					setIsLoading(false);
					return;
				}

				// Para imagens do nosso endpoint proxy, fazer fetch com token
				const token = localStorage.getItem("auth_token");
				if (!token) {
					setError(true);
					setImageSrc(null);
					setIsLoading(false);
					return;
				}

				const response = await fetch(`/api/images/${src}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					setError(true);
					setImageSrc(null);
					setIsLoading(false);
					return;
				}

				// Converter resposta para blob URL
				const blob = await response.blob();
				const blobUrl = URL.createObjectURL(blob);

				// Só atualizar após sucesso
				setImageSrc(blobUrl);
				setIsLoading(false);

				// Limpar blob URL quando componente for desmontado
				return () => {
					URL.revokeObjectURL(blobUrl);
				};
			} catch (err) {
				console.error("Erro ao carregar imagem:", err);
				setError(true);
				setImageSrc(null);
				setIsLoading(false);
			}
		};

		loadImage();
	}, [src]);

	const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		setError(true);
		onError?.(e);
	};

	// Só mostrar fallback se erro confirmado OU se não tem src e não está carregando
	if (error || (!src && !isLoading)) {
		// Fallback para imagens quebradas ou quando não há imagem
		const fallbackSrc =
			"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA2NEw2NCA0MEw4OCA2NEw4OCA4OEg0MFY2NEoiIGZpbGw9IiNEMUQ1REIiLz0KPC9zdmc+";

		return fill ? (
			<img
				src={fallbackSrc}
				alt={alt}
				className={cn("object-cover", className)}
				sizes={sizes}
			/>
		) : (
			<div
				className={cn("bg-muted flex items-center justify-center", className)}
			>
				<span className="text-muted-foreground text-sm">
					Imagem não disponível
				</span>
			</div>
		);
	}

	// Se não tem imageSrc ainda (carregando), não renderizar nada para evitar fallback
	if (!imageSrc) {
		return null;
	}

	return fill ? (
		<img
			src={imageSrc}
			alt={alt}
			className={cn("object-cover", className)}
			sizes={sizes}
			onError={handleError}
		/>
	) : (
		<img
			src={imageSrc}
			alt={alt}
			className={className}
			width={128}
			height={128}
			onError={handleError}
		/>
	);
}
