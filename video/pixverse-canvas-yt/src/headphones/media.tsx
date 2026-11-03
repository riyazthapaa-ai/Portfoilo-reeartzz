// Stills for the headphones ad. The finished video (public/hp/final.mp4) has
// burnt-in subtitles from 4.4–12.6s, so cards use these stills instead and
// only play the video outside that range.
import {Img} from '@revideo/2d';
import type {Reference} from '@revideo/core';
import {IMG} from './theme';

/** A still, cover-fitted into a w×h box. */
export function Pic({
  src,
  w,
  h,
  ar = 16 / 9,
  imgRef,
}: {
  src: string;
  w: number;
  h: number;
  ar?: number;
  imgRef?: Reference<Img>;
}) {
  const cw = Math.max(w, h * ar);
  return <Img ref={imgRef} src={src} width={cw} height={cw / ar} />;
}

/** The original product photo (white background). */
export function Product({w, h, imgRef}: {w: number; h: number; imgRef?: Reference<Img>}) {
  return <Pic src={IMG.original} w={w} h={h} ar={1672 / 941} imgRef={imgRef} />;
}

export const STILLS = [
  {src: IMG.hero, label: 'HERO SHOT'},
  {src: IMG.detail, label: 'CLOSE-UP'},
  {src: IMG.pedestal, label: 'WIDE SHOT'},
];

// Clean (subtitle-free) playback points in final.mp4.
export const PLAY = {hero: 0, wide: 12.7};
