# Korean pronunciation audio

The production site generates its Korean pronunciation clips during the verified GitHub Pages release build. The browser does **not** call a paid TTS API and no API key is shipped to clients.

## Primary generator

- Model: **Ppaso-TTS v1**, repository `akamotaco/ppaso-tts-v1`
- Pinned revision used by this site: `53d09664c4f636a5fb6f2ebe3ec22cd83ee249b9`
- Source: https://huggingface.co/akamotaco/ppaso-tts-v1
- License declared by the model repository: **Apache License 2.0**
- Runtime backend used for release generation: ONNX CPU
- Output: 22.05 kHz mono PCM WAV, one content-addressed file per Korean text

The model repository states that its ONNX model and repository are Apache-2.0 and documents these training/runtime attributions:

- Fun-CosyVoice 3.0 — Apache-2.0; used as the teacher for the Korean training corpus.
- MFA `korean_mfa.dict` — MIT.
- mecab-ko — BSD.
- Vocos architecture — MIT; the Ppaso vocoder is documented as trained from scratch.

This project does not redistribute the upstream model weights in the public website. It uses the model only in the release build to synthesize the Korean text already present in this project, then serves the generated WAV files as static same-origin GitHub Pages assets.

Apache-2.0 attribution and license obligations for the generator/model should be preserved with this file. This note is an attribution record, not legal advice.

## Runtime fallback

If a static clip is missing or cannot be played, the site may attempt the browser's Korean `speechSynthesis` voice as a best-effort fallback. That fallback is not the primary pronunciation source and the site no longer instructs users to install a Korean system voice.

## Slow playback

The slow button uses the same hosted WAV clip at a lower HTML audio `playbackRate` with pitch preservation where supported. It does not generate a second voice or send text to another service.
