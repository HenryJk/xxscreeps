import { declare, enumerated, inherit, variant } from '~/lib/schema';
import * as Id from '~/engine/util/schema/id';
import * as C from '~/game/constants';
import { ConstructionSite } from '~/game/objects/construction-site';
import * as RoomObject from './room-object';

export const shape = declare('ConstructionSite', {
	...inherit(RoomObject.format),
	...variant('constructionSite'),
	progress: 'int32',
	structureType: enumerated(...Object.keys(C.CONSTRUCTION_COST) as (keyof typeof C.CONSTRUCTION_COST)[]),
	_name: 'string',
	_owner: Id.format,
});

export const format = declare(shape, { overlay: ConstructionSite });
