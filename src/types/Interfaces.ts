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

export interface ExtraInfo {}
