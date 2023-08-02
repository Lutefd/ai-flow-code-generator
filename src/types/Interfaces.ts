export interface Departments {
	code: string;
	name: string;
}

export interface API {
	id: number;
	name: string;
	version: string;
	description?: string;
	creationDate: number;
	plans: Plan[];
	appsCount: number;
}

export interface Plan {
	id: number;
	name: string;
	defaultPlan: boolean;
	description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtraInfo {}

export interface AttributesValues {
	values: Value[];
}

export interface Value {
	code: number;
	value: string;
}
export interface Message {
	role: string;
	content: string;
}
