// STYLE SAMPLE B · "Bold kinetic" — huge condensed type, one acid accent,
// hard cuts and colour-block wipes. Covers the first 8.4s of the hook VO.
import {Audio, Img, makeScene2D, Node, Rect, Txt, brightness} from '@revideo/2d';
import {all, createRef, easeInCubic, easeInOutCubic, easeOutCubic, easeOutExpo, linear, loop, spawn, waitFor} from '@revideo/core';
import type {ThreadGenerator} from '@revideo/core';
import {Clip, cue, H, MONO, W} from '../lib';
import {PLAY, Product} from '../headphones/media';

const LIME = '#c8ff2e';
const INK = '#050505';
const PAPER = '#f2f0ea';
const DISPLAY = 'Anton';

/** Slam-in: overshoot scale + fast settle, no bounce, no blur. */
function* slam(n: Node, d = 0.22): ThreadGenerator {
  n.opacity(1).scale(1.35);
  yield* n.scale(1, d, easeOutExpo);
}

function Big({refNode, text, size, color = PAPER, x = 0, y = 0, left = true}: any) {
  return (
    <Txt
      ref={refNode}
      text={text}
      x={x}
      y={y}
      offset={left ? [-1, 0] : [0, 0]}
      fontFamily={DISPLAY}
      fontSize={size}
      lineHeight={size * 0.92}
      letterSpacing={2}
      fill={color}
      opacity={0}
    />
  );
}

export default makeScene2D('style-b', function* (view) {
  view.add(<Rect width={W} height={H} fill={INK} />);
  view.add(<Audio src={'/hp/vo-hook.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);

  // persistent chrome: label, frame counter, marquee
  const counter = createRef<Txt>();
  const marquee = createRef<Txt>();
  const chrome = (
    <Node>
      <Txt text={'LEX AI / PIXVERSE CANVAS'} x={-900} y={-500} offset={[-1, 0]} fontFamily={MONO} fontSize={22} fill={PAPER} opacity={0.7} />
      <Txt ref={counter} text={'00'} x={900} y={-500} offset={[1, 0]} fontFamily={MONO} fontSize={22} fill={LIME} />
      <Rect y={505} width={W} height={70} fill={LIME} />
      <Txt
        ref={marquee}
        y={505}
        x={0}
        text={'ONE IMAGE  ●  NO CAMERA  ●  NO STUDIO  ●  NO CREW  ●  ONE IMAGE  ●  NO CAMERA  ●  NO STUDIO  ●  NO CREW  ●  ONE IMAGE  ●  NO CAMERA  ●'}
        fontFamily={DISPLAY}
        fontSize={40}
        letterSpacing={3}
        fill={INK}
      />
    </Node>
  ) as Node;
  view.add(chrome);
  spawn(marquee().x(-700, 9, linear));

  // ---------------------------------------------------------- 0.0 THIS ENTIRE / PRODUCT AD over the ad
  const vid = createRef<Node>();
  stage.add(
    <Node ref={vid} filters={[brightness(0.5)]}>
      <Clip w={W} h={H} time={PLAY.hero} play />
    </Node>,
  );
  const t1 = createRef<Txt>();
  const t2 = createRef<Txt>();
  stage.add(<Big refNode={t1} text={'THIS ENTIRE'} size={230} x={-860} y={-130} />);
  stage.add(<Big refNode={t2} text={'PRODUCT AD'} size={230} x={-860} y={100} color={LIME} />);
  vid().scale(1.15);
  spawn(vid().scale(1, 1.7, linear));
  counter().text('01');
  yield* slam(t1());
  yield* cue(0.5);
  yield* slam(t2());

  // ---------------------------------------------------------- 1.7 lime block wipe: STARTED WITH JUST
  const block = createRef<Rect>();
  stage.add(<Rect ref={block} width={W} height={H} x={-W} fill={LIME} />);
  const s1 = createRef<Txt>();
  const s2 = createRef<Txt>();
  const s3 = createRef<Txt>();
  stage.add(<Big refNode={s1} text={'STARTED'} size={260} x={-860} y={-200} color={INK} />);
  stage.add(<Big refNode={s2} text={'WITH'} size={260} x={-860} y={50} color={INK} />);
  stage.add(<Big refNode={s3} text={'JUST'} size={260} x={-260} y={50} color={INK} />);
  yield* cue(1.6);
  yield* block().x(0, 0.18, easeOutExpo);
  vid().opacity(0);
  t1().opacity(0);
  t2().opacity(0);
  counter().text('02');
  yield* slam(s1(), 0.18);
  yield* cue(2.1);
  yield* slam(s2(), 0.16);
  yield* cue(2.4);
  yield* slam(s3(), 0.16);

  // ---------------------------------------------------------- 2.7 ONE / IMAGE + the photo panel
  const panel = createRef<Rect>();
  const one = createRef<Txt>();
  const img = createRef<Txt>();
  stage.add(
    <Rect ref={panel} x={480} width={960} height={0} clip fill={'#fff'}>
      <Product w={960} h={1080} />
    </Rect>,
  );
  stage.add(<Big refNode={one} text={'ONE'} size={480} x={-860} y={-80} color={LIME} />);
  stage.add(<Big refNode={img} text={'IMAGE.'} size={200} x={-850} y={250} />);
  yield* cue(2.65);
  block().fill(INK);
  [s1(), s2(), s3()].forEach(t => t.opacity(0));
  counter().text('03');
  spawn(panel().height(H, 0.35, easeOutExpo));
  yield* slam(one(), 0.2);
  yield* cue(3.0);
  yield* slam(img(), 0.2);

  // ---------------------------------------------------------- 3.8 NO + three hard-cut items
  const noBg = createRef<Rect>();
  const no = createRef<Txt>();
  stage.add(<Rect ref={noBg} x={-480} width={960} height={H} fill={LIME} opacity={0} />);
  stage.add(<Big refNode={no} text={'NO'} size={620} x={-480} y={-20} color={INK} left={false} />);
  const items = ['CAMERA\nSETUP', 'PHYSICAL\nSTUDIO', 'COMPLEX\nPRODUCTION'];
  const itemRefs = items.map(() => createRef<Txt>());
  items.forEach((t, i) =>
    stage.add(<Big refNode={itemRefs[i]} text={t} size={i === 2 ? 170 : 200} x={60} y={-20} />),
  );
  const bar = createRef<Rect>();
  stage.add(<Rect ref={bar} x={60} y={-20} offset={[-1, 0]} width={0} height={26} fill={LIME} />);
  const cues = [3.8, 4.9, 6.1];
  for (let i = 0; i < 3; i++) {
    yield* cue(cues[i]);
    counter().text(`0${4 + i}`);
    if (i === 0) {
      panel().opacity(0);
      one().opacity(0);
      img().opacity(0);
      noBg().opacity(1);
      spawn(slam(no(), 0.2));
    } else {
      itemRefs[i - 1]().opacity(0);
      bar().width(0);
    }
    const it = itemRefs[i]();
    it.y(140);
    it.opacity(1);
    yield* it.y(-20, 0.2, easeOutExpo);
    yield* waitFor(0.35);
    yield* bar().width(i === 2 ? 820 : 640, 0.25, easeOutExpo);
  }

  // ---------------------------------------------------------- 7.7 wipe out
  const out = createRef<Rect>();
  stage.add(<Rect ref={out} width={W} height={H} x={-W} fill={LIME} />);
  yield* cue(7.75);
  yield* out().x(0, 0.25, easeInCubic);
  yield* out().x(W, 0.25, easeOutCubic);
  yield* waitFor(0.2);
});
