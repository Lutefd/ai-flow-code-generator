import type { Message } from 'ai';
import { writable } from 'svelte/store';

export const m2 = writable<any[]>([]);
export const qna = writable<any[]>([]);

export const invalidq1 = writable<boolean>(false);
