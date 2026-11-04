// HEADPHONES AD · Intro — the project, the brief and the creative direction.
// Bold kinetic style. public/hp/vo-intro.wav is source VO 0:32.0–1:26.8; cues
// are written in source-VO seconds and converted with T().
import {Audio, Line, makeScene2D, Node, Rect, Txt, brightness, grayscale, hue} from '@revideo/2d';
import {all, createRef, easeInCubic, easeInOutCubic, easeOutExpo, spawn, waitFor} from '@revideo/core';
import {
  Bar,
  BODY,
  Big,
  Chrome,
  Clip,
  cue,
  GREY,
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

const T = (src: number) => src - 32.0;
const at = (src: number) => cue(T(src));

export default makeScene2D('hp-intro', function* (view) {
  Ground(view);
  view.add(<Audio src={'/hp/vo-intro.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  const wipe = Wiper(view);
  const tick = Chrome(view, 'LEX AI / THE PROJECT', 'ONE PRODUCT  ●  THE BRIEF  ●  PREMIUM  ●  MINIMAL  ●  ');

  // ------------------------------------------------------- 32.2 the starting point: one product image
  const startTag = createRef<Rect>();
  const prod = createRef<Rect>();
  const oneA = createRef<Txt>();
  const oneB = createRef<Txt>();
  stage.add(<Tag refNode={startTag} text={'THE STARTING POINT'} mono size={26} x={-860} y={-410} align={'left'} solid={false} />);
  stage.add(
    <Panel refNode={prod} x={360} y={-20} w={1080} h={608} fill={'#fff'}>
      <Product w={1080} h={608} />
    </Panel>,
  );
  stage.add(<Big refNode={oneA} text={'ONE'} size={300} x={-860} y={-150} color={LIME} />);
  stage.add(<Big refNode={oneB} text={'PRODUCT\nIMAGE'} size={150} x={-860} y={160} />);
  yield* at(32.2);
  tick();
  yield* startTag().opacity(1, 0.15);
  yield* at(33.75);
  yield* open(prod(), 608, 0.35);
  yield* at(34.4);
  yield* slam(oneA(), 0.2);
  yield* rise(oneB(), 0.22);

  // 36.4 not just animating a photo
  const notRow: Rect[] = [];
  const animBar = createRef<Rect>();
  const notNode = createRef<Node>();
  stage.add(
    <Node ref={notNode} y={380}>
      <KRow refs={notRow} size={110} words={['NOT', 'JUST', 'ANIMATING', 'A', 'PHOTO']} />
    </Node>,
  );
  stage.add(<Bar refNode={animBar} x={-185} y={380} h={20} />);
  yield* at(36.4);
  hideAll(oneA(), oneB(), startTag());
  tick();
  yield* all(prod().position([0, -120], 0.3, easeOutExpo), prod().size([1100, 560], 0.3, easeOutExpo));
  yield* at(37.6);
  yield* slamWords(notRow, 0.1);
  yield* at(38.5);
  yield* animBar().width(470, 0.25, easeOutExpo);

  // ------------------------------------------------------- 39.3 a complete ad concept
  const acA = createRef<Txt>();
  const checks = ['DIFFERENT SHOTS', 'CONSISTENT VISUAL STYLE', 'A FINAL EDIT'];
  const checkRefs = checks.map(() => createRef<Txt>());
  const nums = checks.map(() => createRef<Txt>());
  const band = createRef<Rect>();
  stage.add(<Big refNode={acA} text={'A COMPLETE AD CONCEPT'} size={140} x={-860} y={-370} />);
  checks.forEach((c, i) => {
    stage.add(<Big refNode={nums[i]} text={`0${i + 1}`} size={100} x={-100} y={-170 + i * 140} color={LIME} />);
    stage.add(<Big refNode={checkRefs[i]} text={c} size={82} x={40} y={-170 + i * 140} />);
  });
  stage.add(
    <Rect ref={band} y={330} width={W} height={150} fill={LIME} opacity={0}>
      <Txt text={'FEELS LIKE A REAL PRODUCT COMMERCIAL'} fontFamily={'Anton'} fontSize={100} letterSpacing={3} fill={INK} />
    </Rect>,
  );
  yield* at(39.3);
  yield* wipe(() => {
    hideAll(...notRow, animBar());
    prod().position([-520, -30]).size([760, 470]);
  });
  tick();
  yield* at(40.3);
  yield* slam(acA(), 0.22);
  const checkCues = [41.9, 43.0, 44.8];
  for (let i = 0; i < 3; i++) {
    yield* at(checkCues[i]);
    spawn(slam(nums[i](), 0.18));
    yield* rise(checkRefs[i](), 0.2, 60);
  }
  yield* at(45.9);
  yield* band().opacity(1).height(0).height(150, 0.22, easeOutExpo);

  // ------------------------------------------------------- 47.85 the brief
  const brief = createRef<Rect>();
  const briefTag = createRef<Rect>();
  const hpA = createRef<Txt>();
  const hpB = createRef<Txt>();
  stage.add(
    <Panel refNode={brief} w={W} h={H}>
      <Node filters={[brightness(0.5)]}>
        <Clip w={W} h={H} time={PLAY.wide} play />
      </Node>
    </Panel>,
  );
  stage.add(<Tag refNode={briefTag} text={'THE BRIEF'} size={44} x={-860} y={-400} align={'left'} />);
  stage.add(<Big refNode={hpA} text={'PREMIUM'} size={260} x={-860} y={-80} />);
  stage.add(<Big refNode={hpB} text={'WIRELESS HEADPHONES'} size={170} x={-860} y={160} color={LIME} />);
  yield* at(47.85);
  hideAll(acA(), ...checkRefs.map(r => r()), ...nums.map(r => r()), band(), prod());
  tick();
  yield* open(brief(), H, 0.3);
  yield* slam(briefTag(), 0.18);
  yield* at(51.7);
  yield* slam(hpA(), 0.22);
  yield* slam(hpB(), 0.22);

  // 53.7 clean · modern · high-end, then the three looks
  const moodRow: Rect[] = [];
  stage.add(
    <Node y={-360}>
      <KRow refs={moodRow} size={170} gap={60} words={['CLEAN', {t: '/', dim: true}, 'MODERN', {t: '/', dim: true}, {t: 'HIGH-END', hl: true}]} />
    </Node>,
  );
  const looks = ['CINEMATIC LIGHTING', 'DETAILED CLOSE-UPS', 'INTERESTING ENVIRONMENTS'];
  const tiles: Rect[] = [];
  stage.add(
    <Node y={110}>
      {looks.map((l, i) => (
        <Panel refNode={r => r && tiles.push(r)} x={(i - 1) * 620} w={600} h={600}>
          <Still src={STILLS[i].src} w={600} h={600} />
          <Label n={`0${i + 1}`} text={l} w={600} h={600} size={32} />
        </Panel>
      ))}
    </Node>,
  );
  yield* at(53.7);
  hideAll(brief(), briefTag(), hpA(), hpB());
  tick();
  yield* at(54.95);
  yield* slamWords(moodRow.slice(0, 2), 0.1);
  yield* at(55.65);
  yield* slamWords(moodRow.slice(2, 4), 0.1);
  yield* at(56.1);
  yield* slamWords(moodRow.slice(4));
  const tileCues = [56.9, 58.0, 59.6];
  for (let i = 0; i < 3; i++) {
    yield* at(tileCues[i]);
    yield* open(tiles[i], 600, 0.3);
  }

  // ------------------------------------------------------- 62.0 PixVerse Canvas: build around the product
  const pvA = createRef<Txt>();
  const nodes = [
    {t: 'ORIGINAL PRODUCT', el: <Product w={560} h={400} />},
    {t: 'DEVELOP VISUALS', el: <Still src={STILLS[1].src} w={560} h={400} />},
    {t: 'BUILD THE VIDEO', el: <Clip w={560} h={400} time={PLAY.wide} play />},
  ];
  const nodeRefs: Rect[] = [];
  const links = [createRef<Line>(), createRef<Line>()];
  const aroundBand = createRef<Rect>();
  stage.add(<Big refNode={pvA} text={'PIXVERSE CANVAS'} size={150} x={-860} y={-370} />);
  stage.add(
    <Node y={40}>
      <Line ref={links[0]} points={[[-330, 0], [-290, 0]]} stroke={LIME} lineWidth={14} end={0} />
      <Line ref={links[1]} points={[[290, 0], [330, 0]]} stroke={LIME} lineWidth={14} end={0} />
      {nodes.map((n, i) => (
        <Panel refNode={r => r && nodeRefs.push(r)} x={(i - 1) * 620} w={560} h={400} fill={i === 0 ? '#fff' : '#111'}>
          {n.el}
          <Label n={`0${i + 1}`} text={n.t} w={560} h={400} size={30} />
        </Panel>
      ))}
    </Node>,
  );
  stage.add(
    <Rect ref={aroundBand} y={360} width={W} height={130} fill={LIME} opacity={0}>
      <Txt text={'BUILT AROUND THE ORIGINAL PRODUCT'} fontFamily={'Anton'} fontSize={90} letterSpacing={3} fill={INK} />
    </Rect>,
  );
  yield* at(62.0);
  yield* wipe(() => hideAll(...moodRow, ...tiles));
  tick();
  yield* at(64.5);
  yield* slam(pvA(), 0.2);
  yield* open(nodeRefs[0], 400, 0.28);
  yield* at(65.6);
  spawn(links[0]().end(1, 0.2, easeOutExpo));
  yield* open(nodeRefs[1], 400, 0.28);
  yield* at(66.7);
  spawn(links[1]().end(1, 0.2, easeOutExpo));
  yield* open(nodeRefs[2], 400, 0.28);
  yield* at(67.6);
  yield* aroundBand().opacity(1).height(0).height(130, 0.22, easeOutExpo);

  // ------------------------------------------------------- 69.3 the image is just a starting point
  const empTag = createRef<Rect>();
  const sp = createRef<Rect>();
  const spRow: Rect[] = [];
  stage.add(<Tag refNode={empTag} text={'ONE THING TO EMPHASIZE'} mono size={26} x={-860} y={-410} align={'left'} solid={false} />);
  stage.add(
    <Panel refNode={sp} x={0} y={-90} w={1000} h={560} fill={'#fff'}>
      <Product w={1000} h={560} />
    </Panel>,
  );
  stage.add(
    <Node y={330}>
      <KRow refs={spRow} size={104} words={['THE', 'IMAGE', 'IS', 'JUST', {t: 'A STARTING POINT', box: true}]} />
    </Node>,
  );
  yield* at(69.3);
  yield* wipe(() => hideAll(pvA(), ...nodeRefs, links[0](), links[1](), aroundBand()));
  tick();
  yield* empTag().opacity(1, 0.15);
  yield* at(71.4);
  yield* open(sp(), 560, 0.3);
  yield* at(72.4);
  yield* slamWords(spRow, 0.12);

  // 74.0 + a creative direction: which kind of ad?
  const dirA = createRef<Txt>();
  const what = createRef<Txt>();
  const opts = ['FUTURISTIC', 'BRIGHT LIFESTYLE', 'MINIMALIST PREMIUM'];
  const optRefs: Rect[] = [];
  const optTxt: Txt[] = [];
  const ours = createRef<Rect>();
  stage.add(<Big refNode={dirA} text={'+ A CREATIVE DIRECTION'} size={170} x={-860} y={-330} color={LIME} />);
  stage.add(<Txt ref={what} text={'what kind of ad do we want?'} x={-860} y={-170} offset={[-1, 0]} fontFamily={MONO} fontSize={40} fill={PAPER} opacity={0} />);
  stage.add(
    <Node y={110}>
      {opts.map((o, i) => (
        <Rect ref={r => r && optRefs.push(r)} x={(i - 1) * 620} width={600} height={300} stroke={PAPER} lineWidth={4} opacity={0}>
          <Txt text={`OPTION 0${i + 1}`} x={-270} y={-110} offset={[-1, 0]} fontFamily={MONO} fontSize={24} fill={GREY} />
          <Txt ref={t => t && optTxt.push(t)} text={o} y={20} fontFamily={'Anton'} fontSize={62} letterSpacing={2} fill={PAPER} />
        </Rect>
      ))}
    </Node>,
  );
  stage.add(<Tag refNode={ours} text={'✓ OUR DIRECTION'} mono size={28} x={620} y={300} />);
  yield* at(74.0);
  hideAll(empTag(), sp(), ...spRow);
  tick();
  yield* slam(dirA(), 0.22);
  yield* at(76.5);
  spawn(rise(what(), 0.25, 30));
  for (const o of optRefs) {
    spawn(rise(o, 0.2, 100));
    yield* waitFor(0.25);
  }
  yield* at(78.4);
  optRefs[0].opacity(0.25);
  optRefs[1].opacity(0.25);
  optRefs[2].fill(LIME).stroke(LIME);
  optTxt[2].fill(INK);
  yield* slam(ours(), 0.18);

  // ------------------------------------------------------- 79.4 a real creative project, not random images
  const realA = createRef<Txt>();
  stage.add(<Big refNode={realA} text={'A REAL CREATIVE PROJECT'} size={150} x={-860} y={-370} />);
  const spots: [number, number, number, string, number][] = [
    [-640, -90, -7, STILLS[0].src, 0],
    [-200, -120, 5, STILLS[1].src, 160],
    [250, -100, -4, STILLS[2].src, 60],
    [680, -60, 8, STILLS[0].src, 250],
    [-480, 200, 4, STILLS[2].src, 300],
    [20, 190, -6, STILLS[1].src, 90],
    [500, 210, 3, STILLS[0].src, 200],
  ];
  const scatter: Rect[] = [];
  stage.add(
    <Node>
      {spots.map(([x, y, r, src, h]) => (
        <Panel refNode={c => c && scatter.push(c)} x={x} y={y} rotation={r} w={420} h={236}>
          <Node filters={[hue(h), brightness(0.95)]}>
            <Still src={src} w={420} h={236} />
          </Node>
        </Panel>
      ))}
    </Node>,
  );
  const hopeRow: Rect[] = [];
  stage.add(
    <Node y={390}>
      <KRow refs={hopeRow} size={100} words={['NOT', 'RANDOM', 'IMAGES', '+', {t: 'HOPE', box: true}]} />
    </Node>,
  );
  yield* at(79.4);
  yield* wipe(() => hideAll(dirA(), what(), ...optRefs, ours()));
  tick();
  yield* at(81.2);
  yield* slam(realA(), 0.22);
  yield* at(83.2);
  spawn(slamWords(hopeRow, 0.1));
  for (const c of scatter) {
    spawn(open(c, 236, 0.22));
    yield* waitFor(0.11);
  }
  yield* at(85.0);
  yield* all(
    ...scatter.map((c, i) => all(c.filters([grayscale(0)]).filters.grayscale(1, 0.3), c.rotation(c.rotation() + (i % 2 ? 9 : -9), 0.3, easeInOutCubic))),
  );
  yield* at(86.2);
  yield* wipe(() => hideAll(realA(), ...scatter, ...hopeRow), 0.2, 0.22);
});
