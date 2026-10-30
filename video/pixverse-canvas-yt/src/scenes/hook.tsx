// SECTION 01 / 0:00–0:30 — Hook: one image, a whole visual world.
// Cue times are seconds into vo-hook.wav.
import {Audio, Img, Line, makeScene2D, Node, Rect, Txt, Video, blur, brightness} from '@revideo/2d';
import {
  all,
  createRef,
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  easeOutExpo,
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
  CardLabel,
  Chip,
  Clip,
  cue,
  draw,
  Eyebrow,
  Flash,
  H,
  HEAD,
  hideWords,
  KLine,
  Letterbox,
  MONO,
  pop,
  RefImg,
  revealWords,
  SHOT,
  unpop,
  Vignette,
  W,
} from '../lib';

export default makeScene2D('hook', function* (view) {
  Backdrop(view);
  view.add(<Audio src={'/vo-hook.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  const bars = Letterbox(view, 120);
  Vignette(view);
  const flash = Flash(view);

  // ---------------------------------------------------------------- 0.0 cold open
  const open = createRef<Node>();
  const openVid = createRef<Video>();
  stage.add(
    <Node ref={open}>
      <Clip w={W} h={H} time={0} play vidRef={openVid} />
    </Node>,
  );
  const l1: Rect[] = [];
  const l2: Rect[] = [];
  const openText = createRef<Node>();
  stage.add(
    <Node ref={openText} y={300}>
      <Node y={-70}>
        <KLine refs={l1} size={64} weight={800} words={['THIS', 'ENTIRE', 'CINEMATIC', 'SEQUENCE']} />
      </Node>
      <Node y={30}>
        <KLine
          refs={l2}
          size={104}
          words={['STARTED', 'WITH', 'JUST', {t: 'ONE IMAGE', box: true}]}
        />
      </Node>
    </Node>,
  );
  open().scale(1.12);
  spawn(open().scale(1, 3.6, linear));
  spawn(bars.in(0.8));
  yield* cue(0.15);
  yield* revealWords(l1, 0.09);
  yield* cue(1.7);
  yield* revealWords(l2.slice(0, 3), 0.1);
  yield* cue(2.55);
  yield* revealWords(l2.slice(3));

  // ------------------------------------------------- 3.4 the original image
  const refCard = createRef<Rect>();
  const refImg = createRef<Img>();
  const refLabel = createRef<Rect>();
  const ideaWords: Rect[] = [];
  const ideaRow = createRef<Node>();
  stage.add(
    <Node>
      <Card refNode={refCard} width={1000} height={563} glow={C.amber} scale={0.6} opacity={0}>
        <RefImg w={1000} h={563} imgRef={refImg} />
      </Card>
      <Node ref={ideaRow} y={-400}>
        <KLine refs={ideaWords} size={70} words={['A', 'SIMPLE', {t: 'VISUAL IDEA', hl: C.amber}]} />
      </Node>
    </Node>,
  );
  stage.add(
    <Node y={330}>
      <Eyebrow refNode={refLabel} text={'THE ORIGINAL IMAGE'} />
    </Node>,
  );

  yield* cue(3.35);
  spawn(flash(0.7, 0.4));
  open().opacity(0);
  openText().opacity(0);
  spawn(bars.out(0.4));
  yield* all(refCard().opacity(1, 0.3), refCard().scale(1, 0.6, easeOutBack), refLabel().opacity(1, 0.4));
  yield* cue(5.0);
  yield* revealWords(ideaWords, 0.12);

  // --------------------------------------------- 6.4 expand into an entire world
  const worldWords: Rect[] = [];
  const worldText = createRef<Node>();
  stage.add(
    <Node ref={worldText} y={360}>
      <KLine refs={worldWords} size={110} words={['AN', 'ENTIRE', {t: 'WORLD', hl: C.amber}]} />
    </Node>,
  );
  yield* cue(6.45);
  spawn(hideWords(ideaWords));
  spawn(unpop(refLabel(), 0.25));
  spawn(function* () {
    yield* waitFor(0.45);
    yield* revealWords(worldWords, 0.12);
  });
  yield* all(
    refCard().size([W, H], 0.9, easeInOutCubic),
    refCard().radius(0, 0.9),
    refImg().size([W * 1.02, (W * 1.02 * 941) / 1672], 0.9, easeInOutCubic),
  );
  spawn(refImg().scale(1.18, 2.2, linear));
  spawn(refImg().filters([brightness(1)]).filters.brightness(0.65, 0.6));

  // --------------------------------------------- 8.1 a finished video
  const vidLayer = createRef<Node>();
  const vid2 = createRef<Video>();
  const finWords: Rect[] = [];
  const playBtn = createRef<Rect>();
  stage.add(
    <Node ref={vidLayer} opacity={0}>
      <Clip w={W} h={H} time={SHOT.approach - 2.5} play vidRef={vid2} />
    </Node>,
  );
  const finText = createRef<Node>();
  stage.add(
    <Node ref={finText} y={360}>
      <Rect layout direction={'row'} gap={30} alignItems={'center'}>
        <Rect ref={playBtn} size={110} radius={60} fill={C.amber} opacity={0} scale={0.5} layout justifyContent={'center'} alignItems={'center'}>
          <Txt text={'▶'} fontSize={50} fill={C.bg} fontFamily={BODY} />
        </Rect>
        <KLine refs={finWords} size={110} words={['A', 'FINISHED', {t: 'VIDEO', box: true}]} />
      </Rect>
    </Node>,
  );
  yield* cue(8.05);
  spawn(hideWords(worldWords, 0.2));
  spawn(flash(0.5, 0.3));
  vidLayer().opacity(1);
  refCard().opacity(0);
  vidLayer().scale(1.1);
  spawn(vidLayer().scale(1, 2, easeOutCubic));
  yield* pop(playBtn(), 0.4);
  yield* revealWords(finWords, 0.1);

  // --------------------------------------------- 9.7 without jumping between AI tools
  const tools = [
    {n: 'Image Gen', c: C.blue, x: -620, y: -230, r: -6},
    {n: 'Upscaler', c: C.violet, x: -180, y: -300, r: 4},
    {n: 'Video Gen', c: C.amber, x: 330, y: -250, r: -3},
    {n: 'Editor', c: C.green, x: 650, y: 40, r: 7},
    {n: 'Voice', c: C.red, x: -560, y: 150, r: 5},
    {n: 'Export', c: C.blue, x: 60, y: 120, r: -5},
  ];
  const toolRefs: Rect[] = [];
  const toolsLayer = createRef<Node>();
  stage.add(
    <Node ref={toolsLayer}>
      {tools.map(t => (
        <Rect
          ref={n => n && toolRefs.push(n)}
          x={t.x}
          y={t.y}
          rotation={t.r}
          width={420}
          height={270}
          radius={22}
          fill={C.panel}
          stroke={'rgba(255,255,255,0.18)'}
          lineWidth={2}
          shadowBlur={50}
          shadowColor={'rgba(0,0,0,0.8)'}
          clip
          opacity={0}
          scale={0.4}
        >
          <Rect width={420} height={50} y={-110} fill={C.panel2} />
          <Rect width={14} height={14} radius={7} x={-180} y={-110} fill={C.red} />
          <Rect width={14} height={14} radius={7} x={-155} y={-110} fill={C.amber} />
          <Rect width={14} height={14} radius={7} x={-130} y={-110} fill={C.green} />
          <Txt text={t.n} x={0} y={-110} fontFamily={BODY} fontWeight={600} fontSize={22} fill={C.dim} />
          <Rect width={360} height={150} y={15} radius={14} fill={t.c} opacity={0.18} />
          <Txt text={t.n.toUpperCase()} y={15} fontFamily={HEAD} fontWeight={900} fontSize={46} fill={t.c} />
          <Rect width={200} height={12} radius={6} y={110} x={-80} fill={'rgba(255,255,255,0.12)'} />
        </Rect>
      ))}
    </Node>,
  );
  const jumpWords: Rect[] = [];
  const jumpText = createRef<Node>();
  stage.add(
    <Node ref={jumpText} y={390}>
      <KLine refs={jumpWords} size={78} words={['WITHOUT', 'JUMPING', 'BETWEEN', {t: 'AI TOOLS', box: true, hl: C.red}]} />
    </Node>,
  );
  const strike = createRef<Line>();
  stage.add(
    <Line
      ref={strike}
      points={[
        [-800, -420],
        [800, 300],
      ]}
      stroke={C.red}
      lineWidth={18}
      lineCap={'round'}
      end={0}
      shadowBlur={30}
      shadowColor={C.red}
    />,
  );
  yield* cue(9.75);
  spawn(hideWords(finWords, 0.2));
  spawn(unpop(playBtn(), 0.2));
  spawn(vidLayer().filters([blur(0), brightness(1)]).filters.blur(16, 0.6));
  spawn(vidLayer().filters.brightness(0.4, 0.6));
  yield* cue(10.2);
  spawn(revealWords(jumpWords, 0.12));
  for (const t of toolRefs) {
    spawn(pop(t, 0.45));
    yield* waitFor(0.28);
  }
  // nervous jitter while the VO lists the problem
  spawn(
    all(
      ...toolRefs.map((t, i) =>
        t.rotation(t.rotation() + (i % 2 ? 6 : -6), 0.25).to(t.rotation(), 0.25).to(t.rotation() + (i % 2 ? -4 : 4), 0.25).to(t.rotation(), 0.25),
      ),
    ),
  );
  yield* cue(12.35);
  yield* strike().end(1, 0.35, easeOutExpo);

  // --------------------------------------------- 13.6 PixVerse Canvas
  const title = createRef<Node>();
  const tWords: Rect[] = [];
  const ring = createRef<Rect>();
  stage.add(
    <Node ref={title} y={-80}>
      <Rect ref={ring} size={0} radius={2000} stroke={C.amber} lineWidth={6} opacity={0.9} shadowBlur={40} shadowColor={C.amber} />
      <KLine refs={tWords} size={150} gap={36} words={['PIXVERSE', {t: 'CANVAS', hl: C.amber}]} />
    </Node>,
  );
  const pills = createRef<Node>();
  const pillRefs: Rect[] = [];
  stage.add(
    <Node ref={pills} y={120}>
      <Rect layout direction={'row'} gap={28}>
        <Chip refNode={r => r && pillRefs.push(r)} icon={'✦'} text={'DEVELOP VISUALS'} />
        <Chip refNode={r => r && pillRefs.push(r)} icon={'✦'} text={'GENERATE SHOTS'} />
        <Chip refNode={r => r && pillRefs.push(r)} icon={'✦'} text={'EDIT IN ONE PLACE'} iconColor={C.green} />
      </Rect>
    </Node>,
  );
  yield* cue(13.6);
  spawn(hideWords(jumpWords, 0.2));
  spawn(strike().opacity(0, 0.2));
  yield* all(
    ...toolRefs.map(t => all(t.position([0, -80], 0.45, easeInCubic), t.scale(0, 0.45, easeInCubic), t.rotation(0, 0.45))),
    vidLayer().opacity(0.25, 0.45),
  );
  spawn(flash(0.6, 0.35));
  spawn(ring().size(1300, 0.9, easeOutExpo));
  spawn(ring().opacity(0, 0.9));
  yield* revealWords(tWords, 0.12, 0.5);
  yield* cue(15.2);
  yield* pop(pillRefs[0], 0.45);
  yield* cue(16.9);
  yield* pop(pillRefs[1], 0.45);
  yield* cue(18.4);
  yield* pop(pillRefs[2], 0.45);

  // --------------------------------------------- 19.9 not just random clips
  const grid = createRef<Node>();
  const tiles: Rect[] = [];
  const times = [0.5, 4.2, 9.8, 15.1, 6.4, 12.2, 2.2, 17.8, 10.9];
  stage.add(
    <Node ref={grid} y={-60}>
      {times.map((t, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <Card
            refNode={r => r && tiles.push(r)}
            width={430}
            height={242}
            x={(col - 1) * 470 + (row % 2 ? 30 : -30)}
            y={(row - 1) * 270}
            rotation={((i * 37) % 9) - 4}
            glow={'rgba(0,0,0,0)'}
            radius={18}
            opacity={0}
            scale={0.5}
          >
            <Node filters={[brightness(0.6)]}>
              <Clip w={430} h={242} time={t} />
            </Node>
          </Card>
        );
      })}
    </Node>,
  );
  const randWords: Rect[] = [];
  const randStrike = createRef<Rect>();
  const randText = createRef<Node>();
  stage.add(
    <Node ref={randText} y={410}>
      <KLine refs={randWords} size={90} words={['NOT', 'JUST', {t: 'RANDOM CLIPS', hl: C.dim}]} />
      <Rect ref={randStrike} x={165} width={0} height={12} radius={6} fill={C.red} />
    </Node>,
  );
  yield* cue(19.9);
  yield* all(title().opacity(0, 0.3), title().y(-200, 0.3), pills().opacity(0, 0.3));
  spawn(revealWords(randWords, 0.1));
  yield* sequence(0.09, ...tiles.map(t => pop(t, 0.4)));
  yield* cue(22.5);
  yield* randStrike().width(560, 0.35, easeOutExpo);
  // shuffle — the tiles feel disconnected
  spawn(all(...tiles.map((t, i) => t.rotation(t.rotation() + (i % 2 ? 8 : -8), 0.5, easeInOutCubic))));

  // --------------------------------------------- 23.9 a sequence with consistent direction
  const seq = createRef<Node>();
  const shots = [
    {t: SHOT.notice, l: 'NOTICE', n: '01'},
    {t: SHOT.approach, l: 'APPROACH', n: '02'},
    {t: SHOT.reveal, l: 'REVEAL', n: '03'},
  ];
  const shotCards: Rect[] = [];
  const shotArrows = [createRef<Line>(), createRef<Line>()];
  stage.add(
    <Node ref={seq} y={-40}>
      {shots.map((s, i) => (
        <Node x={(i - 1) * 600}>
          <Card refNode={r => r && shotCards.push(r)} width={520} height={293} glow={C.blue} opacity={0} scale={0.6}>
            <Clip w={520} h={293} time={s.t} />
            <Rect layout x={-260} y={146} offset={[-1, 1]} padding={[10, 18]} gap={14} fill={'rgba(5,6,12,0.75)'} radius={[0, 14, 0, 0]}>
              <Txt text={s.n} fontFamily={MONO} fontSize={26} fill={C.amber} />
              <Txt text={s.l} fontFamily={HEAD} fontWeight={800} fontSize={28} letterSpacing={3} fill={C.text} />
            </Rect>
          </Card>
        </Node>
      ))}
      <Arrow refNode={shotArrows[0]} from={[-325, 0]} to={[-275, 0]} />
      <Arrow refNode={shotArrows[1]} from={[275, 0]} to={[325, 0]} />
    </Node>,
  );
  const seqWords: Rect[] = [];
  const dirChip = createRef<Rect>();
  stage.add(
    <Node y={-370}>
      <KLine refs={seqWords} size={84} words={['BUILDING', 'A', {t: 'SEQUENCE', hl: C.amber}]} />
    </Node>,
  );
  stage.add(
    <Node y={260}>
      <Chip refNode={dirChip} icon={'◎'} text={'CONSISTENT VISUAL DIRECTION'} size={34} />
    </Node>,
  );
  yield* cue(23.85);
  spawn(hideWords(randWords, 0.2));
  spawn(randStrike().opacity(0, 0.2));
  yield* all(...tiles.map((t, i) => all(t.opacity(0, 0.35), t.y(t.y() + (i % 2 ? 600 : -600), 0.4, easeInCubic))));
  spawn(revealWords(seqWords, 0.1));
  yield* sequence(0.14, ...shotCards.map(c => pop(c, 0.5)));
  spawn(draw(shotArrows[0](), 0.4));
  yield* draw(shotArrows[1](), 0.4);
  yield* cue(25.2);
  yield* pop(dirChip(), 0.45);

  // --------------------------------------------- 26.8 refine into a complete video
  const big = createRef<Rect>();
  const playhead = createRef<Rect>();
  const tl = createRef<Node>();
  const compWords: Rect[] = [];
  stage.add(
    <Node>
      <Card refNode={big} width={1120} height={630} y={-110} glow={C.amber} opacity={0} scale={0.85}>
        <Clip w={1120} h={630} time={SHOT.approach - 1} play />
      </Card>
    </Node>,
  );
  stage.add(
    <Node ref={tl} y={360} opacity={0}>
      <Rect width={1400} height={110} radius={18} fill={'rgba(13,16,32,0.9)'} stroke={C.line} lineWidth={2} />
      <Txt text={'TIMELINE'} x={-640} y={-80} fontFamily={MONO} fontSize={20} fill={C.dim} />
    </Node>,
  );
  const phWrap = createRef<Node>();
  stage.add(
    <Node ref={phWrap} y={360} opacity={0}>
      <Rect ref={playhead} x={-680} width={6} height={140} radius={3} fill={C.amber} shadowBlur={20} shadowColor={C.amber} />
    </Node>,
  );
  stage.add(
    <Node y={-470}>
      <KLine refs={compWords} size={64} words={['REFINED', 'INTO', 'A', {t: 'COMPLETE VIDEO', box: true}]} />
    </Node>,
  );
  yield* cue(26.8);
  spawn(hideWords(seqWords, 0.2));
  spawn(unpop(dirChip(), 0.2));
  spawn(all(...shotArrows.map(a => a().opacity(0, 0.2))));
  // cards dock into the timeline strip
  seq().moveToTop();
  phWrap().moveToTop();
  yield* all(
    tl().opacity(1, 0.4),
    phWrap().opacity(1, 0.4),
    ...shotCards.map((c, i) =>
      all(c.parent()!.position([(i - 1) * 450 - 0, 400], 0.7, easeInOutCubic), c.size([440, 90], 0.7, easeInOutCubic), c.radius(12, 0.7)),
    ),
  );
  spawn(playhead().x(680, 3.2, linear));
  yield* all(big().opacity(1, 0.4), big().scale(1, 0.6, easeOutBack));
  yield* cue(28.4);
  yield* revealWords(compWords, 0.09);

  // --------------------------------------------- 30.4 original image → final result
  const split = createRef<Node>();
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  const midArrow = createRef<Line>();
  const lLabel = createRef<Rect>();
  const rLabel = createRef<Rect>();
  const resultVid = createRef<Video>();
  const procWords: Rect[] = [];
  stage.add(
    <Node ref={split}>
      <Card refNode={left} width={760} height={428} x={-460} y={10} glow={C.violet} opacity={0} scale={0.7}>
        <RefImg w={760} h={428} />
      </Card>
      <Card refNode={right} width={760} height={428} x={460} y={10} glow={C.amber} opacity={0} scale={0.7}>
        <Clip w={760} h={428} time={SHOT.reveal - 1.5} vidRef={resultVid} />
      </Card>
      <Arrow refNode={midArrow} from={[-60, 10]} to={[60, 10]} width={8} />
      <Node x={-460} y={280}>
        <Eyebrow refNode={lLabel} text={'ORIGINAL IMAGE'} color={C.violet} />
      </Node>
      <Node x={460} y={280}>
        <Eyebrow refNode={rLabel} text={'FINAL RESULT'} />
      </Node>
    </Node>,
  );
  stage.add(
    <Node y={-360}>
      <KLine refs={procWords} size={92} words={['THE', 'ENTIRE', {t: 'PROCESS', hl: C.amber}]} />
    </Node>,
  );
  yield* cue(30.35);
  spawn(hideWords(compWords, 0.2));
  spawn(all(tl().opacity(0, 0.3), phWrap().opacity(0, 0.3), seq().opacity(0, 0.3), big().opacity(0, 0.3), big().scale(0.9, 0.3)));
  yield* revealWords(procWords, 0.1);
  yield* cue(32.0);
  yield* all(pop(left(), 0.5), lLabel().opacity(1, 0.3));
  yield* draw(midArrow(), 0.5);
  yield* cue(33.3);
  resultVid().play(); // start on the pendant reveal as the card lands
  yield* all(pop(right(), 0.5), rLabel().opacity(1, 0.3));
  // push in on the result, then out
  yield* cue(34.3);
  yield* all(split().scale(1.06, 0.45, easeInCubic), split().opacity(0, 0.45));
});
