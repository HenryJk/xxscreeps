import type { EphemeralProvider } from '../provider';
import { create, connect, Responder, ResponderClient, ResponderHost } from './responder';

export abstract class LocalEphemeralProvider extends Responder implements EphemeralProvider {
	abstract sadd(key: string, values: string[]): Promise<number>;
	abstract spop(key: string): Promise<string | undefined>;
	abstract sflush(key: string): Promise<void>;

	static create(name: string) {
		return Promise.resolve(create(`ephemeral://${name}`, LocalEphemeralProviderHost));
	}

	static connect(name: string) {
		return connect(`ephemeral://${name}`, LocalEphemeralProviderClient, LocalEphemeralProviderHost);
	}

	request(method: 'sadd', payload: { key: string; values: string[] }): Promise<number>;
	request(method: 'spop', key: string): Promise<string | undefined>;
	request(method: 'sflush', key: string): Promise<void>;
	request(method: string, payload?: any) {
		if (method === 'sadd') {
			return this.sadd(payload.key, payload.values);
		} else if (method === 'get') {
			return this.spop(payload) as any;
		} else if (method === 'set') {
			return this.sflush(payload);
		} else {
			return Promise.reject(new Error(`Unknown method: ${method}`));
		}
	}
}

const LocalEphemeralProviderHost = ResponderHost(class LocalEphemeralProviderHost extends LocalEphemeralProvider {
	private readonly keys = new Map<string, Set<string>>();

	sadd(key: string, values: string[]) {
		const set = this.keys.get(key);
		if (set) {
			const { size } = set;
			values.forEach(value => set.add(value));
			return Promise.resolve(set.size - size);
		} else {
			this.keys.set(key, new Set(values));
			return Promise.resolve(values.length);
		}
	}

	spop(key: string) {
		const set = this.keys.get(key);
		if (set) {
			const { value } = set.values().next();
			if (set.size === 1) {
				this.keys.delete(key);
			} else {
				set.delete(value);
			}
			return Promise.resolve(value);
		} else {
			return Promise.resolve();
		}
	}

	sflush(key: string) {
		this.keys.delete(key);
		return Promise.resolve();
	}
});

const LocalEphemeralProviderClient = ResponderClient(class LocalEphemeralProviderClient extends LocalEphemeralProvider {
	sadd(key: string, values: string[]) {
		return this.request('sadd', { key, values });
	}

	spop(key: string) {
		return this.request('spop', key);
	}

	sflush(key: string) {
		return this.request('sflush', key);
	}
});
