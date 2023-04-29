import { css, customElement, html, internalProperty, LitElement, PropertyValues, TemplateResult }
	from "lit-element";
import {defaultStyles} from './defaultStyles';
import './components/DottyBackground';
import 'lit-toast/lit-toast.js';

import { ChatGpt, PoemData } from "./ChatGpt";

interface ListToast extends Element {
	show(message: string, time: number): Promise<void>;
}

const apiKey = "";

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

			#seed, #style, #api-key {
				color: black;
				height: 100px;
				font-size: 32px;
				padding-left: 0.5rem;
			}

			#api-key {
				flex: 1;
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

			lit-toast {
				--lt-color: #ffffff;
				padding: 16px;
				--lt-border-radius: 15px;
			}

		`
	];


	@internalProperty() _data: PoemData[] = 
	Array(0).fill(
		{
			summary: "words to describe it nicely",
			randomLine: "poem line 3",
			poem: ["poem line 1", "poem line 2", "poem line 3", "poem line 4", 
				"poem ", "poem", "poem", "poem"],
		}
	);

	/** Index of poem to display in full */
	@internalProperty() _poemToDisplay?: number;
	@internalProperty() _loading: boolean = false;
	@internalProperty() _darkmode: boolean = false;

	@internalProperty() _chatGpt?: ChatGpt;

	_defaultIterations: number = 7;

	connectedCallback(): void {
		super.connectedCallback();
		//todoo: turn into .env var
		if (apiKey) {
			this._chatGpt = new ChatGpt(apiKey);
		}
	}
  
	async _createPoems() {
		if (this._loading) {
			this._loading = false;
			return;
		}

		this._loading = true;
		this._data = [];
		this._poemToDisplay = undefined;

		let seed = (this.shadowRoot!.getElementById("seed") as HTMLInputElement).value;
		let style = (this.shadowRoot!.getElementById("style") as HTMLInputElement).value.trim();
		let iterations = Number((this.shadowRoot!.getElementById("iterations") as HTMLInputElement).value);
		iterations = iterations < 50 ? iterations : 1;
		
		if (!seed) {
			this._loading = false;
			return;
		}

		try {
			await this._createPoemsLoop(seed, style, iterations);
		} catch (error) {
			const toast = this.shadowRoot.querySelector<ListToast>('lit-toast');
			toast.show(`ChatGpt call failed: ${error.message}`, 4000);
		}
		this._loading = false;
	}

	async _createPoemsLoop(seed: string, style: string, iterations: number) {
		do {
			const data = await this._chatGpt.getSeedAndCreatePoemAndWords(seed, style, this._darkmode);
			this._data = [...this._data, data];
			seed = data.randomLine;

		} while (this._loading && this._data.length < iterations);
	}

	_onViewPoem(ev: MouseEvent) {
		const element = ev.target as HTMLElement
		this._poemToDisplay = Number(element.id);
	}

	_onInputKeyPress(ev: KeyboardEvent) {
		if (ev.key === "Enter") {
			this._createPoems();
		}
	}

	_onApiInputKeyPress(ev) {
		const apiKey = (this.shadowRoot!.getElementById("api-key") as HTMLInputElement).value.trim();
		if (ev.key === "Enter" && apiKey) {
			this._chatGpt = new ChatGpt(apiKey);
		}
	}

	_onApiKeyStart() {
		const apiKey = (this.shadowRoot!.getElementById("api-key") as HTMLInputElement).value.trim();
		if (apiKey) {
			this._chatGpt = new ChatGpt(apiKey);
		}
	}

	_renderApiKeyInput() {
		return html`
			<input type="text" placeholder="OpenAI-API-Key" id="api-key" @keyup=${this._onApiInputKeyPress}/>
			<button class="go" @click=${this._onApiKeyStart}>START</button>
		`;
	}

	_renderInputs() {
		const buttonText = this._loading ? "HALT" : "GEN";

		return html`
			<input type="text" placeholder="Subject" ?disabled=${this._loading} id="seed" @keyup=${this._onInputKeyPress}/>
			<input type="text" placeholder="Style (optional)" ?disabled=${this._loading} id="style" @keyup=${this._onInputKeyPress}/>
			<span class="text1">set off a chain reaction of random but related generation\n consisting of</span>
			<input type="number" id="iterations" ?disabled=${this._loading} value=${this._defaultIterations.toString()} >
			<span class="text2">Poems</span>
			<button class="go" @click=${this._createPoems}>${buttonText}</button>`;
	}

	_renderSummaries() {
		const results = this._data.map((res, i) => 
			html`	
				<div class="result" 
					?selected=${this._poemToDisplay === i}
					id=${i}
					@click=${this._onViewPoem}>
					${res.summary}
				</div>
			`);

		const loading = this._loading ? html`
			<div class="loading"></div>
		` : null;

		return [results, loading];
	}

	_renderPoem() {
		if (this._poemToDisplay == undefined) {
			return;
		}
		const poemData = this._data[this._poemToDisplay];

		return poemData.poem.map(line => html`
			<p ?bold=${poemData.randomLine == line}>${line}</p>
		`);
	}

	render() {
		let page: TemplateResult;
		if (this._chatGpt) {
			page = html`
				${this._renderInputs()}
				<div class="results">
						${this._renderSummaries()}
				</div>
				<div class="poem">
					${this._renderPoem()}
				</div>`; 
		} else {
			page = this._renderApiKeyInput()
		}

		return html`
			<dotty-background
				?darkmode=${this._darkmode}
				@toggle-darkmode=${() => {this._darkmode = !this._darkmode;}}
			></dotty-background>
			<div class="container ${this._darkmode ? "dark": "light"}">
				${page}
			</div>
			<lit-toast></lit-toast>
		`;
	}
}
