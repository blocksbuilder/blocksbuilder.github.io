/// <reference path="./../bbconfig.ts" />
/// <reference path="./../models/enums/bb-enums.ts" />
/// <reference path="./../models/common/bb-styles.ts" />
/// <reference path="../utils/factories/html/bb-htmlfactory.ts" />

import { BBConfig as config } from './../bbconfig';
import { ElementEventsEnum } from '../models/enums/bb-enums';
import * as ElementStyles from "./../models/common/bb-styles";
import { HTMLElementFactory } from "../utils/factories/html/bb-htmlfactory";

export abstract class BBElement extends HTMLElement {
    public static ObservedAttributesList: string[] = [
        'bb-blockdatasource', 'bb-controlsource'
    ];

    constructor() {
        // Always call super first in constructor
        super();
        // Create a shadow root
        this.attachShadow({ mode: 'open' });
        // import main CSS files from configuration
        this.attachCSSFromConfig();
    }

    /**
     * Gets observed attributes
     */
    static get observedAttributes() {
        return BBElement.ObservedAttributesList;
    }

    /**
     * Fires when attribute value changes 
     * @param name attribute name
     * @param oldValue old value
     * @param newValue new value
     */
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'bb-blockdatasource':
            case 'bb-controlsource':
                this.RaiseCustomEvent(ElementEventsEnum.attributechanged, false, false, false, 
                    { name: name, oldValue: oldValue, newValue: newValue });
                break;
        }
    }

    /**
     * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
     * @param eventName<string> - name of the event
     * @param canBubble<boolean> - event can bubble - default is false
     * @param isCancelable<boolean> - event can be canceled - default is false
     * @param isComposed<boolean> - event is composed - default is false
     * @param eventData<JSON> - (Optional) event data
     * @returns boolean
     */
    RaiseCustomEvent = (eventName:string, 
        canBubble:boolean = false, isCancelable = false, 
        isComposed = false, eventData?:{}):boolean => {
        let data = eventData ? eventData : {}; 
        let customEvent = new CustomEvent(eventName, {detail:data, bubbles:canBubble, 
            cancelable:isCancelable, composed:isComposed});
        return this.dispatchEvent(customEvent);
    }

    /**
     * Find element by id and start node of bbelement
     */
    public FindElementByIdAndStartNode = (id, startNode) => {
        if (typeof startNode.getElementById == "function") {
            return startNode.getElementById(id);
        } else {
            return this.FindElementByIdAndStartNode(id, startNode.parentNode);
        }
    }

    /**
     * Find target element by id of bbelement
     */
    public FindTargetElementByID = (id) => {
        // find target container
        let target = document.getElementById(id);
        // if target not found then it could be that it is inside another web component
        // try to find the root shadowdom
        if (!target) {
            target = this.FindElementByIdAndStartNode(id, this.parentNode);
        }
        return target;
    }

    /**
     * Finds child element by id. It uses shadowRoot to find child element
     */
    public FindChildElementByID = (id) => {
        // find target container
        return this.shadowRoot.getElementById(id);
    }

    public AttachCSSFromList = (cssList: string[]) => {
        cssList.forEach(entry => {
            this.AttachCSS(entry.trim());
        });
    }

    public AttachCSS = (cssFileName: string) => {
        // check if CSS file is already attached
        let cssLinks = Array.from(this.shadowRoot.querySelectorAll('link'));
        let existingCSSLink = cssLinks.find(cssLink => cssLink.href == cssFileName);
        if (!existingCSSLink) {
            let link = HTMLElementFactory.GetHTMLElement('link');
            link.setAttribute('rel', 'stylesheet prerender');
            link.setAttribute('href', cssFileName);
            link.setAttribute('type', 'text/css');
            this.shadowRoot.appendChild(link);
        }
    }

    public get StylesMapping() {
        return ElementStyles;
    }

    private attachCSSFromConfig = () => {
        this.AttachCSS(config.MainCSSPath);
        this.AttachCSS(config.IconCSS.path);
        if (config.CustomCSS.length > 0) {
            this.AttachCSSFromList(config.CustomCSS);
        }
    }
}
