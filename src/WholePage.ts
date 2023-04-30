import { css, customElement, html, internalProperty, LitElement }
	from "lit-element";
import {defaultStyles} from './defaultStyles';
import './components/DottyBackground';
import './components/ApiKeyInput';
import './components/PoemsConfig';
import './components/ViewPoems';
import 'lit-toast/lit-toast.js';

import { ChatGpt, PoemData } from "./ChatGpt";
import { inputStyles } from "./inputStyles";
import { PoemConfig } from "./components/PoemsConfig";

interface ListToast extends Element {
	show(message: string, time: number): Promise<void>;
}

@customElement('whole-page')
/**
 * The Page which will contain and surround our components
 */
export class WholePage extends LitElement {

	static styles = [
		defaultStyles,
		inputStyles,
		css`
			.container {
				position: absolute;
				top: 5%;
				left: 5%;
				width: 90%;
				max-width: 80rem;
				display: flex;
				flex-direction: column;
				gap: 40px;
				padding: 40px;
				overflow: hidden;
				opacity: 0.5;
			}

			lit-toast {
				padding: 16px;
				--lt-border-radius: 15px;
				--lt-color: #ffffff;
			}

		`
	];

	@internalProperty() _poems: PoemData[] = 
	//mock data for testing, increase x in Array(x) to populate
	Array(10).fill(
		{
			summary: "words to describe it nicely",
			randomLine: "poem line 3",
			poem: ["poem line 1", "poem line 2", "poem line 3", "poem line 4", 
				"poem line 5", "poem line 6", "poem line 7", "poem 8"],
		}
	);

	@internalProperty() _chatGpt?: ChatGpt;
	@internalProperty() _loading: boolean = false;
	@internalProperty() _darkmode: boolean = false;

	_initiliseChatGpt(ev: CustomEvent<string>) { 
		this._chatGpt = new ChatGpt(ev.detail);
	}
  
	async _createPoems(ev: CustomEvent<PoemConfig>) {
		this._loading = true;
		this._poems = [];

		const seed = ev.detail.seed;
		const style = ev.detail.style;
		const iterations = ev.detail.iterations;

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
			this._poems = [...this._poems, data];
			seed = data.randomLine;

		} while (this._loading && this._poems.length < iterations);
	}

	/** Stop creating poems */
	_stop() {
		this._loading = false;
	}

	/** 
	 * Render api key input if ChatGpt not initialised,
	 * otherwise render generation options and once loaded, the poems
	 */
	render() {
		const content = this._chatGpt ? 
			html`
				<poems-config 
					@start=${this._createPoems} 
					@stop=${this._stop}
					?loading=${this._loading}
					?darkmode=${this._darkmode}>
				</poems-config>
				<view-poems 
					.poems=${this._poems} 
					?loading=${this._loading} 
					?darkmode=${this._darkmode}>
				</view-poems>`:
			html`
				<api-key-input 
					@new-api-key=${this._initiliseChatGpt}>
				</api-key-input>`;

		return html`
			<dotty-background
				@toggle-darkmode=${() => {this._darkmode = !this._darkmode;}}
				?darkmode=${this._darkmode}>
			</dotty-background>
			<div class="container ${this._darkmode ? "dark": "light"}">
				${content}
			</div>
			<lit-toast></lit-toast>
		`;
	}
}
