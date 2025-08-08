"use client";

import { AuthenticatedImage } from "@/components/authenticated-image";
import { ImageModal } from "@/components/image-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TIPO_ARQUIVO } from "@/modules/factoring/enums";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Eye,
	File,
	FileText,
	Image as ImageIcon,
	Loader2,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface AnexosClienteProps {
	clienteId: number;
}

export function AnexosCliente({ clienteId }: AnexosClienteProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isUploadOpen, setIsUploadOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [observacao, setObservacao] = useState("");
	const [tipoArquivo, setTipoArquivo] = useState<string>("documento");
	const [isUploading, setIsUploading] = useState(false);

	// Modal de visualização de imagem
	const [imageModal, setImageModal] = useState<{
		isOpen: boolean;
		src: string;
		alt: string;
		title?: string;
	}>({
		isOpen: false,
		src: "",
		alt: "",
	});

	// Buscar anexos do cliente
	const {
		data: anexos,
		isLoading,
		error,
	} = useQuery(
		trpc.factoring.anexos.listarPorCliente.queryOptions({
			clienteId,
		}),
	);

	// Mutation para fazer upload de anexo
	const uploadAnexoMutation = useMutation({
		...trpc.factoring.anexos.upload.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.factoring.anexos.listarPorCliente.getQueryKey({
					clienteId,
				}),
			});
			setIsUploadOpen(false);
			resetForm();
			toast.success("Anexo enviado com sucesso!");
		},
		onError: (error: any) => {
			toast.error(`Erro ao enviar anexo: ${error.message}`);
		},
	});

	// Mutation para arquivar anexo
	const arquivarAnexoMutation = useMutation({
		...trpc.factoring.anexos.arquivar.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.factoring.anexos.listarPorCliente.getQueryKey({
					clienteId,
				}),
			});
			toast.success("Anexo arquivado com sucesso!");
		},
		onError: (error: any) => {
			toast.error(`Erro ao arquivar anexo: ${error.message}`);
		},
	});

	const resetForm = () => {
		setSelectedFile(null);
		setObservacao("");
		setTipoArquivo("documento");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleFileSelect = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				setSelectedFile(file);
			}
		},
		[],
	);

	const handleUpload = async () => {
		if (!selectedFile) return;

		try {
			setIsUploading(true);

			// Converter arquivo para base64
			const arrayBuffer = await selectedFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64 = buffer.toString("base64");

			// Fazer upload via tRPC
			await uploadAnexoMutation.mutateAsync({
				clienteId,
				observacao: observacao.trim() || undefined,
				tipoArquivo: tipoArquivo as any,
				arquivo: base64,
				nomeArquivo: selectedFile.name,
				tamanhoArquivo: selectedFile.size,
				tipoMime: selectedFile.type,
				pastaDestino: "anexos-clientes",
			});
		} catch (error) {
			console.error("Erro no upload:", error);
			toast.error("Erro ao fazer upload do arquivo");
		} finally {
			setIsUploading(false);
		}
	};

	const handleViewImage = (anexo: any) => {
		setImageModal({
			isOpen: true,
			src: anexo.chaveArquivoS3 || "",
			alt: anexo.nomeArquivo || "Imagem do anexo",
			title: anexo.nomeArquivo,
		});
	};

	const isImageFile = (tipoMime?: string) => {
		return tipoMime?.startsWith("image/") || false;
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return "0 B";
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
	};

	const getTipoArquivoLabel = (tipo: string) => {
		const labels: Record<string, string> = {
			documento: "Documento",
			comprovante: "Comprovante",
			foto: "Foto",
			anexo_geral: "Anexo Geral",
		};
		return labels[tipo] || tipo;
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<File className="h-5 w-5" />
						Anexos
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<File className="h-5 w-5" />
						Anexos
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						Erro ao carregar anexos
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<CardTitle className="flex items-center gap-2">
						<File className="h-5 w-5" />
						Anexos
					</CardTitle>
					<Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Adicionar
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Adicionar Anexo</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label htmlFor="file">Arquivo</Label>
									<Input
										ref={fileInputRef}
										id="file"
										type="file"
										onChange={handleFileSelect}
										accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
									/>
									{selectedFile && (
										<div className="mt-2 text-sm text-muted-foreground">
											{selectedFile.name} ({formatFileSize(selectedFile.size)})
										</div>
									)}
								</div>

								<div>
									<Label htmlFor="tipo">Tipo do Arquivo</Label>
									<Select value={tipoArquivo} onValueChange={setTipoArquivo}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(TIPO_ARQUIVO).map(([key, value]) => (
												<SelectItem key={value} value={value}>
													{getTipoArquivoLabel(value)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="observacao">Observação (opcional)</Label>
									<Textarea
										id="observacao"
										value={observacao}
										onChange={(e) => setObservacao(e.target.value)}
										placeholder="Descreva o conteúdo do arquivo..."
										rows={3}
									/>
								</div>

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										onClick={() => setIsUploadOpen(false)}
									>
										Cancelar
									</Button>
									<Button
										onClick={handleUpload}
										disabled={!selectedFile || isUploading}
									>
										{isUploading ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Enviando...
											</>
										) : (
											<>
												<Upload className="h-4 w-4 mr-2" />
												Enviar
											</>
										)}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					{!anexos?.length ? (
						<div className="text-center text-muted-foreground py-8">
							<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>Nenhum anexo encontrado</p>
							<p className="text-sm">
								Clique em "Adicionar" para enviar o primeiro anexo
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{anexos.map((anexo) => (
								<div
									key={anexo.id}
									className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow"
								>
									{/* Preview do arquivo */}
									<div className="flex items-center justify-center h-24 bg-muted rounded">
										{isImageFile(anexo.tipoMime) ? (
											<div className="relative w-full h-full">
												<AuthenticatedImage
													src={anexo.chaveArquivoS3 || ""}
													alt={anexo.nomeArquivo || "Anexo"}
													className="w-full h-full object-cover rounded cursor-pointer"
													onClick={() => handleViewImage(anexo)}
												/>
											</div>
										) : (
											<File className="h-8 w-8 text-muted-foreground" />
										)}
									</div>

									{/* Informações do arquivo */}
									<div>
										<div className="flex items-center justify-between mb-2">
											<Badge variant="secondary" className="text-xs">
												{getTipoArquivoLabel(anexo.tipoArquivo)}
											</Badge>
											<span className="text-xs text-muted-foreground">
												{formatFileSize(anexo.tamanhoArquivo)}
											</span>
										</div>

										<h4
											className="font-medium text-sm truncate"
											title={anexo.nomeArquivo}
										>
											{anexo.nomeArquivo}
										</h4>

										{anexo.observacao && (
											<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
												{anexo.observacao}
											</p>
										)}

										<div className="text-xs text-muted-foreground mt-2">
											Por: {anexo.user?.name} •{" "}
											{new Date(anexo.criadoEm).toLocaleDateString("pt-BR")}
										</div>
									</div>

									{/* Ações */}
									<div className="flex justify-between">
										{isImageFile(anexo.tipoMime) && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleViewImage(anexo)}
											>
												<Eye className="h-3 w-3 mr-1" />
												Ver
											</Button>
										)}
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												arquivarAnexoMutation.mutate({ id: anexo.id })
											}
											disabled={arquivarAnexoMutation.isPending}
										>
											<Trash2 className="h-3 w-3 mr-1" />
											Arquivar
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Modal de visualização de imagem */}
			<ImageModal
				isOpen={imageModal.isOpen}
				onClose={() => setImageModal({ ...imageModal, isOpen: false })}
				src={imageModal.src}
				alt={imageModal.alt}
				title={imageModal.title}
			/>
		</>
	);
}
