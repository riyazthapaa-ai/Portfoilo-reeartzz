import type {ProjectSettings} from '@revideo/core';

// DRAFT=1 renders a quick low-res, low-fps preview (see render.mjs).
declare const __DRAFT__: boolean;
const draft = typeof __DRAFT__ !== 'undefined' && __DRAFT__;

export const settings: Partial<ProjectSettings> = {
  shared: {
    background: '#05060c',
    range: [0, Infinity],
    size: {x: 1920, y: 1080},
  },
  preview: {fps: 30, resolutionScale: 0.5},
  rendering: {
    exporter: {name: '@revideo/core/ffmpeg', options: {format: 'mp4'}},
    fps: draft ? 10 : 30,
    resolutionScale: draft ? 0.5 : 1,
    colorSpace: 'srgb',
  },
} as any;

export function loadFonts() {
  return Promise.all(
    [
      '600 32px Barlow',
      '800 32px Barlow',
      '900 32px Barlow',
      'italic 800 32px Barlow',
      '400 32px Inter',
      '600 32px Inter',
      '500 32px "JetBrains Mono"',
    ].map(f => document.fonts.load(f)),
  );
}
