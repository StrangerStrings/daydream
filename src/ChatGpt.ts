import { Configuration, OpenAIApi } from "openai";

export type PoemData = {
	poem: string[];
	randomLine: string;
	summary: string;
}

export class ChatGpt {
	_openai: OpenAIApi;
	_linesPerPoem: number = 8;

	constructor(key: string	) {
			const configuration = new Configuration({
					apiKey: key,
			});
			this._openai = new OpenAIApi(configuration);
	}

	/** Send message to chatgpt and return it's response */
  async chat(chat: string): Promise<string> {
    const response = await this._openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{role: "user", content: chat}],
		});
		return response.data.choices[0].message.content;
	} 


	async getSeedAndCreatePoemAndWords(seed: string, style: string, darkmode: boolean): Promise<PoemData> {
		let requestForPoem = `Can you please write me a ${this._linesPerPoem} line poem about ${seed}.`;
		if (style) {
				requestForPoem += ` In the style of ${style}.`;
			}
			if (darkmode) {
				requestForPoem += ` Make it dark.`;
			}
			const poem = await this.chat(requestForPoem);
			console.log(poem);
	
			const requestForSummary = `Here is a poem \n ${poem} \nCan you summarize it and describe it in a single sentence?`;
			let	summary = await this.chat(requestForSummary);
			summary = summary.toLowerCase();
			
			const poemLines = poem.split('\n').filter(l => l.trim() !== "");
			const random = Math.floor(Math.random() * poemLines.length);
			let randomLine = poemLines[random];
	
			return {
				poem: poemLines, summary, randomLine
			};
		}
	


}