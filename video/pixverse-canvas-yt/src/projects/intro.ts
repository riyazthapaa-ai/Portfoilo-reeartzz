import {makeProject} from '@revideo/core';
import scene from '../scenes/intro';
import {loadFonts, settings} from './settings';
import '../global.css';

// Text is measured on first layout, so the webfonts must be ready before it.
await loadFonts();

export default makeProject({name: 'intro', scenes: [scene], settings} as any);
