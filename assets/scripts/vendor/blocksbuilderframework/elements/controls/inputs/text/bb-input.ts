// /// <reference path="../../../bb-element.ts" />
// /// <reference path="../../../../utils/factories/element/bb-elementfactory.ts" />

// import { BBElement } from "../../../bb-element";
// import { BBElementFactory } from "../../../../utils/factories/element/bb-elementfactory";
// import { HTMLElementFactory } from '../../../../utils/factories/html/bb-htmlfactory';

// export class BBInput extends BBElement {
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
//             let input = BBElementFactory.GetBBItem(
//                 this.Setting.Type, 
//                 this.Setting.Value, 
//                 this.Setting.Title, 
//                 this.Setting.Required.BBToBoolean(), 
//                 this.Setting.AddIcon.BBToBoolean(), 
//                 this.Setting.IconClass, 
//                 this.Setting.IconName);
//             this.shadowRoot.appendChild(input);
//             resolve(true);
//         });
//     }    
// }

// // Define the new element
// customElements.define('bb-input', BBInput);