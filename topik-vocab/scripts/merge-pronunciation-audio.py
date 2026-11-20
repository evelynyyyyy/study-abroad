#!/usr/bin/env python3
"""Merge cached pronunciation shards into one static audio manifest."""
from __future__ import annotations
import argparse, json, shutil
from pathlib import Path

def main() -> int:
    p=argparse.ArgumentParser()
    p.add_argument("--shards",required=True,type=Path)
    p.add_argument("--output",required=True,type=Path)
    p.add_argument("--expected-shards",required=True,type=int)
    args=p.parse_args()
    manifests=sorted(args.shards.glob("*/manifest.json"))
    if len(manifests)!=args.expected_shards:
        raise SystemExit(f"Expected {args.expected_shards} shard manifests, found {len(manifests)}")
    clips={};source=None
    clips_dir=args.output/"clips";clips_dir.mkdir(parents=True,exist_ok=True)
    for manifest_path in manifests:
        m=json.loads(manifest_path.read_text(encoding="utf-8"))
        if source is None:source=m["source"]
        elif m["source"]!=source:raise SystemExit("Pronunciation shard source mismatch")
        for text,clip in m["clips"].items():
            if text in clips and clips[text]!=clip:raise SystemExit(f"Conflicting clip {text!r}")
            src=manifest_path.parent/clip["file"].removeprefix("./audio/")
            # Shard manifests are rooted at their own output directory, so files
            # are normally clips/<hash>.wav.
            if not src.exists():src=manifest_path.parent/"clips"/Path(clip["file"]).name
            if not src.exists():raise SystemExit(f"Missing shard audio {src}")
            dst=clips_dir/src.name
            if dst.exists() and dst.read_bytes()!=src.read_bytes():raise SystemExit(f"Hash-name collision {src.name}")
            if not dst.exists():shutil.copy2(src,dst)
            clips[text]={**clip,"file":"./audio/clips/"+dst.name}
    if len(clips)<5000:raise SystemExit(f"Incomplete merged pronunciation inventory: {len(clips)}")
    manifest={"schemaVersion":1,"source":source,"clipCount":len(clips),"generatedCount":len(clips),"clips":dict(sorted(clips.items()))}
    args.output.mkdir(parents=True,exist_ok=True)
    (args.output/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    (args.output/"manifest.js").write_text("/* Generated during verified release build. */\nwindow.TOPIK_PRONUNCIATION_AUDIO="+json.dumps(manifest,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
    print(f"Merged {len(manifests)} shards into {len(clips)} hosted Korean pronunciation clips")
    return 0
if __name__=="__main__":
    raise SystemExit(main())
