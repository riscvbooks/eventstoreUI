export class WebStorage {
	public constructor(private readonly storage: Storage) {}

	public get(key: string): string | null {
		return this.storage.getItem(`es:${key}`);
	}

	public set(key: string, value: string): void {
		this.storage.setItem(`es:${key}`, value);
	}

	public remove(key: string): void {
		this.storage.removeItem(`es:${key}`);
	}

	public clear(): void {
		this.storage.clear();
	}
}
