import { css, customElement, html, internalProperty, LitElement, property, TemplateResult } from "lit-element";
import { defaultStyles } from "../defaultStyles";
import { inputStyles } from "../inputStyles";
import { PoemData } from "../ChatGpt";

export type PoemConfig = {
	seed: string;
	style: string;
	iterations: number;
	darkmode?: boolean;
}

/** For viewing the poem summaries and selecting and viewing an associated poem */
@customElement("view-poems")
export class ViewPoems extends LitElement{
	static styles = [
		defaultStyles,
		inputStyles,
		css`
      :host {
        display: flex;
        flex: 1;
        gap: 20px;
      }

			.summaries {
				flex-basis: 60%;
				display: flex;
				flex-direction: column;
				gap: 20px;
			}

			.summary {
				color: black;
				font-size: 20px;
				padding: 0 10px;
				cursor: pointer;
				border-right: solid 2px transparent;
				border-left: solid 2px transparent;
			}

			.summary[selected] {
        border-color: #373737;
			}

			.poem {
        flex: 1;
			}

      .poem p {
				padding-top: 3px;
				font-size: 110%;
				text-align: end;
      }

			.poem p[bold] {
				font-weight: bold;
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
				100% {
					transform: rotate(360deg);
				}
			}
		`
	];

	@property({type: Array}) poems: PoemData[] = [];
	@property({type: Boolean}) darkmode: boolean = false;
	@property({type: Boolean}) loading: boolean = true;
  
  /** Index of poem to display in full */
	@internalProperty() _poemToDisplay?: number;
 
	_onViewPoem(ev: MouseEvent) {
		const element = ev.target as HTMLElement
		this._poemToDisplay = Number(element.getAttribute('data-idx'));
	}

	render() {
    const summaries = this.poems.map((res, i) => 
			html`	
				<div class="summary" 
					?selected=${this._poemToDisplay === i}
					data-idx=${i}
					@click=${this._onViewPoem}>
					${res.summary}
				</div>`);

		const loading = this.loading ? 
      html`<div class="loading"></div>` 
      : null;

    const poemToDisplay = this.poems[this._poemToDisplay];

    let poem: TemplateResult[] = [];
    if (poemToDisplay) {
      poem = poemToDisplay.poem.map(line => html`
      <p ?bold=${poemToDisplay.randomLine == line}>${line}</p>
    `);
    }

		return html`
      <div class="summaries">
        ${summaries}
        ${loading}
      </div>
      <div class="poem">
        ${poem}
      </div>
		`;
	}
}
