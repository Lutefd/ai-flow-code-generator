import type { RequestHandler } from './$types';
import { Configuration, OpenAIApi } from 'openai-edge';
import { OPENAI_KEY } from '$env/static/private';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const config = new Configuration({
	apiKey: OPENAI_KEY
});

const openai = new OpenAIApi(config);

export const POST: RequestHandler = async ({ request }) => {
	const { messages, department, product, attributes } = await request.json();
	const response = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo-16k',
		stream: true,
		messages: messages.map((message: any) => ({
			content: `Baseado nos seguintes parametros department:${department.name},productType:${
				product.name
			}, attributes:${JSON.stringify(attributes)} e em nosso histórico de chat,  ${
				message.content
			}`,
			role: message.role
		}))
	});

	const stream = OpenAIStream(response);
	return new StreamingTextResponse(stream);
};
