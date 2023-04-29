import { css, customElement, html, internalProperty, LitElement, property, TemplateResult }
	from "lit-element";
import {defaultStyles} from './defaultStyles';
import './components/RedDots';

import { Configuration, OpenAIApi } from "openai";

type Data = {
	words: string;
	// seed: string;
	poem: string[];
	randomLine: string;
}

@customElement('whole-page')
/**
 * The Page which will contain and surround our components
 */
export class WholePage extends LitElement {

	static styles = [
		defaultStyles,
		css`
			.container {
				padding: 40px;
				position: relative;
				overflow: hidden;

				position: absolute;
				top: 5%;
				left: 5%;
				width: 90%;
				opacity: 0.5;

				display: flex;
				flex-wrap: wrap;
				gap: 20px;

				max-width: 80rem;
			}

			#seed, #style {
				color: black;
				height: 100px;
				font-size: 32px;
				padding-left: 0.5rem;
			}
			#seed {
				flex-basis: 65%;
			}

			#style {
				flex-basis: 33%;

			}
			.dark .text2, .dark .text1 {
				color: white;
			}
			.text1 {
				flex-basis: 280px;
				text-align: end;
			}
			#iterations {
				width: 80px;
				padding: 0 6px;
				font-size: 150%;
			}
			.text2 {
				flex: 1;
				align-self: flex-end;
			}
			.go {
				padding: 10px;
				font-size: 120%;
				font-weight: bold;
				cursor: pointer;
			}
			.results {
				flex-basis: 58%;
			}

			.poem, .results {
				margin: 30px 0px 0;
			}
			.poem {
				flex-basis: 38%;
				padding: 5px 25px;
				font-size: 110%;
				text-align: end;
			}
			.dark .poem {
				color: white;
			}

			.poem p[bold] {
				font-weight: bold;
			}

			.results {
				display: flex;
				flex-direction: column;
				gap: 10px;
			}

			.result {
				color: black;
				font-size: 20px;
				padding: 5px 10px;
				cursor: pointer;
			}

			.dark .result {
				color: white;
			}

			.result[selected] {
				border-right: solid 2px #373737;
			}

			.loading {    
				width: 50px;
				height: 30px;
				border-radius: 0px 0px 30px 30px;
				margin-left: 30px;
				margin-top: 20px;
        background: #dae7ff;
				animation: loading 4s infinite linear
			}
			.dark .loading {
				background-color: #7c0000;
			}

			@keyframes loading {
				0% {
					transform: rotate(0deg);
				}
				50% {
					transform: rotate(180deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}

		`
	];


@internalProperty() _data: Data[] = 
Array(0).fill(
	{
		words: "words to describe",
		seed: "seed",
		poem: ["poem", "poem", "poem", "poem", "poem", "poem", "poem", "poem"],
	}
);


@internalProperty() _chosen?: number;

@internalProperty() _loading: boolean = false;

@internalProperty() _darkmode: boolean = false;

	_openai: OpenAIApi;
	_lines: number = 8;
	_defaultIterations: string = "7";

	connectedCallback(): void {
		super.connectedCallback();


		const configuration = new Configuration({
			apiKey: "",
		});
		this._openai = new OpenAIApi(configuration);
	}

	async CreatePoemsInLoop() {
		if (this._loading) {
			this._loading = false;
			return;
		}

		this._data = [];
		this._chosen = undefined;

		this._loading = true;

		let seed = (this.shadowRoot!.getElementById("seed") as HTMLInputElement).value;
		let style = (this.shadowRoot!.getElementById("style") as HTMLInputElement).value.trim();
		let iterations = Number((this.shadowRoot!.getElementById("iterations") as HTMLInputElement).value);
		
		if (!seed) {
			return;
		}
		iterations = iterations < 50 ? iterations : 1;

		do {
			const data = await this.getSeedAndCreatePoemAndWords(seed, style);
			this._data = [...this._data, data];
			seed = data.randomLine;

		} while (this._loading && this._data.length < iterations);

		this._loading = false;
	}

	async chat(chat: string): Promise<string> {
		const response = await this._openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{role: "user", content: chat}],
		});
		return response.data.choices[0].message.content;
	} 

	async getSeedAndCreatePoemAndWords(seed: string, style?: string): Promise<Data> {
		let requestForPoem = `Can you please write me a ${this._lines} line poem about ${seed}.`;
		if (style) {
			requestForPoem += ` In the style of ${style}.`;
		}
		if (this._darkmode) {
			requestForPoem += ` Make it dark.`;
		}
		const poem = await this.chat(requestForPoem);
		console.log(poem);

		const requestForSummary = `Here is a poem \n ${poem} \nCan you summarize it and describe it in a single sentence?`;
		let	description = await this.chat(requestForSummary);
		description = description.toLowerCase();

		const poemLines = poem.split('\n').filter(l => l.trim() !== "");
		const random = Math.floor(Math.random() * poemLines.length);
		let randomLine = poemLines[random];

		return {
			poem: poemLines, words: description, randomLine
		};
	}

	_viewPoem(ev) {
		this._chosen = Number(ev.target.id);
	}
	_renderResults() {
		const results = this._data.map((res, i) => 
			html`	
				<div class="result" 
					?selected=${this._chosen === i}
					id=${i}
					@click=${this._viewPoem}>
					${res.words}
				</div>
			`);

		const loading = this._loading ? html`
			<div class="loading"></div>
		` : null;

		return [results, loading];
	}

	_enterMaybe(ev) {
		// this._darkmode = !this._darkmode;
		if (ev.key === "Enter") {
			this.CreatePoemsInLoop();
		}
	}

	render() {
		const buttonText = this._loading ? "HALT" : "GEN";
		const a = this._data[0]

		let poemLines: TemplateResult[] = [];
		if (this._chosen !== undefined) {
			const data = this._data[this._chosen];
			poemLines = data.poem.map(line => html`
				<p ?bold=${data.randomLine == line}>${line}</p>
			`);
		}

		return html`
			<red-dot-background
				@darkmode=${() => {
					this._darkmode = !this._darkmode;
				}}
				?darkmode=${this._darkmode}
			></red-dot-background>
			<div class="container ${this._darkmode ? "dark": "light"}">
				<input type="text" placeholder="Subject" ?disabled=${this._loading} id="seed" @keyup=${this._enterMaybe}/>
				<input type="text" placeholder="Style (optional)" ?disabled=${this._loading} id="style" @keyup=${this._enterMaybe}/>
				<span class="text1">set off a chain reaction of random but related generation\n consisting of</span>
				<input type="number" id="iterations" ?disabled=${this._loading} value=${this._defaultIterations} >
				<span class="text2">Poems</span>
				<button class="go" @click=${this.CreatePoemsInLoop}>${buttonText}</button>
				<div class="results">
					<div class="res-2">
						${this._renderResults()}
					</div>
				</div>
				<div class="poem">
					${poemLines}
				</div>
			</div>
		`;
	}
}
