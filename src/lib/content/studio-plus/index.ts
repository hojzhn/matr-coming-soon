import madbutter from './madbutter.json';
import type { StudioPlusArtist } from '../types';

const artists: StudioPlusArtist[] = [madbutter satisfies StudioPlusArtist];

export const studioPlusArtists: Record<string, StudioPlusArtist> = Object.fromEntries(
	artists.map((artist) => [artist.username, artist])
);
