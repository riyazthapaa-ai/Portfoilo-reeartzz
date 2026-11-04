import {makeProject} from '@revideo/core';
// Style sample — loads the headphones theme for its media, then the sample scene.
import '../headphones/theme';
import scene from '../styles/b-kinetic';
import {loadFonts, settings} from './settings';
import '../global.css';

await loadFonts();

export default makeProject({name: 'style-b', scenes: [scene], settings} as any);
