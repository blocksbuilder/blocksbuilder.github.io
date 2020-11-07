// /**
//  * BBAddonButtons - use Addon Buttons control to keep buttons together
//  * @author Ritesh Gandhi
//  * @copyright BlocksBuilder 
//  */

// import { ControlTypeEnum } from "./../../../../models/enums/bb-enums";
// import "../../../utils/extensions";
// import { HTMLElementFactory } from '../../../utils/factories/html/bb-htmlfactory';
// import { BBControl } from '../bb-control';
// import { BBAccordionAttributes } from '../../../../models/attribute/control/bb-accordionattributes';
// import { HeaderControlStyles } from '../../../models/common/bb-styles';

// /**
//  * use Addon Buttons control to keep buttons together 
//  */
// export class BBAddonButtons extends BBControl {
//     constructor() {
//         // Always call super first in constructor
//         super(ControlTypeEnum.addonbuttons);
//     }

//     get ControlAttributes():BBAccordionAttributes {
//         return <BBAccordionAttributes>super.ControlAttributes;
//     }

//     /**
//      * Toggles accordion
//      */
//     public Toggle = () => {
//         let targetID = this.ControlAttributes.TargetContainerID;
//         let target: HTMLElement;
//         let accordionAnchor: HTMLElement;
//         let accordionIcon: HTMLElement;
//         let expandedClassList: string[];
//         let expandedIconClass: string;
//         let collapsedClassList: string[];
//         let collapsedIconClass: string;

//         accordionAnchor = this.shadowRoot.getElementById('accordionAnchor');
//         accordionIcon = this.shadowRoot.getElementById('accordionIcon');

//         if (targetID && accordionAnchor && accordionIcon) {
//             // find target container
//             target = document.getElementById(targetID);

//             // if target not found then it could be that accordion is inside another web component
//             // try to find the root shadowdom
//             if (!target) {
//                 target = this.FindElementByIdAndStartNode(targetID, this.parentNode);
//             }

//             expandedClassList = this.StylesMapping.HeaderControlStyles.AccordionIconClassNameExpanded.split(' ');
//             expandedIconClass = expandedClassList.length > 0 ?
//                 expandedClassList[1] : expandedClassList[0];
//             collapsedClassList = this.StylesMapping.HeaderControlStyles.AccordionIconClassNameCollapsed.split(' ');
//             collapsedIconClass = collapsedClassList.length > 0 ?
//                 collapsedClassList[1] : collapsedClassList[0];

//             if (target) {
//                 target.style.display = (this.ControlAttributes.IsExpanded ? '' : 'none');
//             }

//             if (this.ControlAttributes.IsExpanded) {
//                 accordionIcon.classList.replace(expandedIconClass,
//                     collapsedIconClass);
//                 accordionAnchor.title = this.StylesMapping.HeaderControlStyles.AccordionIconCollapseTooltip;
//             } else {
//                 accordionIcon.classList.replace(collapsedIconClass,
//                     expandedIconClass);
//                 accordionAnchor.title = this.StylesMapping.HeaderControlStyles.AccordionIconExpandedTooltip;
//             }
//         } else {
//             let accordionHeader = this.shadowRoot.getElementById('accordionHeader');
//             if (accordionAnchor) accordionAnchor.style.display = "none";
//             if (accordionIcon) accordionIcon.style.display = "none";
//             if (accordionHeader) {
//                 accordionHeader.removeEventListener('click', this.Toggle);
//                 accordionHeader.style.cursor = "Default";
//             }
//         }
//     }

//     /**
//      * Adds custom element to the accordion slot
//      */
//     public AddCustomElement = (element: Element) => {
//         let slotElement = this.shadowRoot.querySelector('slot');
//         slotElement.appendChild(element);
//         return this;
//     }

//     /**
//      * Toggles sticky property of accordion
//      */
//     private toggleSticky = () => {
//         let header = this.shadowRoot.querySelector('header');
//         if (header) {
//             header.style.position = this.ControlAttributes.IsHeaderSticky.toString().BBToBoolean() ? 'sticky' : 'initial';
//             header.style.top = "0";
//             header.style.zIndex = this.ControlAttributes.IsHeaderSticky.toString().BBToBoolean() ? "9999999999" : "0"
//         }
//     }

//     /**
//      * Renders accordion control
//      */
//     public renderControl = ():Promise<boolean> => {
//         return new Promise((resolve) => {
//             // get shadow root
//             let shadow = this.shadowRoot;

//             let header: HTMLElement;
//             let headerP: HTMLParagraphElement;
//             let headerAccordion: HTMLAnchorElement;
//             let headerAccordionSpan: HTMLSpanElement;
//             let headerAccordionI: HTMLElement;
//             let headerSlot: Element;

//             header = HTMLElementFactory.AddHeader(
//                 {
//                     className: `${HeaderControlStyles.HeaderClassName} ${this.ControlAttributes.BackgroundColor || 
//                         HeaderControlStyles.HeaderBackgroundColor}`,
//                     style: 'cursor:pointer',
//                     id: 'accordionHeader'
//                 });

//             headerP = HTMLElementFactory.AddParagraph(
//                 {
//                     className: `${this.StylesMapping.HeaderControlStyles.HeaderTitleClassName} ${this.ControlAttributes.Color || 
//                         HeaderControlStyles.HeaderColor }`,
//                     textContent: this.ControlAttributes.Title ? this.ControlAttributes.Title : "",
//                     id: 'accordionP'
//                 });

//             headerSlot = HTMLElementFactory.GetHTMLElement('slot');
//             headerSlot.setAttribute('name', 'custommarkup');

//             headerAccordion = HTMLElementFactory.AddAnchor(
//                 {
//                     className: this.StylesMapping.HeaderControlStyles.AccordionAnchorClassName, id: 'accordionAnchor'
//                 });
//             headerAccordion.setAttribute('aria-label', 'Expand');
//             headerAccordion.setAttribute('title', this.ControlAttributes.IsExpanded ?
//                 this.StylesMapping.HeaderControlStyles.AccordionIconCollapseTooltip :
//                 this.StylesMapping.HeaderControlStyles.AccordionIconExpandedTooltip);

//             headerAccordionSpan = HTMLElementFactory.AddSpan(
//                 {
//                     className: this.StylesMapping.HeaderControlStyles.AccordionSpanClassName
//                 });
//             headerAccordionI = HTMLElementFactory.AddI(
//                 {
//                     className: `${(this.ControlAttributes.IsExpanded ?
//                         this.StylesMapping.HeaderControlStyles.AccordionIconClassNameCollapsed :
//                         this.StylesMapping.HeaderControlStyles.AccordionIconClassNameExpanded)} ${this.ControlAttributes.IconColor || 
//                             HeaderControlStyles.AccordionIconColor}`,
//                     id: 'accordionIcon'
//                 });
//             headerAccordionI.setAttribute('aria-hidden', 'true');

//             header.addEventListener('click', (event: any) => {
//                 if (event.target.id == "accordionIcon" || 
//                     event.target.id == "accordionP" || 
//                     event.target.id == "accordionHeader" ||
//                     event.target.id == "accordionAnchor") {
//                     this.ControlAttributes.IsExpanded = !this.ControlAttributes.IsExpanded;
//                     this.Toggle();
//                 }
//             });

//             header.appendChild(headerP);
//             header.appendChild(headerSlot);
//             header.appendChild(headerAccordion);
//             headerAccordionSpan.appendChild(headerAccordionI);
//             headerAccordion.appendChild(headerAccordionSpan);
//             shadow.appendChild(header);

//             this.toggleSticky();
//             resolve(true);
//         })
//     }
// }

// // Define the new element
// window.customElements.define('bb-accordion', BBAccordion);
