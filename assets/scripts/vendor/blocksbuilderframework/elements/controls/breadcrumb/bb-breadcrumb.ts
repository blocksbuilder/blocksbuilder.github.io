/// <reference path="../../../utils/extensions.ts" />
/// <reference path="../../../utils/factories/html/bb-htmlfactory.ts" />
/// <reference path="../../../elements/bb-element.ts" />

/**
 * BBBreadCrumb - A simple breadcrumb component to improve your navigation experience
 * @see https://bulma.io/documentation/components/breadcrumb/
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
*/

import "../../../utils/extensions";
import { HTMLElementFactory } from '../../../utils/factories/html/bb-htmlfactory';
// import { BBElement } from '../../../elements/bb-element';
import { ControlTypeEnum } from "./../../../models/enums/bb-enums";
import { BBControl } from '../bb-control';
import { BBBreadcrumbAttributes } from '../../../models/attribute/control/bb-breadcrumbattributes';

export class BBBreadCrumb extends BBControl {
    /**
     * BBBreadCrumb - A simple breadcrumb component to improve your navigation experience
     * @see https://bulma.io/documentation/components/breadcrumb/
     * @author Ritesh Gandhi
     * @copyright BlocksBuilder 
    */
    constructor() {
        // Always call super first in constructor
        super(ControlTypeEnum.breadcrumb);
        // this.addEventListener(ElementEventsEnum.attributechanged, (event:CustomEvent) => {
        //     if (event.detail.name == "bb-setting") {
        //         this.addPath();
        //     }
        // });
    }

    // /**
    //  * Fires when web component is added to DOM
    //  */
    // connectedCallback() {
    //     // render control
    //     this.renderControl().then((isRendered) => {
    //         if (isRendered) {
    //             this.addPath();
    //         }
    //     });
    // }

    public renderControl = ():Promise<boolean> => {
        return new Promise((resolve) => {
            let shadow = this.shadowRoot;
            let bcNav = HTMLElementFactory.AddNav({ 
                className: 'breadcrumb', 
                style:'padding-left:2%',
                id:'bc_nav'
            });
            let bcUL = HTMLElementFactory.AddUL({id:'bc_ul'});
            bcNav.appendChild(bcUL);
            shadow.appendChild(bcNav);
            this.addPath();
            resolve(true);
        });
    }

    private addPath = () => {
        let bcUL = this.shadowRoot.getElementById('bc_ul');
        if (bcUL) {
            bcUL.innerHTML = "";
            let path: string[] = (<BBBreadcrumbAttributes>this.ControlAttributes).Path.split('/');
            let index = 1;
        
            path.forEach(pathURL => {
                if (pathURL) {
                    let li = HTMLElementFactory.AddLI({ 
                            className: (path.length == index ? 'is-active' : '') 
                        });
                    let liAnchor = HTMLElementFactory.AddAnchor({
                        textContent: pathURL
                    });
                    li.appendChild(liAnchor);
                    bcUL.appendChild(li);
                }
                index++;
            });
        }
    }   
}

// Define the new element
customElements.define('bb-breadcrumb', BBBreadCrumb);
