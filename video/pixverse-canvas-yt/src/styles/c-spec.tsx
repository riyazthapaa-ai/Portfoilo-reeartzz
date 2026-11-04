// STYLE SAMPLE C · "Spec sheet HUD" — typed monospace, a scan line and
// callout lines pointing at the product, like a teardown. First 8.4s of the hook VO.
import {Audio, Circle, Line, makeScene2D, Node, Rect, Txt, brightness} from '@revideo/2d';
import {all, createRef, easeInOutCubic, easeOutCubic, easeOutExpo, linear, loop, spawn, tween, useTime, waitFor} from '@revideo/core';
import type {ThreadGenerator} from '@revideo/core';
import {Clip, cue, DotGrid, H, MONO, W} from '../lib';
import {PLAY, Product} from '../headphones/media';

const BG = '#06080b';
const CYAN = '#39e1ff';
const AMBER = '#ffb020';
const TXT = '#e9f6fa';
const DIM = '#6f8793';
const SANS = 'Inter';

/** Type text out character by character. */
function* type(t: Txt, s: string, dur: number): ThreadGenerator {
  yield* tween(dur, v => t.text(s.slice(0, Math.round(v * s.length))));
  t.text(s);
}

/** Viewfinder corner brackets around a w×h box. */
function Brackets({w, h, color = CYAN, len = 46, refNode}: any) {
  const hw = w / 2;
  const hh = h / 2;
  const c = (x: number, y: number, sx: number, sy: number) => (
    <Line points={[[x, y + sy * len], [x, y], [x + sx * len, y]]} stroke={color} lineWidth={4} />
  );
  return (
    <Node ref={refNode}>
      {c(-hw, -hh, 1, 1)}
      {c(hw, -hh, -1, 1)}
      {c(-hw, hh, 1, -1)}
      {c(hw, hh, -1, -1)}
    </Node>
  );
}

const tc = (t: number) => {
  const f = Math.floor((t % 1) * 24);
  const s = Math.floor(t);
  const p = (n: number) => String(n).padStart(2, '0');
  return `00:00:${p(s)}:${p(f)}`;
};

export default makeScene2D('style-c', function* (view) {
  view.add(<Rect width={W} height={H} fill={BG} />);
  view.add(<DotGrid opacity={0.18} gap={40} />);
  view.add(<Audio src={'/hp/vo-hook.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);

  // HUD chrome: REC + timecode + lens info + frame ticks
  const rec = createRef<Circle>();
  const time = createRef<Txt>();
  view.add(
    <Node>
      <Circle ref={rec} x={-880} y={-490} size={18} fill={'#ff3b3b'} />
      <Txt text={'REC'} x={-860} y={-490} offset={[-1, 0]} fontFamily={MONO} fontSize={24} fill={TXT} />
      <Txt ref={time} text={tc(0)} x={-790} y={-490} offset={[-1, 0]} fontFamily={MONO} fontSize={24} fill={DIM} />
      <Txt text={'PIXVERSE CANVAS · CAM A · 50MM'} x={900} y={-490} offset={[1, 0]} fontFamily={MONO} fontSize={24} fill={DIM} />
      {Array.from({length: 33}, (_, i) => (
        <Rect x={-800 + i * 50} y={510} width={2} height={i % 4 === 0 ? 22 : 10} fill={DIM} />
      ))}
    </Node>,
  );
  spawn(loop(Infinity, function* () {
    time().text(tc(useTime()));
    yield;
  }));
  spawn(loop(Infinity, () => rec().opacity(0.15, 0.4).to(1, 0.4)));

  // ---------------------------------------------------------- 0.0 framed footage + typed caption
  const frame = createRef<Node>();
  const vid = createRef<Rect>();
  stage.add(
    <Node ref={frame} y={-60}>
      <Rect ref={vid} width={1500} height={760} clip>
        <Node filters={[brightness(0.8)]}>
          <Clip w={1500} h={760} time={PLAY.hero} play />
        </Node>
      </Rect>
      <Brackets w={1540} h={800} />
      <Line points={[[-30, 0], [30, 0]]} stroke={CYAN} lineWidth={2} opacity={0.7} />
      <Line points={[[0, -30], [0, 30]]} stroke={CYAN} lineWidth={2} opacity={0.7} />
    </Node>,
  );
  const l1 = createRef<Txt>();
  const l2 = createRef<Txt>();
  stage.add(<Txt ref={l1} text={''} x={-750} y={390} offset={[-1, 0]} fontFamily={MONO} fontSize={40} fill={TXT} />);
  stage.add(<Txt ref={l2} text={''} x={-750} y={450} offset={[-1, 0]} fontFamily={MONO} fontSize={40} fill={TXT} />);
  const big = createRef<Node>();
  const bigTxt = createRef<Txt>();
  const bigBox = createRef<Rect>();
  stage.add(
    <Node ref={big} x={330} y={420} opacity={0}>
      <Rect ref={bigBox} width={0} height={130} stroke={CYAN} lineWidth={3} lineDash={[16, 10]} />
      <Txt ref={bigTxt} text={'ONE IMAGE'} fontFamily={SANS} fontWeight={600} fontSize={110} letterSpacing={-2} fill={CYAN} />
    </Node>,
  );
  spawn(frame().scale(1.04, 3.6, linear));
  yield* cue(0.05);
  yield* type(l1(), '> this entire product ad', 1.4);
  yield* cue(1.7);
  yield* type(l2(), '> started with just', 0.8);
  yield* cue(2.65);
  big().opacity(1);
  yield* bigBox().width(700, 0.35, easeOutExpo);

  // ---------------------------------------------------------- 3.8 product teardown with callouts
  const prod = createRef<Rect>();
  const scan = createRef<Rect>();
  stage.add(
    <Node>
      <Rect ref={prod} width={0} height={506} y={-20} clip fill={'#fff'}>
        <Product w={900} h={506} />
        <Rect ref={scan} y={-260} width={900} height={4} fill={CYAN} shadowBlur={30} shadowColor={CYAN} />
      </Rect>
    </Node>,
  );
  const prodBrackets = createRef<Node>();
  stage.add(
    <Node y={-20} opacity={0} ref={prodBrackets}>
      <Brackets w={940} h={546} />
    </Node>,
  );
  const callouts = [
    {label: 'CAMERA SETUP', from: [-120, 40], to: [-560, -280], side: -1},
    {label: 'PHYSICAL STUDIO', from: [30, -185], to: [560, -280], side: 1},
    {label: 'COMPLEX PRODUCTION', from: [140, 110], to: [560, 270], side: 1},
  ];
  const lines = callouts.map(() => createRef<Line>());
  const dots = callouts.map(() => createRef<Circle>());
  const labels = callouts.map(() => createRef<Txt>());
  const status = callouts.map(() => createRef<Txt>());
  callouts.forEach((c, i) => {
    const elbow: [number, number] = [c.to[0] + c.side * -120, c.to[1]];
    stage.add(
      <Node y={-20}>
        <Line ref={lines[i]} points={[c.from as [number, number], elbow, c.to as [number, number]]} stroke={CYAN} lineWidth={3} end={0} />
        <Circle ref={dots[i]} x={c.from[0]} y={c.from[1]} size={0} fill={CYAN} shadowBlur={16} shadowColor={CYAN} />
        <Txt ref={labels[i]} text={''} x={c.to[0] + c.side * 20} y={c.to[1] - 26} offset={[c.side === -1 ? 1 : -1, 0]} fontFamily={MONO} fontSize={30} fill={TXT} />
        <Txt ref={status[i]} text={''} x={c.to[0] + c.side * 20} y={c.to[1] + 22} offset={[c.side === -1 ? 1 : -1, 0]} fontFamily={MONO} fontSize={26} fill={AMBER} />
      </Node>,
    );
  });
  const req = createRef<Txt>();
  stage.add(<Txt ref={req} text={''} y={400} fontFamily={MONO} fontSize={36} fill={CYAN} />);

  yield* cue(3.75);
  yield* all(frame().opacity(0, 0.25), big().opacity(0, 0.2), l1().opacity(0, 0.2), l2().opacity(0, 0.2));
  spawn(prodBrackets().opacity(1, 0.3));
  yield* prod().width(900, 0.4, easeOutExpo);
  spawn(loop(Infinity, () => scan().y(260, 1.6, easeInOutCubic).to(-260, 1.6, easeInOutCubic)));
  const cues = [3.85, 4.9, 6.1];
  for (let i = 0; i < 3; i++) {
    yield* cue(cues[i]);
    spawn(function* () {
      yield* dots[i]().size(16, 0.2, easeOutCubic);
      yield* lines[i]().end(1, 0.35, easeOutExpo);
      yield* type(labels[i](), callouts[i].label, 0.35);
      yield* type(status[i](), '✕ NOT NEEDED', 0.3);
    });
  }
  yield* cue(7.3);
  yield* type(req(), 'INPUT REQUIRED: 1 × PRODUCT PHOTO', 0.7);
  yield* waitFor(0.4);
});
