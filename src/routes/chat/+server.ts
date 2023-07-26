import type { RequestHandler } from './$types';
import { Configuration, OpenAIApi } from 'openai-edge';
import { OPENAI_KEY } from '$env/static/private';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const config = new Configuration({
	apiKey: OPENAI_KEY
});

const openai = new OpenAIApi(config);

export const POST: RequestHandler = async ({ request }) => {
	const { messages, department } = await request.json();
	console.log(department);
	const response = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo-16k',
		stream: true,
		messages: messages.map((message: any) => ({
			content: `Olá, preciso de uma chamada de api em javascript para criar um access-token, onde preciso passar esse app ${department} com esse Owner: sensedia@teste.com.br e status "ACTIVE" esse é o swagger {  
    "app": {
    "clientId": "7bc8f669-6fe5-4a38-9b04-1afa7b4991e1",
    "id": 2258,
    "name": "App Teste 16 - 12 - 22",
    "status": "APPROVED"
  },
  "owner": "OwnerTeste",
  "status": "ACTIVE"
}
`,
			role: message.role
		}))
	});

	const stream = OpenAIStream(response);
	return new StreamingTextResponse(stream);
};
