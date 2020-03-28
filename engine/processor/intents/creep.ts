import * as C from '~/game/constants';
import * as Creep from '~/game/objects/creep';
import type { ConstructionSite } from '~/game/objects/construction-site';
import type { StructureController } from '~/game/objects/structures/controller';
import { getPositonInDirection, Direction, RoomPosition } from '~/game/position';
import { bindProcessor } from '~/engine/processor/bind';
import type { ResourceType, RoomObjectWithStore } from '~/game/store';
import { instantiate } from '~/lib/utility';
import * as ConstructionSiteIntent from './construction-site';
import * as StructureControllerIntent from './controller';
import { newRoomObject } from './room-object';
import * as StoreIntent from './store';

type Parameters = {
	build: { target: string };
	harvest: { target: string };
	move: { direction: Direction };
	transfer: {
		amount?: number;
		resourceType: ResourceType;
		target: string;
	};
	upgradeController: { target: string };
};

export type Intents = {
	receiver: Creep.Creep;
	parameters: Parameters;
};

export function create(body: C.BodyPart[], pos: RoomPosition, name: string, owner: string) {
	const carryCapacity = body.reduce((energy, type) =>
		(type === C.CARRY ? energy + C.CARRY_CAPACITY : energy), 0);
	return instantiate(Creep.Creep, {
		...newRoomObject(pos),
		body: body.map(type => ({ type, hits: 100, boost: undefined })),
		fatigue: 0,
		hits: body.length,
		name,
		store: StoreIntent.create(carryCapacity),
		[Creep.AgeTime]: 0,
		[Creep.Owner]: owner,
	});
}

export default () => bindProcessor(Creep.Creep, {
	process(intent: Partial<Parameters>) {
		if (intent.build) {
			const { target: id } = intent.build;
			const target = Game.getObjectById(id) as ConstructionSite | undefined;
			if (Creep.checkBuild(this, target) === C.OK) {
				StoreIntent.subtract(this.store, 'energy', 2);
				ConstructionSiteIntent.build(target!, 2);
			}

		} else if (intent.harvest) {
			StoreIntent.add(this.store, 'energy', 25);
			return true;
		}
		if (intent.move) {
			const { direction } = intent.move;
			if (Creep.checkMove(this, direction) === C.OK) {
				this.pos = getPositonInDirection(this.pos, direction);
				return true;
			}
		}
		if (intent.transfer) {
			const { amount, resourceType, target: id } = intent.transfer;
			const target = Game.getObjectById(id) as RoomObjectWithStore | undefined;
			if (Creep.checkTransfer(this, target, resourceType, amount) === C.OK) {
				const transferAmount = Math.min(this.store[resourceType]!, target!.store.getFreeCapacity(resourceType));
				StoreIntent.subtract(this.store, resourceType, transferAmount);
				StoreIntent.add(target!.store, resourceType, transferAmount);
				return true;
			}
		}
		if (intent.upgradeController) {
			const target = Game.getObjectById(intent.upgradeController.target) as StructureController;
			if (Creep.checkUpgradeController(this, target) === C.OK) {
				StoreIntent.subtract(this.store, 'energy', 2);
				StructureControllerIntent.upgrade(target, 2);
				return true;
			}
		}
		return false;
	},
});
