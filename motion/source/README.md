# Reartz motion intro: source

`render.html` draws each frame on a canvas. `rend.js` steps through the frames in headless Chromium and saves them as JPEGs.

To re-render, copy `assets/art*.png` next to `render.html`, then:

```sh
python3 -m http.server 8765 &          # run inside motion/source
node rend.js frames
ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 ../reartz-motion-intro.mp4
```
