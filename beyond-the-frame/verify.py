"""Measure out/final.mp4 against the SPEC acceptance checks. Prints a report."""
import json, subprocess, sys
import numpy as np
from PIL import Image
V = sys.argv[1] if len(sys.argv) > 1 else 'out/final.mp4'
W, H, S = 480, 270, 4   # analysis size
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', V]))
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', V, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'])
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
n = len(fr)
mean = fr.mean(axis=(1, 2)); peak = np.percentile(fr.reshape(n, -1), 99.9, axis=1)
ad = np.abs(np.diff(fr, axis=0)).reshape(n - 1, -1)
diff = np.r_[np.inf, ad.mean(axis=1)]
local = np.r_[np.inf, np.percentile(ad, 99.9, axis=1)]   # catches motion in sparse, minimal frames (thin lines, glints)
still = local < 5                        # grain alone stays at 1–2
runs, cur, start = [], 0, 0
for i, s in enumerate(still):
    if s: cur += 1; start = i - cur + 1
    else:
        if cur: runs.append((start, cur))
        cur = 0
if cur: runs.append((start, cur))
longest_pre_end = max([r for r in runs if r[0] < 25.4 * 30], key=lambda r: r[1], default=(0, 0))
v = [s for s in probe['streams'] if s['codec_type'] == 'video'][0]
a = [s for s in probe['streams'] if s['codec_type'] == 'audio']
print(json.dumps({
  'codec': v['codec_name'], 'profile': v['profile'], 'size': f"{v['width']}x{v['height']}", 'pix_fmt': v['pix_fmt'],
  'fps': v['r_frame_rate'], 'frames': n, 'duration': float(probe['format']['duration']),
  'audio_streams': len(a), 'file_MB': round(int(probe['format']['size']) / 1e6, 1),
  'first_frame_mean_luma': round(float(mean[0]), 2),
  'mean_luma_min_max': [round(float(mean.min()), 2), round(float(mean.max()), 2)],
  'frames_pure_black(mean<1)': int((mean < 1).sum()), 'frames_blown(mean>200)': int((mean > 200).sum()),
  'peak_luma_max': float(peak.max()),
  'still_frames_pct(p99.9 diff<5)': round(100 * float(still.mean()), 1),
  'longest_still_before_endcard_s': round(longest_pre_end[1] / 30, 2), 'at_s': round(longest_pre_end[0] / 30, 2),
  'motion_per_second': [round(float(diff[max(1, i*30):(i+1)*30].mean()), 2) for i in range(30)],
}, indent=1))
