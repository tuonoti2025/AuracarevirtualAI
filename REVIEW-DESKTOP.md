# AuraCare FI/EN review

Branch: feat/fi-en-desktop-review (main and gh-pages unchanged).

The original Finnish desktop and all FI video/audio remain unchanged. All three EN demos now each use a single continuous MP4 assembled from the user-provided clips in numeric order. EN hydration uses a continuous MP4 assembled from Timojuo1.mp4, Hilmajuo2.mp4 and Timmojuo3.mp4, in that order, with their embedded audio. There are no application captions in any mode.

## Continuous video repair

The previous player assigned a new src for each speaker turn while its poster remained configured. This caused a new media load at every turn and could expose the AuraCare poster. The new player loads one fast-start H.264/AAC MP4 for an entire conversation. The poster is removed during playback and shown only when idle.

Source video dimensions differ (portrait Timo and square Hilma), and some sources contain up to 1.9 seconds of image after their audio ends. Each source is normalized to a consistent portrait canvas, preserving aspect ratio with the existing light-green background. Segment duration is rounded up to the complete source audio endpoint plus at least 120 ms. All source audio is retained; only excess image-only tails are shortened. No shortest-stream truncation is used. AAC is encoded once across the concatenated audio, avoiding per-file playback resets. Original uploaded files are retained unchanged.

scripts/assemble-english-videos.py reproduces the assets with an explicit FFmpeg executable. public/media/en/timelines.json records the source filenames and exact segment boundaries. The synthetic speech generation script, recordings and separate Audio player have been removed entirely.

## Validation

- Production build and 18 React tests pass, including complete-video selection, own audio, Stop/language changes, errors/retry, no poster during playback and no captions in all six language/demo combinations.
- The last audible portion of the first two Live clips, first two medication clips and all three hydration clips was compared numerically with the concatenated audio. Tail waveform correlation was 0.966–1.000 (hydration: 0.994–1.000), confirming the supplied speech endings remain present. See speech-tail-validation.json.
- Seven focused browser checks passed against the updated local preview: all three complete English conversations played with one media load each, no poster during playback and no media errors; language cancellation, the original Finnish hydration video, the dashboard hydration test and mobile hydration playback/Stop were checked. See hydration-browser-results.json. Native browser audio output was muted during automated checks; stream decoding and playback were verified.
- Source stream timing analysis and output timelines are supplied in media-duration-analysis.json and continuous-video-timelines.json.
- Physical phone audio output has not been listened to. If a word is already missing in a source MP4, concatenation cannot reconstruct it; the user was asked to check the originals.
- Previous layout/language/settings tests passed across 320–1366 px. Original media copies were verified byte-for-byte.

No production publication, merge, or remote push is included.

## Hydration integration

Original hydration uploads are retained byte-for-byte under public/media/en/drink. Only the drink sequence was encoded; the approved Live and medication MP4 files were not re-encoded. The build script now supports arbitrary sequence lengths and --kind selection. EN hydration works from the main button and dashboard test; FI keeps the original Juomamuistutus.mp4. No captions or synthetic speech remain.
