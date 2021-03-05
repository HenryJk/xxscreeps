import type { WithType } from 'xxscreeps/schema/format';
import type { UnwrapArray, WithKey } from 'xxscreeps/util/types';
import { resolve } from 'xxscreeps/schema/layout';
import { getOrSet } from 'xxscreeps/util/utility';

const schemaByPath = new Map<string, any[]>();

// Resolve mod formats from `declare module` interfaces
type AllFormatsByPath = UnwrapArray<Schema[keyof Schema]>;
type FormatForPath<Path extends string> = WithKey<Path> extends AllFormatsByPath ?
	Extract<AllFormatsByPath, WithKey<Path>>[Path] : unknown;
export interface Schema {}

// Returns augmented formats as plain object that can be spread into a `struct({ ... })` declaration
type ExtractStructSchema<Format> = Format extends WithType<infer Type> ? {
	[Key in keyof Type]: WithType<Type[Key]>;
} : {};
export function structForPath<Path extends string>(path: Path): ExtractStructSchema<FormatForPath<Path>> {
	const schema = {} as any;
	const formats = schemaByPath.get(path) ?? [];
	for (const format of formats) {
		const resolvedFormat = resolve(format);
		for (const [ key, member ] of Object.entries(resolvedFormat)) {
			schema[key] = member;
		}
	}
	return schema;
}

// Returns augmented formats as array that can be spread into variant declarations
type ExtractVariantSchema<Format> = Format extends {} ? Format : never;
export function variantForPath<Path extends string>(path: Path): ExtractVariantSchema<FormatForPath<Path>>[] {
	return schemaByPath.get(path) as never;
}

// Register a schema format for a given "path"
type UnwrapLateBind<Format> = Format extends () => infer Type ? Type : Format;
export function registerSchema<Path extends string, Type>(path: Path, format: Type):
{ [key in Path]: UnwrapLateBind<Type> } {
	getOrSet(schemaByPath, path, () => []).push(format);
	return undefined as never;
}
