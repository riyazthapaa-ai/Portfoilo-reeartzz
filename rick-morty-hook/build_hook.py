#!/usr/bin/env python3
"""
Hook edit for "Every Character Killed Off in Rick and Morty".

Renders the hook (VO 0:00.00 - 0:24.31) as a finished 1080p30 MP4:
episode clips, VO synced to the word, clip-audio ducking under the VO,
punch-in zooms, a still-frame montage, a "STAYED DEAD?" beat, a title card,
a Season 1 lower-third, burned-in word-highlight captions and a white flash
out of the hook.

Usage
-----
  # 1) Animatic with placeholder cards (no episode files needed) - checks timing
  python3 build_hook.py --vo VO.mp3 --placeholder -o hook_preview.mp4

  # 2) Real edit - point it at your own episode files
  python3 build_hook.py --vo VO.mp3 \
      --s3e4 "S03E04 Vindicators 3.mkv" \
      --s7e5 "S07E05 Unmortricken.mkv" \
      --s1e1 "S01E01 Pilot.mkv" \
      [--music bed.mp3] [--tight] -o hook_final.mp4

  --tight   trims each clip to its VO line (~25s hook) instead of letting the
            full clip ranges from the script play out (~53s hook).
  --music   optional music bed; it is auto-ducked under the VO.

Only ffmpeg (with libass + libfreetype) and Python 3 are required.
"""
import argparse, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
W, H = 1920, 1080
GREEN = "0x97CE4C"   # portal green
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
FONT_ASS = "Inter Display"   # family name used by the caption file

# --------------------------------------------------------------------------
# VO lines: (start, end) in the VO file, cut at measured silences.
# Words + times come from a word-level transcription of the VO, spelled as in
# the script.
# --------------------------------------------------------------------------
VO = {
    "L1": (0.00, 3.88),
    "L2": (3.88, 7.05),
    "L3": (7.05, 10.83),
    "L4": (10.83, 14.27),
    "L5": (14.27, 18.47),
    "L6": (18.47, 24.31),
}
WORDS = [  # (vo_time, word)
    (0.0, "From"), (0.3, "a"), (0.5, "whole"), (0.6, "bunch"), (0.8, "of"),
    (1.0, "superheroes"), (1.7, "who"), (1.8, "couldn't"), (2.1, "even"),
    (2.2, "survive"), (2.6, "their"), (2.8, "own"), (3.0, "rescue"), (3.4, "mission…"),
    (3.9, "to"), (4.2, "important"), (4.6, "characters"), (5.2, "dying"), (5.6, "that"),
    (5.8, "changed"), (6.1, "the"), (6.2, "show"), (6.5, "forever."),
    (7.0, "Rick"), (7.3, "and"), (7.4, "Morty"), (7.8, "has"), (8.0, "killed"),
    (8.2, "off"), (8.3, "a"), (8.5, "ridiculous"), (9.2, "number"), (9.4, "of"),
    (9.6, "characters"), (10.1, "over"), (10.3, "the"), (10.5, "years."),
    (11.0, "But"), (11.1, "how"), (11.3, "many"), (11.4, "of"), (11.6, "these"),
    (11.8, "unlucky"), (12.3, "souls"), (13.0, "actually"), (13.3, "stayed"), (13.8, "dead?"),
    (14.4, "Today,"), (14.7, "we're"), (14.9, "digging"), (15.2, "through"), (15.4, "the"),
    (15.5, "show's"), (15.8, "major"), (16.2, "and"), (16.5, "most"), (16.7, "overlooked"),
    (17.4, "character"), (17.9, "deaths."),
    (18.6, "Starting"), (19.0, "all"), (19.2, "the"), (19.3, "way"), (19.4, "back"),
    (19.6, "in"), (20.2, "Season"), (20.4, "One,"), (20.6, "when"), (20.8, "an"),
    (21.0, "ordinary"), (21.4, "school"), (21.7, "bully"), (22.1, "became"), (22.3, "one"),
    (22.4, "of"), (22.5, "Rick's"), (23.1, "very"), (23.4, "first"), (23.6, "victims."),
]
KEYWORDS = {"superheroes", "forever.", "killed", "ridiculous", "dead?", "deaths.",
            "Season", "One,", "victims.", "survive"}

# --------------------------------------------------------------------------
# Edit decision list. Clip times are from the start of the episode.
# --------------------------------------------------------------------------
def ts(s):
    m, sec = s.split(":"); return int(m) * 60 + float(sec)

CLIPS = {
    "s3e4": dict(label="S3E4  VINDICATORS 3", color="0x3a1f5c"),
    "s7e5": dict(label="S7E5  UNMORTRICKEN", color="0x5c1f1f"),
    "s1e1": dict(label="S1E1  PILOT", color="0x1f4a5c"),
}

def build_edl(tight):
    edl = [
        dict(kind="clip", src="s3e4", a="11:17", b="11:29", vo="L1", zoom=(1.0, 1.10)),
        dict(kind="clip", src="s7e5", a="18:45", b="19:08", vo="L2", zoom=(1.0, 1.08)),
        dict(kind="montage", vo="L3",
             stills=[("s3e4", "11:19"), ("s7e5", "18:50"), ("s1e1", "05:52"),
                     ("s3e4", "11:25"), ("s7e5", "18:58"), ("s1e1", "05:56")]),
        dict(kind="question", vo="L4", still=("s7e5", "19:05")),
        dict(kind="title", vo="L5", still=("s3e4", "11:27")),
        dict(kind="clip", src="s1e1", a="05:50", b="05:57", vo="L6", zoom=(1.0, 1.12),
             lower_third=("SEASON 1", "EPISODE 1  ·  PILOT"), flash_out=True),
    ]
    t = 0.0
    for seg in edl:
        vs, ve = VO[seg["vo"]]
        vlen = ve - vs
        if seg["kind"] == "clip":
            clen = ts(seg["b"]) - ts(seg["a"])
            if tight and not seg.get("flash_out"):
                clen = min(clen, vlen + 0.35)
            seg["dur"] = max(clen, vlen + 0.1)
            seg["vo_at"] = t + (0.0 if seg is edl[0] else 0.05)
        else:
            seg["dur"] = vlen + 0.05
            seg["vo_at"] = t
        seg["t"] = t
        t += seg["dur"]
    return edl, t

# --------------------------------------------------------------------------
# Captions (ASS, word-by-word highlight)
# --------------------------------------------------------------------------
def fmt_ass(t):
    cs = int(round(t * 100)); h, cs = divmod(cs, 360000); m, cs = divmod(cs, 6000); s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

def fmt_srt(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def caption_chunks(edl):
    """Map words onto the output timeline and group into 1-3 word chunks."""
    chunks = []
    for seg in edl:
        vs, ve = VO[seg["vo"]]
        off = seg["vo_at"] - vs
        words = [(t + off, w) for t, w in WORDS if vs - 0.05 <= t < ve - 0.05]
        line_end = ve + off
        cur = []
        for i, (t, w) in enumerate(words):
            nxt = words[i + 1][0] if i + 1 < len(words) else line_end
            cur.append((t, nxt, w))
            if len(cur) == 3 or w[-1] in ",.?…" or i + 1 == len(words):
                chunks.append(cur); cur = []
    return chunks

def write_captions(edl, ass_path, srt_path):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{FONT_ASS},96,&H0000E5FF,&H00FFFFFF,&H00000000,&H96000000,-1,0,0,0,100,100,1,0,1,7,4,2,80,80,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev, srt = [], []
    for n, ch in enumerate(caption_chunks(edl), 1):
        start, end = ch[0][0], ch[-1][1]
        parts = []
        for (t0, t1, w) in ch:
            k = max(1, int(round((t1 - t0) * 100)))
            word = w.upper()
            if w in KEYWORDS:   # keywords land in portal green instead of yellow
                word = r"{\1c&H4CCE97&}" + word + r"{\1c&H0000E5FF&}"
            parts.append(rf"{{\kf{k}}}{word}")
        pop = r"{\fscx85\fscy85\t(0,90,\fscx100\fscy100)}"
        ev.append(f"Dialogue: 0,{fmt_ass(start)},{fmt_ass(end)},Cap,,0,0,0,,{pop}" + " ".join(parts))
        srt.append(f"{n}\n{fmt_srt(start)} --> {fmt_srt(end)}\n{' '.join(w for _, _, w in ch)}\n")
    with open(ass_path, "w") as f:
        f.write(head + "\n".join(ev) + "\n")
    with open(srt_path, "w") as f:
        f.write("\n".join(srt))

# --------------------------------------------------------------------------
# ffmpeg graph
# --------------------------------------------------------------------------
def esc(s):
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'").replace(",", "\\,")

def dt(text, size, x, y, color="white", extra=""):
    return (f"drawtext=fontfile={FONT}:text='{esc(text)}':fontsize={size}:fontcolor={color}"
            f":borderw={max(4, size // 14)}:bordercolor=black:x={x}:y={y}{extra}")

class Graph:
    def __init__(self, args):
        self.args, self.inputs, self.f = args, [], []

    def add_input(self, opts):
        self.inputs.append(opts); return len(self.inputs) - 1

    def video_in(self, src, at, dur):
        """Video stream label for `dur` seconds of `src` starting at episode time `at`."""
        if self.args.placeholder:
            c = CLIPS[src]
            i = self.add_input(["-f", "lavfi", "-t", f"{dur:.3f}", "-i",
                                f"color=c={c['color']}:s={W}x{H}:r={FPS}"])
            lab = f"ph{len(self.f)}"
            mm, ss = divmod(at, 60)
            self.f.append(
                f"[{i}:v]" + dt(c["label"], 88, "(w-text_w)/2", "h/2-150") + "," +
                dt(f"@ {int(mm):02d}:{ss:05.2f}  (+%{{eif:t:d}}.%{{eif:mod(t*10,10):d}}s)", 64,
                   "(w-text_w)/2", "h/2-30", "0xDDDDDD") + "," +
                dt("PLACEHOLDER - replace with episode footage", 40, "(w-text_w)/2", "h/2+70", "0xAAAAAA") +
                f"[{lab}]")
            return lab, None
        i = self.add_input(["-ss", f"{at:.3f}", "-t", f"{dur:.3f}", "-i", getattr(self.args, src)])
        return f"{i}:v", f"{i}:a"

    def norm(self, inp, out, extra=""):
        self.f.append(f"[{inp}]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                      f"setsar=1,fps={FPS},format=yuv420p{extra}[{out}]")

    def zoom(self, inp, out, dur, z0, z1, extra=""):
        n = max(1, int(round(dur * FPS)))
        self.f.append(
            f"[{inp}]scale={W*2}:{H*2},zoompan=z='{z0}+({z1}-{z0})*on/{n}':d=1:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}{extra}[{out}]")

    def still(self, src, at, dur, idx):
        lab, _ = self.video_in(src, ts(at), 0.2 if not self.args.placeholder else dur)
        n = max(1, int(round(dur * FPS)))
        self.norm(lab, f"st{idx}n", f",trim=end_frame=1,loop=loop={n}:size=1,setpts=N/{FPS}/TB")
        return f"st{idx}n"

def build(args):
    edl, total = build_edl(args.tight)
    work = tempfile.mkdtemp(prefix="hook_")
    ass = os.path.join(work, "captions.ass")
    srt_out = os.path.splitext(args.output)[0] + "_captions.srt"
    write_captions(edl, ass, srt_out)
    shutil.copy(ass, os.path.splitext(args.output)[0] + "_captions.ass")

    g = Graph(args)
    vo_i = g.add_input(["-i", args.vo])
    music_i = g.add_input(["-stream_loop", "-1", "-i", args.music]) if args.music else None

    vsegs, aclips = [], []
    for k, seg in enumerate(edl):
        d = seg["dur"]
        if seg["kind"] == "clip":
            v, a = g.video_in(seg["src"], ts(seg["a"]), d)
            g.norm(v, f"c{k}n")
            extra = ""
            if seg.get("lower_third"):
                big, small = seg["lower_third"]
                en = "enable='between(t,0.4,3.6)':alpha='min(1,(t-0.4)*5)*min(1,(3.6-t)*5)'"
                extra += "," + dt(big, 110, "90", "80", GREEN, ":" + en)
                extra += "," + dt(small, 52, "96", "205", "white", ":" + en)
            if seg.get("flash_out"):
                extra += f",fade=t=out:st={d-0.15:.2f}:d=0.15:color=white"
            z0, z1 = seg["zoom"]
            g.zoom(f"c{k}n", f"v{k}", d, z0, z1, extra)
            if a:  # clip audio: ducked under its VO line, full after
                vs, ve = VO[seg["vo"]]
                rel = seg["vo_at"] - seg["t"] + (ve - vs)
                g.f.append(
                    f"[{a}]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{d:.3f},"
                    f"volume='if(lt(t,{rel:.2f}),0.16,min(1,0.16+(t-{rel:.2f})/0.35))':eval=frame,"
                    f"afade=t=in:d=0.05,afade=t=out:st={d-0.08:.2f}:d=0.08,"
                    f"adelay={int(seg['t']*1000)}:all=1[ca{k}]")
                aclips.append(f"ca{k}")

        elif seg["kind"] == "montage":
            stills = seg["stills"]; per = d / len(stills); parts = []
            for j, (src, at) in enumerate(stills):
                s = g.still(src, at, per, f"{k}_{j}")
                g.zoom(s, f"m{k}_{j}", per, 1.0 if j % 2 else 1.12, 1.12 if j % 2 else 1.0,
                       ",eq=contrast=1.15:saturation=1.25")
                parts.append(f"[m{k}_{j}]")
            vs, _ = VO[seg["vo"]]
            t_k = 8.0 - vs  # "killed" lands here
            g.f.append("".join(parts) + f"concat=n={len(parts)}:v=1:a=0," +
                       dt("KILLED OFF", 190, "(w-text_w)/2", "(h-text_h)/2-120", "0xE53935",
                          f":enable='gte(t,{t_k:.2f})'") +
                       f",fade=t=in:d=0.08:color=white[v{k}]")

        elif seg["kind"] == "question":
            s = g.still(*seg["still"], d, k)
            vs, _ = VO[seg["vo"]]
            t_d = 13.3 - vs  # "stayed dead?"
            g.zoom(s, f"v{k}", d, 1.0, 1.18,
                   ",eq=saturation=0.25:brightness=-0.12,vignette=PI/4," +
                   dt("STAYED", 170, "(w-text_w)/2", "h/2-260", "white", f":enable='gte(t,{t_d:.2f})'") + "," +
                   dt("DEAD?", 230, "(w-text_w)/2", "h/2-90", "0xE53935", f":enable='gte(t,{t_d+0.5:.2f})'"))

        elif seg["kind"] == "title":
            s = g.still(*seg["still"], d, k)
            g.zoom(s, f"t{k}", d, 1.05, 1.15, ",gblur=sigma=18,eq=brightness=-0.3:saturation=0.6,vignette=PI/3")
            fade = ":alpha='min(1,t*4)'"
            g.f.append(f"[t{k}]" +
                       dt("EVERY CHARACTER", 150, "(w-text_w)/2", "h/2-250", "white", fade) + "," +
                       dt("KILLED OFF", 210, "(w-text_w)/2", "h/2-90", GREEN, ":alpha='min(1,max(0,(t-0.35)*4))'") + "," +
                       dt("IN RICK AND MORTY", 70, "(w-text_w)/2", "h/2+150", "0xDDDDDD", ":alpha='min(1,max(0,(t-0.7)*4))'") +
                       f",fade=t=in:d=0.12:color=white[v{k}]")
        vsegs.append(f"[v{k}]")

    # video: concat + captions
    g.f.append("".join(vsegs) + f"concat=n={len(vsegs)}:v=1:a=0,ass=filename='{esc(ass)}'[vout]")

    # VO lines placed on the timeline
    vo_labels = []
    g.f.append(f"[{vo_i}:a]aresample=48000,aformat=channel_layouts=stereo,asplit={len(edl)}" +
               "".join(f"[vo{k}]" for k in range(len(edl))))
    for k, seg in enumerate(edl):
        vs, ve = VO[seg["vo"]]
        g.f.append(f"[vo{k}]atrim={vs}:{ve},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,"
                   f"afade=t=out:st={ve-vs-0.03:.2f}:d=0.03,adelay={int(seg['vo_at']*1000)}:all=1[vl{k}]")
        vo_labels.append(f"[vl{k}]")
    g.f.append("".join(vo_labels) + f"amix=inputs={len(vo_labels)}:normalize=0:duration=longest,"
               f"apad=whole_dur={total:.3f}[vobus]")

    mix = ["[vomain]"] + [f"[{a}]" for a in aclips]
    if music_i is not None:
        g.f.append("[vobus]asplit=2[vomain][vosc]")
        g.f.append(f"[{music_i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.35,"
                   f"atrim=0:{total:.3f},afade=t=out:st={total-1:.2f}:d=1[mus]")
        g.f.append("[mus][vosc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=350[musd]")
        mix.append("[musd]")
    else:
        g.f.append("[vobus]anull[vomain]")
    g.f.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,"
               f"atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]")

    graph_path = os.path.join(work, "graph.txt")
    with open(graph_path, "w") as fh:
        fh.write(";\n".join(g.f))
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stats"]
    for opts in g.inputs:
        cmd += opts
    cmd += ["-filter_complex_script", graph_path, "-map", "[vout]", "-map", "[aout]",
            "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", args.preset, "-crf", str(args.crf),
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", args.output]
    print(f"Hook length: {total:.2f}s  ({'tight' if args.tight else 'full clips'})")
    for seg in edl:
        print(f"  {seg['t']:6.2f}-{seg['t']+seg['dur']:6.2f}  {seg['kind']:8s} VO {seg['vo']} "
              + (f"{seg['src']} {seg['a']}-{seg['b']}" if seg['kind'] == 'clip' else ""))
    subprocess.run(cmd, check=True)
    print("Wrote", args.output, "and", srt_out)

def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--vo", required=True, help="full VO mp3 (the hook is read from 0:00-0:24.31)")
    p.add_argument("--s3e4"); p.add_argument("--s7e5"); p.add_argument("--s1e1")
    p.add_argument("--music")
    p.add_argument("--placeholder", action="store_true", help="render an animatic without footage")
    p.add_argument("--tight", action="store_true", help="trim clips to their VO lines")
    p.add_argument("--preset", default="medium"); p.add_argument("--crf", type=int, default=18)
    p.add_argument("-o", "--output", default="hook.mp4")
    a = p.parse_args()
    if not a.placeholder:
        missing = [k for k in CLIPS if not getattr(a, k)]
        if missing:
            p.error("missing episode files: " + ", ".join("--" + m for m in missing) + " (or use --placeholder)")
    build(a)

if __name__ == "__main__":
    main()
