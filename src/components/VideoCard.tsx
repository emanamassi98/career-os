import { useState } from 'react';
import { Play, X } from 'lucide-react';

export interface TopicVideo {
  youtubeId: string;
  title: string;
  channel: string;
  duration?: string;
}

export function VideoCard(video: TopicVideo) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {open ? (
        <div className="relative aspect-video bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button
            onClick={() => setOpen(false)}
            className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white hover:bg-black/80"
            aria-label="Close video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group relative aspect-video w-full bg-secondary transition-colors"
          aria-label={`Watch ${video.title}`}
        >
          <img
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-110">
              <Play className="h-5 w-5 fill-current" />
            </span>
          </span>
          {video.duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-xs text-white">
              {video.duration}
            </span>
          )}
        </button>
      )}
      <div className="p-3">
        <div className="line-clamp-2 text-sm font-medium">{video.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{video.channel}</div>
      </div>
    </div>
  );
}