import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { englishVideoFiles } from './playback';
beforeEach(() => {
  localStorage.clear();
  let language = 'fi';
  window.AuraCareLanguage = { get: () => language, set: value => { language = value; document.documentElement.lang = value; window.dispatchEvent(new Event('auracare-language')); } };
  window.Audio = jest.fn();
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
const switchEnglish = () => fireEvent.click(screen.getByRole('button', { name: 'English' }));
async function start(name) { await act(async () => fireEvent.click(screen.getByRole('button', { name, exact: true }))); }
test('restores three panels and translates the dashboard, settings and dynamic summary', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Miksi AuraCare?' })).toBeInTheDocument();
  switchEnglish();
  expect(screen.getByRole('heading', { name: 'Why AuraCare?' })).toBeInTheDocument();
  fireEvent.click(screen.getByText('Open control panel ›'));
  const dialog = screen.getByRole('dialog', { name: 'Control panel' });
  fireEvent.change(within(dialog).getByLabelText('Morning'), { target: { value: '09:30' } });
  fireEvent.change(within(dialog).getByPlaceholderText('New name…'), { target: { value: 'Mary' } });
  fireEvent.click(within(dialog).getByText('Add', { exact: true }));
  fireEvent.click(within(dialog).getByText('Save', { exact: true }));
  expect(JSON.parse(localStorage.getItem('auracare.settings')).contacts).toContain('Mary');
  expect(screen.getByText(/Medication: 09:30 and 20:00/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Suomi' }));
  expect(screen.getByText(/Lääkkeet: 09:30 ja 20:00/)).toBeInTheDocument();
});
test('Finnish video keeps original audio and returns to ready when it ends', async () => {
  const { container } = render(<App />);
  await start('Lääkemuistutus');
  const video = container.querySelector('video');
  expect(video.muted).toBe(false);
  expect(video.src).toMatch(/Laakemuistutus.mp4$/);
  expect(window.Audio).not.toHaveBeenCalled();
  fireEvent.ended(video);
  expect(screen.getByRole('status')).toHaveTextContent('Valmis');
});
test('video rejection reports an error and unlocks retry', async () => {
  HTMLMediaElement.prototype.play.mockRejectedValueOnce(new Error('blocked'));
  render(<App />); switchEnglish(); await start('Hydration reminder');
  expect(screen.getByRole('alert')).toHaveTextContent('The video could not be played');
  expect(screen.getByRole('button', { name: 'Hydration reminder', exact: true })).toBeEnabled();
});
test.each([['live', 'Live'], ['meds', 'Medication reminder'], ['drink', 'Hydration reminder']])('English %s uses one continuous video with own sound and no loading poster', async (kind, name) => {
  const { container } = render(<App />); switchEnglish(); await start(name);
  const video = container.querySelector('video');
  expect(video.src).toMatch('/media/' + englishVideoFiles[kind]);
  expect(video.muted).toBe(false);
  expect(video.loop).toBe(false);
  expect(video.hasAttribute('poster')).toBe(false);
  expect(window.Audio).not.toHaveBeenCalled();
  fireEvent.ended(video);
  expect(screen.getByRole('status')).toHaveTextContent('Ready');
  expect(video.hasAttribute('src')).toBe(false);
  expect(video.poster).toMatch('/logo.png');
});
test.each(['Live', 'Medication reminder', 'Hydration reminder'])('Stop and language switch halt uploaded English %s video sequence', async name => {
  const { container } = render(<App />); switchEnglish(); await start(name);
  const video = container.querySelector('video');
  fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
  fireEvent.ended(video);
  expect(video.hasAttribute('src')).toBe(false);
  await start(name);
  fireEvent.click(screen.getByRole('button', { name: 'Suomi' }));
  fireEvent.ended(video);
  expect(video.hasAttribute('src')).toBe(false);
  expect(screen.getByRole('status')).toHaveTextContent('Valmis');
});

test.each(['Live', 'Medication reminder', 'Hydration reminder'])('a failed %s video stops playback and allows retry', async name => {
  const { container } = render(<App />); switchEnglish(); await start(name);
  const video = container.querySelector('video');
  fireEvent.error(video);
  expect(screen.getByRole('alert')).toHaveTextContent('The video could not be played');
  expect(video.hasAttribute('src')).toBe(false);
  expect(screen.getByRole('button', { name, exact: true })).toBeEnabled();
});

test.each([['fi', 'Live'], ['fi', 'Lääkemuistutus'], ['fi', 'Juomamuistutus'], ['en', 'Live'], ['en', 'Medication reminder'], ['en', 'Hydration reminder']])('no captions are rendered during %s %s playback', async (language, name) => {
  const { container } = render(<App />);
  if (language === 'en') switchEnglish();
  await start(name);
  expect(container.querySelector('.speech-caption')).toBeNull();
  expect(container.querySelector('track')).toBeNull();
  expect(container.textContent).not.toMatch(/Hello Hilma|Thank you, Timo/);
});
