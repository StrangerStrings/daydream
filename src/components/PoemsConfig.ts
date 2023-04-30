import { css, customElement, html, LitElement, property } from "lit-element";
import { defaultStyles } from "../styles/defaultStyles";
import { inputStyles } from "../styles/inputStyles";
import { darkStyles } from "../styles/darkStyles";

export type PoemConfig = {
	seed: string;
	style: string;
	iterations: number;
}

/** Configuration inputs and start button for the poem generation */
@customElement("poems-config")
export class PoemsConfig extends LitElement{
	static styles = [
		defaultStyles,
		inputStyles,
		darkStyles,
		css`
			:host {
				display: flex;
				flex: 1;
				flex-direction: column;
				gap: 20px;
			}

		 	.flex-layer {
				display: flex;
				gap: 20px;
		 	}

		 	#seed {
				flex-basis: 65%;
			}

			#style {
				flex-basis: 33%;
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
		 
		`
	];

	@property({type: Boolean}) darkmode: boolean = false;
	@property({type: Boolean}) loading: boolean = false;

	_defaultIterations: number = 7;

	_onInputKeyUp(ev: KeyboardEvent) {
		if (ev.key === "Enter") {
			this._start();
		}
	}

	/** Send event to start (or stop) generating poems */
	_start() {
		if (this.loading) {
			this.dispatchEvent(new Event('stop'));
			return;
		}

		let seed = (this.shadowRoot!.getElementById("seed") as HTMLInputElement).value;
		let style = (this.shadowRoot!.getElementById("style") as HTMLInputElement).value.trim();
		let iterations = Number((this.shadowRoot!.getElementById("iterations") as HTMLInputElement).value);
		iterations = iterations < 50 ? iterations : 1;
		
		if (!seed) {
			return;
		}
    
		this.dispatchEvent(new CustomEvent<PoemConfig>('start', 
			{detail: {seed, style, iterations}}
		));
	}

	render() {
		const buttonText = this.loading ? "HALT" : "GEN";

		return html`
			<div class="flex-layer">
				<input type="text" placeholder="Subject" ?disabled=${this.loading} id="seed" @keyup=${this._onInputKeyUp}/>
				<input type="text" placeholder="Style (optional)" ?disabled=${this.loading} id="style" @keyup=${this._onInputKeyUp}/>
			</div>
			<div class="flex-layer">
				<span class="text1">Set off a chain reaction of random but related generation\n consisting of</span>
				<input type="number" id="iterations" @keyup=${this._onInputKeyUp} ?disabled=${this.loading} value=${this._defaultIterations.toString()} >
				<span class="text2">Poems</span>
				<button @click=${this._start}>${buttonText}</button>
			</div>
		`;
	}
}
