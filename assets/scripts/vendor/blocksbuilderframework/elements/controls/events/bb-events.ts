// /// <reference path="./../../bb-element.ts" />
// /// <reference path="../accordion/bb-accordion.ts" />
// /// <reference path="../../../utils/factories/html/bb-htmlfactory.ts" />

// import { BBElement } from "./../../bb-element";
// import { BBAccordion } from '../accordion/bb-accordion';
// import { HTMLElementFactory } from '../../../utils/factories/html/bb-htmlfactory';

// export class BBEvents extends BBElement {
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

//     get EventsData(): string[] {
//         if (this.Setting && this.Setting.Values) {
//             let eventList = this.Setting.Values.replace(/'/g, "").split(',');
//             return eventList;
//         }
//     }

//     private renderControl = ():Promise<boolean> => {
//         return new Promise((resolve) => {
//             let eventCard: HTMLDivElement = HTMLElementFactory.AddDiv({ 
//                 className: 'card' 
//             });
//             let cardHeader: BBAccordion = new BBAccordion();
//             let eventTable: HTMLTableElement = HTMLElementFactory.AddTable(
//                 { className: 'table is-fullwidth is-striped' 
//             });
//             cardHeader.setAttribute('bb-setting', 
//                 JSON.stringify({
//                 Title: this.Setting.Title, 
//                 IsExpanded: this.Setting.IsExpanded, 
//                 TargetContainerID:this.Setting.TargetContainerID}));
        
//             this.EventsData.forEach((event: string) => {
//                 let eventRow: HTMLTableRowElement = HTMLElementFactory.AddTR();
//                 let eventIconTD: HTMLTableCellElement = HTMLElementFactory.AddTD();
//                 let eventIconI = HTMLElementFactory.AddI({ className: 'fa fa-bell-o' });
//                 let eventDescriptionTD: HTMLTableCellElement = HTMLElementFactory.AddTD();
//                 let eventActionTD: HTMLTableCellElement = HTMLElementFactory.AddTD();
        
//                 eventDescriptionTD.textContent = event;
//                 eventRow.appendChild(eventIconTD);
//                 eventRow.appendChild(eventDescriptionTD);
//                 eventRow.appendChild(eventActionTD);
//                 eventIconTD.appendChild(eventIconI);
//                 eventTable.tBodies[0].appendChild(eventRow);
//             });
        
//             eventCard.appendChild(cardHeader);
//             eventCard.appendChild(eventTable);
//             this.shadowRoot.appendChild(eventCard);
//             resolve(true);
//         });
//     }
// }

// // Define the new element
// customElements.define('bb-events', BBEvents);