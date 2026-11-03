// HEADPHONES AD · Hook — "This entire product advertisement started with just one image…"
// Cue times are seconds into public/hp/vo-hook.wav (= source VO 0:00–0:31.75).
import {Audio, Img, Line, makeScene2D, Node, Rect, Txt, Video, blur, brightness} from '@revideo/2d';
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
  draw,
  Eyebrow,
  Flash,
  H,
  hideWords,
  KLine,
  Letterbox,
  MONO,
  HEAD,
  pop,
  revealWords,
  unpop,
  Vignette,
  W,
} from '../lib';
import {PLAY, Pic, Product, STILLS} from './media';

export default makeScene2D('hp-hook', function* (view) {
  Backdrop(view);
  view.add(<Audio src={'/hp/vo-hook.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  const bars = Letterbox(view, 120);
  Vignette(view);
  const flash = Flash(view);

  // ---------------------------------------------------------- 0.0 cold open on the finished ad
  const open = createRef<Node>();
  stage.add(
    <Node ref={open}>
      <Clip w={W} h={H} time={PLAY.hero} play />
    </Node>,
  );
  const l1: Rect[] = [];
  const l2: Rect[] = [];
  const openText = createRef<Node>();
  stage.add(
    <Node ref={openText} y={300}>
      <Node y={-70}>
        <KLine refs={l1} size={64} weight={800} words={['THIS', 'ENTIRE', 'PRODUCT', 'AD']} />
      </Node>
      <Node y={30}>
        <KLine refs={l2} size={104} words={['STARTED', 'WITH', 'JUST', {t: 'ONE IMAGE', box: true}]} />
      </Node>
    </Node>,
  );
  open().scale(1.12);
  spawn(open().scale(1, 3.8, linear));
  spawn(bars.in(0.8));
  yield* cue(0.1);
  yield* revealWords(l1, 0.12);
  yield* cue(1.6);
  yield* revealWords(l2.slice(0, 3), 0.12);
  yield* cue(2.65);
  yield* revealWords(l2.slice(3));

  // ---------------------------------------------------------- 3.8 no camera, no studio, no production
  const noItems = ['NO CAMERA SETUP', 'NO PHYSICAL STUDIO', 'NO COMPLICATED PRODUCTION'];
  const noRows: Rect[] = [];
  const noStrikes: Rect[] = [];
  const noLayer = createRef<Node>();
  stage.add(
    <Node ref={noLayer}>
      {noItems.map((t, i) => (
        <Rect
          ref={r => r && noRows.push(r)}
          y={(i - 1) * 170}
          width={1300}
          height={136}
          radius={24}
          fill={'rgba(12,13,16,0.85)'}
          stroke={C.line}
          lineWidth={2}
          opacity={0}
          scale={0.7}
        >
          <Rect x={-570} size={72} radius={36} fill={C.red} />
          <Txt x={-570} text={'✕'} fontFamily={BODY} fontWeight={600} fontSize={40} fill={'#fff'} />
          <Txt x={-500} offset={[-1, 0]} text={t} fontFamily={HEAD} fontWeight={900} fontSize={72} letterSpacing={2} fill={C.text} />
          <Rect ref={r => r && noStrikes.push(r)} x={-500} offset={[-1, 0]} width={0} height={8} radius={4} fill={C.red} />
        </Rect>
      ))}
    </Node>,
  );
  yield* cue(3.75);
  spawn(flash(0.5, 0.35));
  spawn(bars.out(0.4));
  yield* all(open().filters([blur(0), brightness(1)]).filters.blur(18, 0.4), open().filters.brightness(0.3, 0.4), openText().opacity(0, 0.25));
  const noCues = [3.85, 4.9, 6.25];
  const strikeW = [670, 780, 1060];
  for (let i = 0; i < 3; i++) {
    yield* cue(noCues[i]);
    spawn(function* () {
      yield* pop(noRows[i], 0.4);
      yield* noStrikes[i].width(strikeW[i], 0.35, easeOutExpo);
    });
  }

  // ---------------------------------------------------------- 8.2 one product photo + AI
  const prodCard = createRef<Rect>();
  const prodImg = createRef<Img>();
  const prodTag = createRef<Rect>();
  const aiChip = createRef<Rect>();
  stage.add(
    <Card refNode={prodCard} width={960} height={540} glow={C.amber} opacity={0} scale={0.6}>
      <Product w={960} h={540} imgRef={prodImg} />
    </Card>,
  );
  stage.add(
    <Node y={330}>
      <Eyebrow refNode={prodTag} text={'THE PRODUCT PHOTO'} />
    </Node>,
  );
  stage.add(
    <Node x={420} y={-270}>
      <Chip refNode={aiChip} icon={'✦'} text={'+ AI'} size={44} bg={C.amber} color={C.bg} iconColor={C.bg} stroke={C.amber} />
    </Node>,
  );
  yield* cue(8.15);
  yield* all(...noRows.map(r => all(r.opacity(0, 0.3), r.scale(0.9, 0.3))));
  yield* all(pop(prodCard(), 0.55), prodTag().opacity(1, 0.3));
  yield* cue(10.1);
  yield* pop(aiChip(), 0.45);

  // 11.6 → a complete visual concept
  const conceptWords: Rect[] = [];
  const hero = createRef<Node>();
  const heroImg = createRef<Img>();
  stage.add(
    <Node ref={hero} opacity={0}>
      <Pic src={STILLS[0].src} w={W} h={H} imgRef={heroImg} />
    </Node>,
  );
  stage.add(
    <Node y={360}>
      <KLine refs={conceptWords} size={100} words={['A', 'COMPLETE', {t: 'VISUAL CONCEPT', hl: C.amber}]} />
    </Node>,
  );
  yield* cue(11.55);
  spawn(unpop(aiChip(), 0.2));
  spawn(prodTag().opacity(0, 0.2));
  yield* all(prodCard().size([W, H], 0.7, easeInOutCubic), prodCard().radius(0, 0.7), prodImg().size([W, (W * 941) / 1672], 0.7, easeInOutCubic));
  spawn(flash(0.4, 0.3));
  hero().opacity(1);
  prodCard().opacity(0);
  spawn(heroImg().scale(1.12, 2, linear));
  yield* revealWords(conceptWords, 0.1);

  // ---------------------------------------------------------- 13.3 new scenes → finished video
  const scenes: Rect[] = [];
  const sceneLayer = createRef<Node>();
  stage.add(
    <Node ref={sceneLayer} y={-60}>
      {STILLS.map((s, i) => (
        <Card refNode={r => r && scenes.push(r)} x={(i - 1) * 560} width={500} height={282} glow={C.amber} opacity={0} scale={0.5} rotation={(i - 1) * 6}>
          <Pic src={s.src} w={500} h={282} />
          <Rect layout x={-250} y={141} offset={[-1, 1]} padding={[10, 18]} gap={12} fill={'rgba(3,3,4,0.75)'} radius={[0, 14, 0, 0]}>
            <Txt text={`0${i + 1}`} fontFamily={MONO} fontSize={24} fill={C.amber} />
            <Txt text={s.label} fontFamily={HEAD} fontWeight={800} fontSize={26} letterSpacing={3} fill={C.text} />
          </Rect>
        </Card>
      ))}
    </Node>,
  );
  const newWords: Rect[] = [];
  stage.add(
    <Node y={-380}>
      <KLine refs={newWords} size={84} words={['GENERATE', {t: 'NEW SCENES', hl: C.amber}]} />
    </Node>,
  );
  const vidLayer = createRef<Node>();
  stage.add(
    <Node ref={vidLayer} opacity={0}>
      <Card width={1280} height={715} glow={C.amber} radius={28}>
        <Clip w={1280} h={715} time={PLAY.wide} play />
      </Card>
    </Node>,
  );
  const finWords: Rect[] = [];
  stage.add(
    <Node y={440}>
      <KLine refs={finWords} size={72} words={['INTO', 'A', {t: 'FINISHED VIDEO', box: true}]} />
    </Node>,
  );
  yield* cue(13.3);
  spawn(hideWords(conceptWords, 0.2));
  spawn(all(hero().filters([blur(0), brightness(1)]).filters.blur(26, 0.5), hero().filters.brightness(0.3, 0.5)));
  spawn(revealWords(newWords, 0.12));
  yield* sequence(0.2, ...scenes.map(c => all(pop(c, 0.5), c.rotation(0, 0.5, easeOutCubic))));
  // 14.6 bring everything together
  yield* cue(14.6);
  yield* all(...scenes.map(c => all(c.position([0, 0], 0.55, easeInCubic), c.scale(0.6, 0.55, easeInCubic))));
  spawn(flash(0.5, 0.3));
  sceneLayer().opacity(0);
  spawn(hideWords(newWords, 0.2));
  vidLayer().scale(0.6);
  yield* all(vidLayer().opacity(1, 0.3), vidLayer().scale(1, 0.6, easeOutBack));
  yield* cue(15.9);
  yield* revealWords(finWords, 0.1);

  // ---------------------------------------------------------- 17.7 inside PixVerse Canvas
  const insideTag = createRef<Rect>();
  const title = createRef<Node>();
  const tWords: Rect[] = [];
  const ring = createRef<Rect>();
  stage.add(
    <Node y={-200}>
      <Eyebrow refNode={insideTag} text={'AND I CAN DO IT ALL INSIDE'} />
    </Node>,
  );
  stage.add(
    <Node ref={title} y={-70}>
      <Rect ref={ring} size={0} radius={2000} stroke={C.amber} lineWidth={6} opacity={0.9} shadowBlur={40} shadowColor={C.amber} />
      <KLine refs={tWords} size={150} gap={36} words={['PIXVERSE', {t: 'CANVAS', hl: C.amber}]} />
    </Node>,
  );
  const wsWords: Rect[] = [];
  stage.add(
    <Node y={70}>
      <KLine refs={wsWords} size={44} weight={600} family={BODY} color={C.dim} words={['a', 'creative', 'workspace', 'that', 'brings', 'together']} gap={14} />
    </Node>,
  );
  const pills: Rect[] = [];
  stage.add(
    <Node y={200}>
      <Rect layout direction={'row'} gap={28}>
        <Chip refNode={r => r && pills.push(r)} icon={'✦'} text={'AI IMAGE GENERATION'} />
        <Chip refNode={r => r && pills.push(r)} icon={'▶'} text={'VIDEO CREATION'} />
        <Chip refNode={r => r && pills.push(r)} icon={'✂'} text={'EDITING'} />
      </Rect>
    </Node>,
  );
  yield* cue(17.6);
  spawn(hideWords(finWords, 0.2));
  yield* all(vidLayer().opacity(0, 0.35), vidLayer().scale(0.9, 0.35));
  yield* cue(19.6);
  yield* insideTag().opacity(1, 0.3);
  yield* cue(20.25);
  spawn(flash(0.5, 0.35));
  spawn(ring().size(1300, 0.9, easeOutExpo));
  spawn(ring().opacity(0, 0.9));
  yield* revealWords(tWords, 0.14, 0.5);
  yield* cue(21.5);
  yield* revealWords(wsWords, 0.1);
  const pillCues = [23.6, 24.45, 25.45];
  for (let i = 0; i < 3; i++) {
    yield* cue(pillCues[i]);
    yield* pop(pills[i], 0.45);
  }

  // ---------------------------------------------------------- 26.3 original image → final advertisement
  const procWords: Rect[] = [];
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  const midArrow = createRef<Line>();
  const lLabel = createRef<Rect>();
  const rLabel = createRef<Rect>();
  const resultVid = createRef<Video>();
  const split = createRef<Node>();
  stage.add(
    <Node ref={split}>
      <Card refNode={left} width={760} height={428} x={-460} y={20} glow={C.violet} opacity={0} scale={0.7}>
        <Product w={760} h={428} />
      </Card>
      <Card refNode={right} width={760} height={428} x={460} y={20} glow={C.amber} opacity={0} scale={0.7}>
        <Clip w={760} h={428} time={PLAY.hero} vidRef={resultVid} />
      </Card>
      <Arrow refNode={midArrow} from={[-60, 20]} to={[60, 20]} width={8} />
      <Node x={-460} y={290}>
        <Eyebrow refNode={lLabel} text={'ORIGINAL IMAGE'} color={C.violet} />
      </Node>
      <Node x={460} y={290}>
        <Eyebrow refNode={rLabel} text={'FINAL ADVERTISEMENT'} />
      </Node>
    </Node>,
  );
  stage.add(
    <Node y={-360}>
      <KLine refs={procWords} size={92} words={['THE', 'COMPLETE', {t: 'WORKFLOW', hl: C.amber}]} />
    </Node>,
  );
  yield* cue(26.3);
  yield* all(
    hideWords(tWords, 0.3),
    hideWords(wsWords, 0.3),
    insideTag().opacity(0, 0.3),
    ...pills.map(p => unpop(p, 0.3)),
  );
  yield* cue(27.5);
  yield* revealWords(procWords, 0.1);
  yield* cue(28.9);
  yield* all(pop(left(), 0.5), lLabel().opacity(1, 0.3));
  yield* draw(midArrow(), 0.4);
  yield* cue(30.1);
  resultVid().play();
  yield* all(pop(right(), 0.5), rLabel().opacity(1, 0.3));
  yield* cue(31.25);
  yield* all(split().scale(1.06, 0.45, easeInCubic), split().opacity(0, 0.45), hideWords(procWords, 0.3));
});
