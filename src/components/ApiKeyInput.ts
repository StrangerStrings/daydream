import { css, customElement, html, LitElement, property } from "lit-element";
import { defaultStyles } from "../styles/defaultStyles";
import { inputStyles } from "../styles/inputStyles";

/** Input for a openai api key */
@customElement("api-key-input")
export class ApiKeyInput extends LitElement{
	static styles = [
		defaultStyles,
		inputStyles,
		css`
     :host {
			display: flex;
			flex: 1;
			gap: 20px;
		 }

		 input {
			flex: 1;
		 }
		`
	];

	@property({type: Boolean}) darkmode: boolean = false;

	_newApiKey() {
		const apiKey = (this.shadowRoot!.getElementById("api-key") as HTMLInputElement).value.trim();
		if (apiKey) {
			this.dispatchEvent(new CustomEvent<string>('new-api-key', {detail: apiKey}));
		}
	}

	_onInputKeyUp(ev: KeyboardEvent) {
		if (ev.key === "Enter") {
			this._newApiKey();
		}
	}

	render() {
		return html`
			<input type="text" placeholder="OpenAI-API-Key" id="api-key" @keyup=${this._onInputKeyUp}/>
			<button @click=${this._newApiKey}>START</button>
		`;
	}
}
