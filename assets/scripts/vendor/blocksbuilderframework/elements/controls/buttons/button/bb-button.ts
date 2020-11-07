// /// <reference path="../../../bb-element.ts" />
// /// <reference path="../../../../utils/factories/html/bb-htmlfactory.ts" />

// import { BBElement } from "../../../bb-element";
// import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";

// export class BBButton extends BBElement {
//     constructor() {
//         // Always call super first in constructor
//         super();
//     }

//     /**
//      * Fires when web component is added to DOM
//      */
//     async connectedCallback() {
//         await this.renderControl();
//     }

//     private renderControl = ():Promise<boolean> => {
//         return new Promise((resolve) => {
//             let button = HTMLElementFactory.AddButton({
//                 className:this.StylesMapping.FormControlStyles.ButtonClassName,
//                 textContent:this.Setting.Title
//             });
//             this.shadowRoot.appendChild(button);
//             resolve(true);
//         });
//     }    
// }

// // Define the new element
// customElements.define('bb-button', BBButton);