import type * as Storage from 'xxscreeps/storage';
import * as Id from 'xxscreeps/engine/schema/id';
import { getOrSet } from 'xxscreeps/utility/utility';
import { declare, makeReader, makeWriter, struct, vector, TypeOf } from 'xxscreeps/schema';

export function flattenUsername(username: string) {
	return username.replace(/[-_]/g, '').toLowerCase();
}

const format = declare('Entries', vector(struct({
	key: 'string',
	user: Id.format,
})));

type Shape = TypeOf<typeof format>;
const read = makeReader(format);
export const write = makeWriter(format);

export class Authentication {
	private readonly providerToUser = new Map<string, string>();
	private readonly userToProvider = new Map<string, string[]>();

	constructor(
		private readonly storage: Storage.Provider,
		private readonly data: Shape,
	) {
		// Index provider entries
		for (const entry of data) {
			this.providerToUser.set(entry.key, entry.user);
			getOrSet(this.userToProvider, entry.user, () => []).push(entry.key);
		}
	}

	static async connect(storage: Storage.Provider) {
		return new Authentication(storage, read(await storage.persistence.get('auth')));
	}

	associateUser(providerKey: string, userId: string) {
		if (this.providerToUser.has(providerKey)) {
			throw new Error('Existing provider key already exists');
		}
		this.providerToUser.set(providerKey, userId);
		getOrSet(this.userToProvider, userId, () => []).push(providerKey);
		this.data.push({ key: providerKey, user: userId });
	}

	getProvidersForUser(userId: string) {
		return this.userToProvider.get(userId)!;
	}

	lookupUserByProvider(providerKey: string) {
		return this.providerToUser.get(providerKey);
	}

	usernameToProviderKey(username: string) {
		return `username:${flattenUsername(username)}`;
	}

	save() {
		return this.storage.persistence.set('auth', write(this.data));
	}
}
