import {makeProject} from '@revideo/core';
// The theme must load first: it swaps the palette and media for this video.
import '../headphones/theme';
import scene from '../headphones/intro';
import {loadFonts, settings} from './settings';
import '../global.css';

await loadFonts();

export default makeProject({name: 'hp-intro', scenes: [scene], settings} as any);
