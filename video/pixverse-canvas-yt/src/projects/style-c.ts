import {makeProject} from '@revideo/core';
// Style sample — loads the headphones theme for its media, then the sample scene.
import '../headphones/theme';
import scene from '../styles/c-spec';
import {loadFonts, settings} from './settings';
import '../global.css';

await loadFonts();

export default makeProject({name: 'style-c', scenes: [scene], settings} as any);
