// Black / silver / champagne look for the premium headphones ad.
import {C, MEDIA, SHOT} from '../lib';

Object.assign(C, {
  bg: '#030304',
  panel: '#0c0d10',
  panel2: '#15171c',
  line: 'rgba(255,255,255,0.14)',
  text: '#f3f2ee',
  dim: '#9b9ea6',
  blue: '#8ea6c9',
  violet: '#b9bdc8',
  amber: '#d8bd8a',
  green: '#a8d5b9',
  red: '#ff5a5f',
});

Object.assign(MEDIA, {
  image: '/hp/original.jpg',
  imageAR: 1672 / 941,
  video: '/hp/final.mp4',
  videoAR: 1920 / 1072,
  glow: [0.07, 0.09, 0.06],
});

// Shots in final.mp4: hero 0–4.4, pedestal 4.4–8.2, detail 8.2–12.6, pedestal 12.6–16.8.
// The 4.4–12.6 range carries burnt-in subtitles, so stills use the source images instead.
Object.assign(SHOT, {wide: 1.5, notice: 2.5, approach: 13.5, reveal: 15.5});

export const IMG = {
  hero: '/hp/hero.jpg',
  detail: '/hp/detail.jpg',
  pedestal: '/hp/pedestal.jpg',
  original: '/hp/original.jpg',
};
