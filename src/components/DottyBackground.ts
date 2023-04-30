import { css, customElement, html, internalProperty, LitElement } from "lit-element";
import { styleMap } from 'lit-html/directives/style-map';
import { defaultStyles } from "../styles/defaultStyles";
import { darkStyles } from "../styles/darkStyles";

type Circle = {
	x: number,
	y: number,
	r: number
}

/**
 * An experiment with circles that didn't quite work out so i thought i'd use it for a background
 * Sorry about confusing bits.
 */
@customElement("dotty-background")
export class DottyBackground extends LitElement{
	static styles = [
		defaultStyles,
		darkStyles,
		css`
			.dot-container {
				height: 100%;
				padding: 40px;
				position: relative;
				overflow: hidden;
			}

			.circle {
				border-radius: 50%;
				position: absolute;	
				transform: translate(-30%, -30%);
				background: #b7d1ff;
				background: #bfd5ff;
			}
		`
	];

	@internalProperty() circles: Circle[] = [];

	connectedCallback(): void {
		super.connectedCallback();
		this.createCircles();
	}

	createCircles() {
		const circles = [];
		const maxPlacementAttempts = 10000;
		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;

		let circleSize = 100;
		let success = 1;

		for (let i = 0; i < maxPlacementAttempts; i++) {
			const circle: Circle = {
				x: Math.random() * screenWidth,
				y: Math.random() * screenHeight,
				r: circleSize
			};

			if (this._isInterseting(circle, circles)) {
				success *= 0.99999;
			} else {
				success *= (success * 1.05) + 0;
				circles.push(circle); 
			}
			
			circleSize *= success;

			if (circleSize < 0.00001) {
				break;
			}
		}

		this.circles = [...circles];
	}

	_isInterseting (circle: Circle, circles: Circle[]): boolean {
		for (let i = 0; i < circles.length; i++) {
			const otherCircle = circles[i];
			if(this._twoCirclesIntersect(circle, otherCircle)) {
				return true;
			}
		}
		return false;
	}

	_twoCirclesIntersect (circle1: Circle, circle2: Circle): boolean {
		const dx = circle1.x - circle2.x;
		const dy = circle1.y - circle2.y;
		const distance = Math.sqrt((dx * 1.9*dx) + (dy*1.9 * dy));
		const isIntersecting = distance < (circle1.r + circle2.r);
		
		return isIntersecting;
	}

  _onClick() {
    this.dispatchEvent(new CustomEvent('toggle-darkmode'));
  }

	render() {
		const circlesHtml = this.circles.map((circle) => 
			html`
				<div 
					class="circle"
					style=${styleMap({
						left: `${circle.x}px`,
						top: `${circle.y}px`,
						width: `${circle.r * 1.5}px`,
						height: `${circle.r * 1.5}px`,
					})} 
          @click=${this._onClick}>
				</div>`);

    return html`
			<div class="dot-container">
      	${circlesHtml}
    	</div>`;
	}
}
