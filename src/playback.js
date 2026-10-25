import { useCallback, useEffect, useRef, useState } from 'react';
const BASE = process.env.PUBLIC_URL || '';
const videos = { live: 'Auracaredemo.mp4', meds: 'Laakemuistutus.mp4', drink: 'Juomamuistutus.mp4' };
export const englishVideoFiles = { live: 'en/live-conversation.mp4', meds: 'en/medication-reminder.mp4', drink: 'en/hydration-reminder.mp4' };

export function useDemoPlayback(videoRef, language) {
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState('Valmis');
  const [error, setError] = useState('');
  const active = useRef(null);
  const clear = useCallback(() => {
    active.current = null;
    const video = videoRef.current;
    if (video) { video.pause(); video.loop = false; video.removeAttribute('src'); video.load(); }
  }, [videoRef]);
  const stop = useCallback((status = 'Valmis') => {
    clear(); setPlaying(false); setLabel(status); setError('');
  }, [clear]);
  useEffect(() => { stop(); }, [language, stop]);
  useEffect(() => () => clear(), [clear]);
  function fail(message) {
    clear(); setPlaying(false); setLabel('Valmis'); setError(message);
  }
  function start(kind) {
    stop();
    const video = videoRef.current;
    if (!video || !videos[kind]) return;
    const run = { language, kind };
    active.current = run;
    setPlaying(true);
    setLabel(kind === 'live' ? 'Live-puhelu' : kind === 'meds' ? 'Lääkemuistutus' : 'Juomamuistutus');
    video.muted = false;
    video.loop = false;
    video.removeAttribute('poster');
    video.src = `${BASE}/media/${language === 'en' ? englishVideoFiles[kind] : videos[kind]}`;
    video.play().catch(() => {
      if (active.current === run) fail('Videon toisto epäonnistui. Yritä uudelleen.');
    });
  }
  function onVideoEnded() {
    if (active.current) stop();
  }
  function onVideoError() {
    if (active.current) fail('Videon toisto epäonnistui. Yritä uudelleen.');
  }
  return { playing, label, error, start, stop, onVideoEnded, onVideoError };
}
