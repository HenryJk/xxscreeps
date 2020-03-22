import * as Structure from '.';
import * as C from '~/engine/game/constants';
import { gameTime } from '~/engine/runtime';
import { checkCast, withType, Format, Inherit, Interceptor, Variant } from '~/engine/schema';

const DowngradeTime = Symbol('downgradeTime');
const Progress = Symbol('progress');
const UpgradeBlockedTime = Symbol('upgradeBlockedTime');

export const format = withType<StructureController>(checkCast<Format>()({
	[Inherit]: Structure.format,
	[Variant]: 'controller',

	downgradeTime: 'int32',
	isPowerEnabledboolean: 'int8',
	level: 'int32',
	progress: 'int32',
	// reservation: { username, ticksToEnd }
	safeMode: 'int32',
	safeModeAvailable: 'int32',
	safeModeCooldown: 'int32',
	// sign: { username, text, time, datetime }
	upgradeBlockedTime: 'int32',
}));

export class StructureController extends Structure.Structure {
	[DowngradeTime]: number;
	[Progress]!: number;
	[UpgradeBlockedTime]!: number;
	isPowerEnabledboolean!: number;
	level!: number;
	safeMode!: number;
	safeModeAvailable!: number;
	safeModeCooldown!: number;

	get [Variant]() { return 'controller' }
	get progress() { return this.level > 0 ? this[Progress] : undefined }
	get progressTotal() { return this.level > 0 && this.level < 8 ? C.CONTROLLER_LEVELS[this.level] : undefined }
	get structureType() { return C.STRUCTURE_CONTROLLER }
	get ticksToDowngrade() { return this[DowngradeTime] === 0 ? undefined : this[DowngradeTime] - gameTime }
	get upgradeBlocked() {
		if (this[UpgradeBlockedTime] === 0 || this[UpgradeBlockedTime] > gameTime) {
			return undefined;
		} else {
			return gameTime - this[UpgradeBlockedTime];
		}
	}
}

export const interceptors = checkCast<Interceptor>()({
	overlay: StructureController,
	members: {
		downgradeTime: { symbol: DowngradeTime },
		progress: { symbol: Progress },
		upgradeBlockedTime: { symbol: UpgradeBlockedTime },
	},
});
