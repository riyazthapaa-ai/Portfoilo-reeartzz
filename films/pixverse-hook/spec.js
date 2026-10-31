// spec.js: the hook of the "one image to a full product ad" video, as kinetic type over the voiceover.
// 150 BPM grid (1 beat = 0.4 s) so beat = seconds x 2.5; every shot lands on the word as it is spoken
// (word times from a forced alignment of the script to audio/vo.wav). Blocks and options: references/blocks.md.
import { Words, Strike, Hero, Logo } from './blocks.js';

export default {
  title: 'One Image Hook',
  bpm: 150, beats: 87, fps: 60,
  palette: { bg: '#0A0A12', paper: '#F4F1EA', accent: '#8B6CFF', hot: '#FF4FD8', ink: '#12111A' },
  hud: 'ONE IMAGE  ·  PRODUCT AD', hudOut: [84, 86],
  music: { file: 'audio/vo.wav', offset: 0, gain: 0 },   // the voiceover plays in preview; the final mix is made in mix_vo.sh
  sounds: {},
  cues: [],

  scenes: [
    // "This entire product advertisement started with just one image."  (0.0 - 3.7 s)
    [Words, 0, 8.6, { shots: [
      { at: 0, style: 'punch3d', text: 'THIS ENTIRE', fx: 'punch' },
      { at: 1.45, style: 'slam', text: 'PRODUCT AD', ground: 'accent', in: 'whipY', fx: 'hit' },
      { at: 4.5, style: 'pair', text: ['STARTED WITH', 'JUST'], ground: 'paper', second: 1.5, fx: 'beat' },
      { at: 6.85, style: 'split', text: ['ONE', 'IMAGE.'], second: .95, in: 'whipX', fx: 'punch', big: true },
    ] }],
    // "No camera setup, no physical studio, and no complicated ..."  (NO at 3.83, 4.85, 6.11 s)
    [Strike, 8.6, 17.2, { no: 'NO', tvOff: false, items: [
      { at: 8.6, word: 'CAMERA.', ui: { type: 'tiles', tiles: [['CAM A', '●', '50MM'], ['CAM B', '●', '85MM'], ['SLIDER', '▬', 'RIG'], ['TRIPOD', '▲', 'SETUP']] } },
      { at: 11.1, word: 'STUDIO.', ground: 'paper', ui: { type: 'rack', rows: ['SOFTBOX  ·  KEY', 'SOFTBOX  ·  FILL', 'BACKDROP  ·  SEAMLESS'] } },
      { at: 14.3, word: 'COMPLICATED', ui: { type: 'timeline', title: 'product_ad_FINAL_v12', tag: 'EXPORTING  3%' } },
    ] }],
    // "... production process."  (6.93, 7.44 s)
    [Words, 17.2, 20.7, { shots: [
      { at: 17.2, style: 'stack', text: ['PRODUCTION', 'PROCESS.'], ground: 'accent', second: 1.4, in: 'whipY', fx: 'hit' },
    ] }],
    // "I started with a product photo and used AI to turn it into a complete visual concept,"  (8.3 - 13.1 s)
    [Words, 20.7, 33.2, { shots: [
      { at: 20.7, style: 'pair', text: ['I STARTED WITH', 'A PRODUCT PHOTO.'], second: 2, fx: 'beat' },
      { at: 25.2, style: 'cut', text: 'USED', ground: 'paper', size: 420, rot: -3, fx: 'beat' },
      { at: 26.15, style: 'slam', text: 'AI.', ground: 'accent', fx: 'punch', big: true },
      { at: 27.15, style: 'cut', text: 'TO TURN IT', size: 300, rot: 2, fx: 'beat' },
      { at: 29.1, style: 'cut', text: 'A COMPLETE', ground: 'paper', size: 320, rot: -2, fx: 'beat' },
      { at: 30.2, style: 'stack', text: ['VISUAL', 'CONCEPT.'], second: 1.3, in: 'whipX', fx: 'hit' },
    ] }],
    // "generate new scenes, and bring everything together into a finished video."  (13.35 - 17.3 s)
    [Words, 33.2, 44.6, { shots: [
      { at: 33.2, style: 'slam', text: 'GENERATE', ground: 'paper', in: 'whipY', fx: 'hit' },
      { at: 34.45, style: 'cut', text: 'NEW SCENES.', ground: 'accent', size: 380, rot: 3, fx: 'beat' },
      { at: 36.5, style: 'pair', text: ['BRING', 'EVERYTHING'], second: .7, fx: 'beat' },
      { at: 38.2, style: 'slam', text: 'TOGETHER.', ground: 'paper', in: 'whipX', fx: 'hit' },
      { at: 40.35, style: 'split', text: ['A FINISHED', 'VIDEO.'], second: 1.2, ground: 'accent', color: 'paper', in: 'whipY', fx: 'punch', big: true },
    ], exit: { type: 'zoom', at: 43.6, char: 4 } }],
    // "And the interesting part is that I can do this ..."  (17.86 - 19.9 s)
    [Words, 44.6, 49.2, { shots: [
      { at: 44.6, style: 'stack', text: ['THE INTERESTING', 'PART?'], second: 1.6, fx: 'beat' },
      { at: 47.9, style: 'pair', text: ['I CAN DO', 'THIS'], ground: 'paper', second: .7, in: 'whipX', fx: 'beat' },
    ] }],
    // "... inside PixVerse Canvas, a creative workspace"  (19.93 - 22.5 s)
    [Hero, 49.2, 57.2, { kicker: 'INSIDE', title: 'PIXVERSE', sub: 'Canvas  ·  a creative workspace', whipOut: [0, 1150, .13] }],
    // "that brings AI image generation, video creation, and editing together."  (22.8 - 26.4 s): a run of cuts
    [Words, 57.2, 66.6, { shots: [
      { at: 57.2, style: 'cut', text: 'AI', color: 'accent', size: 620, fx: 'beat' },
      { at: 58.85, style: 'cut', text: 'IMAGE', ground: 'paper', size: 520, rot: -3, fx: 'beat' },
      { at: 59.75, style: 'cut', text: 'GENERATION.', size: 300, rot: 2, fx: 'beat' },
      { at: 61.15, style: 'cut', text: 'VIDEO', ground: 'accent', size: 540, rot: 3, fx: 'beat' },
      { at: 62.0, style: 'cut', text: 'CREATION.', ground: 'paper', size: 360, rot: -2, fx: 'beat' },
      { at: 63.9, style: 'cut', text: 'EDITING.', size: 420, rot: -3, rgb: true, fx: 'beat' },
      { at: 64.75, style: 'slam', text: 'TOGETHER.', ground: 'accent', fx: 'punch', big: true },
    ], exit: { type: 'flash', at: 66.3 } }],
    // "Let me show you the complete workflow, from the original image to the final advertisement."  (26.86 - 31.45 s)
    [Words, 66.6, 78.8, { shots: [
      { at: 66.9, style: 'pair', text: ['LET ME', 'SHOW YOU'], ground: 'paper', second: .9, fx: 'beat' },
      { at: 68.9, style: 'cut', text: 'THE COMPLETE', size: 320, rot: 2, fx: 'beat' },
      { at: 69.8, style: 'split', text: ['THE', 'WORKFLOW.'], second: .5, ground: 'accent', color: 'paper', in: 'whipX', fx: 'punch', big: true },
      { at: 71.6, style: 'stack', text: ['FROM THE ORIGINAL', 'IMAGE'], second: 2.2, in: 'whipY', fx: 'hit' },
      { at: 75.2, style: 'cut', text: 'TO THE FINAL', ground: 'paper', size: 330, rot: -2, fx: 'beat' },
      { at: 76.4, style: 'slam', text: 'ADVERTISEMENT.', ground: 'accent', color: 'paper', in: 'whipY', fx: 'punch', big: true },
    ] }],
    // the voiceover ends at 31.45 s: the end card lands on the next beat
    [Logo, 78.8, 87, { wordmark: 'ONE IMAGE → AD.', tagline: 'From the original image to the final advertisement.', small: 'THE COMPLETE WORKFLOW  ·  PIXVERSE CANVAS' }],
  ],
  captions: [],
};
