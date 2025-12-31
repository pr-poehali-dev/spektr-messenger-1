import { useState } from 'react';
import { MediaAttachment } from '@/types/chat';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MediaMessageProps {
  media: MediaAttachment;
}

export default function MediaMessage({ media }: MediaMessageProps) {
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (media.type === 'image') {
    return (
      <>
        <div
          className="relative group cursor-pointer rounded-lg overflow-hidden max-w-xs"
          onClick={() => setShowPreview(true)}
        >
          <img
            src={media.url}
            alt={media.name || 'Изображение'}
            className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <Icon name="Maximize2" className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
          </div>
        </div>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl p-0 bg-black/90">
            <img
              src={media.url}
              alt={media.name || 'Изображение'}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (media.type === 'video') {
    return (
      <div className="relative rounded-lg overflow-hidden max-w-md">
        <video
          src={media.url}
          controls
          className="w-full h-auto"
          preload="metadata"
        >
          Ваш браузер не поддерживает видео.
        </video>
      </div>
    );
  }

  if (media.type === 'document') {
    return (
      <a
        href={media.url}
        download={media.name}
        className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors max-w-xs"
      >
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="FileText" size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{media.name || 'Документ'}</p>
          {media.size && (
            <p className="text-xs text-muted-foreground">{formatFileSize(media.size)}</p>
          )}
        </div>
        <Icon name="Download" size={20} className="text-muted-foreground flex-shrink-0" />
      </a>
    );
  }

  return null;
}
