import { IFormula } from '../../models/block/bb-blockmodel';
import { ItemAttributeTypeEnum, ControlAttributeTypeEnum, CommonAttributesEnum } from '../../models/enums/bb-enums';
import { BBFormulaHelper } from './bb-formula-helper';
import { IAttribute } from '../../models/attribute/common/bb-attributesmodel';
import { BBConfig } from '../../bbconfig';
import { BBElementRegistryHelper } from './bb-elementregistry-helper';
import { Common } from './bb-common-helper';

export class BBAttributeHelper {
    private constructor() {

    }

    private static attributesToIgnore = Object.keys(ItemAttributeTypeEnum);

    public static async ApplyAttribute(attribute:IAttribute, element:Element, shadowDOM?:ShadowRoot) {
        const attributeName = attribute.Name.toLowerCase();  

        attributeName == ItemAttributeTypeEnum.formula ? (() => {
            // apply formula attribute
            const attributeData: IFormula = typeof attribute.Value == 'object' ? 
                attribute.Value :
                JSON.parse(attribute.Value);
            // check if element is not null, if yes then formula needs to be applied 
            // to child elements of the supplied element  
            // shadowDOM should not be available if element is supplied
            BBFormulaHelper.ApplyFormula(attributeData, shadowDOM, element);
        })() : 
        attributeName == "class" ? (() => {
            const classesToAdd = attribute.Value.split(" ");
            classesToAdd.forEach(classToAdd => {
                element.classList.add(classToAdd);
            });
        })() : 
        (element.nodeName.toLowerCase() != "th" && 
            element.nodeName.toLowerCase() != "td" && 
            attributeName == ItemAttributeTypeEnum.thousandseparator) ||
        (element.nodeName.toLowerCase() != "th" && 
            element.nodeName.toLowerCase() != "td" &&
            attributeName == ItemAttributeTypeEnum.decimals) ? (() => {
            element.setAttribute(attribute.Name, attribute.Value);
            (<HTMLElement>element).style.cssFloat = "right";
        })() : 
        (attributeName == ItemAttributeTypeEnum.datestr && 
            element.nodeName.toLowerCase() != "th") ? (() => {
            const formattedDateValue =  Common.FormatDateValue(element.BBGetDataItemValue(), 
                BBConfig.Localization.DateFormatDisplay, 
                BBConfig.Localization.DateFormatTransform);
            element.BBSetDataItemValue(formattedDateValue);
        })() :
        (element.nodeName.toLowerCase() != "th" && 
            attributeName == ItemAttributeTypeEnum.defaultvalue) ? (async () => {
                if (attribute.Value != CommonAttributesEnum.rowno) {
                    const format = element.getAttribute(ItemAttributeTypeEnum.format);
                    const defaultValue = await BBElementRegistryHelper.GetSourceValue(element, attribute.Value, null, format);
                    element.BBSetDataItemValue(defaultValue);
                }
        })() :
        element?.setAttributeNS(null, attribute.Name, attribute.Value);
    }

    public static ApplyAttributes(attributes: IAttribute[], 
        element?: Element, shadowDOM?: ShadowRoot) {
        if (attributes) {
            // apply only HTML attributes. Ignore custom ItemAttributes
            // but allow below attributes to be applied on enement
            const attributesToApply = attributes.filter(attr => 
                !BBAttributeHelper.attributesToIgnore.find(a => a.toLowerCase() == attr.Name.toLowerCase() &&
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.defaultvalue && 
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.thousandseparator && 
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.decimals &&
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.formula &&
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.static &&
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.format &&
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.storedpropname &&
                    attr.Name.toLowerCase() != ItemAttributeTypeEnum.datestr));
            // loop through HTML attributes and apply
            attributesToApply.forEach((attribute: IAttribute) => {
                // apply attribute
                BBAttributeHelper.ApplyAttribute(attribute, element, shadowDOM);
            });
        }
    }

    public static GetAttribute = (attributeType:string, attributes:IAttribute[]):IAttribute => {
        return (attributes ? attributes.find(attr =>
            attr.Name.toLowerCase() == attributeType.toLowerCase()) : null);
    }

    public static GetAttributes = (attributeType:string, attributes:IAttribute[]):IAttribute[] => {
        return (attributes ? attributes.filter(attr =>
            attr.Name.toLowerCase() == attributeType.toLowerCase()) : null);
    }

    /**
     * Get value of an attribute
     */
    public static GetAttributeValue = (attributeType,
        attributes: IAttribute[]) => {
        if (!attributes) return "";
        const foundAttribute = BBAttributeHelper.GetAttribute(attributeType, attributes);
        return foundAttribute ? foundAttribute.Value : "";
    }

    public static HasAttribute = (attributeType:string, attributes: IAttribute[]):boolean => {
        const hasAttribute = BBAttributeHelper.GetAttribute(attributeType, attributes);
        return hasAttribute ? true : false;
    }

    public static CheckIfEnabled = (attribute:IAttribute):boolean => {
        return attribute ? attribute.Value.BBToBoolean() : false;
    }

    public static GetTargetContainerId = (attributes:IAttribute[]):string => {
        return BBAttributeHelper.GetAttributeValue(
            ControlAttributeTypeEnum.targetcontainerid, attributes);
    }
}