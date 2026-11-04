// HEADPHONES AD · Final thoughts + CTA. Bold kinetic style.
// public/hp/vo-cta.wav is source VO (second file) 3:24.5–end; cues are in
// source-VO seconds and converted with T().
import {Audio, Circle, Img, Line, makeScene2D, Node, Rect, Txt} from '@revideo/2d';
import {all, createRef, easeInCubic, easeInOutCubic, easeOutCubic, easeOutExpo, spawn, waitFor} from '@revideo/core';
import {
  Bar,
  BODY,
  Big,
  Chrome,
  Clip,
  cue,
  Cursor,
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

const T = (src: number) => src - 204.5;
const at = (src: number) => cue(T(src));

export default makeScene2D('hp-cta', function* (view) {
  Ground(view);
  view.add(<Audio src={'/hp/vo-cta.wav'} play />);
  const stage = (<Node />) as Node;
  view.add(stage);
  const wipe = Wiper(view);
  const tick = Chrome(view, 'LEX AI / FINAL THOUGHTS', 'LINK IN DESCRIPTION  ●  TRY PIXVERSE CANVAS  ●  SUBSCRIBE  ●  ');

  // ------------------------------------------------------- 204.6 what I like
  const likeTag = createRef<Rect>();
  const pvA = createRef<Txt>();
  const pvB = createRef<Txt>();
  stage.add(<Tag refNode={likeTag} text={'WHAT I LIKE ABOUT THIS WORKFLOW'} mono size={26} x={-860} y={-410} align={'left'} solid={false} />);
  stage.add(<Big refNode={pvA} text={'PIXVERSE'} size={300} x={-870} y={-190} />);
  stage.add(<Big refNode={pvB} text={'CANVAS'} size={300} x={-870} y={90} color={LIME} />);
  const parts = ['IDEA', 'VISUALS', 'CLIPS', 'EDIT'];
  const partRefs: Rect[] = [];
  stage.add(
    <Node>
      {parts.map((p, i) => (
        <Tag refNode={r => r && partRefs.push(r)} text={p} size={70} x={560} y={-300 + i * 150} solid={false} />
      ))}
    </Node>,
  );
  const together = createRef<Rect>();
  stage.add(
    <Rect ref={together} x={560} y={-75} width={560} height={600} fill={LIME} opacity={0}>
      <Txt text={'ONE\nCREATIVE\nPROCESS'} fontFamily={'Anton'} fontSize={120} lineHeight={124} textAlign={'center'} fill={INK} />
    </Rect>,
  );
  yield* at(204.6);
  tick();
  yield* likeTag().opacity(1, 0.15);
  yield* at(206.55);
  yield* slam(pvA(), 0.22);
  yield* slam(pvB(), 0.22);
  yield* at(207.9);
  for (const p of partRefs) {
    spawn(slam(p, 0.18));
    yield* waitFor(0.15);
  }
  yield* at(209.2);
  yield* all(...partRefs.map(p => all(p.y(-75, 0.25, easeInCubic), p.opacity(0, 0.25))));
  yield* together().opacity(1).height(0).height(600, 0.25, easeOutExpo);

  // ------------------------------------------------------- 210.6 the pipeline (four columns)
  const pipe = ['IDEA / REFERENCE', 'DEVELOP VISUALS', 'GENERATE CLIPS', 'EDIT & REFINE'];
  const cols: Rect[] = [];
  const colW = W / 4;
  stage.add(
    <Node>
      {pipe.map((p, i) => (
        <Panel refNode={r => r && cols.push(r)} x={-W / 2 + colW * (i + 0.5)} y={-35} w={colW - 6} h={H - 70} fill={i % 2 ? '#0d0d0d' : '#151515'}>
          <Rect y={-170} width={colW - 6} height={580} clip fill={'#fff'}>
            {i === 0 ? <Product w={colW - 6} h={580} /> : <Still src={STILLS[i - 1].src} w={colW - 6} h={580} />}
          </Rect>
          <Txt text={`0${i + 1}`} x={-colW / 2 + 30} y={190} offset={[-1, 0]} fontFamily={'Anton'} fontSize={120} fill={LIME} />
          <Txt text={p} x={-colW / 2 + 30} y={320} offset={[-1, 0]} fontFamily={'Anton'} fontSize={52} letterSpacing={2} fill={PAPER} />
        </Panel>
      ))}
    </Node>,
  );
  yield* at(210.6);
  yield* wipe(() => hideAll(likeTag(), pvA(), pvB(), together()));
  const pipeCues = [211.4, 213.0, 214.1, 215.8];
  for (let i = 0; i < 4; i++) {
    yield* at(pipeCues[i]);
    tick();
    yield* open(cols[i], H - 70, 0.3);
  }

  // ------------------------------------------------------- 219.0 who it's for
  const aud = [
    {t: 'FOR\nCREATORS', lines: ['EXPERIMENT WITH VISUAL CONCEPTS', 'NO NEED TO FILM EVERY SHOT'], cues: [221.0, 222.7]},
    {t: 'FOR\nBUSINESSES', lines: ['PRODUCT VISUALS', 'ADVERTISING CONCEPTS', 'NEW CREATIVE DIRECTIONS'], cues: [228.0, 229.7, 231.0]},
    {t: 'FOR AI\nFILMMAKERS', lines: ['DEVELOP VISUALS + EDIT', 'IN THE SAME WORKSPACE'], cues: [236.2, 238.7]},
  ];
  const audStart = [219.2, 225.7, 233.0];
  const heads: Rect[] = [];
  const audLines: Rect[][] = aud.map(() => []);
  const ax = (i: number) => (i - 1) * 620;
  stage.add(
    <Node>
      {aud.map((a, i) => (
        <Rect ref={r => r && heads.push(r)} x={ax(i)} y={-250} width={590} height={300} fill={i === 1 ? LIME : PAPER} opacity={0}>
          <Txt text={a.t} x={-265} offset={[-1, 0]} fontFamily={'Anton'} fontSize={110} lineHeight={108} fill={INK} />
        </Rect>
      ))}
      {aud.flatMap((a, i) =>
        a.lines.map((l, j) => (
          <Rect ref={r => r && audLines[i].push(r)} layout x={ax(i) - 295} y={-40 + j * 90} offset={[-1, 0]} direction={'row'} gap={14} alignItems={'center'} opacity={0}>
            <Rect width={18} height={18} fill={LIME} />
            <Txt text={l} fontFamily={'Anton'} fontSize={40} letterSpacing={1} fill={PAPER} />
          </Rect>
        )),
      )}
    </Node>,
  );
  const worth = createRef<Rect>();
  stage.add(
    <Rect ref={worth} y={360} width={W} height={130} fill={LIME} opacity={0}>
      <Txt text={'WORTH EXPLORING'} fontFamily={'Anton'} fontSize={100} letterSpacing={4} fill={INK} />
    </Rect>,
  );
  yield* at(219.0);
  yield* wipe(() => hideAll(...cols));
  for (let i = 0; i < 3; i++) {
    yield* at(audStart[i]);
    tick();
    yield* rise(heads[i], 0.22, 200);
    for (let j = 0; j < aud[i].lines.length; j++) {
      yield* at(aud[i].cues[j]);
      yield* rise(audLines[i][j], 0.18, 40);
    }
  }
  yield* at(240.9);
  yield* worth().opacity(1).height(0).height(130, 0.22, easeOutExpo);

  // ------------------------------------------------------- 242.4 the important thing
  const impTag = createRef<Rect>();
  const clearA = createRef<Txt>();
  const focusRow: Rect[] = [];
  const randRow: Rect[] = [];
  const randBar = createRef<Rect>();
  stage.add(<Tag refNode={impTag} text={'THE IMPORTANT THING'} mono size={26} x={-860} y={-410} align={'left'} solid={false} />);
  stage.add(<Big refNode={clearA} text={'START WITH A\nCLEAR IDEA'} size={200} x={-860} y={-170} />);
  stage.add(
    <Node x={0} y={140}>
      <KRow refs={focusRow} size={120} words={['FOCUS', 'ON', 'THE', {t: 'FINAL RESULT', box: true}]} />
    </Node>,
  );
  stage.add(
    <Node y={320}>
      <KRow refs={randRow} size={80} words={[{t: 'NOT', dim: true}, {t: 'RANDOM', dim: true}, {t: 'CLIPS', dim: true}, {t: 'WITHOUT', dim: true}, {t: 'A', dim: true}, {t: 'PLAN', dim: true}]} />
    </Node>,
  );
  stage.add(<Bar refNode={randBar} x={-280} y={320} h={16} />);
  yield* at(242.4);
  yield* wipe(() => hideAll(...heads, ...audLines.flat(), worth()));
  tick();
  yield* impTag().opacity(1, 0.15);
  yield* at(243.8);
  yield* slam(clearA(), 0.24);
  yield* at(245.9);
  yield* slamWords(focusRow, 0.1);
  yield* at(248.3);
  yield* slamWords(randRow, 0.08);
  yield* at(249.6);
  yield* randBar().width(690, 0.3, easeOutExpo);

  // ------------------------------------------------------- 250.3 CTA
  const ideaA = createRef<Txt>();
  const life = createRef<Txt>();
  const btn = createRef<Rect>();
  const btnTxt = createRef<Txt>();
  const cursor = createRef<Node>();
  const flashBox = createRef<Rect>();
  const sub = createRef<Txt>();
  stage.add(<Big refNode={ideaA} text={'GOT AN IDEA?'} size={280} x={-860} y={-250} color={LIME} />);
  stage.add(<Big refNode={life} text={'BRING IT TO LIFE.'} size={130} x={-860} y={-40} />);
  stage.add(
    <Rect ref={btn} y={200} width={W - 160} height={190} fill={PAPER} opacity={0}>
      <Txt ref={btnTxt} text={'LINK IN THE DESCRIPTION ↓'} fontFamily={'Anton'} fontSize={120} letterSpacing={3} fill={INK} />
    </Rect>,
  );
  stage.add(<Rect ref={flashBox} y={200} width={W - 160} height={190} fill={LIME} opacity={0} />);
  stage.add(<Cursor refNode={cursor} />);
  stage.add(<Txt ref={sub} text={'> start building your own project'} x={-880} y={350} offset={[-1, 0]} fontFamily={MONO} fontSize={36} fill={PAPER} opacity={0} />);
  yield* at(250.3);
  hideAll(impTag(), clearA(), ...focusRow, ...randRow, randBar());
  tick();
  yield* slam(ideaA(), 0.24);
  yield* at(252.5);
  yield* rise(life(), 0.22, 60);
  yield* at(253.5);
  yield* btn().opacity(1).height(0).height(190, 0.22, easeOutExpo);
  cursor().position([700, 450]);
  cursor().opacity(1);
  yield* cursor().position([380, 230], 0.5, easeInOutCubic);
  yield* cursor().scale(0.85, 0.08);
  flashBox().opacity(1);
  spawn(flashBox().opacity(0, 0.35));
  yield* cursor().scale(1, 0.12);
  yield* at(255.2);
  btn().fill(LIME);
  btnTxt().text('TRY PIXVERSE CANVAS →');
  cursor().opacity(0);
  yield* slam(btn(), 0.18);
  yield* at(256.5);
  yield* rise(sub(), 0.2, 30);

  // ------------------------------------------------------- 258.5 how far can one idea go
  const steps = ['EXPLORE THE TOOLS', 'DEVELOP YOUR VISUALS', 'TAKE ONE IDEA FURTHER'];
  const stepRefs: Rect[] = [];
  const farA = createRef<Txt>();
  const jl = createRef<Rect>();
  const jr = createRef<Rect>();
  const track = createRef<Rect>();
  const dot = createRef<Rect>();
  stage.add(
    <Node>
      {steps.map((s, i) => (
        <Tag refNode={r => r && stepRefs.push(r)} text={`0${i + 1}  ${s}`} size={36} x={-880 + i * 600} y={-410} align={'left'} />
      ))}
    </Node>,
  );
  stage.add(<Big refNode={farA} text={'HOW FAR CAN ONE IDEA GO?'} size={150} x={-860} y={-250} />);
  stage.add(
    <Panel refNode={jl} x={-620} y={150} w={600} h={380} fill={'#fff'}>
      <Product w={600} h={380} />
      <Label n={'A'} text={'FIRST CONCEPT'} w={600} h={380} size={34} />
    </Panel>,
  );
  stage.add(<Rect ref={track} x={-320} y={150} offset={[-1, 0]} width={0} height={14} fill={LIME} />);
  stage.add(<Rect ref={dot} x={-320} y={150} size={40} fill={LIME} opacity={0} />);
  stage.add(
    <Panel refNode={jr} x={620} y={150} w={600} h={380}>
      <Clip w={600} h={380} time={PLAY.wide + 2} />
      <Label n={'B'} text={'FINAL SHOT'} w={600} h={380} size={34} />
    </Panel>,
  );
  yield* at(258.5);
  yield* wipe(() => hideAll(ideaA(), life(), btn(), sub()));
  tick();
  const stepCues = [259.0, 260.4, 261.6];
  for (let i = 0; i < 3; i++) {
    yield* at(stepCues[i]);
    yield* slam(stepRefs[i], 0.18);
  }
  yield* slam(farA(), 0.22);
  yield* at(264.3);
  yield* open(jl(), 380, 0.28);
  dot().opacity(1);
  yield* all(track().width(640, 0.7, easeInOutCubic), dot().x(320, 0.7, easeInOutCubic));
  yield* at(265.3);
  yield* open(jr(), 380, 0.28);

  // ------------------------------------------------------- 266.3 subscribe + thanks
  const avatar = createRef<Rect>();
  const name = createRef<Txt>();
  const handle = createRef<Txt>();
  const subBtn = createRef<Rect>();
  const subLabel = createRef<Txt>();
  const more: Rect[] = [];
  const thanks: Rect[] = [];
  stage.add(
    <Panel refNode={avatar} x={-700} y={-170} w={300} h={300}>
      <Img src={'/avatar.jpg'} size={300} />
    </Panel>,
  );
  stage.add(<Big refNode={name} text={'LEX AI'} size={200} x={-510} y={-210} />);
  stage.add(<Txt ref={handle} text={'@LexAI01'} x={-505} y={-60} offset={[-1, 0]} fontFamily={MONO} fontSize={40} fill={GREY} opacity={0} />);
  stage.add(
    <Rect ref={subBtn} x={560} y={-170} width={680} height={160} fill={'#ff2a3d'} opacity={0}>
      <Txt ref={subLabel} text={'SUBSCRIBE'} fontFamily={'Anton'} fontSize={100} letterSpacing={4} fill={'#fff'} />
    </Rect>,
  );
  stage.add(
    <Node>
      <Rect layout x={-860} y={70} offset={[-1, 0]} direction={'row'} gap={28}>
        {['AI TOOLS', 'CREATIVE WORKFLOWS', 'PRACTICAL DEMOS'].map(t => (
          <Tag refNode={r => r && more.push(r)} text={`+ ${t}`} size={48} solid={false} />
        ))}
      </Rect>
    </Node>,
  );
  stage.add(
    <Node y={290}>
      <KRow refs={thanks} size={170} words={['THANKS', 'FOR', {t: 'WATCHING', box: true}]} />
    </Node>,
  );
  yield* at(266.3);
  yield* wipe(() => hideAll(...stepRefs, farA(), jl(), jr(), track(), dot()));
  tick();
  yield* open(avatar(), 300, 0.3);
  yield* slam(name(), 0.2);
  yield* rise(handle(), 0.2, 30);
  yield* at(267.7);
  yield* slam(subBtn(), 0.2);
  const moreCues = [269.0, 269.85, 270.95];
  for (let i = 0; i < 3; i++) {
    yield* at(moreCues[i]);
    yield* rise(more[i], 0.18, 50);
  }
  yield* at(272.8);
  spawn(slamWords(thanks, 0.14));
  yield* waitFor(0.6);
  subBtn().fill(PAPER);
  subLabel().fill(INK).fontSize(84).text('SUBSCRIBED  ✓');
  yield* slam(subBtn(), 0.18);
  yield* at(277.6);
  yield* stage.opacity(0, 0.4);
});
