import { css } from "lit-element";

/** Shared styles for inputs */
export const darkStyles = css`
  :host(.dark) p,:host(.dark) span {
    color: white;
  }

  :host(.dark) .dot-container {
    background: black;
  }

  :host(.dark) .circle {
    background: red;
  }

  :host(.dark) .loading {
    background-color: #7c0000;
  }

  * {
    transition: background .15s ease, color .2s ease;
  }
`;
