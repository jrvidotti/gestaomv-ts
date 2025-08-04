'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { AuthenticatedImage } from './authenticated-image';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ImageModal({ src, alt, isOpen, onClose, title }: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Reset state when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setIsLoading(true);
      setHasError(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {title && (
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-center">{title}</DialogTitle>
          </DialogHeader>
        )}

        <div className="relative flex items-center justify-center p-6 pt-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando imagem...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <div>
                  <p className="font-medium">Não foi possível carregar a imagem</p>
                  <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente</p>
                </div>
              </div>
            </div>
          )}

          {/* Image */}
          <div
            className={`relative max-w-full max-h-[70vh] ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            style={{
              minHeight: isLoading ? '400px' : 'auto',
              position: isLoading ? 'absolute' : 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src.startsWith('http') || src.startsWith('data:') ? src : `/api/images/${src}`}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '70vh',
              }}
            />
          </div>
        </div>

        {/* Image Info */}
        <div className="px-6 pb-6 pt-0">
          <div className="flex justify-center">
            <p className="text-xs text-muted-foreground">{alt} • Clique fora da imagem ou pressione ESC para fechar</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
