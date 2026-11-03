// HEADPHONES AD · Final thoughts + CTA.
// public/hp/vo-cta.wav is source VO (second file) 3:24.5–end; cues are in
// source-VO seconds and converted with T().
import {Audio, Circle, Img, Line, makeScene2D, Node, Rect, Txt, blur, brightness} from '@revideo/2d';
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

const T = (src: number) => src - 204.5;
const at = (src: number) => cue(T(src));

export default makeScene2D('hp-cta', function* (view) {
  Backdrop(view);
  view.add(<Audio src={'/hp/vo-cta.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  Vignette(view);
  const flash = Flash(view);

  // ---------------------------------------------------------- bed: blurred hero still, slow push
  const bed = createRef<Node>();
  const bedImg = createRef<Img>();
  stage.add(
    <Node ref={bed} filters={[blur(16), brightness(0.32)]}>
      <Pic src={STILLS[0].src} w={W} h={H} imgRef={bedImg} />
    </Node>,
  );
  spawn(bedImg().scale(1.15, 72, linear));

  // ---------------------------------------------------------- 204.6 what I like
  const likeTag = createRef<Rect>();
  const pvWords: Rect[] = [];
  stage.add(
    <Node y={-200}>
      <Eyebrow refNode={likeTag} text={'WHAT I LIKE ABOUT THIS WORKFLOW'} />
    </Node>,
  );
  stage.add(
    <Node y={-70}>
      <KLine refs={pvWords} size={150} gap={36} words={['PIXVERSE', {t: 'CANVAS', hl: C.amber}]} />
    </Node>,
  );
  const parts = ['IDEA', 'VISUALS', 'CLIPS', 'EDIT'];
  const partRefs: Rect[] = [];
  const startX = [-780, -260, 260, 780];
  stage.add(
    <Node y={170}>
      {parts.map((p, i) => (
        <Node x={startX[i]}>
          <Chip refNode={r => r && partRefs.push(r)} text={p} size={38} />
        </Node>
      ))}
    </Node>,
  );
  const together = createRef<Rect>();
  stage.add(
    <Node y={170}>
      <Chip refNode={together} icon={'◆'} text={'ONE CREATIVE PROCESS'} size={44} bg={C.amber} color={C.bg} iconColor={C.bg} stroke={C.amber} />
    </Node>,
  );
  yield* at(204.6);
  yield* likeTag().opacity(1, 0.3);
  yield* at(206.55);
  yield* revealWords(pvWords, 0.14, 0.5);
  yield* at(207.9);
  yield* sequence(0.15, ...partRefs.map(p => pop(p, 0.4)));
  yield* at(209.2);
  yield* all(...partRefs.map(p => all(p.parent()!.x(0, 0.45, easeInCubic), p.opacity(0, 0.45))));
  spawn(flash(0.35, 0.3));
  yield* pop(together(), 0.5);

  // ---------------------------------------------------------- 210.7 the pipeline
  const pipe = [
    {l: 'IDEA / REFERENCE', c: C.violet},
    {l: 'DEVELOP VISUALS', c: C.blue},
    {l: 'GENERATE CLIPS', c: C.green},
    {l: 'EDIT & REFINE', c: C.amber},
  ];
  const pipeRefs: Rect[] = [];
  const pipeArrows = [createRef<Line>(), createRef<Line>(), createRef<Line>()];
  const px = (i: number) => (i - 1.5) * 440;
  stage.add(
    <Node y={20}>
      {pipe.map((p, i) => (
        <Rect ref={r => r && pipeRefs.push(r)} x={px(i)} width={380} height={400} radius={24} fill={C.panel} stroke={p.c} lineWidth={3} shadowBlur={44} shadowColor={p.c} clip opacity={0} scale={0.6}>
          <Rect width={350} height={250} y={-55} radius={14} clip fill={'#0a0b0e'}>
            {i === 0 ? <Product w={350} h={250} /> : null}
            {i === 1 ? <Pic src={STILLS[1].src} w={350} h={250} /> : null}
            {i === 2 ? (
              <Node>
                {STILLS.map((s, j) => (
                  <Rect x={(j - 1) * 116} width={108} height={230} radius={10} clip>
                    <Pic src={s.src} w={108} h={230} />
                  </Rect>
                ))}
              </Node>
            ) : null}
            {i === 3 ? (
              <Node>
                {STILLS.map((s, j) => (
                  <Rect x={(j - 1) * 112} y={-40} width={104} height={110} radius={8} clip>
                    <Pic src={s.src} w={104} h={110} />
                  </Rect>
                ))}
                <Rect y={50} width={330} height={20} radius={8} fill={C.violet} opacity={0.6} />
                <Rect y={84} x={-60} width={200} height={16} radius={8} fill={C.amber} opacity={0.7} />
                <Rect x={-30} width={4} height={240} fill={C.amber} />
              </Node>
            ) : null}
          </Rect>
          <Txt text={`0${i + 1}`} y={115} fontFamily={MONO} fontSize={22} fill={p.c} />
          <Txt text={p.l} y={155} fontFamily={HEAD} fontWeight={800} fontSize={36} letterSpacing={2} fill={C.text} />
        </Rect>
      ))}
      {pipeArrows.map((a, i) => (
        <Arrow refNode={a} from={[px(i) + 195, 0]} to={[px(i + 1) - 195, 0]} width={5} />
      ))}
    </Node>,
  );
  yield* at(210.6);
  yield* all(hideWords(pvWords, 0.3), likeTag().opacity(0, 0.3), unpop(together(), 0.3));
  const pipeCues = [211.4, 213.0, 214.1, 215.8];
  for (let i = 0; i < 4; i++) {
    yield* at(pipeCues[i]);
    if (i > 0) spawn(draw(pipeArrows[i - 1](), 0.35));
    yield* pop(pipeRefs[i], 0.5);
  }

  // ---------------------------------------------------------- 219.2 creators / businesses / AI filmmakers
  const aud = [
    {t: 'FOR CREATORS', c: C.blue, lines: ['Experiment with visual concepts', 'No need to film every shot'], cues: [221.0, 222.7]},
    {t: 'FOR BUSINESSES', c: C.green, lines: ['Product visuals', 'Advertising concepts', 'New creative directions'], cues: [228.0, 229.7, 231.0]},
    {t: 'FOR AI FILMMAKERS', c: C.amber, lines: ['Develop visuals + edit', 'In the same workspace'], cues: [236.2, 238.7]},
  ];
  const audCards: Rect[] = [];
  const audLines: Rect[][] = aud.map(() => []);
  const audCueStart = [219.2, 225.7, 233.0];
  stage.add(
    <Node y={-10}>
      {aud.map((a, i) => (
        <Rect ref={r => r && audCards.push(r)} x={(i - 1) * 580} width={540} height={460} radius={28} fill={C.panel} stroke={a.c} lineWidth={3} shadowBlur={40} shadowColor={a.c} opacity={0} scale={0.6}>
          <Rect width={540} height={6} y={-227} fill={a.c} />
          <Txt text={a.t} y={-160} fontFamily={HEAD} fontWeight={900} fontSize={48} letterSpacing={3} fill={C.text} />
        </Rect>
      ))}
      {/* JSX children aren't flattened deeply, hence flatMap */}
      {aud.flatMap((a, i) =>
        a.lines.map((l, j) => (
          <Rect ref={r => r && audLines[i].push(r)} layout direction={'row'} gap={14} alignItems={'center'} x={(i - 1) * 580} y={-50 + j * 80} opacity={0}>
            <Txt text={'✓'} fontFamily={BODY} fontWeight={600} fontSize={30} fill={a.c} />
            <Txt text={l} fontFamily={BODY} fontWeight={600} fontSize={30} fill={C.text} />
          </Rect>
        )),
      )}
    </Node>,
  );
  const worth = createRef<Rect>();
  stage.add(
    <Node y={330}>
      <Chip refNode={worth} icon={'✓'} iconColor={C.bg} text={'WORTH EXPLORING'} size={40} bg={C.green} color={C.bg} stroke={C.green} />
    </Node>,
  );
  yield* at(219.0);
  yield* all(...pipeRefs.map(r => all(r.opacity(0, 0.35), r.y(80, 0.35, easeInCubic))), ...pipeArrows.map(a => a().opacity(0, 0.2)));
  for (let i = 0; i < 3; i++) {
    yield* at(audCueStart[i]);
    yield* pop(audCards[i], 0.5);
    for (let j = 0; j < aud[i].lines.length; j++) {
      yield* at(aud[i].cues[j]);
      const line = audLines[i][j];
      yield* all(line.opacity(1, 0.3), line.y(line.y() - 10, 0.3, easeOutCubic));
    }
  }
  yield* at(240.9);
  spawn(flash(0.25, 0.3));
  yield* pop(worth(), 0.5);

  // ---------------------------------------------------------- 242.6 start with a clear idea
  const impTag = createRef<Rect>();
  const ideaWords: Rect[] = [];
  const focusWords: Rect[] = [];
  const randWords: Rect[] = [];
  const randStrike = createRef<Rect>();
  stage.add(
    <Node y={-300}>
      <Eyebrow refNode={impTag} text={'THE IMPORTANT THING'} />
    </Node>,
  );
  stage.add(
    <Node y={-160}>
      <KLine refs={ideaWords} size={100} words={['START', 'WITH', 'A', {t: 'CLEAR IDEA', hl: C.amber}]} />
    </Node>,
  );
  stage.add(
    <Node y={-20}>
      <KLine refs={focusWords} size={72} words={['FOCUS', 'ON', 'THE', {t: 'FINAL RESULT', box: true}]} />
    </Node>,
  );
  stage.add(
    <Node y={150}>
      <KLine refs={randWords} size={56} weight={800} color={C.dim} words={['NOT', 'RANDOM', 'CLIPS', 'WITHOUT', 'A', 'PLAN']} />
      <Rect ref={randStrike} x={70} width={0} height={8} radius={4} fill={C.red} />
    </Node>,
  );
  yield* at(242.4);
  yield* all(...audCards.map(c => unpop(c, 0.35)), ...audLines.flat().map(l => l.opacity(0, 0.3)), unpop(worth(), 0.35));
  yield* impTag().opacity(1, 0.3);
  yield* at(243.8);
  yield* revealWords(ideaWords, 0.12);
  yield* at(245.9);
  yield* revealWords(focusWords, 0.1);
  yield* at(248.3);
  yield* revealWords(randWords, 0.09);
  yield* at(249.6);
  yield* randStrike().width(850, 0.4, easeOutExpo);

  // ---------------------------------------------------------- 250.4 CTA
  const ideaQ: Rect[] = [];
  const lifeWords: Rect[] = [];
  const btn = createRef<Rect>();
  const btnTxt = createRef<Txt>();
  const cursor = createRef<Node>();
  const ripple = createRef<Circle>();
  const subTxt = createRef<Txt>();
  stage.add(
    <Node>
      <Node y={-300}>
        <KLine refs={ideaQ} size={130} words={['GOT', 'AN', {t: 'IDEA?', hl: C.amber}]} />
      </Node>
      <Node y={-170}>
        <KLine refs={lifeWords} size={56} weight={600} family={BODY} color={C.dim} words={['bring', 'it', 'to', 'life']} gap={16} />
      </Node>
      <Rect ref={btn} y={60} layout direction={'row'} alignItems={'center'} gap={24} padding={[34, 64]} radius={100} fill={C.amber} shadowBlur={60} shadowColor={C.amber} opacity={0} scale={0.5}>
        <Txt ref={btnTxt} text={'LINK IN THE DESCRIPTION'} fontFamily={HEAD} fontWeight={900} fontSize={64} letterSpacing={2} fill={C.bg} />
        <Txt text={'↓'} fontFamily={BODY} fontWeight={600} fontSize={64} fill={C.bg} />
      </Rect>
      <Circle ref={ripple} x={300} y={90} size={0} stroke={C.text} lineWidth={6} />
      <Node ref={cursor} x={700} y={420} opacity={0}>
        <Line points={[[0, 0], [0, 64], [16, 50], [28, 76], [38, 72], [26, 46], [46, 46]]} closed fill={C.text} stroke={C.bg} lineWidth={3} shadowBlur={20} shadowColor={'#000'} />
      </Node>
      <Txt ref={subTxt} y={240} text={'Start building your own project'} fontFamily={BODY} fontWeight={600} fontSize={44} fill={C.text} opacity={0} />
    </Node>,
  );
  yield* at(250.3);
  yield* all(impTag().opacity(0, 0.3), hideWords(ideaWords, 0.3), hideWords(focusWords, 0.3), hideWords(randWords, 0.3), randStrike().opacity(0, 0.3));
  yield* revealWords(ideaQ, 0.12);
  yield* at(252.5);
  yield* revealWords(lifeWords, 0.08);
  yield* at(253.5);
  yield* pop(btn(), 0.55);
  spawn(cursor().opacity(1, 0.2));
  yield* cursor().position([300, 90], 0.6, easeInOutCubic);
  yield* all(btn().scale(0.94, 0.08), cursor().scale(0.85, 0.08));
  ripple().opacity(1);
  spawn(all(ripple().size(320, 0.6, easeOutCubic), ripple().opacity(0, 0.6)));
  yield* all(btn().scale(1, 0.25, easeOutBack), cursor().scale(1, 0.15));
  yield* at(255.2);
  yield* btnTxt().opacity(0, 0.12);
  btnTxt().text('TRY PIXVERSE CANVAS');
  yield* btnTxt().opacity(1, 0.15);
  spawn(cursor().opacity(0, 0.3));
  yield* at(256.5);
  yield* all(subTxt().opacity(1, 0.4), subTxt().y(220, 0.4, easeOutCubic));

  // ---------------------------------------------------------- 258.6 how far can one idea go
  const jr = createRef<Node>();
  const jChips: Rect[] = [];
  const jl = createRef<Rect>();
  const jrc = createRef<Rect>();
  const path = createRef<Line>();
  const dot = createRef<Circle>();
  const lLab = createRef<Rect>();
  const rLab = createRef<Rect>();
  const farWords: Rect[] = [];
  stage.add(
    <Node ref={jr}>
      <Node y={-390}>
        <Rect layout direction={'row'} gap={24}>
          <Chip refNode={r => r && jChips.push(r)} text={'EXPLORE THE TOOLS'} size={30} icon={'01'} />
          <Chip refNode={r => r && jChips.push(r)} text={'DEVELOP YOUR VISUALS'} size={30} icon={'02'} />
          <Chip refNode={r => r && jChips.push(r)} text={'TAKE ONE IDEA FURTHER'} size={30} icon={'03'} />
        </Rect>
      </Node>
      <Node y={-250}>
        <KLine refs={farWords} size={72} words={['HOW', 'FAR', 'CAN', {t: 'ONE IDEA', hl: C.amber}, 'GO?']} />
      </Node>
      <Line ref={path} points={[[-420, 90], [-150, -10], [150, 190], [420, 90]]} radius={120} stroke={C.amber} lineWidth={5} lineDash={[16, 12]} end={0} shadowBlur={16} shadowColor={C.amber} />
      <Card refNode={jl} x={-640} y={90} width={420} height={236} glow={C.violet} opacity={0} scale={0.6}>
        <Product w={420} h={236} />
      </Card>
      <Card refNode={jrc} x={640} y={90} width={420} height={236} glow={C.amber} opacity={0} scale={0.6}>
        <Clip w={420} h={236} time={PLAY.wide + 2} />
      </Card>
      <Circle ref={dot} x={-420} y={90} size={0} fill={C.amber} shadowBlur={30} shadowColor={C.amber} />
      <Node x={-640} y={250}>
        <Eyebrow refNode={lLab} text={'FIRST CONCEPT'} color={C.violet} />
      </Node>
      <Node x={640} y={250}>
        <Eyebrow refNode={rLab} text={'FINAL SHOT'} />
      </Node>
    </Node>,
  );
  yield* at(258.5);
  yield* all(hideWords(ideaQ, 0.3), hideWords(lifeWords, 0.3), unpop(btn(), 0.3), subTxt().opacity(0, 0.3));
  const jCues = [259.0, 260.4, 261.6];
  for (let i = 0; i < 3; i++) {
    yield* at(jCues[i]);
    yield* pop(jChips[i], 0.45);
  }
  yield* revealWords(farWords, 0.09);
  yield* at(264.3);
  yield* all(pop(jl(), 0.5), lLab().opacity(1, 0.3));
  dot().position(() => path().getPointAtPercentage(path().end()).position);
  spawn(dot().size(28, 0.3, easeOutBack));
  yield* path().end(1, 0.9, easeInOutCubic);
  yield* at(265.3);
  yield* all(pop(jrc(), 0.5), rLab().opacity(1, 0.3));

  // ---------------------------------------------------------- 266.4 subscribe + thanks
  const avatar = createRef<Rect>();
  const handle = createRef<Node>();
  const sub = createRef<Rect>();
  const subLabel = createRef<Txt>();
  const moreChips: Rect[] = [];
  const thanks: Rect[] = [];
  stage.add(
    <Node>
      <Rect ref={avatar} x={-330} y={-170} size={190} radius={100} clip stroke={C.amber} lineWidth={6} opacity={0} scale={0.5}>
        <Img src={'/avatar.jpg'} size={190} />
      </Rect>
      <Node ref={handle} x={-200} y={-170} opacity={0}>
        <Txt text={'Lex AI'} offset={[-1, 0]} y={-30} fontFamily={HEAD} fontWeight={900} fontSize={76} fill={C.text} />
        <Txt text={'@LexAI01'} offset={[-1, 0]} y={38} fontFamily={MONO} fontSize={34} fill={C.dim} />
      </Node>
      <Rect ref={sub} y={30} layout padding={[26, 56]} radius={18} fill={'#ff2a3d'} opacity={0} scale={0.5} shadowBlur={40} shadowColor={'#ff2a3d'}>
        <Txt ref={subLabel} text={'SUBSCRIBE'} fontFamily={HEAD} fontWeight={900} fontSize={50} letterSpacing={3} fill={'#fff'} />
      </Rect>
      <Node y={170}>
        <Rect layout direction={'row'} gap={24}>
          <Chip refNode={r => r && moreChips.push(r)} icon={'✦'} text={'AI TOOLS'} size={32} />
          <Chip refNode={r => r && moreChips.push(r)} icon={'✦'} text={'CREATIVE WORKFLOWS'} size={32} />
          <Chip refNode={r => r && moreChips.push(r)} icon={'✦'} text={'PRACTICAL DEMOS'} size={32} />
        </Rect>
      </Node>
      <Node y={360}>
        <KLine refs={thanks} size={96} words={['THANKS', 'FOR', {t: 'WATCHING', hl: C.amber}]} />
      </Node>
    </Node>,
  );
  yield* at(266.3);
  yield* all(jr().opacity(0, 0.35), jr().scale(0.95, 0.35));
  yield* pop(avatar(), 0.5);
  yield* all(handle().opacity(1, 0.4), handle().x(-210, 0.4));
  yield* at(267.7);
  yield* pop(sub(), 0.5);
  const moreCues = [269.0, 269.85, 270.95];
  for (let i = 0; i < 3; i++) {
    yield* at(moreCues[i]);
    yield* pop(moreChips[i], 0.4);
  }
  yield* at(272.8);
  spawn(revealWords(thanks, 0.12, 0.5));
  yield* waitFor(0.6);
  yield* sub().scale(0.92, 0.08);
  sub().fill('rgba(255,255,255,0.14)').shadowColor('rgba(0,0,0,0)');
  subLabel().text('SUBSCRIBED  ✓');
  yield* sub().scale(1, 0.25, easeOutBack);
  yield* at(277.6);
  yield* stage.opacity(0, 0.5);
});
