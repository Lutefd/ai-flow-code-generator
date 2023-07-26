export interface Apps {
	id: number;
	clientId: string;
	name: string;
	status: string;
	description: string;
	secret: string;
	extraInfo: ExtraInfo;
	developer: string;
	creationDate: number;
	showAppGallery: boolean;
	apis: API[];
	accessTokens: any[];
	ownerType: string;
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
