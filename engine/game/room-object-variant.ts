import { makeVariant } from '~/engine/schema';
import * as Creep from './creep';
import * as Source from './source';
import * as StructureController from './structure/controller';
import * as StructureSpawn from './structure/spawn';

export const variantFormat = makeVariant(
	Creep.format,
	Source.format,
	StructureController.format,
	StructureSpawn.format,
);
