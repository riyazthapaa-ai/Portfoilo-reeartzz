import {makeProject} from '@revideo/core';
import scene from '../scenes/hook';
import {loadFonts, settings} from './settings';
import '../global.css';

// Text is measured on first layout, so the webfonts must be ready before it.
await loadFonts();

export default makeProject({name: 'hook', scenes: [scene], settings} as any);
