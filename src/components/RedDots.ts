import { css, customElement, html, internalProperty, LitElement, property } from "lit-element";
import { defaultStyles } from "../defaultStyles";

import { styleMap } from 'lit-html/directives/style-map';



type Circle = {
	x: number,
	y: number,
	r: number
	,band?: number
}

/**
 * Just one configurable component for use and reuse
 */
@customElement("red-dot-background")
export class RedDots extends LitElement{
	static styles = [
		defaultStyles,
		css`
     .container {
				height: 100%;
				padding: 40px;
				position: relative;
				overflow: hidden;
     }

     .light {
        background: white;
     }

     .dark {
        background: black;
     }


			.container > * {
				position: absolute;
				height: 100%;
				width: 100%;
			}

			.circle {
				border-radius: 50%;
				position: absolute;	
				transition: background .15s ease;
				transform: translate(-30%, -30%);
			}

      .light .circle {
        background: #b7d1ff;
      }

      .dark .circle {
        background: red;
      }
		`
	];


	@internalProperty() circles: Circle[] = [];

	@property({type: Boolean}) darkmode: boolean = false;

	connectedCallback(): void {
		super.connectedCallback();
		this.createCircles();
	}

	async createCircles() {
		const circles = [];
		const maxPlacementAttempts = 10000;
		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;

		let circleSize = 100;
		let success = 1;

		for (let i = 0; i < maxPlacementAttempts; i++) {
			// const circle = this._myFunction(circleSize)

			const circle: Circle = {
				x: Math.random() * screenWidth,
				y: Math.random() * screenHeight,
				// x: (Math.random() * screenWidth * .8) + (.1 * screenWidth),
				// y: (Math.random() * screenHeight * .8) + (.1 * screenHeight),
				r: circleSize
			};

			if (this.isInterseting(circle, circles)) {
				success *= 0.99999;
			} else {
				success *= (success * 1.05) + 0;
				circles.push(circle); 
				console.log(circles.length);
				
			}

			// console.log(success);
			
			circleSize *= success;

			if (circleSize < 0.00001) {
				break;
			}

			// if (i % 2000 === 0) {
			// 	await delay(.00001)
			// }
		}

		this.circles = [...circles];
	}



	isInterseting (circle: Circle, circles: Circle[]) {
		for (let i = 0; i < circles.length; i++) {
			const circlea = circles[i];
			const isIntersecting = this.twocircles(circlea, circle);
			if (isIntersecting) {
				return true;
			}
		}
	}

	twocircles (circle1, circle2): boolean {
		const dx = circle1.x - circle2.x;
		const dy = circle1.y - circle2.y;
		const distance = Math.sqrt((dx * 1.9*dx) + (dy*1.9 * dy));
		const isIntersecting = distance < (circle1.r + circle2.r);
		
		return isIntersecting;
	}

  _onClick() {
    this.dispatchEvent(new CustomEvent('darkmode'));
  }


	render() {
		const circlesHtml = this.circles.map((circle) => {

			return html`
				<div 
					style=${styleMap({
						left: `${circle.x}px`,
						top: `${circle.y}px`,
						width: `${circle.r * 1.5}px`,
						height: `${circle.r * 1.5}px`,
					})} 
					class="circle band-${circle.band}"
          @click=${this._onClick}
				></div>
			`;
		});

    return html`<div class="container ${this.darkmode ? "dark": "light"}">
      ${circlesHtml}
    </div>`


	}

}
