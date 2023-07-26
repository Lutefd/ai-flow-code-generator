import { SENSEDIA_AUTH } from '$env/static/private';
import { fail } from '@sveltejs/kit';

export const actions = {
	validateq1: async ({ cookies, request }) => {
		const data = await request.formData();
		console.log(data.get('a1'));
		if (SENSEDIA_AUTH == undefined) return { body: { message: 'SENSEDIA_AUTH não definido' } };
		const dataFromManager = await fetch(
			'https://manager-treinamento.sensedia.com/api-manager/api/v3/apps/',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Sensedia-Auth': SENSEDIA_AUTH
				}
			}
		).then((res) => res.json());
		const match = dataFromManager.find((element: { name: string }) => {
			if (element.name.toLowerCase() == data.get('a1')?.toString().toLocaleLowerCase()) {
				return true;
			}
		});

		if (match) {
			return { message: 'Resposta correta', app: match };
		} else {
			return fail(401, { message: 'Resposta incorreta', apps: dataFromManager });
		}
	},
	validateq2: async ({ cookies, request }) => {
		const data = await request.formData();
		console.log(data.get('a2'));
		return { message: 'Resposta correta' };
	},
	delete: async ({ cookies, request }) => {
		const data = await request.formData();
	}
};
