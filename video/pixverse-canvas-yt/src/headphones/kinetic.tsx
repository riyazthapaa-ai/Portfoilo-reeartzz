// "Bold kinetic" style kit for the headphones video (style option B).
// Huge condensed type, black / paper / one acid-lime accent, hard cuts,
// colour-block wipes and square-cornered panels. No glows, no bounces.
import {Circle, Img, Layout, Line, Node, Rect, Txt} from '@revideo/2d';
import type {View2D} from '@revideo/2d';
import {all, createRef, easeInCubic, easeOutCubic, easeOutExpo, linear, spawn, useTime, waitFor} from '@revideo/core';
import type {Reference, ThreadGenerator} from '@revideo/core';
import {H, MONO, W} from '../lib';

export {Clip, H, MONO, W} from '../lib';

export const LIME = '#c8ff2e';
export const INK = '#050505';
export const PAPER = '#f2f0ea';
export const GREY = '#7d7d7d';
export const DISPLAY = 'Anton';
export const BODY = 'Inter';

/** Wait until an absolute time (seconds since the start of the scene). */
export function* cue(t: number): ThreadGenerator {
  const d = t - useTime();
  if (d > 0) yield* waitFor(d);
}

/** Flat black with a faint column grid. */
export function Ground(view: View2D) {
  view.add(
    <Node>
      <Rect width={W} height={H} fill={INK} />
      {Array.from({length: 7}, (_, i) => (
        <Rect x={-W / 2 + (i + 1) * (W / 8)} width={1} height={H} fill={'rgba(255,255,255,0.05)'} />
      ))}
    </Node>,
  );
}

/**
 * Persistent chrome: label top-left, shot counter top-right and a lime
 * marquee ticker along the bottom. Returns a setter for the counter.
 */
export function Chrome(view: View2D, label: string, ticker: string) {
  const counter = createRef<Txt>();
  const marquee = createRef<Txt>();
  const text = Array.from({length: 4}, () => ticker).join('');
  view.add(
    <Node>
      <Txt text={label} x={-900} y={-500} offset={[-1, 0]} fontFamily={MONO} fontSize={22} fill={PAPER} opacity={0.7} />
      <Txt ref={counter} text={'00'} x={900} y={-500} offset={[1, 0]} fontFamily={MONO} fontSize={22} fill={LIME} />
      <Rect y={505} width={W} height={70} fill={LIME} />
      <Txt ref={marquee} y={505} x={300} text={text} fontFamily={DISPLAY} fontSize={40} letterSpacing={3} fill={INK} />
    </Node>,
  );
  spawn(marquee().x(-1400, 90, linear));
  let n = 0;
  return () => counter().text(String(++n).padStart(2, '0'));
}

/** Full-screen lime block wipe. `swap` runs while the screen is covered. */
export function Wiper(view: View2D) {
  const r = createRef<Rect>();
  view.add(<Rect ref={r} width={W} height={H} x={-W} fill={LIME} />);
  return function* (swap?: () => void, inDur = 0.18, outDur = 0.22): ThreadGenerator {
    r().x(-W);
    yield* r().x(0, inDur, easeInCubic);
    swap?.();
    yield* r().x(W, outDur, easeOutCubic);
  };
}

/** Slam-in: overshoot scale and a fast settle. */
export function* slam(n: Node, d = 0.22): ThreadGenerator {
  n.opacity(1).scale(1.35);
  yield* n.scale(1, d, easeOutExpo);
}

/** Drop-in from below (for stacked lines). */
export function* rise(n: Node, d = 0.22, by = 120): ThreadGenerator {
  const y = n.y();
  n.opacity(1).y(y + by);
  yield* n.y(y, d, easeOutExpo);
}

export function* cut(...nodes: Node[]): ThreadGenerator {
  nodes.forEach(n => n.opacity(0));
}

/** Big condensed headline. Hidden until slammed. */
export function Big({
  refNode,
  text,
  size,
  color = PAPER,
  x = 0,
  y = 0,
  align = 'left',
}: {
  refNode?: Reference<Txt>;
  text: string;
  size: number;
  color?: string;
  x?: number;
  y?: number;
  align?: 'left' | 'center' | 'right';
}) {
  return (
    <Txt
      ref={refNode}
      text={text}
      x={x}
      y={y}
      offset={align === 'left' ? [-1, 0] : align === 'right' ? [1, 0] : [0, 0]}
      textAlign={align}
      fontFamily={DISPLAY}
      fontSize={size}
      lineHeight={size * 0.94}
      letterSpacing={2}
      fill={color}
      opacity={0}
    />
  );
}

export type KWord = string | {t: string; hl?: boolean; box?: boolean; dim?: boolean};

/** A row of condensed words that slam in one by one. */
export function KRow({words, size, refs, gap, color = PAPER}: {words: KWord[]; size: number; refs: Rect[]; gap?: number; color?: string}) {
  return (
    <Layout layout direction={'row'} gap={gap ?? size * 0.22} alignItems={'center'}>
      {words.map(w => {
        const o = typeof w === 'string' ? {t: w} : w;
        return (
          <Rect ref={n => n && refs.push(n)} layout padding={o.box ? [0, size * 0.14] : 0} fill={o.box ? LIME : null} opacity={0}>
            <Txt
              text={o.t}
              fontFamily={DISPLAY}
              fontSize={size}
              lineHeight={size * 1.02}
              letterSpacing={2}
              fill={o.box ? INK : o.hl ? LIME : o.dim ? GREY : color}
            />
          </Rect>
        );
      })}
    </Layout>
  );
}

export function* slamWords(words: Rect[], stagger = 0.09, d = 0.2): ThreadGenerator {
  for (const w of words) {
    spawn(slam(w, d));
    yield* waitFor(stagger);
  }
  yield* waitFor(Math.max(0, d - stagger));
}

export function hideAll(...groups: (Node | Node[])[]) {
  for (const g of groups) (Array.isArray(g) ? g : [g]).forEach(n => n.opacity(0));
}

/** Rectangular tag: lime block with ink text, or outlined. */
export function Tag({
  refNode,
  text,
  size = 34,
  solid = true,
  mono = false,
  x = 0,
  y = 0,
  align = 'center',
}: {
  refNode?: Reference<Rect> | ((r: Rect) => void);
  text: string;
  size?: number;
  solid?: boolean;
  mono?: boolean;
  x?: number;
  y?: number;
  align?: 'left' | 'center';
}) {
  return (
    <Rect
      ref={refNode as any}
      layout
      x={x}
      y={y}
      offset={align === 'left' ? [-1, 0] : [0, 0]}
      padding={mono ? [10, 18] : [size * 0.2, size * 0.45]}
      fill={solid ? LIME : null}
      stroke={solid ? null : PAPER}
      lineWidth={solid ? 0 : 3}
      opacity={0}
    >
      <Txt
        text={text}
        fontFamily={mono ? MONO : DISPLAY}
        fontSize={size}
        letterSpacing={mono ? 2 : 3}
        fill={solid ? INK : PAPER}
      />
    </Rect>
  );
}

/** Square-cornered clipped panel. Starts collapsed; open it with `open`. */
export function Panel({
  refNode,
  w,
  h,
  x = 0,
  y = 0,
  children,
  fill = '#111',
  rotation = 0,
}: {
  refNode?: Reference<Rect> | ((r: Rect) => void);
  w: number;
  h: number;
  x?: number;
  y?: number;
  children?: any;
  fill?: string;
  rotation?: number;
}) {
  return (
    <Rect ref={refNode as any} x={x} y={y} width={w} height={0} clip fill={fill} rotation={rotation}>
      {children}
    </Rect>
  );
}

/** Mask-open a panel vertically (height 0 → full). */
export function* open(p: Rect, h: number, d = 0.3): ThreadGenerator {
  p.opacity(1);
  yield* p.height(h, d, easeOutExpo);
}

/** Numbered label strip pinned to the bottom-left of a panel. */
export function Label({n, text, w, h, size = 30}: {n: string; text: string; w: number; h: number; size?: number}) {
  return (
    <Rect layout x={-w / 2} y={h / 2} offset={[-1, 1]} direction={'row'} gap={14} padding={[8, 16]} fill={INK} alignItems={'center'}>
      <Txt text={n} fontFamily={DISPLAY} fontSize={size} fill={LIME} />
      <Txt text={text} fontFamily={DISPLAY} fontSize={size} letterSpacing={2} fill={PAPER} />
    </Rect>
  );
}

/** A still, cover-fitted. */
export function Still({src, w, h, ar = 16 / 9}: {src: string; w: number; h: number; ar?: number}) {
  const cw = Math.max(w, h * ar);
  return <Img src={src} width={cw} height={cw / ar} />;
}

/** Thick bar used as a strike-through or underline. */
export function Bar({refNode, x = 0, y = 0, h = 24, color = LIME}: {refNode: Reference<Rect>; x?: number; y?: number; h?: number; color?: string}) {
  return <Rect ref={refNode} x={x} y={y} offset={[-1, 0]} width={0} height={h} fill={color} />;
}

/** Hand cursor (arrow) used for the CTA click. */
export function Cursor({refNode}: {refNode: Reference<Node>}) {
  return (
    <Node ref={refNode} opacity={0}>
      <Line points={[[0, 0], [0, 64], [16, 50], [28, 76], [38, 72], [26, 46], [46, 46]]} closed fill={PAPER} stroke={INK} lineWidth={3} />
    </Node>
  );
}

export {all, Circle, easeOutExpo};
