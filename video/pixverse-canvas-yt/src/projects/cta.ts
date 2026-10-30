import {makeProject} from '@revideo/core';
import scene from '../scenes/cta';
import {loadFonts, settings} from './settings';
import '../global.css';

// Text is measured on first layout, so the webfonts must be ready before it.
await loadFonts();

export default makeProject({name: 'cta', scenes: [scene], settings} as any);
