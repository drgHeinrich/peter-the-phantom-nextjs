'use client';
import React from 'react';
import MuxPlayer from '@mux/mux-player-react';

interface MuxVideoPlayerProps {
  playbackId: string;
  token: string;
}

export function MuxVideoPlayer({ playbackId, token }: MuxVideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={{ playback: token }}
      streamType="on-demand"
      className="w-full h-full"
      style={
        {
          '--media-primary-color': 'var(--color-accent)',
          '--media-accent-color': '#ffffff',
        } as React.CSSProperties & Record<`--${string}`, string>
      }
    />
  );
}
