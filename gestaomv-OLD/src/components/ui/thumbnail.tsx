'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Image as ImageIcon } from 'lucide-react';

interface ThumbnailProps {
  src?: string | null;
  alt: string;
  size?: 'small' | 'medium' | 'large' | number;
  fallbackIcon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const sizeMap = {
  small: 32,
  medium: 40,
  large: 48,
};

const roundedMap = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Thumbnail({
  src,
  alt,
  size = 'medium',
  fallbackIcon: FallbackIcon = ImageIcon,
  onClick,
  className,
  rounded = 'md',
}: ThumbnailProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!src);
  const [error, setError] = useState(false);

  // Determinar tamanho em pixels
  const sizeInPx = typeof size === 'number' ? size : sizeMap[size];

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setImageSrc(null);
      setError(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Se a imagem já é uma URL completa, usar diretamente
        if (src.startsWith('http') || src.startsWith('data:')) {
          setImageSrc(src);
          setIsLoading(false);
          return;
        }

        // Para imagens do nosso endpoint proxy, fazer fetch com token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError(true);
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
          setIsLoading(false);
          return;
        }

        // Converter resposta para blob URL
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageSrc(blobUrl);
        setIsLoading(false);

        // Limpar blob URL quando componente for desmontado
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      } catch (err) {
        console.error('Erro ao carregar thumbnail:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    loadImage();
  }, [src]);

  const containerClasses = cn(
    'flex items-center justify-center overflow-hidden bg-muted border border-border',
    roundedMap[rounded],
    {
      'cursor-pointer hover:opacity-80 transition-opacity': onClick,
      'animate-pulse': isLoading,
    },
    className,
  );

  const containerStyle = {
    width: sizeInPx,
    height: sizeInPx,
    minWidth: sizeInPx,
    minHeight: sizeInPx,
  };

  // Estado de loading
  if (isLoading) {
    return (
      <div className={containerClasses} style={containerStyle} onClick={onClick}>
        <div className="w-full h-full bg-muted-foreground/20" />
      </div>
    );
  }

  // Estado de erro ou sem imagem
  if (error || !imageSrc) {
    return (
      <div className={containerClasses} style={containerStyle} onClick={onClick} title={alt}>
        <FallbackIcon className="text-muted-foreground" size={Math.max(16, sizeInPx * 0.4)} />
      </div>
    );
  }

  // Imagem carregada com sucesso
  return (
    <div className={containerClasses} style={containerStyle} onClick={onClick} title={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />
    </div>
  );
}
