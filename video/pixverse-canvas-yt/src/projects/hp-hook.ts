import {makeProject} from '@revideo/core';
// The theme must load first: it swaps the palette and media for this video.
import '../headphones/theme';
import scene from '../headphones/hook';
import {loadFonts, settings} from './settings';
import '../global.css';

await loadFonts();

export default makeProject({name: 'hp-hook', scenes: [scene], settings} as any);
