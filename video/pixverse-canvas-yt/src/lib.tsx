import {
  Circle,
  Gradient,
  Img,
  Layout,
  Line,
  Node,
  Rect,
  Txt,
  Video,
  blur,
} from '@revideo/2d';
import type {View2D} from '@revideo/2d';
import {
  all,
  createRef,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  easeOutExpo,
  loop,
  spawn,
  useTime,
  waitFor,
} from '@revideo/core';
import type {Reference, ThreadGenerator} from '@revideo/core';

// ---------------------------------------------------------------------------
// Design tokens — pulled from the reference image: blue/violet night city with
// a warm amber doorway as the single accent.
// ---------------------------------------------------------------------------
export const C = {
  bg: '#05060c',
  panel: '#0d1020',
  panel2: '#141833',
  line: 'rgba(255,255,255,0.14)',
  text: '#f6f2ea',
  dim: '#9ba4cc',
  blue: '#5b8cff',
  violet: '#a465ff',
  amber: '#ffb347',
  red: '#ff4d5e',
  green: '#4dffa6',
};

export const HEAD = 'Barlow';
export const BODY = 'Inter';
export const MONO = 'JetBrains Mono';

export const W = 1920;
export const H = 1080;

// Final video shot timestamps (seconds into final.mp4).
export const SHOT = {wide: 1.2, notice: 5.2, approach: 11.4, reveal: 16.2};

/** Wait until an absolute time (seconds since the start of the scene). */
export function* cue(t: number): ThreadGenerator {
  const d = t - useTime();
  if (d > 0) yield* waitFor(d);
}

/** Dark animated backdrop: drifting glows, faint dot grid and a vignette. */
export function Backdrop(view: View2D) {
  const g1 = createRef<Circle>();
  const g2 = createRef<Circle>();
  const g3 = createRef<Circle>();
  view.add(
    <Node>
      <Rect width={W} height={H} fill={C.bg} />
      <Circle
        ref={g1}
        size={900}
        x={-600}
        y={-250}
        fill={C.violet}
        opacity={0.22}
        filters={[blur(220)]}
      />
      <Circle
        ref={g2}
        size={1000}
        x={650}
        y={300}
        fill={C.blue}
        opacity={0.2}
        filters={[blur(240)]}
      />
      <Circle
        ref={g3}
        size={500}
        x={200}
        y={-380}
        fill={C.amber}
        opacity={0.08}
        filters={[blur(200)]}
      />
      <DotGrid opacity={0.35} />
    </Node>,
  );
  spawn(
    loop(Infinity, () =>
      all(
        g1().position([-450, -150], 7, easeInOutCubic).to([-600, -250], 7, easeInOutCubic),
        g2().position([520, 380], 6, easeInOutCubic).to([650, 300], 8, easeInOutCubic),
        g3().position([-100, -330], 7, easeInOutCubic).to([200, -380], 7, easeInOutCubic),
      ),
    ),
  );
}

export function DotGrid({opacity = 0.3, gap = 48}: {opacity?: number; gap?: number}) {
  const dots = [];
  for (let x = -W / 2 + gap / 2; x < W / 2; x += gap) {
    for (let y = -H / 2 + gap / 2; y < H / 2; y += gap) {
      dots.push(<Circle x={x} y={y} size={3} fill={'rgba(255,255,255,0.35)'} />);
    }
  }
  return <Node opacity={opacity}>{dots}</Node>;
}

/** Top-layer cinematic finish: vignette + letterbox-ish edge shading. */
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
          fromRadius: 520,
          toRadius: 1250,
          stops: [
            {offset: 0, color: 'rgba(0,0,0,0)'},
            {offset: 1, color: 'rgba(0,0,0,0.8)'},
          ],
        })
      }
    />,
  );
}

/** Full-bleed white flash used to punctuate hard cuts. */
export function Flash(view: View2D) {
  const r = createRef<Rect>();
  view.add(<Rect ref={r} width={W} height={H} fill={'#fff'} opacity={0} />);
  return function* (strength = 0.85, dur = 0.35): ThreadGenerator {
    r().opacity(strength);
    yield* r().opacity(0, dur, easeOutCubic);
  };
}

// ---------------------------------------------------------------------------
// Kinetic typography
// ---------------------------------------------------------------------------
export type Word = string | {t: string; hl?: string; box?: boolean};

/**
 * A line of words that reveal one by one. Highlighted words get an accent
 * colour, boxed words get a marker-swipe box behind them.
 */
export function KLine({
  words,
  size = 96,
  weight = 900,
  color = C.text,
  refs,
  gap,
  italic = false,
  family = HEAD,
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
  return (
    <Layout layout direction={'row'} gap={gap ?? size * 0.26} alignItems={'center'}>
      {words.map(w => {
        const o = typeof w === 'string' ? {t: w} : w;
        const box = o.box;
        return (
          <Rect
            ref={n => n && refs.push(n)}
            layout
            padding={box ? [size * 0.02, size * 0.18] : 0}
            radius={size * 0.12}
            fill={box ? o.hl ?? C.amber : null}
            opacity={0}
            scale={0.6}
          >
            <Txt
              text={o.t}
              fontFamily={family}
              fontWeight={weight}
              fontSize={size}
              fontStyle={italic ? 'italic' : 'normal'}
              letterSpacing={size * 0.01}
              fill={box ? C.bg : o.hl ?? color}
              lineHeight={size * 1.05}
              shadowBlur={box ? 0 : 28}
              shadowColor={'rgba(0,0,0,0.9)'}
            />
          </Rect>
        );
      })}
    </Layout>
  );
}

export function* revealWords(words: Rect[], stagger = 0.07, dur = 0.45): ThreadGenerator {
  for (const w of words) {
    w.filters([blur(14)]);
    spawn(
      all(
        w.opacity(1, dur * 0.6),
        w.scale(1, dur, easeOutBack),
        w.filters.blur(0, dur, easeOutCubic),
      ),
    );
    yield* waitFor(stagger);
  }
  yield* waitFor(Math.max(0, dur - stagger));
}

export function* hideWords(words: Rect[], dur = 0.25): ThreadGenerator {
  yield* all(...words.map(w => all(w.opacity(0, dur), w.scale(0.85, dur))));
}

/** Small uppercase label with a coloured dot. */
export function Eyebrow({
  text,
  color = C.amber,
  refNode,
  size = 30,
}: {
  text: string;
  color?: string;
  refNode?: Reference<Rect>;
  size?: number;
}) {
  return (
    <Rect
      ref={refNode}
      layout
      direction={'row'}
      alignItems={'center'}
      gap={14}
      padding={[12, 26]}
      radius={100}
      fill={'rgba(255,255,255,0.06)'}
      stroke={'rgba(255,255,255,0.18)'}
      lineWidth={2}
      opacity={0}
    >
      <Circle size={size * 0.42} fill={color} shadowBlur={20} shadowColor={color} />
      <Txt
        text={text}
        fontFamily={BODY}
        fontWeight={600}
        fontSize={size}
        letterSpacing={size * 0.12}
        fill={C.text}
      />
    </Rect>
  );
}

/** Pill / chip. */
export function Chip({
  text,
  refNode,
  color = C.text,
  bg = 'rgba(255,255,255,0.08)',
  stroke = 'rgba(255,255,255,0.2)',
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
      padding={[size * 0.45, size * 0.8]}
      radius={200}
      fill={bg}
      stroke={stroke}
      lineWidth={2}
      opacity={0}
      scale={0.7}
    >
      {icon ? (
        <Txt text={icon} fontFamily={BODY} fontWeight={600} fontSize={size} fill={iconColor} />
      ) : null}
      <Txt text={text} fontFamily={HEAD} fontWeight={800} fontSize={size} fill={color} letterSpacing={1} />
    </Rect>
  );
}

export function* pop(node: Node, dur = 0.5, to = 1): ThreadGenerator {
  yield* all(node.opacity(1, dur * 0.5), node.scale(to, dur, easeOutBack));
}

export function* unpop(node: Node, dur = 0.3): ThreadGenerator {
  yield* all(node.opacity(0, dur), node.scale(0.8, dur, easeInOutCubic));
}

// ---------------------------------------------------------------------------
// Media cards
// ---------------------------------------------------------------------------
/** Rounded, clipped card with a glow border. Children are the media. */
export function Card({
  refNode,
  width,
  height,
  children,
  glow = C.blue,
  radius = 28,
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
  return (
    <Rect
      ref={refNode as any}
      width={width}
      height={height}
      x={x}
      y={y}
      radius={radius}
      clip
      fill={C.panel}
      stroke={'rgba(255,255,255,0.22)'}
      lineWidth={3}
      shadowBlur={70}
      shadowColor={glow}
      opacity={opacity}
      scale={scale}
      rotation={rotation}
    >
      {children}
    </Rect>
  );
}

/** Reference still, cover-fitted into a box. */
export function RefImg({w, h, imgRef}: {w: number; h: number; imgRef?: Reference<Img>}) {
  const ar = 1672 / 941;
  const cw = Math.max(w, h * ar);
  return <Img ref={imgRef} src={'/reference.jpg'} width={cw} height={cw / ar} />;
}

/** A frozen frame (or playing clip) from the final video, cover-fitted. */
export function Clip({
  w,
  h,
  time,
  play = false,
  vidRef,
}: {
  w: number;
  h: number;
  time: number;
  play?: boolean;
  vidRef?: Reference<Video>;
}) {
  const ar = 1280 / 720;
  const cw = Math.max(w, h * ar);
  return (
    <Video
      ref={vidRef}
      src={'/final.mp4'}
      time={time}
      play={play}
      loop
      volume={0}
      width={cw}
      height={cw / ar}
    />
  );
}

/** Caption label that sits at the bottom of a card. */
export function CardLabel({text, color = C.amber, w}: {text: string; color?: string; w: number}) {
  return (
    <Rect
      layout
      width={w}
      padding={[16, 24]}
      y={0}
      fill={'rgba(5,6,12,0.72)'}
      justifyContent={'space-between'}
      alignItems={'center'}
    >
      <Txt text={text} fontFamily={HEAD} fontWeight={800} fontSize={30} letterSpacing={3} fill={color} />
    </Rect>
  );
}

/** Animated arrow (line with arrowhead) that draws itself. */
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
  return (
    <Line
      ref={refNode}
      points={[from, to]}
      stroke={color}
      lineWidth={width}
      endArrow
      arrowSize={width * 3}
      lineCap={'round'}
      lineDash={dashed ? [14, 14] : undefined}
      end={0}
      shadowBlur={20}
      shadowColor={color}
    />
  );
}

export function* draw(line: Line, dur = 0.5): ThreadGenerator {
  yield* line.end(1, dur, easeOutExpo);
}

/** Cinematic letterbox bars that can slide in and out. */
export function Letterbox(view: View2D, size = 110) {
  const top = createRef<Rect>();
  const bot = createRef<Rect>();
  view.add(
    <Node>
      <Rect ref={top} width={W} height={size} y={-H / 2 - size / 2} fill={'#000'} />
      <Rect ref={bot} width={W} height={size} y={H / 2 + size / 2} fill={'#000'} />
    </Node>,
  );
  return {
    *in(d = 0.6) {
      yield* all(top().y(-H / 2 + size / 2, d, easeOutCubic), bot().y(H / 2 - size / 2, d, easeOutCubic));
    },
    *out(d = 0.5) {
      yield* all(top().y(-H / 2 - size / 2, d, easeInOutCubic), bot().y(H / 2 + size / 2, d, easeInOutCubic));
    },
    top,
    bot,
  };
}

/** Lower-third progress pill showing which chapter we're in. */
export function ChapterTag(view: View2D, idx: string, title: string) {
  const r = createRef<Rect>();
  view.add(
    <Rect
      ref={r}
      layout
      x={-W / 2 + 60}
      y={-H / 2 + 60}
      offset={[-1, -1]}
      direction={'row'}
      gap={16}
      alignItems={'center'}
      padding={[12, 22]}
      radius={14}
      fill={'rgba(5,6,12,0.6)'}
      stroke={'rgba(255,255,255,0.14)'}
      lineWidth={2}
      opacity={0}
    >
      <Txt text={idx} fontFamily={MONO} fontWeight={500} fontSize={22} fill={C.amber} />
      <Rect width={2} height={22} fill={'rgba(255,255,255,0.3)'} />
      <Txt text={title} fontFamily={BODY} fontWeight={600} fontSize={22} letterSpacing={3} fill={C.dim} />
    </Rect>,
  );
  return r;
}
