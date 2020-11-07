/// <reference path="./../../../models/element/bb-elementoptions.ts" />

import { ElementOptions, ISelectOption } from "../../../models/element/bb-elementoptions";

export class HTMLElementFactory {
    private constructor() {

    }

    public static GetHTMLElement = (tagName: string, options?: ElementOptions) => {
        let element = document.createElement(tagName);
        if (options != undefined) {
            HTMLElementFactory.setOptions(element, options);
        }
        return element;
    }
    public static AddFieldSet = (options?: ElementOptions) => {
        const fieldSet = HTMLElementFactory.GetHTMLElement("fieldset");
        if (options.legend != undefined) {
            let legendElement = HTMLElementFactory.GetHTMLElement('legend', 
            {
                textContent: options.legend, className: options.className
            });
            fieldSet.appendChild(legendElement);
        }
        return fieldSet;
    }
    public static AddTable = (options?: ElementOptions) => {
        const bbTable = <HTMLTableElement>HTMLElementFactory.GetHTMLElement('table');

        if (options != undefined) {
            HTMLElementFactory.setOptions(bbTable, options);
        }

        // const bbTHead = <HTMLTableSectionElement>HTMLElementFactory.AddTHead();
        // const bbTBody = <HTMLTableSectionElement>HTMLElementFactory.AddTBody();
        // const bbTFoot = <HTMLTableSectionElement>HTMLElementFactory.AddTFoot();

        //bbTable.tHead = bbTHead;
        bbTable.createTHead();
        bbTable.createTBody();
        bbTable.createTFoot();
        // bbTable.tFoot = bbTFoot;
        return bbTable;
    }
    public static AddTHead = () => {
        return HTMLElementFactory.GetHTMLElement('thead');
    }
    public static AddTFoot = () => {
        return HTMLElementFactory.GetHTMLElement('tfoot');
    }
    public static AddTBody = () => {
        return HTMLElementFactory.GetHTMLElement('tbody');
    }
    public static AddTR = (): HTMLTableRowElement => {
        return <HTMLTableRowElement>HTMLElementFactory.GetHTMLElement('tr');
    }
    public static AddTH = (): HTMLTableHeaderCellElement => {
        return <HTMLTableHeaderCellElement>HTMLElementFactory.GetHTMLElement('th');
    }
    public static AddTD = (): HTMLTableCellElement => {
        return <HTMLTableCellElement>HTMLElementFactory.GetHTMLElement('td');
    }

    public static AddInput = (options?: ElementOptions) => {
        return <HTMLInputElement>HTMLElementFactory.GetHTMLElement('input', options);
    }

    public static AddAnchor = (options?: ElementOptions): HTMLAnchorElement => {
        return <HTMLAnchorElement>HTMLElementFactory.GetHTMLElement('a', options);
    }
    public static AddButton = (options?: ElementOptions) => {
        return <HTMLButtonElement>HTMLElementFactory.GetHTMLElement('button', options);
    }
    public static AddLabel = (options?: ElementOptions) => {
        return <HTMLLabelElement>HTMLElementFactory.GetHTMLElement('label', options);
    }
    public static AddCheckbox = (options?: ElementOptions) => {
        let element = <HTMLInputElement>HTMLElementFactory.GetHTMLElement('input', options);
        element.type = 'checkbox';
        return element;
    }
    public static AddRadio = (options?: ElementOptions) => {
        let element = <HTMLInputElement>HTMLElementFactory.GetHTMLElement('input', options);
        element.type = 'radio';
        return element;
    }
    public static AddTextArea = (options?: ElementOptions) => {
        let element = <HTMLTextAreaElement>HTMLElementFactory.GetHTMLElement('textarea', options);
        return element;
    }
    public static AddSelect = (options?: ElementOptions) => {
        let selectDiv = HTMLElementFactory.AddDiv({ className: options.className });
        let select = <HTMLSelectElement>HTMLElementFactory.GetHTMLElement('select');
        if (options.id) {
            select.id = options.id;
        }
        if (options.selectOptions) {
            options.selectOptions.forEach((option: ISelectOption) => {
                let selectOption = <HTMLOptionElement>HTMLElementFactory.GetHTMLElement('option');
                selectOption.value = option.Value;
                selectOption.text = option.DisplayValue;
                select.appendChild(selectOption);
            });
            let selectedValue = options.selectOptions.find(option => option.Selected == true);
            if (selectedValue != undefined) {
                select.BBSetSelectedValue(selectedValue.Value);
            }
        }
        selectDiv.appendChild(select);
        return selectDiv;
    }
    public static AddDiv = (options?: ElementOptions) => {
        return <HTMLDivElement>HTMLElementFactory.GetHTMLElement('div', options);
    }
    public static AddFigure = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('figure', options);
    }
    public static AddParagraph = (options?: ElementOptions): HTMLParagraphElement => {
        return <HTMLParagraphElement>HTMLElementFactory.GetHTMLElement('p', options);
    }
    public static AddNav = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('nav', options)
    }
    public static AddImage = (options?: ElementOptions): HTMLImageElement => {
        return <HTMLImageElement>HTMLElementFactory.GetHTMLElement('img', options);
    }
    public static AddHeader = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('header', options);
    }
    public static AddFooter = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('footer', options);
    }
    public static AddI = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('i', options);
    }
    public static AddHeading = (headingLevel: number, options?: ElementOptions): HTMLHeadingElement => {
        let headingTag = `h${(headingLevel ? headingLevel.toString() : '1')}`;
        let element = <HTMLHeadingElement> HTMLElementFactory.GetHTMLElement(headingTag, options);
        return element;
    }
    public static AddSpan = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('span', options);
    }
    public static AddAside = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('aside', options);
    }
    public static AddArticle = (options?: ElementOptions) => {
        return HTMLElementFactory.GetHTMLElement('article', options);
    }
    public static AddUL = (options?: ElementOptions): HTMLUListElement => {
        return <HTMLUListElement>HTMLElementFactory.GetHTMLElement('ul', options);
    }
    public static AddLI = (options?: ElementOptions): HTMLLIElement => {
        return <HTMLLIElement>HTMLElementFactory.GetHTMLElement('li', options);
    }
    public static AddForm = (options?: ElementOptions): HTMLFormElement => {
        return <HTMLFormElement>HTMLElementFactory.GetHTMLElement('form', options);
    }
    public static AddSection = (options?: ElementOptions): HTMLElement => {
        return <HTMLElement>HTMLElementFactory.GetHTMLElement('section', options);
    }

    public static AttachCSSFromList = (element:Element, cssList: {"fileName": string, "media": string}[]) => {
        cssList.forEach(entry => {
            HTMLElementFactory.AttachCSS(element, entry);
        });
    }

    public static AttachCSS = (element:Element, cssFile: {"fileName": string, "media": string}) => {
        // check if CSS file is already attached
        let cssLinks = Array.from(element.querySelectorAll('link'));
        let existingCSSLink = cssLinks.find(cssLink => cssLink.href == cssFile.fileName);
        if (!existingCSSLink) {
            let link = HTMLElementFactory.GetHTMLElement('link');
            link.setAttribute('rel', 'stylesheet prerender');
            link.setAttribute('href', cssFile.fileName);
            link.setAttribute('type', 'text/css');
            cssFile.media && link.setAttribute('media', cssFile.media);
            element.shadowRoot.appendChild(link);
        }
    }

    private static setOptions(element, options: ElementOptions) {
        if (options.id != undefined) element.id = options.id;
        if (options.href != undefined && options.href) element.href = options.href;
        if (options.target != undefined) element.target = options.target;
        if (options.labelFor != undefined) element.labelFor = options.labelFor;
        if (options.title != undefined) element.title = options.title;
        if (options.className != undefined) element.className = options.className;
        if (options.type != undefined) element.type = options.type;
        if (options.src != undefined) element.src = options.src;
        if (options.alt != undefined) (<Element>element).setAttribute('alt', options.alt);
        if (options.display != undefined) (<HTMLElement>element).style.display = options.display;
        if (options.visibility != undefined) (<HTMLElement>element).style.visibility = options.visibility;
        if (options.style != undefined) (<Element>element).setAttribute('style', options.style);
        if (options.value != undefined) (<Element>element).setAttribute('value', options.value);
        if (options.placeHolder != undefined) (<Element>element).setAttribute('placeholder', options.placeHolder);
        if (options.textContent != undefined) element.textContent = options.textContent;
        if (options.checked != undefined) element.checked = options.checked;
    }
}
