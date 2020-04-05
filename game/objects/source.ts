import type { shape } from '~/engine/schema/source';
import { withOverlay } from '~/lib/schema';
import { RoomObject } from './room-object';

export class Source extends withOverlay<typeof shape>()(RoomObject) {
	get ticksToRegeneration() {
		return this._nextRegenerationTime === 0 ? undefined : this._nextRegenerationTime - Game.time;
	}
}
