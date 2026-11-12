# SPEC — "Beyond the Frame"

A 30-second futuristic motion-graphics film on the relationship between **creativity** and **technology**.
Visual only: no narration, no TTS, no soundtrack.

## Deliverable

| Property | Value |
| --- | --- |
| File | `out/final.mp4` |
| Duration | 30.00 s (900 frames) |
| Resolution / rate | 1920 × 1080, 30 fps, progressive |
| Codec | H.264 High, yuv420p, CRF 20, `-tune grain`, `+faststart` (≈16 MB) |
| Audio | none (visual-only piece by brief) |
| Source | `beyond-the-frame/` (film page `index.html`, renderer `render.mjs`) |

## Method

The film is code. `beyond-the-frame/index.html` draws every frame on a 2D canvas as a **pure function of
time** `draw(t)`: no `Math.random`, no clock, no state carried between frames (particles come from a
seeded hash). That lets the renderer seek to any instant, render frames out of order across workers, and
average sub-frames for real motion blur.

Per frame: 3 sub-frame samples across a 180° shutter → accumulated → **bloom** (two blurred additive
passes of the bright layer) → vignette. Film grain (`noise=alls=2:allf=t`) is added once at encode time in
ffmpeg.

## Look

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#04050A` → `#0A0D18` radial | the void; never pure black, never flat |
| `ink` | `#EEF1F8` | primary type |
| `dim` | `#7C8499` | secondary labels, mono captions |
| `cyan` | `#5BE7FF` | technology: grids, precise lines |
| `violet` | `#8E6BFF` | the bridge between the two |
| `rose` | `#FF5FA8` | creativity: curves, organic flow |

Typography: **Inter Display** (Thin 100 → Black 900) for headlines; **JetBrains Mono** for small
technical captions (coordinates, labels, chapter numbers). Hierarchy per scene: one hero word, one
label, one quiet mono line. Nothing else competes.

Motion rules: ease-out-expo for entrances, ease-in-out-cubic for camera; the camera always drifts
(slow push + sub-degree roll), so no frame parks; transitions are **moves** (a line, a frame rotating
through camera, a collapse to a point), not cross-fades.

## Beat sheet

| # | Time | Scene | What happens |
| --- | --- | --- | --- |
| 1 | 0.0 – 3.0 | **Void** | Dark minimal ground. Fine dust fades in. A single point of light ignites at centre (0.35 s) with a soft halo ring, then stretches into a glowing horizon line across the frame, glints travelling along it. |
| 2 | 3.0 – 8.5 | **Title** | The line traces a rectangular frame. `BEYOND` (Black) and `FRAME` (Black) rise letter-by-letter from behind masks; `THE` sets in Thin between them. Tracking tightens from wide to set. Mono caption `CREATIVITY × TECHNOLOGY` types on. At 6.6 s the type scales up *past* the frame border while the border stays put — the title literally goes beyond the frame. |
| 3 | 8.5 – 9.6 | **Transition** | The frame rotates 45° and flies through camera; its edge sweeps the screen into scene 4. |
| 4 | 9.6 – 14.4 | **Creativity** | Warm rose/violet. Particles stream along flowing sine-field curves; a comet draws a perfect circle; concentric arcs breathe. Hero word `CREATIVITY` (Light, wide tracking), label `01 — IMAGINATION`. |
| 5 | 14.4 – 19.2 | **Technology** | Cool cyan. A perspective grid scrolls toward camera; concentric squares lock in; nodes connect along a lattice with travelling pulses. Hero word `TECHNOLOGY` (Bold), label `02 — PRECISION`. Transition into it is a horizontal light wipe. |
| 6 | 19.2 – 24.6 | **Convergence** | The circle (creativity) and the square (technology) slide in from opposite sides and overlap; a superellipse morphs between them; rotating triangle and ring orbits; rose and cyan particles swirl into one violet vortex. Hero line `WHERE THEY MEET` (SemiBold), label `03 — SYNTHESIS`. |
| 7 | 24.6 – 25.6 | **Collapse** | Everything collapses into the central point; a flash ring expands. |
| 8 | 25.6 – 30.0 | **End card** | A frame expands from the point. `BEYOND THE FRAME` resolves on one line, letters blurred-in from depth; the words overrun the frame's side borders; a light sweep crosses the type; dust settles. The final frame holds the words "Beyond the Frame". |

## Acceptance checks (see VERIFY.md)

1. `ffprobe`: 1920×1080, 30 fps, 900 frames, 30.0 s ± 1 frame, h264/yuv420p, no audio stream.
2. First frame is dark/minimal (mean luma < 12).
3. Title "BEYOND THE FRAME" readable in the 4–8 s window and in the final frame.
4. No frozen stretch longer than 0.7 s before the end card (frame-difference scan, 99.9th-percentile local change).
5. No pure-black or blown-white frames anywhere; no visual glitches on a contact sheet at 1 fps.
