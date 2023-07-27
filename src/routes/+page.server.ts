import { SENSEDIA_AUTH, CLIENT_ID, ACCESS_TOKEN } from '$env/static/private';
import { fail } from '@sveltejs/kit';

export const actions = {
	validateq1: async ({ request }) => {
		const data = await request.formData();
		if (SENSEDIA_AUTH == undefined) return { body: { message: 'SENSEDIA_AUTH não definido' } };

		const dataFromManager = await fetch(
			'http://api-sandbox.netshoes.com.br/api/v1/bus/NS/departments',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					client_id: CLIENT_ID,
					access_token: ACCESS_TOKEN
				}
			}
		).then(async (res) => {
			const reader = res.body?.getReader();
			if (!reader) return '';
			const chunks: string[] = [];
			async function readStream(): Promise<string> {
				if (!reader) return '';
				const { done, value } = await reader.read();
				if (done) {
					return chunks.join('');
				}

				chunks.push(new TextDecoder().decode(value));
				return await readStream();
			}
			return await readStream();
		});

		const parsedData = JSON.parse(dataFromManager);

		const match = parsedData.items.find((element: { name: string }) => {
			if (element.name.toLowerCase() == data.get('a1')?.toString().toLocaleLowerCase()) {
				return true;
			}
		});

		if (match) {
			return { message: 'Resposta correta', app: match };
		} else {
			return fail(404, { message: 'Resposta incorreta', apps: parsedData.items });
		}
	},
	validateq2: async ({ request }) => {
		const data = await request.formData();
		const dataFromManager = await fetch(
			`http://api-sandbox.netshoes.com.br/api/v1/department/${data.get('department')}/productType`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					client_id: CLIENT_ID,
					access_token: ACCESS_TOKEN
				}
			}
		).then(async (res) => {
			const reader = res.body?.getReader();
			if (!reader) return '';
			const chunks: string[] = [];
			async function readStream(): Promise<string> {
				if (!reader) return '';
				const { done, value } = await reader.read();
				if (done) {
					return chunks.join('');
				}

				chunks.push(new TextDecoder().decode(value));
				return await readStream();
			}
			return await readStream();
		});
		const parsedData = JSON.parse(dataFromManager);

		const match = parsedData.items.find((element: { name: string }) => {
			if (element.name.toLowerCase() == data.get('a2')?.toString().toLocaleLowerCase()) {
				return true;
			}
		});

		if (match) {
			return { message: 'Resposta correta', app: match };
		} else {
			return fail(404, { message: 'Resposta incorreta', productTypes: parsedData.items });
		}
	},
	validateq3: async ({ request }) => {
		const data = await request.formData();
		const dataFromManager = await fetch(
			`http://api-sandbox.netshoes.com.br/api/v1/department/${data.get(
				'department'
			)}/productType/${data.get('product')}/templates`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					client_id: CLIENT_ID,
					access_token: ACCESS_TOKEN
				}
			}
		).then(async (res) => {
			const reader = res.body?.getReader();
			if (!reader) return '';
			const chunks: string[] = [];
			async function readStream(): Promise<string> {
				if (!reader) return '';
				const { done, value } = await reader.read();
				if (done) {
					return chunks.join('');
				}

				chunks.push(new TextDecoder().decode(value));
				return await readStream();
			}
			return await readStream();
		});
		const parsedData = JSON.parse(dataFromManager);
		const itemNames = data.get('a2')?.toString().toLocaleLowerCase().split(', ');

		const matches = parsedData.items.filter((element: { name: string }) => {
			if (itemNames == undefined)
				return fail(404, { message: 'Resposta incorreta', productAttributes: parsedData.items });
			return itemNames.includes(element.name.toLowerCase());
		});
		const transformedMatches = matches.map(
			(element: { code: number; name: string; typeSelection: string; required: boolean }) => {
				return {
					value: element.code,
					label: element.name,
					typeSelection: element.typeSelection,
					required: element.required
				};
			}
		);
		const transformedParsedData = parsedData.items.map(
			(element: { code: number; name: string; typeSelection: string; required: boolean }) => {
				return {
					value: element.code,
					label: element.name,
					typeSelection: element.typeSelection,
					required: element.required
				};
			}
		);
		if (matches.length > 0) {
			return { message: 'Resposta correta', app: transformedMatches };
		} else {
			return fail(404, { message: 'Resposta incorreta', productAttributes: transformedParsedData });
		}
	}
};
