import type { RequestHandler } from './$types';
import type { Message } from '../../types/Interfaces';
import { Configuration, OpenAIApi } from 'openai-edge';
import { OPENAI_KEY } from '$env/static/private';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const config = new Configuration({
	apiKey: OPENAI_KEY
});

const openai = new OpenAIApi(config);

export const POST: RequestHandler = async ({ request }) => {
	const { messages, department, product, attributes } = await request.json();
	console.log(attributes);
	if (attributes.length < 6) {
		for (const attribute of attributes) {
			if (attribute.values && JSON.parse(attribute.values).length > 8) {
				attribute.values = JSON.stringify(JSON.parse(attribute.values).slice(0, 5));
			}
		}
	} else {
		for (const attribute of attributes) {
			if (attribute.values && JSON.parse(attribute.values).length > 8) {
				attribute.values = JSON.stringify(JSON.parse(attribute.values).slice(0, 3));
			}
		}
	}
	console.log('attributes2', attributes);
	const response = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo-16k-0613',
		stream: true,
		messages: messages.map((message: Message) => ({
			content: `Olá, preciso de uma chamada de api em para criar um produto, esse é o endpoint: "https://api-sandbox.netshoes.com.br/api/v2/products/", onde preciso passar esse departamento: ${
				department.name
			} e esse productType: ${product.name} e esses atributos ${JSON.stringify(
				attributes
			)}.Nesse modelo a seguir, as informações não passadas previamente apenas preencha com "placeholder", caso os attributes possuam values com "code e values" apenas preencha com os objetos que possuem "code e values" e caso não possuam apenas preencha com "placeholder":
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
	console.log(response);
	const stream = OpenAIStream(response);
	return new StreamingTextResponse(stream);
};
