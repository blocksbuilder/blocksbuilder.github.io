// /// <reference path="../../../bb-element.ts" />
// /// <reference path="../../../../utils/factories/element/bb-elementfactory.ts" />

// import { BBElement } from "../../../bb-element";
// import { BBElementFactory } from "../../../../utils/factories/element/bb-elementfactory";

// export class BBCheckbox extends BBElement {
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
//             let bbCheckBox = BBElementFactory.GetBBCheckbox(this.id, 
//                 this.Setting.Title, this.Setting.Value.BBToBoolean());
//             this.shadowRoot.appendChild(bbCheckBox);
//             resolve(true);
//         });
//     }    
// }

// // Define the new element
// customElements.define('bb-checkbox', BBCheckbox);