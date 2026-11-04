// HEADPHONES AD · Hook — "This entire product advertisement started with just one image…"
// Bold kinetic style. Cue times are seconds into public/hp/vo-hook.wav (= source VO 0:00–0:31.75).
import {Audio, makeScene2D, Node, Rect, Txt, Video, brightness} from '@revideo/2d';
import {all, createRef, easeInCubic, easeOutExpo, linear, spawn, waitFor} from '@revideo/core';
import {
  Bar,
  BODY,
  Big,
  Chrome,
  Clip,
  cue,
  Ground,
  H,
  hideAll,
  INK,
  KRow,
  Label,
  LIME,
  MONO,
  open,
  Panel,
  PAPER,
  rise,
  slam,
  slamWords,
  Still,
  Tag,
  W,
  Wiper,
} from './kinetic';
import {PLAY, Product, STILLS} from './media';

export default makeScene2D('hp-hook', function* (view) {
  Ground(view);
  view.add(<Audio src={'/hp/vo-hook.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  const wipe = Wiper(view);
  const tick = Chrome(view, 'LEX AI / PIXVERSE CANVAS', 'ONE IMAGE  ●  NO CAMERA  ●  NO STUDIO  ●  NO CREW  ●  ');

  // ------------------------------------------------------- 0.0 THIS ENTIRE / PRODUCT AD over the ad
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
  tick();
  yield* slam(t1());
  yield* cue(0.5);
  yield* slam(t2());

  // ------------------------------------------------------- 1.6 lime block: STARTED WITH JUST
  const block = createRef<Rect>();
  stage.add(<Rect ref={block} width={W} height={H} x={-W} fill={LIME} />);
  const s1 = createRef<Txt>();
  const s2 = createRef<Txt>();
  const s3 = createRef<Txt>();
  stage.add(<Big refNode={s1} text={'STARTED'} size={260} x={-860} y={-200} color={INK} />);
  stage.add(<Big refNode={s2} text={'WITH'} size={260} x={-860} y={50} color={INK} />);
  stage.add(<Big refNode={s3} text={'JUST'} size={260} x={-330} y={50} color={INK} />);
  yield* cue(1.6);
  yield* block().x(0, 0.18, easeOutExpo);
  hideAll(vid(), t1(), t2());
  tick();
  yield* slam(s1(), 0.18);
  yield* cue(2.1);
  yield* slam(s2(), 0.16);
  yield* cue(2.4);
  yield* slam(s3(), 0.16);

  // ------------------------------------------------------- 2.65 ONE IMAGE. + the photo panel
  const panel = createRef<Rect>();
  const one = createRef<Txt>();
  const img = createRef<Txt>();
  stage.add(
    <Panel refNode={panel} x={480} w={960} h={H} fill={'#fff'}>
      <Product w={960} h={H} />
    </Panel>,
  );
  stage.add(<Big refNode={one} text={'ONE'} size={480} x={-860} y={-80} color={LIME} />);
  stage.add(<Big refNode={img} text={'IMAGE.'} size={200} x={-850} y={250} />);
  yield* cue(2.65);
  block().fill(INK);
  hideAll(s1(), s2(), s3());
  tick();
  spawn(open(panel(), H, 0.35));
  yield* slam(one(), 0.2);
  yield* cue(3.0);
  yield* slam(img(), 0.2);

  // ------------------------------------------------------- 3.8 NO + three hard-cut items
  const noBg = createRef<Rect>();
  const no = createRef<Txt>();
  stage.add(<Rect ref={noBg} x={-480} width={960} height={H} fill={LIME} opacity={0} />);
  stage.add(<Big refNode={no} text={'NO'} size={620} x={-480} y={-20} color={INK} align={'center'} />);
  const items = ['CAMERA\nSETUP', 'PHYSICAL\nSTUDIO', 'COMPLEX\nPRODUCTION'];
  const itemRefs = items.map(() => createRef<Txt>());
  items.forEach((t, i) => stage.add(<Big refNode={itemRefs[i]} text={t} size={i === 2 ? 170 : 200} x={60} y={-20} />));
  const bar = createRef<Rect>();
  stage.add(<Bar refNode={bar} x={60} y={-20} h={26} />);
  const noCues = [3.8, 4.9, 6.1];
  for (let i = 0; i < 3; i++) {
    yield* cue(noCues[i]);
    tick();
    if (i === 0) {
      hideAll(panel(), one(), img());
      noBg().opacity(1);
      spawn(slam(no(), 0.2));
    } else {
      itemRefs[i - 1]().opacity(0);
      bar().width(0);
    }
    yield* rise(itemRefs[i](), 0.2, 160);
    yield* waitFor(0.35);
    yield* bar().width(i === 2 ? 820 : 640, 0.25, easeOutExpo);
  }

  // ------------------------------------------------------- 8.1 the product photo + AI
  const photo = createRef<Rect>();
  const photoLabel = createRef<Rect>();
  const ai = createRef<Rect>();
  stage.add(
    <Panel refNode={photo} x={-260} y={-30} w={1200} h={675} fill={'#fff'}>
      <Product w={1200} h={675} />
    </Panel>,
  );
  stage.add(<Tag refNode={photoLabel} text={'THE PRODUCT PHOTO'} mono size={26} x={-860} y={-410} align={'left'} solid={false} />);
  stage.add(
    <Rect ref={ai} x={600} y={-30} width={520} height={675} fill={LIME} opacity={0}>
      <Txt text={'+AI'} fontFamily={'Anton'} fontSize={300} fill={INK} />
    </Rect>,
  );
  yield* cue(8.1);
  yield* wipe(() => {
    hideAll(noBg(), no(), itemRefs[2](), bar());
    block().opacity(0);
  });
  tick();
  spawn(photoLabel().opacity(1, 0.2));
  yield* open(photo(), 675, 0.35);
  yield* cue(10.1);
  yield* slam(ai(), 0.22);

  // ------------------------------------------------------- 11.55 → a complete visual concept
  const hero = createRef<Rect>();
  const c1 = createRef<Txt>();
  const c2 = createRef<Txt>();
  stage.add(
    <Panel refNode={hero} w={W} h={H}>
      <Node filters={[brightness(0.55)]}>
        <Still src={STILLS[0].src} w={W} h={H} />
      </Node>
    </Panel>,
  );
  stage.add(<Big refNode={c1} text={'A COMPLETE'} size={200} x={-860} y={-110} />);
  stage.add(<Big refNode={c2} text={'VISUAL CONCEPT'} size={200} x={-860} y={100} color={LIME} />);
  yield* cue(11.55);
  hideAll(ai(), photoLabel());
  tick();
  yield* all(photo().size([W, H], 0.3, easeOutExpo), photo().position([0, 0], 0.3, easeOutExpo));
  yield* open(hero(), H, 0.25);
  photo().opacity(0);
  yield* slam(c1(), 0.2);
  yield* waitFor(0.1);
  yield* slam(c2(), 0.2);

  // ------------------------------------------------------- 13.3 NEW SCENES triptych
  const tri: Rect[] = [];
  stage.add(
    <Node>
      {STILLS.map((s, i) => (
        <Panel refNode={r => r && tri.push(r)} x={(i - 1) * 640} w={636} h={H}>
          <Still src={s.src} w={636} h={H} />
          <Label n={`0${i + 1}`} text={s.label} w={636} h={H - 140} size={40} />
        </Panel>
      ))}
    </Node>,
  );
  const nsBand = createRef<Rect>();
  stage.add(
    <Rect ref={nsBand} y={-300} width={W} height={180} fill={INK} opacity={0}>
      <Txt text={'GENERATE NEW SCENES'} fontFamily={'Anton'} fontSize={150} letterSpacing={3} fill={LIME} />
    </Rect>,
  );
  yield* cue(13.3);
  hideAll(c1(), c2());
  tick();
  spawn(slam(nsBand(), 0.2));
  for (const p of tri) {
    spawn(open(p, H, 0.3));
    yield* waitFor(0.22);
  }
  nsBand().moveToTop();

  // ------------------------------------------------------- 14.6 → a finished video
  const fin = createRef<Rect>();
  const finVid = createRef<Video>();
  stage.add(
    <Panel refNode={fin} w={W} h={H}>
      <Node filters={[brightness(0.7)]}>
        <Clip w={W} h={H} time={PLAY.wide} vidRef={finVid} />
      </Node>
    </Panel>,
  );
  const finRow: Rect[] = [];
  stage.add(
    <Node y={300}>
      <KRow refs={finRow} size={170} words={['INTO', 'A', {t: 'FINISHED VIDEO', box: true}]} />
    </Node>,
  );
  yield* cue(14.6);
  yield* all(...tri.map(p => all(p.width(0, 0.28, easeInCubic), p.x(0, 0.28, easeInCubic))), nsBand().opacity(0, 0.2));
  hero().opacity(0);
  finVid().play();
  tick();
  yield* open(fin(), H, 0.25);
  yield* cue(15.9);
  yield* slamWords(finRow, 0.12);

  // ------------------------------------------------------- 17.6 inside PixVerse Canvas
  const inside = createRef<Rect>();
  const pv = createRef<Txt>();
  const cv = createRef<Txt>();
  const ws = createRef<Txt>();
  stage.add(<Tag refNode={inside} text={'AND I CAN DO IT ALL INSIDE'} mono size={28} x={-860} y={-380} align={'left'} solid={false} />);
  stage.add(<Big refNode={pv} text={'PIXVERSE'} size={240} x={-870} y={-150} />);
  stage.add(<Big refNode={cv} text={'CANVAS'} size={240} x={-870} y={80} color={LIME} />);
  stage.add(
    <Txt ref={ws} text={'a creative workspace that brings together →'} x={90} y={-60} offset={[-1, 0]} fontFamily={BODY} fontWeight={600} fontSize={40} fill={PAPER} opacity={0} />,
  );
  const pillars = ['AI IMAGE\nGENERATION', 'VIDEO\nCREATION', 'EDITING'];
  const pills: Rect[] = [];
  stage.add(
    <Node>
      {pillars.map((p, i) => (
        <Rect ref={r => r && pills.push(r)} x={230 + i * 275} y={150} width={260} height={250} fill={i === 2 ? LIME : PAPER} opacity={0}>
          <Txt text={`0${i + 1}`} x={-110} y={-90} offset={[-1, 0]} fontFamily={MONO} fontSize={24} fill={INK} />
          <Txt text={p} y={30} fontFamily={'Anton'} fontSize={54} lineHeight={56} textAlign={'center'} fill={INK} />
        </Rect>
      ))}
    </Node>,
  );
  yield* cue(17.6);
  yield* wipe(() => hideAll(fin(), ...finRow));
  yield* cue(19.6);
  tick();
  yield* inside().opacity(1, 0.15);
  yield* cue(20.25);
  yield* slam(pv(), 0.22);
  yield* slam(cv(), 0.22);
  yield* cue(21.5);
  yield* rise(ws(), 0.25, 40);
  const pillCues = [23.6, 24.45, 25.45];
  for (let i = 0; i < 3; i++) {
    yield* cue(pillCues[i]);
    yield* rise(pills[i], 0.2, 200);
  }

  // ------------------------------------------------------- 26.3 original image → final ad
  const cw1 = createRef<Txt>();
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  const arrow = createRef<Txt>();
  const resultVid = createRef<Video>();
  stage.add(<Big refNode={cw1} text={'THE COMPLETE WORKFLOW'} size={150} x={-860} y={-360} />);
  stage.add(
    <Panel refNode={left} x={-500} y={90} w={820} h={520} fill={'#fff'}>
      <Product w={820} h={520} />
      <Label n={'IN'} text={'ORIGINAL IMAGE'} w={820} h={520} size={36} />
    </Panel>,
  );
  stage.add(<Big refNode={arrow} text={'→'} size={200} x={0} y={70} color={LIME} align={'center'} />);
  stage.add(
    <Panel refNode={right} x={500} y={90} w={820} h={520}>
      <Clip w={820} h={520} time={PLAY.hero} vidRef={resultVid} />
      <Label n={'OUT'} text={'FINAL ADVERTISEMENT'} w={820} h={520} size={36} />
    </Panel>,
  );
  yield* cue(26.3);
  yield* wipe(() => hideAll(inside(), pv(), cv(), ws(), ...pills));
  tick();
  yield* cue(27.5);
  yield* slam(cw1(), 0.22);
  yield* cue(28.9);
  yield* open(left(), 520, 0.3);
  yield* slam(arrow(), 0.18);
  yield* cue(30.1);
  resultVid().play();
  yield* open(right(), 520, 0.3);
  yield* cue(31.3);
  yield* wipe(() => hideAll(cw1(), left(), right(), arrow()), 0.2, 0.22);
});
