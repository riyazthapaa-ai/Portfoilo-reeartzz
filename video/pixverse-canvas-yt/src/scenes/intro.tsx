// SECTION 02 / 0:30–1:05 — Introducing PixVerse Canvas.
// Cue times are seconds into vo-intro.wav.
import {Audio, Circle, Img, Line, makeScene2D, Node, Rect, Txt, Video, blur, brightness, grayscale} from '@revideo/2d';
import {
  all,
  createRef,
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  linear,
  sequence,
  spawn,
  waitFor,
} from '@revideo/core';
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
  RefImg,
  revealWords,
  SHOT,
  unpop,
  Vignette,
  W,
} from '../lib';

/** A crop of the reference image centred on image pixel (cx, cy) at scale k. */
function Crop({w, h, cx, cy, k}: {w: number; h: number; cx: number; cy: number; k: number}) {
  return (
    <Rect width={w} height={h} clip>
      <Img src={'/reference.jpg'} width={1672 * k} height={941 * k} x={(836 - cx) * k} y={(470.5 - cy) * k} />
    </Rect>
  );
}

/** Canvas node card (workspace UI). */
function NodeCard({
  refNode,
  x,
  y,
  title,
  color,
  children,
}: {
  refNode: (r: Rect) => void;
  x: number;
  y: number;
  title: string;
  color: string;
  children: any;
}) {
  return (
    <Rect
      ref={refNode as any}
      x={x}
      y={y}
      width={380}
      height={290}
      radius={20}
      fill={C.panel}
      stroke={color}
      lineWidth={3}
      shadowBlur={40}
      shadowColor={color}
      clip
      opacity={0}
      scale={0.6}
    >
      <Rect width={380} height={56} y={-117} fill={C.panel2} />
      <Circle size={14} x={-160} y={-117} fill={color} shadowBlur={12} shadowColor={color} />
      <Txt text={title} x={-142} y={-117} offset={[-1, 0]} fontFamily={BODY} fontWeight={600} fontSize={22} fill={C.text} />
      <Rect width={350} height={208} y={22} radius={12} clip>
        {children}
      </Rect>
    </Rect>
  );
}

/** Minimal timeline graphic for the editor node / step card. */
function MiniTimeline({w, h}: {w: number; h: number}) {
  const tw = (w - 40) / 3;
  return (
    <Node>
      <Rect width={w} height={h} fill={'#0a0c18'} />
      {[SHOT.notice, SHOT.approach, SHOT.reveal].map((t, i) => (
        <Rect x={-w / 2 + 20 + tw / 2 + i * tw} y={-h * 0.12} width={tw - 8} height={h * 0.42} radius={8} clip>
          <Clip w={tw - 8} h={h * 0.42} time={t} />
        </Rect>
      ))}
      <Rect x={-w / 2 + 20 + (w - 40) * 0.42} y={h * 0.27} width={(w - 40) * 0.84} height={h * 0.12} radius={6} fill={C.violet} opacity={0.6} />
      <Rect x={-w / 2 + 20 + (w - 40) * 0.3} y={h * 0.43} width={(w - 40) * 0.25} height={h * 0.1} radius={6} fill={C.amber} opacity={0.7} />
      <Rect x={-w * 0.05} width={4} height={h * 0.95} fill={C.amber} />
    </Node>
  );
}

export default makeScene2D('intro', function* (view) {
  Backdrop(view);
  view.add(<Audio src={'/vo-intro.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  Vignette(view);
  const flash = Flash(view);

  // ---------------------------------------------------------- 0.27 title
  const titleNode = createRef<Node>();
  const tWords: Rect[] = [];
  const thisIs = createRef<Rect>();
  stage.add(
    <Node ref={titleNode}>
      <Node y={-130}>
        <Eyebrow refNode={thisIs} text={'THIS IS'} />
      </Node>
      <KLine refs={tWords} size={170} gap={40} words={['PIXVERSE', {t: 'CANVAS', hl: C.amber}]} />
    </Node>,
  );
  const tagWords: Rect[] = [];
  const tagline = createRef<Node>();
  stage.add(
    <Node ref={tagline} y={140}>
      <KLine refs={tagWords} size={44} weight={600} family={BODY} color={C.dim} words={['a', 'creative', 'workspace']} gap={14} />
    </Node>,
  );
  yield* cue(0.2);
  spawn(thisIs().opacity(1, 0.3));
  yield* revealWords(tWords, 0.15, 0.55);
  yield* cue(1.9);
  yield* revealWords(tagWords, 0.1);

  // ---------------------------------------------------------- 2.6 workspace window
  const win = createRef<Rect>();
  const nodesLayer = createRef<Node>();
  const nodeRefs: Rect[] = [];
  const links = [createRef<Line>(), createRef<Line>()];
  const frame = createRef<Rect>();
  const frameTag = createRef<Rect>();
  stage.add(
    <Rect
      ref={win}
      width={1560}
      height={800}
      y={1100}
      radius={26}
      fill={'#090b16'}
      stroke={'rgba(255,255,255,0.18)'}
      lineWidth={2}
      shadowBlur={80}
      shadowColor={'rgba(91,140,255,0.35)'}
      clip
    >
      <DotGrid opacity={0.25} gap={36} />
      {/* title bar */}
      <Rect width={1560} height={60} y={-370} fill={C.panel2} />
      <Circle size={16} x={-740} y={-370} fill={C.red} />
      <Circle size={16} x={-712} y={-370} fill={C.amber} />
      <Circle size={16} x={-684} y={-370} fill={C.green} />
      <Rect width={520} height={36} y={-370} radius={18} fill={'rgba(255,255,255,0.06)'} />
      <Txt text={'PixVerse Canvas  ·  Lone Traveler'} y={-370} fontFamily={BODY} fontWeight={600} fontSize={20} fill={C.dim} />
      {/* toolbar */}
      <Rect width={80} height={740} x={-740} y={30} fill={'rgba(13,16,32,0.9)'} />
      {[0, 1, 2, 3, 4].map(i => (
        <Rect x={-740} y={-250 + i * 80} size={44} radius={12} fill={i === 0 ? C.amber : 'rgba(255,255,255,0.08)'} opacity={i === 0 ? 0.9 : 1} />
      ))}
      <Node ref={nodesLayer} x={40} y={10}>
        <Line ref={links[0]} points={[[-430, 0], [-20, 80]]} stroke={C.dim} lineWidth={4} lineDash={[12, 10]} end={0} />
        <Line ref={links[1]} points={[[20, 80], [430, 0]]} stroke={C.dim} lineWidth={4} lineDash={[12, 10]} end={0} />
        <NodeCard refNode={r => r && nodeRefs.push(r)} x={-450} y={-20} title={'Image Generation'} color={C.blue}>
          <RefImg w={350} h={208} />
        </NodeCard>
        <NodeCard refNode={r => r && nodeRefs.push(r)} x={0} y={80} title={'Video Generation'} color={C.violet}>
          <Clip w={350} h={208} time={SHOT.approach - 2} play />
        </NodeCard>
        <NodeCard refNode={r => r && nodeRefs.push(r)} x={450} y={-20} title={'Video Editor'} color={C.amber}>
          <MiniTimeline w={350} h={208} />
        </NodeCard>
        <Rect ref={frame} width={0} height={0} y={30} radius={30} stroke={C.amber} lineWidth={4} lineDash={[20, 14]} opacity={0} />
        <Node y={-260}>
          <Chip refNode={frameTag} text={'ONE PROJECT'} icon={'◆'} size={30} bg={C.amber} color={C.bg} iconColor={C.bg} stroke={C.amber} />
        </Node>
      </Node>
    </Rect>,
  );
  yield* cue(2.55);
  spawn(hideWords(tagWords, 0.2));
  spawn(thisIs().opacity(0, 0.2));
  yield* all(
    titleNode().y(-470, 0.7, easeInOutCubic),
    titleNode().scale(0.42, 0.7, easeInOutCubic),
    win().y(70, 0.8, easeOutCubic),
  );
  yield* cue(3.5);
  yield* pop(nodeRefs[0], 0.5);
  yield* cue(4.6);
  spawn(draw(links[0](), 0.5));
  yield* pop(nodeRefs[1], 0.5);
  yield* cue(5.55);
  spawn(draw(links[1](), 0.5));
  yield* pop(nodeRefs[2], 0.5);
  yield* cue(6.35);
  frame().opacity(1);
  spawn(frame().size([1400, 520], 0.6, easeOutCubic));
  yield* waitFor(0.3);
  yield* pop(frameTag(), 0.45);

  // ---------------------------------------------------------- 8.0 idea → finished piece
  const steps = [
    {l: 'IDEA / REFERENCE', c: C.blue},
    {l: 'DEVELOP VISUALS', c: C.violet},
    {l: 'VIDEO EDITOR', c: C.amber},
    {l: 'FINISHED PIECE', c: C.green},
  ];
  const stepRefs: Rect[] = [];
  const stepArrows = [createRef<Line>(), createRef<Line>(), createRef<Line>()];
  const stepsLayer = createRef<Node>();
  const pieceVid = createRef<Video>();
  const sx = (i: number) => (i - 1.5) * 370;
  win().add(
    <Node ref={stepsLayer} x={40} y={20}>
      {steps.map((s, i) => (
        <Rect
          ref={r => r && stepRefs.push(r)}
          x={sx(i)}
          width={310}
          height={330}
          radius={20}
          fill={C.panel}
          stroke={s.c}
          lineWidth={3}
          shadowBlur={36}
          shadowColor={s.c}
          clip
          opacity={0}
          scale={0.6}
        >
          <Rect width={280} height={190} y={-50} radius={12} clip>
            {i === 0 ? <RefImg w={280} h={190} /> : null}
            {i === 1 ? <Clip w={280} h={190} time={SHOT.notice} /> : null}
            {i === 2 ? <MiniTimeline w={280} h={190} /> : null}
            {i === 3 ? <Clip w={280} h={190} time={SHOT.reveal - 1} vidRef={pieceVid} /> : null}
          </Rect>
          <Txt text={`0${i + 1}`} y={80} fontFamily={MONO} fontSize={22} fill={s.c} />
          <Txt text={s.l} y={120} fontFamily={HEAD} fontWeight={800} fontSize={28} letterSpacing={2} fill={C.text} />
        </Rect>
      ))}
      {stepArrows.map((a, i) => (
        <Arrow refNode={a} from={[sx(i) + 158, 0]} to={[sx(i + 1) - 158, 0]} width={5} />
      ))}
    </Node>,
  );
  yield* cue(8.0);
  yield* all(unpop(nodesLayer(), 0.4));
  yield* cue(8.9);
  yield* pop(stepRefs[0], 0.5);
  yield* cue(10.8);
  spawn(draw(stepArrows[0](), 0.35));
  yield* pop(stepRefs[1], 0.5);
  yield* cue(12.0);
  spawn(draw(stepArrows[1](), 0.35));
  yield* pop(stepRefs[2], 0.5);
  yield* cue(14.1);
  pieceVid().play();
  spawn(draw(stepArrows[2](), 0.35));
  yield* pop(stepRefs[3], 0.5);

  // ---------------------------------------------------------- 15.9 the concept
  const concept = createRef<Node>();
  const cImg = createRef<Img>();
  const IW = 1920;
  const IH = (1920 * 941) / 1672;
  stage.add(
    <Node ref={concept} opacity={0}>
      <Img ref={cImg} src={'/reference.jpg'} width={IW} height={IH} />
    </Node>,
  );
  const conceptTag = createRef<Rect>();
  const seqWords: Rect[] = [];
  const seqText = createRef<Node>();
  stage.add(
    <Node x={-700} y={-450}>
      <Eyebrow refNode={conceptTag} text={'THE CONCEPT'} />
    </Node>,
  );
  stage.add(
    <Node ref={seqText} y={360}>
      <KLine refs={seqWords} size={96} words={['A', 'SHORT', {t: 'CINEMATIC', hl: C.amber}, 'SEQUENCE']} />
    </Node>,
  );
  yield* cue(15.85);
  spawn(titleNode().opacity(0, 0.4));
  yield* all(win().scale(1.25, 0.5, easeInCubic), win().opacity(0, 0.5), concept().opacity(1, 0.5));
  spawn(cImg().scale(1.08, 3.8, linear)); // must finish before the 20.2 zoom
  yield* conceptTag().opacity(1, 0.3);
  yield* cue(17.4);
  yield* revealWords(seqWords, 0.1);

  // 20.7 zoom on the lone traveler
  // traveler sits at image pixel (555, 590) → screen (-323, 137) at full width.
  const k = 1.5;
  const bracket = createRef<Rect>();
  const travWords: Rect[] = [];
  const travText = createRef<Node>();
  stage.add(
    <Rect ref={bracket} width={360} height={760} radius={16} stroke={C.amber} lineWidth={5} shadowBlur={30} shadowColor={C.amber} opacity={0} scale={1.3} lineDash={[70, 40]} />,
  );
  stage.add(
    <Node ref={travText} x={440} y={-40}>
      <KLine refs={travWords} size={92} words={['A', 'LONE', {t: 'TRAVELER', hl: C.amber}]} />
    </Node>,
  );
  yield* cue(20.2);
  spawn(hideWords(seqWords, 0.2));
  bracket().position([-180, 40]);
  yield* all(
    cImg().scale(k, 0.6, easeInOutCubic),
    cImg().position([323 * k - 180, -137 * k + 40], 0.6, easeInOutCubic),
  );
  spawn(all(bracket().opacity(1, 0.3), bracket().scale(1, 0.4, easeOutBack)));
  spawn(bracket().lineDashOffset(-220, 3, linear));
  yield* revealWords(travWords, 0.1);

  // 22.2 the city, at night
  const cityWords: Rect[] = [];
  const moon = createRef<Circle>();
  const nightChip = createRef<Rect>();
  stage.add(
    <Node y={380}>
      <KLine refs={cityWords} size={84} words={['EXPLORING', 'A', 'MYSTERIOUS', {t: 'FUTURISTIC CITY', box: true}]} />
    </Node>,
  );
  stage.add(<Circle ref={moon} x={142} y={-455} size={0} stroke={C.text} lineWidth={4} shadowBlur={30} shadowColor={C.blue} />);
  stage.add(
    <Node x={142} y={-320}>
      <Chip refNode={nightChip} icon={'☾'} text={'AT NIGHT'} size={34} iconColor={C.blue} />
    </Node>,
  );
  yield* cue(22.2);
  spawn(hideWords(travWords, 0.2));
  spawn(all(bracket().opacity(0, 0.3)));
  spawn(all(cImg().scale(1.04, 0.9, easeInOutCubic), cImg().position([0, 0], 0.9, easeInOutCubic)));
  yield* waitFor(0.25);
  yield* revealWords(cityWords, 0.11);
  yield* cue(23.95);
  spawn(moon().size(200, 0.5, easeOutBack));
  yield* pop(nightChip(), 0.45);

  // ---------------------------------------------------------- 25.0 the mood
  const tiles = [
    {l: 'ATMOSPHERIC', cx: 1150, cy: 700, k: 1.2, c: C.blue},
    {l: 'CINEMATIC', cx: 836, cy: 470, k: 0.62, c: C.violet},
    {l: 'DRAMATIC LIGHTING', cx: 1090, cy: 520, k: 1.4, c: C.amber},
    {l: 'REFLECTIONS', cx: 420, cy: 740, k: 1.4, c: C.green},
  ];
  const tileRefs: Rect[] = [];
  const moodLayer = createRef<Node>();
  stage.add(
    <Node ref={moodLayer} y={-30}>
      {tiles.map((t, i) => (
        <Node x={(i - 1.5) * 440}>
          <Rect
            ref={r => r && tileRefs.push(r)}
            width={400}
            height={520}
            radius={24}
            clip
            stroke={t.c}
            lineWidth={3}
            shadowBlur={40}
            shadowColor={t.c}
            opacity={0}
            scale={0.6}
            y={40}
          >
            <Crop w={400} h={520} cx={t.cx} cy={t.cy} k={t.k} />
            <Rect width={400} height={90} y={215} fill={'rgba(5,6,12,0.78)'} />
            <Txt text={t.l} y={215} fontFamily={HEAD} fontWeight={800} fontSize={34} letterSpacing={3} fill={C.text} />
          </Rect>
        </Node>
      ))}
    </Node>,
  );
  const moodTag = createRef<Rect>();
  stage.add(
    <Node y={-420}>
      <Eyebrow refNode={moodTag} text={'THE MOOD'} color={C.violet} />
    </Node>,
  );
  yield* cue(24.95);
  spawn(hideWords(cityWords, 0.2));
  spawn(unpop(nightChip(), 0.2));
  spawn(moon().opacity(0, 0.2));
  spawn(conceptTag().opacity(0, 0.2));
  yield* concept().filters([blur(0), brightness(1)]).filters.blur(30, 0.5);
  spawn(concept().filters.brightness(0.35, 0.5));
  spawn(moodTag().opacity(1, 0.3));
  const tileCues = [26.0, 26.9, 27.8, 28.95];
  for (let i = 0; i < tiles.length; i++) {
    yield* cue(tileCues[i]);
    spawn(all(pop(tileRefs[i], 0.5), tileRefs[i].y(0, 0.5, easeOutCubic)));
  }

  // 29.8 clear progression from one shot to the next
  const prog = createRef<Node>();
  const progCards: Rect[] = [];
  const progArrows = [createRef<Line>(), createRef<Line>()];
  const progChip = createRef<Rect>();
  stage.add(
    <Node ref={prog} y={260}>
      {[SHOT.notice, SHOT.approach, SHOT.reveal].map((t, i) => (
        <Card refNode={r => r && progCards.push(r)} x={(i - 1) * 480} width={420} height={236} glow={C.amber} opacity={0} scale={0.6}>
          <Clip w={420} h={236} time={t} />
          <Txt text={`SHOT 0${i + 1}`} x={-190} y={-95} offset={[-1, 0]} fontFamily={MONO} fontSize={22} fill={C.amber} shadowBlur={10} shadowColor={'#000'} />
        </Card>
      ))}
      <Arrow refNode={progArrows[0]} from={[-265, 0]} to={[-215, 0]} />
      <Arrow refNode={progArrows[1]} from={[215, 0]} to={[265, 0]} />
    </Node>,
  );
  stage.add(
    <Node y={40}>
      <Chip refNode={progChip} icon={'→'} text={'CLEAR PROGRESSION, SHOT TO SHOT'} size={36} />
    </Node>,
  );
  yield* cue(29.75);
  yield* all(
    moodLayer().y(-250, 0.6, easeInOutCubic),
    moodLayer().scale(0.62, 0.6, easeInOutCubic),
    moodTag().opacity(0, 0.3),
  );
  spawn(pop(progChip(), 0.45));
  yield* sequence(0.35, ...progCards.map(c => pop(c, 0.45)));
  spawn(draw(progArrows[0](), 0.3));
  yield* draw(progArrows[1](), 0.3);

  // ---------------------------------------------------------- 32.5 not every shot separately
  const scatter = createRef<Node>();
  const scat: Rect[] = [];
  const spots = [
    [-720, -260, -8, 0.6],
    [-300, -330, 5, 3.4],
    [260, -300, -4, 7.5],
    [700, -220, 7, 9.9],
    [-650, 160, 6, 12.6],
    [-200, 220, -6, 14.6],
    [300, 180, 4, 17.2],
    [720, 230, -7, 2.4],
  ];
  stage.add(
    <Node ref={scatter}>
      {spots.map(([x, y, r, t]) => (
        <Card refNode={c => c && scat.push(c)} x={x} y={y} rotation={r} width={360} height={203} glow={'rgba(0,0,0,0)'} radius={16} opacity={0} scale={0.5}>
          <Clip w={360} h={203} time={t} />
        </Card>
      ))}
    </Node>,
  );
  const sepWords: Rect[] = [];
  const sepText = createRef<Node>();
  stage.add(
    <Node ref={sepText} y={-10}>
      <KLine refs={sepWords} size={76} words={['GENERATING', 'EVERY', 'SHOT', {t: 'SEPARATELY?', box: true, hl: C.red}]} />
    </Node>,
  );
  yield* cue(32.5);
  spawn(unpop(progChip(), 0.25));
  yield* all(moodLayer().opacity(0, 0.35), prog().opacity(0, 0.35));
  spawn(revealWords(sepWords, 0.12));
  yield* sequence(0.18, ...scat.map(c => pop(c, 0.45)));
  yield* cue(34.6);
  yield* all(...scat.map(c => c.filters([grayscale(0), brightness(1)]).filters.grayscale(1, 0.4)), ...scat.map(c => c.filters.brightness(0.5, 0.4)));

  // 35.2 begin with one reference and build around it
  const hub = createRef<Rect>();
  const spokes: Line[] = [];
  const orbit = [
    [-640, -270],
    [0, -360],
    [640, -270],
    [-700, 120],
    [700, 120],
    [-380, 330],
    [380, 330],
    [0, 380],
  ];
  const spokeLayer = createRef<Node>();
  stage.add(
    <Node ref={spokeLayer}>
      {orbit.map(([x, y]) => (
        <Line ref={l => l && spokes.push(l)} points={[[0, 0], [x * 0.82, y * 0.82]]} stroke={C.amber} lineWidth={3} lineDash={[10, 10]} end={0} opacity={0.8} />
      ))}
    </Node>,
  );
  spokeLayer().moveBelow(scatter());
  stage.add(
    <Card refNode={hub} width={560} height={315} glow={C.amber} opacity={0} scale={0.5}>
      <RefImg w={560} h={315} />
    </Card>,
  );
  const hubTag = createRef<Rect>();
  stage.add(
    <Node y={-205}>
      <Eyebrow refNode={hubTag} text={'REFERENCE IMAGE'} />
    </Node>,
  );
  const buildWords: Rect[] = [];
  stage.add(
    <Node y={470}>
      <KLine refs={buildWords} size={62} words={['BUILD', 'THE', 'PROJECT', {t: 'AROUND IT', hl: C.amber}]} />
    </Node>,
  );
  yield* cue(35.2);
  spawn(hideWords(sepWords, 0.25));
  yield* all(
    ...scat.map((c, i) =>
      all(
        c.position(orbit[i] as [number, number], 0.7, easeInOutCubic),
        c.rotation(0, 0.7, easeInOutCubic),
        c.scale(0.75, 0.7, easeInOutCubic),
        c.filters.grayscale(0, 0.7),
        c.filters.brightness(1, 0.7),
      ),
    ),
  );
  yield* cue(36.1);
  spawn(flash(0.35, 0.3));
  yield* all(pop(hub(), 0.5), hubTag().opacity(1, 0.3));
  yield* cue(37.0);
  spawn(revealWords(buildWords, 0.1));
  yield* sequence(0.05, ...spokes.map(s => s.end(1, 0.4, easeOutCubic)));
  yield* cue(38.3);
  yield* all(stage.opacity(0, 0.4));
});
