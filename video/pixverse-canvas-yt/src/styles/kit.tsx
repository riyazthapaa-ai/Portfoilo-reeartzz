// Editorial / "studio viewfinder" style kit for the headphones video.
//
// Same component API as ../lib so the scenes keep their structure and cue
// timing, but a different look: wide-tracked sans with serif-italic accents,
// soft fade-and-settle reveals (no bounce), hairline cards with corner ticks,
// light-sweep transitions and a camera HUD overlay.
import {Circle, Gradient, Layout, Line, Node, Rect, Txt, blur} from '@revideo/2d';
import type {View2D} from '@revideo/2d';
import {all, createRef, easeInOutCubic, easeInOutSine, easeOutCubic, linear, loop, spawn, useTime, waitFor} from '@revideo/core';
import type {Reference, ThreadGenerator} from '@revideo/core';
import {C, H, W} from '../lib';

export {C, Clip, cue, DotGrid, draw, H, Letterbox, MONO, W} from '../lib';

export const HEAD = 'Inter';
export const BODY = 'Inter';
export const SERIF = 'Instrument Serif';

const HAIR = 'rgba(255,255,255,0.28)';
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s-])\S/g, m => m.toUpperCase());

// ---------------------------------------------------------------------------
// Backdrop: black studio with a slow overhead key light and a floor glow.
// ---------------------------------------------------------------------------
export function Backdrop(view: View2D) {
  const key = createRef<Rect>();
  view.add(
    <Node>
      <Rect width={W} height={H} fill={C.bg} />
      <Rect
        ref={key}
        width={W * 1.6}
        height={H * 1.6}
        fill={
          new Gradient({
            type: 'radial',
            from: [0, -620],
            to: [0, -620],
            fromRadius: 0,
            toRadius: 1150,
            stops: [
              {offset: 0, color: 'rgba(255,244,226,0.13)'},
              {offset: 1, color: 'rgba(255,244,226,0)'},
            ],
          })
        }
      />
      <Rect
        width={W}
        height={H}
        fill={
          new Gradient({
            type: 'linear',
            from: [0, H / 2],
            to: [0, H / 6],
            stops: [
              {offset: 0, color: 'rgba(216,189,138,0.07)'},
              {offset: 1, color: 'rgba(216,189,138,0)'},
            ],
          })
        }
      />
      {/* faint horizon line */}
      <Rect width={W} height={1} y={H * 0.28} fill={'rgba(255,255,255,0.05)'} />
    </Node>,
  );
  spawn(loop(Infinity, () => key().x(260, 9, easeInOutSine).to(-260, 9, easeInOutSine)));
}

// ---------------------------------------------------------------------------
// Vignette + camera HUD (always on top).
// ---------------------------------------------------------------------------
export function Vignette(view: View2D) {
  view.add(
    <Rect
      width={W}
      height={H}
      fill={
        new Gradient({
          type: 'radial',
          from: [0, 0],
          to: [0, 0],
          fromRadius: 560,
          toRadius: 1250,
          stops: [
            {offset: 0, color: 'rgba(0,0,0,0)'},
            {offset: 1, color: 'rgba(0,0,0,0.85)'},
          ],
        })
      }
    />,
  );
  Hud(view);
}

function Hud(view: View2D) {
  const m = 46;
  const L = 44;
  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  const tc = createRef<Txt>();
  const rec = createRef<Circle>();
  view.add(
    <Node opacity={0.7}>
      {corners.map(([sx, sy]) => (
        <Line
          points={[
            [sx * (W / 2 - m), sy * (H / 2 - m - L)],
            [sx * (W / 2 - m), sy * (H / 2 - m)],
            [sx * (W / 2 - m - L), sy * (H / 2 - m)],
          ]}
          stroke={'rgba(255,255,255,0.6)'}
          lineWidth={2}
        />
      ))}
      <Circle ref={rec} x={-W / 2 + m + 18} y={-H / 2 + m + 34} size={12} fill={C.red} />
      <Txt x={-W / 2 + m + 34} y={-H / 2 + m + 34} offset={[-1, 0]} text={'REC   PIXVERSE CANVAS · PRODUCT AD'} fontFamily={'JetBrains Mono'} fontSize={18} letterSpacing={3} fill={'rgba(255,255,255,0.75)'} />
      <Txt ref={tc} x={W / 2 - m - 18} y={-H / 2 + m + 34} offset={[1, 0]} text={'00:00:00:00'} fontFamily={'JetBrains Mono'} fontSize={18} letterSpacing={3} fill={'rgba(255,255,255,0.75)'} />
      <Txt x={-W / 2 + m + 18} y={H / 2 - m - 30} offset={[-1, 0]} text={'LEX AI  ·  @LEXAI01'} fontFamily={'JetBrains Mono'} fontSize={16} letterSpacing={3} fill={'rgba(255,255,255,0.5)'} />
      <Txt x={W / 2 - m - 18} y={H / 2 - m - 30} offset={[1, 0]} text={'1920×1080  ·  30P  ·  ƒ/1.8'} fontFamily={'JetBrains Mono'} fontSize={16} letterSpacing={3} fill={'rgba(255,255,255,0.5)'} />
    </Node>,
  );
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
  spawn(
    loop(Infinity, function* () {
      const t = useTime();
      tc().text(`00:${pad(t / 60)}:${pad(t % 60)}:${pad((t % 1) * 30)}`);
      rec().opacity(Math.floor(t * 1.5) % 2 ? 0.25 : 1);
      yield;
    }),
  );
}

// ---------------------------------------------------------------------------
// Transition: a diagonal light sweep across the frame (replaces white flash).
// ---------------------------------------------------------------------------
export function Flash(view: View2D) {
  const bar = createRef<Rect>();
  view.add(
    <Rect
      ref={bar}
      x={-1500}
      rotation={14}
      width={520}
      height={H * 1.6}
      opacity={0}
      fill={
        new Gradient({
          type: 'linear',
          from: [-260, 0],
          to: [260, 0],
          stops: [
            {offset: 0, color: 'rgba(255,246,230,0)'},
            {offset: 0.5, color: 'rgba(255,246,230,0.55)'},
            {offset: 1, color: 'rgba(255,246,230,0)'},
          ],
        })
      }
    />,
  );
  return function* (strength = 0.85, _dur = 0.35): ThreadGenerator {
    bar().x(-1500).opacity(Math.min(1, strength + 0.3));
    yield* bar().x(1500, 0.6, easeInOutCubic);
    bar().opacity(0);
  };
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export type Word = string | {t: string; hl?: string; box?: boolean};

/**
 * Words: plain words are wide-tracked sans caps; highlighted words become
 * serif italics in title case; "boxed" words get a serif italic with an
 * underline that draws in.
 */
export function KLine({
  words,
  size = 96,
  weight = 900,
  color = C.text,
  refs,
  gap,
  family,
}: {
  words: Word[];
  size?: number;
  weight?: number;
  color?: string;
  refs: Rect[];
  gap?: number;
  italic?: boolean;
  family?: string;
}) {
  const s = size * 0.78;
  // A family override marks a soft sub-line: set it in serif italics.
  const body = family !== undefined;
  return (
    <Layout layout direction={'row'} gap={gap ?? s * 0.34} alignItems={'end'}>
      {words.map(w => {
        const o = typeof w === 'string' ? {t: w} : w;
        const accent = o.hl !== undefined || o.box;
        return (
          <Rect ref={n => n && refs.push(n)} layout direction={'column'} alignItems={'center'} gap={s * 0.02} opacity={0} scale={1.08}>
            {accent ? (
              <Txt
                text={titleCase(o.t)}
                fontFamily={SERIF}
                fontStyle={'italic'}
                fontWeight={400}
                fontSize={s * 1.32}
                lineHeight={s * 1.3}
                fill={o.box ? C.text : o.hl === C.red ? C.red : o.hl === C.dim ? C.dim : C.amber}
                shadowBlur={24}
                shadowColor={'rgba(0,0,0,0.85)'}
              />
            ) : (
              <Txt
                text={body ? o.t : o.t.toUpperCase()}
                fontFamily={body ? SERIF : HEAD}
                fontStyle={body ? 'italic' : 'normal'}
                fontWeight={body ? 400 : weight >= 800 ? 600 : 500}
                fontSize={body ? size * 1.15 : s}
                letterSpacing={body ? 0.5 : s * 0.09}
                lineHeight={s * 1.3}
                fill={color}
                shadowBlur={24}
                shadowColor={'rgba(0,0,0,0.85)'}
              />
            )}
            {o.box ? <Rect width={0} height={Math.max(3, s * 0.035)} fill={o.hl ?? C.amber} /> : null}
          </Rect>
        );
      })}
    </Layout>
  );
}

export function* revealWords(words: Rect[], stagger = 0.07, dur = 0.45): ThreadGenerator {
  const d = dur * 1.3;
  for (const w of words) {
    w.filters([blur(10)]);
    const underline = w.children()[1] as Rect | undefined;
    spawn(
      all(
        w.opacity(1, d * 0.7, easeOutCubic),
        w.scale(1, d, easeOutCubic),
        w.filters.blur(0, d, easeOutCubic),
        underline ? underline.width(w.children()[0].size().x * 1.04, d * 1.2, easeInOutCubic) : waitFor(0),
      ),
    );
    yield* waitFor(stagger);
  }
  yield* waitFor(Math.max(0, d - stagger));
}

export function* hideWords(words: Rect[], dur = 0.25): ThreadGenerator {
  yield* all(...words.map(w => all(w.opacity(0, dur), w.scale(0.97, dur))));
}

/** "— LABEL" caption with a short rule. */
export function Eyebrow({text, color = C.amber, refNode, size = 30}: {text: string; color?: string; refNode?: Reference<Rect>; size?: number}) {
  return (
    <Rect ref={refNode} layout direction={'row'} alignItems={'center'} gap={18} opacity={0}>
      <Rect width={56} height={2} fill={color} />
      <Txt text={text} fontFamily={'JetBrains Mono'} fontWeight={500} fontSize={size * 0.78} letterSpacing={size * 0.26} fill={C.text} />
    </Rect>
  );
}

/** Square-cornered outlined tag. */
export function Chip({
  text,
  refNode,
  color = C.text,
  bg,
  stroke,
  size = 36,
  icon,
  iconColor = C.amber,
}: {
  text: string;
  refNode?: Reference<Rect> | ((r: Rect) => void);
  color?: string;
  bg?: string;
  stroke?: string;
  size?: number;
  icon?: string;
  iconColor?: string;
}) {
  return (
    <Rect
      ref={refNode as any}
      layout
      direction={'row'}
      alignItems={'center'}
      gap={16}
      padding={[size * 0.4, size * 0.7]}
      radius={3}
      fill={bg ?? 'rgba(255,255,255,0.03)'}
      stroke={stroke ?? 'rgba(255,255,255,0.4)'}
      lineWidth={1.5}
      opacity={0}
      scale={0.96}
    >
      {icon ? <Txt text={icon} fontFamily={'JetBrains Mono'} fontSize={size * 0.7} fill={iconColor} /> : null}
      <Txt text={text.toUpperCase()} fontFamily={HEAD} fontWeight={500} fontSize={size * 0.72} letterSpacing={size * 0.14} fill={color} />
    </Rect>
  );
}

export function* pop(node: Node, dur = 0.5, to = 1): ThreadGenerator {
  yield* all(node.opacity(1, dur * 0.8, easeOutCubic), node.scale(to, dur * 1.1, easeOutCubic));
}

export function* unpop(node: Node, dur = 0.3): ThreadGenerator {
  yield* all(node.opacity(0, dur), node.scale(0.97, dur, easeInOutCubic));
}

/** Hairline card with viewfinder corner ticks. */
export function Card({
  refNode,
  width,
  height,
  children,
  x = 0,
  y = 0,
  opacity = 1,
  scale = 1,
  rotation = 0,
}: {
  refNode?: Reference<Rect> | ((r: Rect) => void);
  width: number;
  height: number;
  children?: any;
  glow?: string;
  radius?: number;
  x?: number;
  y?: number;
  opacity?: number;
  scale?: number;
  rotation?: number;
}) {
  const t = Math.min(30, Math.min(width, height) * 0.12);
  const hw = width / 2 - 10;
  const hh = height / 2 - 10;
  const ticks: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <Rect
      ref={refNode as any}
      width={width}
      height={height}
      x={x}
      y={y}
      radius={4}
      clip
      fill={C.panel}
      stroke={HAIR}
      lineWidth={1.5}
      shadowBlur={60}
      shadowColor={'rgba(0,0,0,0.75)'}
      opacity={opacity}
      scale={scale}
      rotation={rotation}
    >
      {children}
      {ticks.map(([sx, sy]) => (
        <Line
          points={[
            [sx * hw, sy * (hh - t)],
            [sx * hw, sy * hh],
            [sx * (hw - t), sy * hh],
          ]}
          stroke={C.amber}
          lineWidth={2}
        />
      ))}
    </Rect>
  );
}

/** Thin arrow that draws itself. */
export function Arrow({
  refNode,
  from,
  to,
  color = C.amber,
  width = 6,
  dashed = false,
}: {
  refNode: Reference<Line>;
  from: [number, number];
  to: [number, number];
  color?: string;
  width?: number;
  dashed?: boolean;
}) {
  const lw = Math.max(2, width * 0.4);
  return <Line ref={refNode} points={[from, to]} stroke={color} lineWidth={lw} endArrow arrowSize={lw * 4.5} lineDash={dashed ? [10, 10] : undefined} end={0} />;
}
