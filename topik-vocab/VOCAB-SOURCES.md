# Vocabulary source audit and licensing (2026-11-19)

## Baseline before expansion
Actual unique Korean surface forms used by the application: **4,411** (built-in 90? + 603 supplemental records + 4,445 Yonsei records, deduplicated by Hangul surface form). The Yonsei and supplemental files alone have 5,048 rows, 4,375 distinct forms, 673 repeated forms, and 284 forms with multiple distinct Chinese translations. The latter are **not** automatically separate dictionary senses. The app currently collapses homographs into one card; migration to sense-aware cards is still outstanding.

After adding 160 sourced Chinese-translated forms, the deployed vocabulary contains **4,571 distinct Korean surface forms**. Counts by the app's first-match teaching group: level 1 **988**, level 2 **914**, level 3 **732**, level 4 **568**, level 5 **833**, level 6 **536**. These are not official TOPIK levels. The 160 new forms are provisionally assigned to levels 1 (36), 2 (47), and 3 (77). All 160 have nonempty Chinese text, but many definitions still need manual checking. The original 4,411 surface forms remain unchanged. User progress keys continue to be the Korean surface form in localStorage `topik_lab_v2`; no automatic destructive migration.

## Reviewed sources

1. [Julien Shim combined Korean vocabulary](https://github.com/julienshim/combined_korean_vocabulary_list) — MIT code/repository license, 7,497 TSV rows; columns `rank, word, part_of_speech, hanja, explanation, nikl_level, topik_level`. Rank is from NIKL and is **not** a guaranteed corpus probability or TOPIK examination list. Homograph disambiguation suffixes and POS must be preserved as source metadata. Source includes NIKL 2003 and TOPIK 2015 data; downstream reuse of those underlying sources may have additional restrictions. Used here for word-order ranking and supplementary POS metadata only; attribution preserved.
2. [basickorean-vocab](https://github.com/basickorean/basickorean-vocab) — **CC BY-SA 2.0 KR**, derived from the Korean Basic Dictionary (국립국어원 한국어기초사전); JSON shards `core/<initial>.json`, `tr/zh/<initial>.json`. Contains POS, pronunciations, definitions, example Korean sentences and Chinese translation shards. Chinese definitions are not always suitable as direct typing answers; entries are imported only when matching a ranked Hangul lemma with nonempty Chinese. **New translated data in verified-expansion.js is adapted under CC BY-SA 2.0 KR**, credit: 국립국어원 and basickorean-vocab contributors, license https://creativecommons.org/licenses/by-sa/2.0/kr/ .
3. [Open Yonsei Korean Vocabulary](https://github.com/sugalhjk-tech/yonsei-korean-vocabulary) — CC BY-SA 3.0 for the dataset; existing six-volume dataset with 4,445 rows; third-party terms documented in DATA-LICENSE.md. Its volume index is textbook progression, not official TOPIK 1–6 level.
4. [Korean Vocab Builder](https://github.com/liy-che/korean-vocab-builder) — MIT software; workflow calls krdict API for Korean word/POS/pronunciation/example/audio. API credentials and individual dictionary data terms must be checked before bulk automated enrichment. No API calls or paid services enabled.

## Import strategy and limitations

- The current increment is **160 newly translated surface forms**, matched between the ranked TSV and 10 Chinese translation shards; sourced metadata is retained separately in `data/verified-expansion.js`.
- Imported educational levels 1–3 are **provisional heuristics from rank** (<=600, <=1500, <=2500) and are not official TOPIK levels.
- The ranking metadata is used to prioritize **new words only**. Due reviews retain their existing SM-2 per-direction schedule.
- Existing translations are not silently replaced; multi-sense and multi-POS terms need a dedicated sense-aware model and editorial review before the website can truthfully claim sense-level deduplication.
- The original rows do not universally include example sentences, POS, IPA or recordings. Korean speech remains device-dependent TTS; no missing audio has been invented.
- Source translation quality, inflected variants, and iPhone performance need manual QA. Do not claim full linguistic verification.
- Static word data does not affect browser-local learning history, but user-created custom words with identical spelling may still share progress with built-in words.
