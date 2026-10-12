export interface ToastMessage {
	id: string;
	text: string;
}

export class ToastStore {
	messages = $state<ToastMessage[]>([]);

	show(text: string, duration = 3000): void {
		const id = crypto.randomUUID();
		this.messages.push({ id, text });
		setTimeout(() => this.dismiss(id), duration);
	}

	dismiss(id: string): void {
		this.messages = this.messages.filter((m) => m.id !== id);
	}
}

export const toast = new ToastStore();
