'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { useUpload } from '@/hooks/use-upload';
import { Upload, X, Image as ImageIcon, Loader2, ZoomIn } from 'lucide-react';
import { Progress } from './progress';
import { AuthenticatedImage } from './authenticated-image';
import { ImageModal } from './image-modal';

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Clique ou arraste uma imagem aqui',
  maxSizeInMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, progress, uploadFile } = useUpload({
    maxSizeInMB,
    acceptedTypes,
    onSuccess: (url) => {
      onChange(url);
    },
  });

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled || isUploading) return;

      const file = files[0];
      uploadFile(file);
    },
    [disabled, isUploading, uploadFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !isUploading) {
        setIsDragOver(true);
      }
    },
    [disabled, isUploading],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled && !isUploading) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [disabled, isUploading, handleFileSelect],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled && !isUploading) {
        onChange(null);
      }
    },
    [disabled, isUploading, onChange],
  );

  const isDisabled = disabled || isUploading;
  const hasImage = Boolean(value);

  return (
    <div className={cn('flex flex-row gap-2', className)}>
      {/* Preview da imagem atual */}
      {hasImage ? (
        <div className="relative inline-block group">
          <div
            className="relative w-32 h-32 rounded-lg overflow-hidden border border-border cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => setIsModalOpen(true)}
            title="Clique para visualizar em tamanho grande"
          >
            <AuthenticatedImage src={value!} alt="Preview da imagem" fill className="object-cover" sizes="128px" />

            {/* Overlay com ícone de zoom */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Botão remover */}
          {!isDisabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(e);
              }}
              title="Remover imagem"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
            'hover:border-primary/50 hover:bg-accent/50',
            {
              'border-primary bg-accent/50': isDragOver,
              'border-muted-foreground/25': !isDragOver,
              'opacity-50 cursor-not-allowed': isDisabled,
              'border-destructive': required && !hasImage,
            },
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isDisabled}
          />

          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-2 w-full max-w-xs">
                  <p className="text-sm text-muted-foreground">Fazendo upload... {progress}%</p>
                  <Progress value={progress} className="h-2" />
                </div>
              </>
            ) : (
              <>
                {hasImage ? (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}

                <div className="space-y-1">
                  <p className="text-sm font-medium">{hasImage ? 'Alterar imagem' : placeholder}</p>
                  <p className="text-xs text-muted-foreground">
                    {acceptedTypes.map((type) => type.split('/')[1]).join(', ')} até {maxSizeInMB}MB
                  </p>
                  {required && !hasImage && <p className="text-xs text-destructive">Campo obrigatório</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de visualização */}
      {hasImage && (
        <ImageModal
          src={value!}
          alt="Preview da imagem"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Visualizar Imagem"
        />
      )}
    </div>
  );
}
