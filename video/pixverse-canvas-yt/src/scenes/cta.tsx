// SECTION 09 / 6:45–7:25 — Final thoughts and CTA.
// Cue times are seconds into vo-cta.wav.
import {Audio, Circle, Img, Line, makeScene2D, Node, Rect, Txt, Video, blur, brightness} from '@revideo/2d';
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
  RefImg,
  revealWords,
  SHOT,
  unpop,
  Vignette,
  W,
} from '../lib';

export default makeScene2D('cta', function* (view) {
  Backdrop(view);
  view.add(<Audio src={'/vo-cta.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  Vignette(view);
  const flash = Flash(view);

  // ---------------------------------------------------------- 0.0 montage bed
  const bed = createRef<Node>();
  stage.add(
    <Node ref={bed} filters={[blur(0), brightness(0.9)]}>
      <Clip w={W} h={H} time={0} play />
    </Node>,
  );
  const likeTag = createRef<Rect>();
  const pvWords: Rect[] = [];
  stage.add(
    <Node y={-150}>
      <Eyebrow refNode={likeTag} text={'WHAT I LIKE ABOUT'} />
    </Node>,
  );
  stage.add(
    <Node y={-30}>
      <KLine refs={pvWords} size={150} gap={36} words={['PIXVERSE', {t: 'CANVAS', hl: C.amber}]} />
    </Node>,
  );
  bed().scale(1.1);
  spawn(bed().scale(1, 6, linear));
  yield* cue(0.2);
  spawn(all(bed().filters.blur(14, 0.6), bed().filters.brightness(0.35, 0.6)));
  yield* likeTag().opacity(1, 0.3);
  yield* revealWords(pvWords, 0.14, 0.5);

  // 2.6 connected, beginning to end
  const endLine = createRef<Line>();
  const dotA = createRef<Circle>();
  const dotB = createRef<Circle>();
  const begTxt = createRef<Txt>();
  const endTxt = createRef<Txt>();
  const conWords: Rect[] = [];
  stage.add(
    <Node y={190}>
      <Line ref={endLine} points={[[-640, 0], [640, 0]]} stroke={C.amber} lineWidth={6} end={0} shadowBlur={20} shadowColor={C.amber} />
      <Circle ref={dotA} x={-640} size={0} fill={C.amber} shadowBlur={20} shadowColor={C.amber} />
      <Circle ref={dotB} x={640} size={0} fill={C.amber} shadowBlur={20} shadowColor={C.amber} />
      <Txt ref={begTxt} x={-640} y={55} text={'BEGINNING'} fontFamily={MONO} fontSize={26} fill={C.dim} opacity={0} />
      <Txt ref={endTxt} x={640} y={55} text={'END'} fontFamily={MONO} fontSize={26} fill={C.dim} opacity={0} />
    </Node>,
  );
  stage.add(
    <Node y={110}>
      <KLine refs={conWords} size={52} weight={800} words={['ONE', 'CONNECTED', 'CREATIVE', 'PROCESS']} />
    </Node>,
  );
  yield* cue(2.6);
  yield* revealWords(conWords, 0.08);
  yield* cue(4.2);
  yield* all(dotA().size(26, 0.3, easeOutBack), begTxt().opacity(1, 0.3));
  yield* endLine().end(1, 0.8, easeInOutCubic);
  yield* all(dotB().size(26, 0.3, easeOutBack), endTxt().opacity(1, 0.3));

  // ---------------------------------------------------------- 6.1 the pipeline
  const intro1 = [likeTag, endLine, dotA, dotB, begTxt, endTxt];
  const pipe = [
    {l: 'SINGLE REFERENCE', c: C.blue},
    {l: 'VISUAL DIRECTION', c: C.violet},
    {l: 'THE MATERIAL', c: C.amber},
    {l: 'FINISHED VIDEO', c: C.green},
  ];
  const pipeRefs: Rect[] = [];
  const pipeArrows = [createRef<Line>(), createRef<Line>(), createRef<Line>()];
  const px = (i: number) => (i - 1.5) * 440;
  const pipeLayer = createRef<Node>();
  stage.add(
    <Node ref={pipeLayer} y={20}>
      {pipe.map((p, i) => (
        <Rect
          ref={r => r && pipeRefs.push(r)}
          x={px(i)}
          width={380}
          height={400}
          radius={24}
          fill={C.panel}
          stroke={p.c}
          lineWidth={3}
          shadowBlur={44}
          shadowColor={p.c}
          clip
          opacity={0}
          scale={0.6}
        >
          <Rect width={350} height={250} y={-55} radius={14} clip fill={'#0a0c18'}>
            {i === 0 ? <RefImg w={350} h={250} /> : null}
            {i === 1 ? (
              <Txt
                width={310}
                textWrap
                text={'"A lone traveler in a dark hooded coat explores a futuristic city at night… amber-lit circular doorway… blue and violet lighting…"'}
                fontFamily={MONO}
                fontSize={19}
                lineHeight={30}
                fill={C.dim}
              />
            ) : null}
            {i === 2 ? (
              <Node>
                {[SHOT.notice, SHOT.approach, SHOT.reveal].map((t, j) => (
                  <Rect x={(j - 1) * 116} width={108} height={230} radius={10} clip>
                    <Clip w={108} h={230} time={t} />
                  </Rect>
                ))}
              </Node>
            ) : null}
            {i === 3 ? <Clip w={350} h={250} time={SHOT.reveal - 3} play /> : null}
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
  yield* cue(6.0);
  yield* all(
    hideWords(pvWords, 0.3),
    hideWords(conWords, 0.3),
    ...intro1.map(r => (r() as Node).opacity(0, 0.3)),
  );
  const pipeCues = [6.6, 7.7, 9.2, 10.4];
  for (let i = 0; i < pipe.length; i++) {
    yield* cue(pipeCues[i]);
    if (i > 0) spawn(draw(pipeArrows[i - 1](), 0.35));
    yield* pop(pipeRefs[i], 0.5);
  }

  // ---------------------------------------------------------- 12.4 for creators
  const forTag = createRef<Rect>();
  const chips: Rect[] = [];
  const wfWords: Rect[] = [];
  stage.add(
    <Node y={-300}>
      <Eyebrow refNode={forTag} text={'FOR CREATORS EXPERIMENTING WITH'} color={C.violet} />
    </Node>,
  );
  stage.add(
    <Node y={-150}>
      <Rect layout direction={'row'} gap={30}>
        <Chip refNode={r => r && chips.push(r)} icon={'▶'} text={'CINEMATIC AI VIDEO'} size={40} />
        <Chip refNode={r => r && chips.push(r)} icon={'✎'} text={'STORYTELLING'} size={40} />
        <Chip refNode={r => r && chips.push(r)} icon={'✦'} text={'VISUAL CONTENT'} size={40} />
      </Rect>
    </Node>,
  );
  stage.add(
    <Node y={80}>
      <KLine refs={wfWords} size={120} words={['CONNECTED', {t: 'WORKFLOW', hl: C.amber}]} />
    </Node>,
  );
  const worth = createRef<Rect>();
  stage.add(
    <Node y={240}>
      <Chip refNode={worth} icon={'✓'} iconColor={C.bg} text={'WORTH EXPLORING'} size={40} bg={C.green} color={C.bg} stroke={C.green} />
    </Node>,
  );
  yield* cue(12.3);
  yield* all(
    ...pipeRefs.map(r => all(r.opacity(0, 0.35), r.y(80, 0.35, easeInCubic))),
    ...pipeArrows.map(a => a().opacity(0, 0.2)),
  );
  yield* forTag().opacity(1, 0.3);
  const chipCues = [14.2, 15.5, 16.4];
  for (let i = 0; i < 3; i++) {
    yield* cue(chipCues[i]);
    yield* pop(chips[i], 0.45);
  }
  yield* cue(17.5);
  yield* revealWords(wfWords, 0.12, 0.5);
  yield* cue(19.2);
  spawn(flash(0.25, 0.3));
  yield* pop(worth(), 0.5);

  // ---------------------------------------------------------- 21.3 it still depends on…
  const depTag = createRef<Rect>();
  stage.add(
    <Node y={-330}>
      <Eyebrow refNode={depTag} text={'THE RESULT STILL DEPENDS ON'} />
    </Node>,
  );
  const meters = [
    {l: 'YOUR PROMPTS', c: C.blue, v: 0.86},
    {l: 'GENERATION QUALITY', c: C.violet, v: 0.78},
    {l: 'YOUR EDITING DECISIONS', c: C.amber, v: 0.92},
  ];
  const meterRows: Rect[] = [];
  const meterFills: Rect[] = [];
  const metersLayer = createRef<Node>();
  stage.add(
    <Node ref={metersLayer} y={0}>
      {meters.map((m, i) => (
        <Rect ref={r => r && meterRows.push(r)} y={(i - 1) * 150} opacity={0} x={-60}>
          <Txt text={m.l} x={-560} y={-36} offset={[-1, 0]} fontFamily={HEAD} fontWeight={800} fontSize={44} letterSpacing={2} fill={C.text} />
          <Rect x={0} y={26} width={1120} height={22} radius={11} fill={'rgba(255,255,255,0.08)'} />
          <Rect ref={r => r && meterFills.push(r)} x={-560} y={26} offset={[-1, 0]} width={0} height={22} radius={11} fill={m.c} shadowBlur={24} shadowColor={m.c} />
        </Rect>
      ))}
    </Node>,
  );
  yield* cue(21.3);
  yield* all(hideWords(wfWords, 0.3), unpop(worth(), 0.3), forTag().opacity(0, 0.3), ...chips.map(c => unpop(c, 0.3)));
  yield* depTag().opacity(1, 0.3);
  const meterCues = [22.9, 24.4, 25.8];
  for (let i = 0; i < 3; i++) {
    yield* cue(meterCues[i]);
    spawn(meterFills[i].width(1120 * meters[i].v, 0.9, easeOutExpo));
    yield* all(meterRows[i].opacity(1, 0.3), meterRows[i].x(0, 0.45, easeOutCubic));
  }

  // 28.0 creation + editing in one workspace
  const cr = createRef<Rect>();
  const ed = createRef<Rect>();
  const merged = createRef<Rect>();
  stage.add(
    <Node y={-40}>
      <Rect ref={cr} x={-1300} width={600} height={360} radius={26} fill={C.panel} stroke={C.blue} lineWidth={3} shadowBlur={44} shadowColor={C.blue} clip>
        <Rect width={560} height={240} y={-40} radius={14} clip>
          <Clip w={560} h={240} time={SHOT.notice} />
        </Rect>
        <Txt text={'CREATION'} y={130} fontFamily={HEAD} fontWeight={900} fontSize={48} letterSpacing={4} fill={C.text} />
      </Rect>
      <Rect ref={ed} x={1300} width={600} height={360} radius={26} fill={C.panel} stroke={C.amber} lineWidth={3} shadowBlur={44} shadowColor={C.amber} clip>
        <Rect width={560} height={240} y={-40} radius={14} clip fill={'#0a0c18'}>
          <Node>
            {[SHOT.notice, SHOT.approach, SHOT.reveal].map((t, j) => (
              <Rect x={(j - 1) * 182} y={-30} width={172} height={110} radius={10} clip>
                <Clip w={172} h={110} time={t} />
              </Rect>
            ))}
            <Rect y={60} width={530} height={22} radius={8} fill={C.violet} opacity={0.6} />
            <Rect x={-60} width={4} height={220} fill={C.amber} />
          </Node>
        </Rect>
        <Txt text={'EDITING'} y={130} fontFamily={HEAD} fontWeight={900} fontSize={48} letterSpacing={4} fill={C.text} />
      </Rect>
      <Rect ref={merged} width={1290} height={440} radius={34} stroke={C.amber} lineWidth={5} lineDash={[22, 14]} opacity={0} />
    </Node>,
  );
  const oneWs = createRef<Rect>();
  stage.add(
    <Node y={-300}>
      <Chip refNode={oneWs} icon={'◆'} text={'ONE WORKSPACE'} size={44} bg={C.amber} color={C.bg} iconColor={C.bg} stroke={C.amber} />
    </Node>,
  );
  const ideaWords: Rect[] = [];
  stage.add(
    <Node y={330}>
      <KLine refs={ideaWords} size={84} words={['IDEA', '→', {t: 'COMPLETE PROJECT', box: true}]} />
    </Node>,
  );
  yield* cue(28.0);
  yield* all(depTag().opacity(0, 0.3), metersLayer().opacity(0, 0.3), metersLayer().y(-60, 0.3));
  yield* all(cr().x(-330, 0.7, easeOutCubic), ed().x(330, 0.7, easeOutCubic));
  yield* cue(30.4);
  spawn(flash(0.4, 0.3));
  yield* all(cr().x(-310, 0.25, easeInCubic), ed().x(310, 0.25, easeInCubic));
  spawn(all(merged().opacity(1, 0.3), merged().lineDashOffset(-200, 4, linear)));
  yield* pop(oneWs(), 0.45);
  yield* cue(32.0);
  yield* revealWords(ideaWords.slice(0, 2), 0.25);
  yield* cue(33.6);
  yield* revealWords(ideaWords.slice(2));

  // ---------------------------------------------------------- 35.6 CTA
  const cta = createRef<Node>();
  const ideaQ: Rect[] = [];
  const lifeWords: Rect[] = [];
  const btn = createRef<Rect>();
  const btnTxt = createRef<Txt>();
  const cursor = createRef<Node>();
  const ripple = createRef<Circle>();
  const subTxt = createRef<Txt>();
  stage.add(
    <Node ref={cta}>
      <Node y={-300}>
        <KLine refs={ideaQ} size={130} words={['GOT', 'AN', {t: 'IDEA?', hl: C.amber}]} />
      </Node>
      <Node y={-170}>
        <KLine refs={lifeWords} size={56} weight={600} family={BODY} color={C.dim} words={['bring', 'it', 'to', 'life']} gap={16} />
      </Node>
      <Rect
        ref={btn}
        y={60}
        layout
        direction={'row'}
        alignItems={'center'}
        gap={24}
        padding={[34, 64]}
        radius={100}
        fill={C.amber}
        shadowBlur={60}
        shadowColor={C.amber}
        opacity={0}
        scale={0.5}
      >
        <Txt ref={btnTxt} text={'LINK IN THE DESCRIPTION'} fontFamily={HEAD} fontWeight={900} fontSize={64} letterSpacing={2} fill={C.bg} />
        <Txt text={'↓'} fontFamily={BODY} fontWeight={600} fontSize={64} fill={C.bg} />
      </Rect>
      <Circle ref={ripple} x={300} y={90} size={0} stroke={C.text} lineWidth={6} />
      <Node ref={cursor} x={700} y={420} opacity={0}>
        <Line
          points={[[0, 0], [0, 64], [16, 50], [28, 76], [38, 72], [26, 46], [46, 46]]}
          closed
          fill={C.text}
          stroke={C.bg}
          lineWidth={3}
          shadowBlur={20}
          shadowColor={'#000'}
        />
      </Node>
      <Txt ref={subTxt} y={240} text={'Start building your own project'} fontFamily={BODY} fontWeight={600} fontSize={44} fill={C.text} opacity={0} />
    </Node>,
  );
  yield* cue(35.5);
  spawn(all(oneWs().opacity(0, 0.3), merged().opacity(0, 0.3), cr().opacity(0, 0.3), ed().opacity(0, 0.3)));
  spawn(hideWords(ideaWords, 0.3));
  yield* waitFor(0.2);
  yield* revealWords(ideaQ, 0.12);
  yield* cue(36.9);
  yield* revealWords(lifeWords, 0.08);
  yield* cue(38.1);
  yield* pop(btn(), 0.55);
  spawn(cursor().opacity(1, 0.2));
  yield* cursor().position([300, 90], 0.7, easeInOutCubic);
  // click
  yield* all(btn().scale(0.94, 0.08), cursor().scale(0.85, 0.08));
  ripple().opacity(1);
  spawn(all(ripple().size(320, 0.6, easeOutCubic), ripple().opacity(0, 0.6)));
  yield* all(btn().scale(1, 0.25, easeOutBack), cursor().scale(1, 0.15));
  yield* cue(39.8);
  yield* btnTxt().opacity(0, 0.12);
  btnTxt().text('TRY PIXVERSE CANVAS');
  yield* btnTxt().opacity(1, 0.15);
  spawn(cursor().opacity(0, 0.3));
  yield* cue(40.9);
  yield* all(subTxt().opacity(1, 0.4), subTxt().y(220, 0.4, easeOutCubic));

  // ---------------------------------------------------------- 43.1 how far can one idea go
  const jr = createRef<Node>();
  const jChips: Rect[] = [];
  const jl = createRef<Rect>();
  const jrc = createRef<Rect>();
  const path = createRef<Line>();
  const traveler = createRef<Circle>();
  const lLab = createRef<Rect>();
  const rLab = createRef<Rect>();
  const farWords: Rect[] = [];
  stage.add(
    <Node ref={jr}>
      <Node y={-390}>
        <Rect layout direction={'row'} gap={24}>
          <Chip refNode={r => r && jChips.push(r)} text={'EXPLORE THE TOOLS'} size={30} icon={'01'} />
          <Chip refNode={r => r && jChips.push(r)} text={'DEVELOP YOUR WORLD'} size={30} icon={'02'} />
          <Chip refNode={r => r && jChips.push(r)} text={'TAKE ONE IDEA FURTHER'} size={30} icon={'03'} />
        </Rect>
      </Node>
      <Node y={-250}>
        <KLine refs={farWords} size={72} words={['HOW', 'FAR', 'CAN', {t: 'ONE IDEA', hl: C.amber}, 'GO?']} />
      </Node>
      <Line
        ref={path}
        points={[[-420, 90], [-150, -10], [150, 190], [420, 90]]}
        radius={120}
        stroke={C.amber}
        lineWidth={5}
        lineDash={[16, 12]}
        end={0}
        shadowBlur={16}
        shadowColor={C.amber}
      />
      <Card refNode={jl} x={-640} y={90} width={420} height={236} glow={C.violet} opacity={0} scale={0.6}>
        <RefImg w={420} h={236} />
      </Card>
      <Card refNode={jrc} x={640} y={90} width={420} height={236} glow={C.amber} opacity={0} scale={0.6}>
        <Clip w={420} h={236} time={18.2} />
      </Card>
      <Circle ref={traveler} x={-420} y={90} size={0} fill={C.amber} shadowBlur={30} shadowColor={C.amber} />
      <Node x={-640} y={250}>
        <Eyebrow refNode={lLab} text={'FIRST CONCEPT'} color={C.violet} />
      </Node>
      <Node x={640} y={250}>
        <Eyebrow refNode={rLab} text={'FINAL SHOT'} />
      </Node>
    </Node>,
  );
  yield* cue(43.0);
  yield* all(hideWords(ideaQ, 0.3), hideWords(lifeWords, 0.3), unpop(btn(), 0.3), subTxt().opacity(0, 0.3));
  const jCues = [43.3, 44.8, 46.3];
  for (let i = 0; i < 3; i++) {
    yield* cue(jCues[i]);
    yield* pop(jChips[i], 0.45);
  }
  yield* revealWords(farWords, 0.09);
  yield* cue(48.7);
  yield* all(pop(jl(), 0.5), lLab().opacity(1, 0.3));
  // the dot rides the path as it draws
  traveler().position(() => path().getPointAtPercentage(path().end()).position);
  spawn(traveler().size(28, 0.3, easeOutBack));
  yield* path().end(1, 1.2, easeInOutCubic);
  yield* cue(49.9);
  yield* all(pop(jrc(), 0.5), rLab().opacity(1, 0.3));

  // ---------------------------------------------------------- 51.1 end card
  const endCard = createRef<Node>();
  const thanks: Rect[] = [];
  const avatar = createRef<Rect>();
  const handle = createRef<Node>();
  const sub = createRef<Rect>();
  const subLabel = createRef<Txt>();
  stage.add(
    <Node ref={endCard}>
      <Node y={-220}>
        <KLine refs={thanks} size={130} words={['THANKS', 'FOR', {t: 'WATCHING', hl: C.amber}]} />
      </Node>
      <Rect ref={avatar} x={-330} y={60} size={190} radius={100} clip stroke={C.amber} lineWidth={6} opacity={0} scale={0.5}>
        <Img src={'/avatar.jpg'} size={190} />
      </Rect>
      <Node ref={handle} x={-200} y={60} opacity={0}>
        <Txt text={'Lex AI'} offset={[-1, 0]} y={-30} fontFamily={HEAD} fontWeight={900} fontSize={76} fill={C.text} />
        <Txt text={'@LexAI01'} offset={[-1, 0]} y={38} fontFamily={MONO} fontSize={34} fill={C.dim} />
      </Node>
      <Rect ref={sub} y={260} layout padding={[26, 56]} radius={18} fill={'#ff2a3d'} opacity={0} scale={0.5} shadowBlur={40} shadowColor={'#ff2a3d'}>
        <Txt ref={subLabel} text={'SUBSCRIBE'} fontFamily={HEAD} fontWeight={900} fontSize={50} letterSpacing={3} fill={'#fff'} />
      </Rect>
    </Node>,
  );
  yield* cue(51.0);
  yield* all(jr().opacity(0, 0.35), jr().scale(0.95, 0.35));
  spawn(revealWords(thanks, 0.12, 0.5));
  yield* waitFor(0.4);
  yield* pop(avatar(), 0.5);
  yield* all(handle().opacity(1, 0.4), handle().x(-210, 0.4));
  yield* cue(52.9);
  yield* pop(sub(), 0.5);
  yield* waitFor(0.5);
  yield* sub().scale(0.92, 0.08);
  sub().fill('rgba(255,255,255,0.14)').shadowColor('rgba(0,0,0,0)');
  subLabel().text('SUBSCRIBED  ✓');
  yield* sub().scale(1, 0.25, easeOutBack);
  yield* cue(56.0);
  yield* stage.opacity(0, 0.5);
});
