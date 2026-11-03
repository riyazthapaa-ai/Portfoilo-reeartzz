// HEADPHONES AD · Intro — the project, the brief and the creative direction.
// public/hp/vo-intro.wav is source VO 0:32.0–1:26.8; cues are written in
// source-VO seconds and converted with T().
import {Audio, Circle, Img, Line, makeScene2D, Node, Rect, Txt, blur, brightness, grayscale, hue} from '@revideo/2d';
import {all, createRef, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, easeOutExpo, linear, sequence, spawn, waitFor} from '@revideo/core';
import {
  Arrow,
  Backdrop,
  BODY,
  C,
  Card,
  Chip,
  Clip,
  cue,
  DotGrid,
  draw,
  Eyebrow,
  Flash,
  H,
  HEAD,
  hideWords,
  KLine,
  MONO,
  pop,
  revealWords,
  unpop,
  Vignette,
  W,
} from '../lib';
import {PLAY, Pic, Product, STILLS} from './media';

const T = (src: number) => src - 32.0;
const at = (src: number) => cue(T(src));

export default makeScene2D('hp-intro', function* (view) {
  Backdrop(view);
  view.add(<Audio src={'/hp/vo-intro.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  Vignette(view);
  const flash = Flash(view);

  // ---------------------------------------------------------- 31.8 a single product image
  const startTag = createRef<Rect>();
  const prod = createRef<Rect>();
  const oneChip = createRef<Rect>();
  stage.add(
    <Node y={-400}>
      <Eyebrow refNode={startTag} text={'THE STARTING POINT'} />
    </Node>,
  );
  stage.add(
    <Card refNode={prod} width={900} height={506} y={-10} glow={C.amber} opacity={0} scale={0.6}>
      <Product w={900} h={506} />
    </Card>,
  );
  stage.add(
    <Node y={330}>
      <Chip refNode={oneChip} icon={'◎'} text={'ONE PRODUCT IMAGE'} size={40} />
    </Node>,
  );
  yield* at(32.2);
  yield* startTag().opacity(1, 0.3);
  yield* at(33.75);
  yield* pop(prod(), 0.55);
  yield* at(34.4);
  yield* pop(oneChip(), 0.45);

  // 36.4 the goal isn't simply to animate it
  const animChip = createRef<Rect>();
  const animStrike = createRef<Rect>();
  const notWords: Rect[] = [];
  stage.add(
    <Node x={330} y={-200}>
      <Chip refNode={animChip} icon={'▶'} text={'JUST ANIMATE IT'} size={40} bg={C.panel2} />
      <Rect ref={animStrike} width={0} height={8} radius={4} fill={C.red} />
    </Node>,
  );
  stage.add(
    <Node y={440}>
      <KLine refs={notWords} size={64} words={['NOT', 'JUST', 'ANIMATING', 'A', {t: 'PHOTO', hl: C.red}]} />
    </Node>,
  );
  yield* at(36.4);
  spawn(unpop(oneChip(), 0.2));
  yield* at(37.6);
  spawn(revealWords(notWords, 0.08));
  yield* pop(animChip(), 0.4);
  yield* at(38.5);
  yield* animStrike().width(430, 0.35, easeOutExpo);

  // ---------------------------------------------------------- 39.4 a complete advertising concept
  const conceptWords: Rect[] = [];
  const checks = ['DIFFERENT SHOTS', 'CONSISTENT VISUAL STYLE', 'A FINAL EDIT'];
  const checkRows: Rect[] = [];
  const commercial = createRef<Rect>();
  stage.add(
    <Node y={-400}>
      <KLine refs={conceptWords} size={84} words={['A', 'COMPLETE', {t: 'AD CONCEPT', hl: C.amber}]} />
    </Node>,
  );
  stage.add(
    <Node x={0} y={-40}>
      {checks.map((c, i) => (
        <Rect ref={r => r && checkRows.push(r)} layout direction={'row'} alignItems={'center'} gap={22} y={(i - 1) * 120} x={40} offset={[-1, 0]} opacity={0}>
          <Rect size={56} radius={14} fill={C.amber} layout justifyContent={'center'} alignItems={'center'}>
            <Txt text={'✓'} fontFamily={BODY} fontWeight={600} fontSize={34} fill={C.bg} />
          </Rect>
          <Txt text={c} fontFamily={HEAD} fontWeight={900} fontSize={54} letterSpacing={2} fill={C.text} />
        </Rect>
      ))}
    </Node>,
  );
  stage.add(
    <Node y={330}>
      <Chip refNode={commercial} icon={'★'} text={'FEELS LIKE A REAL PRODUCT COMMERCIAL'} size={40} bg={C.amber} color={C.bg} iconColor={C.bg} stroke={C.amber} />
    </Node>,
  );
  yield* at(39.3);
  spawn(hideWords(notWords, 0.2));
  spawn(all(unpop(animChip(), 0.25), animStrike().opacity(0, 0.2), startTag().opacity(0, 0.2)));
  yield* all(prod().position([-430, -20], 0.6, easeInOutCubic), prod().size([720, 405], 0.6, easeInOutCubic));
  yield* at(40.3);
  yield* revealWords(conceptWords, 0.1);
  const checkCues = [41.9, 43.0, 44.8];
  for (let i = 0; i < 3; i++) {
    yield* at(checkCues[i]);
    yield* all(checkRows[i].opacity(1, 0.3), checkRows[i].x(0, 0.4, easeOutCubic));
  }
  yield* at(45.9);
  yield* pop(commercial(), 0.5);

  // ---------------------------------------------------------- 47.9 the brief
  const brief = createRef<Node>();
  stage.add(
    <Node ref={brief} opacity={0}>
      <Clip w={W} h={H} time={PLAY.wide} play />
    </Node>,
  );
  const briefTag = createRef<Rect>();
  const hpWords: Rect[] = [];
  stage.add(
    <Node x={-720} y={-450}>
      <Eyebrow refNode={briefTag} text={'THE BRIEF'} />
    </Node>,
  );
  stage.add(
    <Node y={360}>
      <KLine refs={hpWords} size={96} words={['PREMIUM', {t: 'WIRELESS HEADPHONES', hl: C.amber}]} />
    </Node>,
  );
  yield* at(47.85);
  spawn(all(...checkRows.map(r => r.opacity(0, 0.3)), unpop(commercial(), 0.3), hideWords(conceptWords, 0.3), prod().opacity(0, 0.3)));
  spawn(flash(0.4, 0.35));
  brief().scale(1.1);
  spawn(brief().scale(1, 5.5, linear));
  yield* brief().opacity(1, 0.4);
  yield* briefTag().opacity(1, 0.3);
  yield* at(51.7);
  yield* revealWords(hpWords, 0.15, 0.5);

  // 53.7 clean · modern · high-end, then the look
  const moodWords: Rect[] = [];
  stage.add(
    <Node y={-300}>
      <KLine refs={moodWords} size={110} words={['CLEAN', '·', 'MODERN', '·', {t: 'HIGH-END', hl: C.amber}]} />
    </Node>,
  );
  const tiles = [
    {l: 'CINEMATIC LIGHTING', src: STILLS[0].src},
    {l: 'DETAILED CLOSE-UPS', src: STILLS[1].src},
    {l: 'INTERESTING ENVIRONMENTS', src: STILLS[2].src},
  ];
  const tileRefs: Rect[] = [];
  stage.add(
    <Node y={90}>
      {tiles.map((t, i) => (
        <Node x={(i - 1) * 580}>
          <Card refNode={r => r && tileRefs.push(r)} width={540} height={400} glow={C.amber} opacity={0} scale={0.6} y={40}>
            <Pic src={t.src} w={540} h={400} />
            <Rect width={540} height={80} y={160} fill={'rgba(3,3,4,0.8)'} />
            <Txt text={t.l} y={160} fontFamily={HEAD} fontWeight={800} fontSize={32} letterSpacing={3} fill={C.text} />
          </Card>
        </Node>
      ))}
    </Node>,
  );
  yield* at(53.7);
  spawn(hideWords(hpWords, 0.25));
  spawn(briefTag().opacity(0, 0.25));
  yield* all(brief().filters([blur(0), brightness(1)]).filters.blur(26, 0.5), brief().filters.brightness(0.3, 0.5));
  yield* at(54.95);
  yield* revealWords(moodWords.slice(0, 2), 0.1);
  yield* at(55.65);
  yield* revealWords(moodWords.slice(2, 4), 0.1);
  yield* at(56.1);
  yield* revealWords(moodWords.slice(4));
  const tileCues = [56.9, 58.0, 59.6];
  for (let i = 0; i < 3; i++) {
    yield* at(tileCues[i]);
    spawn(all(pop(tileRefs[i], 0.5), tileRefs[i].y(0, 0.5, easeOutCubic)));
  }

  // ---------------------------------------------------------- 62.1 build it in PixVerse Canvas
  const win = createRef<Rect>();
  const nodeRefs: Rect[] = [];
  const links = [createRef<Line>(), createRef<Line>()];
  const aroundTag = createRef<Rect>();
  const frame = createRef<Rect>();
  const winTitle: Rect[] = [];
  const winTitleNode = createRef<Node>();
  const nodes = [
    {t: 'Original Product', x: -470, y: -10, c: C.violet, img: 'product'},
    {t: 'Develop Visuals', x: 0, y: 70, c: C.blue, img: STILLS[1].src},
    {t: 'Build the Video', x: 470, y: -10, c: C.amber, img: 'video'},
  ];
  stage.add(
    <Node ref={winTitleNode} y={-470}>
      <KLine refs={winTitle} size={62} words={['PIXVERSE', {t: 'CANVAS', hl: C.amber}]} />
    </Node>,
  );
  stage.add(
    <Rect ref={win} width={1560} height={800} y={1100} radius={26} fill={'#07080a'} stroke={'rgba(255,255,255,0.18)'} lineWidth={2} shadowBlur={80} shadowColor={'rgba(216,189,138,0.25)'} clip>
      <DotGrid opacity={0.22} gap={36} />
      <Rect width={1560} height={60} y={-370} fill={C.panel2} />
      <Circle size={16} x={-740} y={-370} fill={C.red} />
      <Circle size={16} x={-712} y={-370} fill={C.amber} />
      <Circle size={16} x={-684} y={-370} fill={C.green} />
      <Rect width={560} height={36} y={-370} radius={18} fill={'rgba(255,255,255,0.06)'} />
      <Txt text={'PixVerse Canvas  ·  Headphones Ad'} y={-370} fontFamily={BODY} fontWeight={600} fontSize={20} fill={C.dim} />
      <Rect width={80} height={740} x={-740} y={30} fill={'rgba(12,13,16,0.9)'} />
      {[0, 1, 2, 3, 4].map(i => (
        <Rect x={-740} y={-250 + i * 80} size={44} radius={12} fill={i === 1 ? C.amber : 'rgba(255,255,255,0.08)'} />
      ))}
      <Node x={40} y={20}>
        <Line ref={links[0]} points={[[-450, 0], [-20, 70]]} stroke={C.dim} lineWidth={4} lineDash={[12, 10]} end={0} />
        <Line ref={links[1]} points={[[20, 70], [450, 0]]} stroke={C.dim} lineWidth={4} lineDash={[12, 10]} end={0} />
        <Rect ref={frame} width={0} height={0} y={30} radius={30} stroke={C.amber} lineWidth={4} lineDash={[20, 14]} opacity={0} />
        {nodes.map(n => (
          <Rect ref={r => r && nodeRefs.push(r)} x={n.x} y={n.y} width={380} height={290} radius={20} fill={C.panel} stroke={n.c} lineWidth={3} shadowBlur={40} shadowColor={n.c} clip opacity={0} scale={0.6}>
            <Rect width={380} height={56} y={-117} fill={C.panel2} />
            <Circle size={14} x={-160} y={-117} fill={n.c} />
            <Txt text={n.t} x={-142} y={-117} offset={[-1, 0]} fontFamily={BODY} fontWeight={600} fontSize={22} fill={C.text} />
            <Rect width={350} height={208} y={22} radius={12} clip fill={'#0a0b0e'}>
              {n.img === 'product' ? <Product w={350} h={208} /> : null}
              {n.img === 'video' ? <Clip w={350} h={208} time={PLAY.wide} play /> : null}
              {n.img !== 'product' && n.img !== 'video' ? <Pic src={n.img} w={350} h={208} /> : null}
            </Rect>
          </Rect>
        ))}
        <Node y={-250}>
          <Chip refNode={aroundTag} icon={'◆'} text={'BUILT AROUND THE ORIGINAL PRODUCT'} size={30} bg={C.amber} color={C.bg} iconColor={C.bg} stroke={C.amber} />
        </Node>
      </Node>
    </Rect>,
  );
  yield* at(62.0);
  spawn(hideWords(moodWords, 0.25));
  spawn(all(...tileRefs.map(t => unpop(t, 0.3))));
  yield* all(win().y(60, 0.8, easeOutCubic), brief().opacity(0.4, 0.6));
  yield* at(64.5);
  yield* revealWords(winTitle, 0.12);
  yield* pop(nodeRefs[0], 0.45);
  yield* at(65.6);
  spawn(draw(links[0](), 0.45));
  yield* pop(nodeRefs[1], 0.45);
  yield* at(66.7);
  spawn(draw(links[1](), 0.45));
  yield* pop(nodeRefs[2], 0.45);
  yield* at(67.6);
  frame().opacity(1);
  spawn(frame().size([1420, 500], 0.6, easeOutCubic));
  yield* waitFor(0.25);
  yield* pop(aroundTag(), 0.45);

  // ---------------------------------------------------------- 69.4 the image is only a starting point
  const spCard = createRef<Rect>();
  const spWords: Rect[] = [];
  const keyTag = createRef<Rect>();
  stage.add(
    <Node y={-400}>
      <Eyebrow refNode={keyTag} text={'ONE THING TO EMPHASIZE'} />
    </Node>,
  );
  stage.add(
    <Card refNode={spCard} width={760} height={428} y={-60} glow={C.violet} opacity={0} scale={0.6}>
      <Product w={760} h={428} />
    </Card>,
  );
  stage.add(
    <Node y={290}>
      <KLine refs={spWords} size={80} words={['THE', 'IMAGE', 'IS', 'JUST', {t: 'A STARTING POINT', box: true}]} />
    </Node>,
  );
  yield* at(69.3);
  yield* all(win().scale(1.2, 0.45, easeInCubic), win().opacity(0, 0.45), hideWords(winTitle, 0.3), brief().opacity(0, 0.45));
  yield* keyTag().opacity(1, 0.3);
  yield* at(71.4);
  yield* pop(spCard(), 0.5);
  yield* at(72.4);
  yield* revealWords(spWords, 0.1);

  // 74.1 we still need a creative direction
  const dirWords: Rect[] = [];
  const opts = [
    {t: 'FUTURISTIC', c: C.blue},
    {t: 'BRIGHT LIFESTYLE', c: C.green},
    {t: 'MINIMALIST PREMIUM', c: C.amber},
  ];
  const optRefs: Rect[] = [];
  const chosen = createRef<Rect>();
  stage.add(
    <Node y={-400}>
      <KLine refs={dirWords} size={80} words={['+', 'A', {t: 'CREATIVE DIRECTION', hl: C.amber}]} />
    </Node>,
  );
  const whatWords: Rect[] = [];
  stage.add(
    <Node y={-150}>
      <KLine refs={whatWords} size={56} weight={600} family={BODY} color={C.dim} words={['what', 'kind', 'of', 'ad', 'do', 'we', 'want?']} gap={16} />
    </Node>,
  );
  stage.add(
    <Node y={60}>
      {opts.map((o, i) => (
        <Rect ref={r => r && optRefs.push(r)} x={(i - 1) * 560} width={500} height={180} radius={24} fill={C.panel} stroke={o.c} lineWidth={3} shadowBlur={30} shadowColor={o.c} opacity={0} scale={0.6}>
          <Txt text={`OPTION 0${i + 1}`} y={-40} fontFamily={MONO} fontSize={22} fill={o.c} />
          <Txt text={o.t} y={20} fontFamily={HEAD} fontWeight={900} fontSize={44} letterSpacing={2} fill={C.text} />
        </Rect>
      ))}
      <Node x={560} y={150}>
        <Chip refNode={chosen} icon={'✓'} text={'OUR DIRECTION'} size={30} bg={C.amber} color={C.bg} iconColor={C.bg} stroke={C.amber} />
      </Node>
    </Node>,
  );
  yield* at(74.0);
  yield* all(hideWords(spWords, 0.3), keyTag().opacity(0, 0.3), unpop(spCard(), 0.3));
  yield* revealWords(dirWords, 0.1);
  yield* at(76.5);
  spawn(revealWords(whatWords, 0.07));
  yield* sequence(0.25, ...optRefs.map(o => pop(o, 0.45)));
  yield* at(78.4);
  spawn(all(optRefs[0].opacity(0.35, 0.3), optRefs[1].opacity(0.35, 0.3)));
  yield* all(optRefs[2].scale(1.08, 0.3, easeOutBack), pop(chosen(), 0.4));

  // ---------------------------------------------------------- 79.4 a real creative project, not random images
  const realWords: Rect[] = [];
  stage.add(
    <Node y={-400}>
      <KLine refs={realWords} size={80} words={['A', 'REAL', {t: 'CREATIVE PROJECT', hl: C.amber}]} />
    </Node>,
  );
  const scatter: Rect[] = [];
  const spots: [number, number, number, string, number][] = [
    [-700, -120, -8, STILLS[0].src, 0],
    [-280, -170, 6, STILLS[1].src, 160],
    [260, -140, -5, STILLS[2].src, 60],
    [700, -90, 7, STILLS[0].src, 250],
    [-560, 230, 5, STILLS[2].src, 300],
    [0, 200, -6, STILLS[1].src, 90],
    [560, 240, 4, STILLS[0].src, 200],
  ];
  stage.add(
    <Node>
      {spots.map(([x, y, r, src, h]) => (
        <Card refNode={c => c && scatter.push(c)} x={x} y={y} rotation={r} width={380} height={214} glow={'rgba(0,0,0,0)'} radius={16} opacity={0} scale={0.5}>
          <Node filters={[hue(h), brightness(0.9)]}>
            <Pic src={src} w={380} h={214} />
          </Node>
        </Card>
      ))}
    </Node>,
  );
  const randWords: Rect[] = [];
  stage.add(
    <Node y={440}>
      <KLine refs={randWords} size={68} words={['NOT', 'RANDOM', 'IMAGES', '+', {t: 'HOPE', box: true, hl: C.red}]} />
    </Node>,
  );
  yield* at(79.4);
  yield* all(hideWords(dirWords, 0.3), hideWords(whatWords, 0.3), ...optRefs.map(o => unpop(o, 0.3)), unpop(chosen(), 0.3));
  yield* at(81.2);
  yield* revealWords(realWords, 0.1);
  yield* at(83.2);
  spawn(revealWords(randWords, 0.1));
  yield* sequence(0.12, ...scatter.map(c => pop(c, 0.4)));
  yield* at(85.0);
  // "hoping they look good together" — they don't: desaturate and shake
  yield* all(
    ...scatter.map((c, i) =>
      all(c.filters([grayscale(0)]).filters.grayscale(1, 0.4), c.rotation(c.rotation() + (i % 2 ? 10 : -10), 0.4, easeInOutCubic)),
    ),
  );
  yield* at(86.35);
  yield* stage.opacity(0, 0.4);
});
