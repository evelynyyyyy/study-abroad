# Keyboard click sample provenance (v3.7.11)

All three files are short, independently distributed CC0 1.0 sound effects. They are **not** Apple system audio and are not synthesized at keypress time. Copies below come from the CC0-cleared collection at https://github.com/Barty-Bart/motion-graphics/blob/main/skills/sound-effects/LICENSES.md (shortened/converted OGG assets); their original upstream links are recorded below. Attribution is voluntary.

- key-click.ogg: Kenney, Interface Sounds, interface-tick-001. License: CC0 1.0. Original: https://kenney.nl/assets/interface-sounds ; bundled copy: https://github.com/Barty-Bart/motion-graphics/blob/main/skills/sound-effects/sfx/click/kenney-interface-tick-001.ogg
- delete-click.ogg: malle99, “Click Tick.wav”, Freesound #384187. License: CC0 1.0. Original: https://freesound.org/people/malle99/sounds/384187/ ; bundled copy: https://github.com/Barty-Bart/motion-graphics/blob/main/skills/sound-effects/sfx/tick/fs384187.ogg
- modifier-click.ogg: Kenney, Interface Sounds, interface-select-001. License: CC0 1.0. Original: https://kenney.nl/assets/interface-sounds ; bundled copy: https://github.com/Barty-Bart/motion-graphics/blob/main/skills/sound-effects/sfx/click/kenney-interface-select-001.ogg

CC0 legal code: https://creativecommons.org/publicdomain/zero/1.0/

Playback uses fetch + decodeAudioData + AudioBufferSourceNode. On load or decode failure, the existing programmatically generated PCM click remains the fallback. Ogg Vorbis requires iOS Safari 18.4+ for reliable support; older versions use the PCM fallback.
