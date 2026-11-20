#!/usr/bin/env python3
"""Build same-origin Korean pronunciation WAV assets for the static TOPIK site.

The release workflow supplies a local checkout of akamotaco/ppaso-tts-v1.
No API key or browser speech package is required at runtime.
"""
from __future__ import annotations
import argparse, hashlib, json, re, sys, unicodedata
from pathlib import Path

MODEL_ID="akamotaco/ppaso-tts-v1"
MODEL_REVISION="53d0966"
MODEL_LICENSE="Apache-2.0"
GENERATOR_VERSION="1"
SAMPLE_RATE=22050
HANGUL=re.compile(r"[가-힣]")
DOUBLE_QUOTED=re.compile(r'"((?:\\.|[^"\\])*)"')

def normalized(value: str) -> str:
    return unicodedata.normalize("NFC", value).strip()

def spoken_text(value: str) -> str:
    # Keep the displayed key unchanged in the manifest; only clean notation that
    # a Korean TTS should not literally pronounce.
    text=normalized(value).replace("…", " ").replace("／", " ").replace("/", " ")
    text=text.replace("(", " ").replace(")", " ").replace("[", " ").replace("]", " ")
    text=re.sub(r"^[\-–—]+", "", text)
    text=re.sub(r"\s+", " ", text).strip()
    return text or normalized(value)

def extract_texts(site: Path) -> list[str]:
    sources=[site/"app.js",site/"vocabulary.js",*sorted((site/"data").glob("*.js"))]
    values=set()
    for source in sources:
        raw=source.read_text(encoding="utf-8")
        for match in DOUBLE_QUOTED.finditer(raw):
            try:
                value=json.loads('"'+match.group(1)+'"')
            except Exception:
                continue
            value=normalized(value)
            if not value or len(value)>120 or not HANGUL.search(value):
                continue
            if "<" in value or ">" in value:
                continue
            values.add(value)
    return sorted(values)

def write_manifests(output: Path, clips: dict, generated_count: int) -> None:
    source={
        "kind":"build-generated-static-audio",
        "model":MODEL_ID,
        "revision":MODEL_REVISION,
        "license":MODEL_LICENSE,
        "modelPage":"https://huggingface.co/akamotaco/ppaso-tts-v1",
        "sampleRate":SAMPLE_RATE,
        "format":"wav-pcm16",
        "generatorVersion":GENERATOR_VERSION,
    }
    manifest={"schemaVersion":1,"source":source,"clipCount":len(clips),"generatedCount":generated_count,"clips":clips}
    (output/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    js="/* Generated during verified release build. */\nwindow.TOPIK_PRONUNCIATION_AUDIO="+json.dumps(manifest,ensure_ascii=False,separators=(",",":"))+";\n"
    (output/"manifest.js").write_text(js,encoding="utf-8")

def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument("--site",required=True,type=Path)
    parser.add_argument("--model",type=Path)
    parser.add_argument("--output",type=Path)
    parser.add_argument("--limit",type=int,default=0,help="QA only: generate first N texts")\n    parser.add_argument("--inventory-only",action="store_true",help="Only verify and report extracted Korean text inventory")
    args=parser.parse_args()
    texts=extract_texts(args.site)
    if args.limit:
        texts=texts[:args.limit]
    if len(texts)<100 and not args.limit:
        raise SystemExit(f"Refusing incomplete pronunciation build: only {len(texts)} Korean texts found")

    if args.inventory_only:\n        print(json.dumps({"count":len(texts),"sample":texts[:10]},ensure_ascii=False))\n        return 0\n    if not args.model or not args.output:\n        raise SystemExit("--model and --output are required unless --inventory-only is used")\n\n    sys.path.insert(0,str(args.model/"example"))
    try:
        import numpy as np
        import soundfile as sf
        from ppaso_tts import PpasoTTS
    except Exception as exc:
        raise SystemExit(f"Unable to load Ppaso-TTS dependencies: {exc}")

    clips_dir=args.output/"clips";clips_dir.mkdir(parents=True,exist_ok=True)
    tts=PpasoTTS(str(args.model),backend="onnx")
    clips={};generated=0
    for index,text in enumerate(texts,1):
        voice_input=spoken_text(text)
        key=hashlib.sha256((MODEL_ID+"\0"+MODEL_REVISION+"\0"+GENERATOR_VERSION+"\0"+text+"\0"+voice_input).encode("utf-8")).hexdigest()[:24]
        target=clips_dir/(key+".wav")
        if not target.exists() or target.stat().st_size<1000:
            wav=tts.synthesize(voice_input)
            wav=np.asarray(wav,dtype=np.float32).reshape(-1)
            if wav.size<100:
                raise RuntimeError(f"Empty audio for {text!r}")
            sf.write(target,wav,SAMPLE_RATE,subtype="PCM_16",format="WAV")
            generated+=1
        payload=target.read_bytes()
        frames=max(0,(len(payload)-44)//2)
        clips[text]={
            "file":"./audio/clips/"+target.name,
            "sha256":hashlib.sha256(payload).hexdigest(),
            "bytes":len(payload),
            "durationMs":round(frames/SAMPLE_RATE*1000),
        }
        if index%250==0 or index==len(texts):
            print(f"pronunciation {index}/{len(texts)} (generated {generated})",flush=True)
    write_manifests(args.output,clips,generated)
    print(f"Built {len(clips)} Korean pronunciation clips using {MODEL_ID}@{MODEL_REVISION}")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
