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
		model: 'gpt-3.5-turbo-16k-0613',
		stream: true,
		messages: messages.map((message: any) => ({
			content: `Olá, preciso de uma chamada de api em para criar um produto em uma api, onde preciso passar esse departamento: ${
				department.name
			} e esse productType: ${product.name} e esses atributos ${JSON.stringify(
				attributes
			)}.Nesse modelo a seguir, as informações não passadas previamente apenas preencha com "placeholder":
			{
  "sku": "string",
  "productGroup": "string",
  "department": "string",
  "productType": "string",
  "brand": "string",
  "name": "string",
  "description": "string",
  "color": "string",
  "flavor": "string",
  "gender": "Homem",
  "manufacturerCode": "string",
  "size": "string",
  "eanIsbn": "string",
  "height": 0,
  "width": 0,
  "depth": 0,
  "weight": 0,
  "video": "string",
  "images": [
    {
      "url": "string"
    }
  ],
  "attributes": [
    {
      "name": "string",
      "values": [
        "string"
      ]
    }
  ]
}

me dê um modelo dessa chamada

${message.content}
`,
			role: message.role
		}))
	});

	const stream = OpenAIStream(response);
	return new StreamingTextResponse(stream);
};
