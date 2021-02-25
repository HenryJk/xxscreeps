import * as C from 'xxscreeps/game/constants';
import type { Shape } from 'xxscreeps/engine/schema/tower';
import { withOverlay } from 'xxscreeps/schema';
import { Structure } from '.';

export class StructureTower extends withOverlay<Shape>()(Structure) {
	get energy() { return this.store[C.RESOURCE_ENERGY] }
	get energyCapacity() { return this.store.getCapacity(C.RESOURCE_ENERGY) }
	get structureType() { return C.STRUCTURE_TOWER }
}