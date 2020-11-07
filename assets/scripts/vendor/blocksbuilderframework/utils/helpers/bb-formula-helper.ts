/// <reference path="../../models/enums/bb-enums.ts" />
/// <reference path="../../models/block/bb-blockmodel.ts" />

import { ItemAttributeTypeEnum } from "./../../models/enums/bb-enums";
import { IFormula, IFormulaItem } from "../../models/block/bb-blockmodel";

export class BBFormulaHelper {
    private constructor() {

    }

    /**
     * Applies formula attribute to child elements. Supply shadowDOM or parentElement to apply formulas
     */
    public static ApplyFormula = (formula: IFormula, shadowDOM?: ShadowRoot,
        parentElement?: Element) => {

        const containerElement = shadowDOM ? shadowDOM : (parentElement ? parentElement : null);

        if (formula.Items && containerElement) {
            formula.Items.forEach((item: IFormulaItem) => {
                const element = containerElement.querySelector(`#${item.ID}`);
                //const element: HTMLInputElement = <HTMLInputElement>shadowDOM.getElementById(item.ID);
                if (element) {
                    // set observers on subjects
                    element.setAttribute("data-observers", JSON.stringify(formula.Target));
                    // add formula type data attribute
                    // for example 'data-formula'
                    element.setAttribute("data-formula", formula.Type);
                    // check if ContainerType attribute available
                    if (item.ContainerType) element.setAttribute("data-containertype", item.ContainerType);
                }
            });
        }

        if (formula.Target && containerElement) {
            // add subjects for observers to watch
            formula.Target.forEach(targetFormulaItem => {
                const targetElement:HTMLElement = containerElement.querySelector(`#${targetFormulaItem.ID}`);
                //const targetElement = shadowDOM.getElementById(targetFormulaItem.ID);
                targetElement.setAttribute("data-subjects", JSON.stringify(formula.Items));
                // check if ContainerType attribute available
                if (targetFormulaItem.ContainerType) targetElement.setAttribute("data-containertype", targetFormulaItem.ContainerType);
                targetElement.style.cssFloat = "right";
                targetElement.style.textAlign = "right";
            });
        }
    }

    public static RunFormula = (source: Element) => {
        const formulaType = source.getAttribute("data-formula");
        const observers = BBFormulaHelper.getObservers(source);
        if (formulaType === "sum") {
            BBFormulaHelper.sum(observers, source);
        }
    }

    private static getObservers = (source: Element): IFormulaItem[] => {
        return JSON.parse(source.getAttribute("data-observers"));
    }

    private static getSubjects = (source: Element): IFormulaItem[] => {
        return JSON.parse(source.getAttribute("data-subjects"));
    }

    private static containerProvider = {
        ["row"]:(element:Element):Node => { return element.parentNode.parentNode.parentNode.parentNode;},
        ["shadow"]:(element:Element):Node => { return element.getRootNode();},
    }

    private static getContainer = (element:Element):Node => {
        // check if element has attribute "ContainerType"
        // if not then set containerType as shadowRoot;
        const containerElementType:string = element.hasAttribute("data-containertype") ? 
            element.getAttribute("data-containertype").toLowerCase() : "shadow";
        return BBFormulaHelper.containerProvider[containerElementType](element);
    }

    private static getChildElementFromRoot = (shadowRoot:ShadowRoot, elementId:string):HTMLInputElement => {
        return shadowRoot.getElementById(elementId) as HTMLInputElement;        
    }

    private static getChildElementFromRow = (row:HTMLTableRowElement, elementId:string):HTMLInputElement => {
        let foundElement;
        try {
            foundElement = Array.from(row.querySelectorAll(".dataelement")).find(a => a.id == elementId);
        } catch {
            
        }
        return foundElement;
    }

    private static sum = (observers: IFormulaItem[], source: Element) => {
        const containerElementType:string = source.hasAttribute("data-containertype") ? 
            source.getAttribute("data-containertype").toLowerCase() : "shadow";
        const containerElement = BBFormulaHelper.getContainer(source);
        const shadowRoot = <ShadowRoot>source.getRootNode();
        const thousandsSeparatorAttribute = source.getAttribute(ItemAttributeTypeEnum.thousandseparator);
        const hasThousandSeparator = thousandsSeparatorAttribute ?
            thousandsSeparatorAttribute.BBToBoolean() : false;
        const decimalsAttribute = source.getAttribute(ItemAttributeTypeEnum.decimals);
        const decimalDigits = decimalsAttribute ? decimalsAttribute : "0";

        // list of subjects
        let subjects: IFormulaItem[] = [];
        // loop thru the observers 
        observers.forEach((targetFormulaItem: IFormulaItem) => {
            let targetElement: Element;
            if (containerElementType == "row") {
                targetElement = BBFormulaHelper.getChildElementFromRow(containerElement as HTMLTableRowElement, targetFormulaItem.ID);
            } else {
                targetElement = BBFormulaHelper.getChildElementFromRoot(shadowRoot, targetFormulaItem.ID);
            }
            // get subjects
            if (subjects.length == 0) {
                // get list of subjects from first observer
                subjects = BBFormulaHelper.getSubjects(targetElement);
            }
            let allSubjectTotal = 0;
            subjects.forEach(subject => {
                let subjectElement:HTMLInputElement;
                if (containerElementType == "row") {
                    subjectElement = BBFormulaHelper.getChildElementFromRow(containerElement as HTMLTableRowElement, subject.ID);
                } else {
                    subjectElement = BBFormulaHelper.getChildElementFromRoot(shadowRoot, subject.ID);
                }
                // const subjectElement: HTMLInputElement = containerElement.querySelector(`#${subject.ID}`); // .getElementById(targetFormulaItem.ID);
                allSubjectTotal += subjectElement.value.BBToNumber();
                //allSubjectTotal += (<HTMLInputElement>shadowRoot.getElementById(subject.ID)).value.BBToNumber();
            });
            let totalValue = allSubjectTotal.toString().BBFormatAsNumber(decimalDigits);
            totalValue = hasThousandSeparator ? totalValue.BBThousandsSeparator() : totalValue;
            targetElement.BBSetDataItemValue(totalValue);
            targetElement.BBSetDataModifiedAttribute();
        });
    }
}