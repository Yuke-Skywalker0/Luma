import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export type OfflineTrack = {
  id: string; title: string; artist: string; album?: string; artwork?: string;
  localUri: string; savedAt: number; provider?: string; providerId?: string;
};
const KEY = 'luma:offline-tracks:v1';
const safeName = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);

export async function listOfflineTracks(): Promise<OfflineTrack[]> {
  const { value } = await Preferences.get({ key: KEY });
  try { return value ? JSON.parse(value) as OfflineTrack[] : []; } catch { return []; }
}

/** Download only when the provider explicitly marks the track downloadable. */
export async function saveTrackOffline(track: {id:string;title:string;artist:string;album?:string;artwork?:string;provider?:string;providerId?:string;downloadable?:boolean}, downloadUrl?: string): Promise<OfflineTrack> {
  if (!Capacitor.isNativePlatform()) throw new Error('Il download offline completo richiede l’app nativa.');
  if (!track.downloadable) throw new Error('Questa sorgente non autorizza il download offline.');
  if (!downloadUrl || !/^https:\/\//i.test(downloadUrl)) throw new Error('La sorgente non ha fornito un URL di download autorizzato.');
  const path = `luma-offline/${safeName(track.id)}.audio`;
  const result = await Filesystem.downloadFile({ url: downloadUrl, path, directory: Directory.Data, recursive: true });
  if (!result.path && !result.uri) throw new Error('Download incompleto.');
  const localUri = result.uri || result.path!;
  const saved: OfflineTrack = { id:track.id,title:track.title,artist:track.artist,album:track.album,artwork:track.artwork,provider:track.provider,providerId:track.providerId,localUri,savedAt:Date.now() };
  const all = (await listOfflineTracks()).filter(x=>x.id!==track.id); all.unshift(saved);
  await Preferences.set({ key: KEY, value: JSON.stringify(all) });
  return saved;
}

export async function removeOfflineTrack(id: string): Promise<void> {
  const all = await listOfflineTracks(); const track = all.find(x=>x.id===id);
  if (track) { try { await Filesystem.deleteFile({ path: track.localUri }); } catch { /* old versions may store a file URI */ } }
  await Preferences.set({ key: KEY, value: JSON.stringify(all.filter(x=>x.id!==id)) });
}


/** Storage summary for the offline screen. Browser storage estimates are advisory; native file sizes are platform-managed. */
export async function getOfflineSummary(): Promise<{count:number;bytes:number;tracks:OfflineTrack[]}> {
  const tracks = await listOfflineTracks();
  let bytes = 0;
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try { const estimate = await navigator.storage.estimate(); bytes = estimate.usage || 0; } catch { /* unavailable on native WebView */ }
  }
  return { count: tracks.length, bytes, tracks };
}

export function canUseOfflineDownloads(): boolean { return Capacitor.isNativePlatform(); }
