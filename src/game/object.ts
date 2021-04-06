import type { InspectOptionsStylized } from 'util';
import type { Room } from './room';
import type { LookConstants } from './room/look';
import * as Id from 'xxscreeps/engine/schema/id';
import * as BufferObject from 'xxscreeps/schema/buffer-object';
import * as RoomPosition from 'xxscreeps/game/position';
import { compose, declare, optional, struct, vector, withOverlay, XSymbol } from 'xxscreeps/schema';
import { expandGetters } from 'xxscreeps/engine/util/inspect';
import { IntentIdentifier } from 'xxscreeps/processor/symbols';
import { assign } from 'xxscreeps/utility/utility';
import { Game, registerGlobal } from '.';

export const AddToMyGame = XSymbol('addToMyGame');
export const AfterInsert = XSymbol('afterInsert');
export const AfterRemove = XSymbol('afterRemove');
export const LookType = XSymbol('lookType');
export const NextPosition = XSymbol('nextPosition');
export const Owner = XSymbol('owner');
export const PathCost = XSymbol('pathCost');

export const format = () => compose(shape, RoomObject);
const shape = declare('RoomObject', struct({
	id: Id.format,
	pos: RoomPosition.format,
	effects: optional(vector(struct({
		effect: 'uint16',
		expireTime: 'uint32',
		level: 'uint16',
	}))),
}));

export type RoomObjectWithOwner = { [Owner]: string } & RoomObject;

export abstract class RoomObject extends withOverlay(BufferObject.BufferObject, shape) {
	abstract get [LookType](): LookConstants;
	room!: Room;
	[NextPosition]?: RoomPosition.RoomPosition | null;

	[AddToMyGame](_game: Game) {}
	[AfterInsert](room: Room) {
		this.room = room;
	}
	[AfterRemove](_room: Room) {
		this.room = undefined as never;
	}

	[Symbol.for('nodejs.util.inspect.custom')](depth: number, options: InspectOptionsStylized) {
		if (BufferObject.check(this)) {
			return expandGetters(this);
		} else {
			return `${options.stylize(`[${this.constructor.name}]`, 'special')}${options.stylize('{released}', 'null')}`;
		}
	}

	get [IntentIdentifier]() {
		return { group: this.room.name, name: this.id };
	}

	get [PathCost](): undefined | number {
		return undefined;
	}
}

export function create<Type extends RoomObject>(instance: Type, pos: RoomPosition.RoomPosition): Type {
	return assign<Type, RoomObject>(instance, {
		id: Id.generateId(),
		pos,
	});
}

// Export `RoomObject` to runtime globals
registerGlobal(RoomObject);
declare module 'xxscreeps/game/runtime' {
	interface Global {
		RoomObject: typeof RoomObject;
	}
}