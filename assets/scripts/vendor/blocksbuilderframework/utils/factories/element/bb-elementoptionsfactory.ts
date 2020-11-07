import { IItem } from "../../../models/block/bb-blockmodel";
import { BBElementFactory, ElementArgsEnum } from "./bb-elementfactory";
import { FormControlStyles } from "../../../models/common/bb-styles";
import { ElementOptions, ISelectOption } from "../../../models/element/bb-elementoptions";
import { BBAttributeHelper } from "../../helpers/bb-attribute-helper";
import { ItemAttributeTypeEnum, ItemTypeEnum } from "../../../models/enums/bb-enums";
import { Common } from "../../helpers/bb-common-helper";
import { BBConfig } from "../../../bbconfig";

export class BBElementOptionsFactory {
    public static GetElementOptions = {
        [ItemTypeEnum.text]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getInputElementOptions(item); },
        [ItemTypeEnum.date]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getInputElementOptions(item); },
        [ItemTypeEnum.tel]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getInputElementOptions(item); },
        [ItemTypeEnum.password]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getInputElementOptions(item); },
        [ItemTypeEnum.email]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getInputElementOptions(item); },
        [ItemTypeEnum.file]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getInputElementOptions(item); },
        [ItemTypeEnum.number]: (item: IItem) => { return BBElementOptionsFactory.getNumberInputElementOptions(item); },
        [ItemTypeEnum.checkbox]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getCheckboxElementOptions(item); },
        [ItemTypeEnum.radio]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getRadioElementOptions(item); },
        [ItemTypeEnum.link]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getLinkElementOptions(item, elementArgs); },
        [ItemTypeEnum.select]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getSelectElementOptions(item); },
        [ItemTypeEnum.textarea]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getTextAreaElementOptions(item); },
        [ItemTypeEnum.button]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getButtonElementOptions(item); },
        [ItemTypeEnum.label]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getLabelElementOptions(item); },
        [ItemTypeEnum.span]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getSpanElementOptions(item); },
        [ItemTypeEnum.img]: (item: IItem, elementArgs?: {}) => { return BBElementOptionsFactory.getImageElementOptions(item); },
    };

    /**
     * Get options for Input Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getInputElementOptions = (item: IItem): ElementOptions => {
        let itemValue = BBElementFactory.GetItemValueAsString(item);

        return {
            className: FormControlStyles.GetInputClassName(item.Type),
            type: item.Type,
            id: item.ID,
            value: itemValue,
            placeHolder: item.Title,
            title: item.Title ? item.Title : itemValue
        }
    }

    /**
     * Get options for Number Input Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getNumberInputElementOptions = (item: IItem): ElementOptions => {
        // get thousandseparator attribute
        const thousandsSeparatorAttribute =
            BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.thousandseparator,
                item.Attributes);
        const hasThousandSeparator = thousandsSeparatorAttribute ?
            thousandsSeparatorAttribute.Value.BBToBoolean() : false;
        const itemValue = BBElementFactory.GetItemValueAsString(item);
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.className = FormControlStyles.GetInputClassName(item.Type),
            elementOptions.value = hasThousandSeparator ? itemValue.BBThousandsSeparator() : itemValue;
        elementOptions.style = "text-align: right";
        return elementOptions;
    }

    /**
     * Get options for Anchor
     * @param   item            BBItem
     * @param   elementArgs     Additional arguments
     * @returns elementOptions  ElementOptions
     */
    private static getLinkElementOptions = (item: IItem, elementArgs?: {}): ElementOptions => {
        const elementClassName = elementArgs && elementArgs.hasOwnProperty(ElementArgsEnum.classname) ?
            elementArgs[ElementArgsEnum.classname] :
            FormControlStyles.LinkClassName;
        const itemValue = BBElementFactory.GetItemValueAsString(item);
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);

        elementOptions.className = elementClassName,
            elementOptions.href = itemValue;
        elementOptions.textContent = item.Title ? item.Title : itemValue;
        elementOptions.placeHolder = undefined;
        return elementOptions;
    }

    /**
     * Get options for Checkbox Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getCheckboxElementOptions = (item: IItem): ElementOptions => {
        const itemValue = BBElementFactory.GetItemValueAsString(item)?.toString().BBToBoolean();
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.className = FormControlStyles.CheckboxClassName,
            elementOptions.textContent = item.Title;
        elementOptions.checked = itemValue;
        return elementOptions;
    }

    /**
     * Get options for Radio button Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getRadioElementOptions = (item: IItem): ElementOptions => {
        const itemValue = BBElementFactory.GetItemValueAsString(item).BBToBoolean();
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.className = FormControlStyles.RadioClassName,
            elementOptions.textContent = item.Title;
        elementOptions.checked = itemValue;
        return elementOptions;
    }

    /**
     * Get options for Select Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getSelectElementOptions = (item: IItem): ElementOptions => {
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.className = FormControlStyles.SelectClassName;
        // get item value
        const isURL = Common.IsValidURL(item.Value);
        // check if itemValue is URL
        isURL ? (async () => {
            elementOptions.selectOptions = <ISelectOption[]> await Common.FetchJSON(item.Value);
        })() :
            elementOptions.selectOptions = BBElementFactory.GetItemValue(item).Options;    
        //elementOptions.selectOptions = BBElementFactory.GetItemValue(item).Options;
        return elementOptions;
    }

    /**
     * Get options for TextArea Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getTextAreaElementOptions = (item: IItem): ElementOptions => {
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        const itemValue = BBElementFactory.GetItemValue(item);
        elementOptions.className = FormControlStyles.TextAreaClassName;
        elementOptions.textContent = itemValue ? itemValue.Value : "";
        elementOptions["type"] = undefined;
        return elementOptions;
    }

    /**
     * Get options for Button Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getButtonElementOptions = (item: IItem): ElementOptions => {
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.className = FormControlStyles.ButtonClassName;
        elementOptions.textContent = item.Title;
        return elementOptions;
    }

    /**
     * Get options for Label Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getLabelElementOptions = (item: IItem): ElementOptions => {
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.className = FormControlStyles.LabelClassName;
        elementOptions.textContent = BBElementFactory.GetItemValueAsString(item);
        return elementOptions;
    }

    /**
     * Get options for Span Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getSpanElementOptions = (item: IItem): ElementOptions => {
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.textContent = BBElementFactory.GetItemValueAsString(item);
        const decimalsAttribute = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.decimals, item.Attributes);
        decimalsAttribute && (() => {
            elementOptions.textContent = elementOptions?.textContent?.toString().BBFormatAsNumber((decimalsAttribute.Value || "2"));
            const hasThousandSeparator = BBAttributeHelper.GetAttributeValue(
                ItemAttributeTypeEnum.thousandseparator, item.Attributes).BBToBoolean();
            elementOptions.textContent = hasThousandSeparator ?
                elementOptions.textContent.BBThousandsSeparator() : elementOptions.textContent;
        })();

        // item.Value && BBAttributeHelper.HasAttribute(ItemAttributeTypeEnum.datestr, item?.Attributes) && (() => {
        //     elementOptions.textContent = Common.FormatValue(item.Value, 
        //         BBConfig.Localization.DateFormatDisplay, 
        //         BBConfig.Localization.DateFormatTransform);
        // })();
       
        return elementOptions;
    }

    /**
     * Get options for Image (img) Element
     * @param   item            BBItem
     * @returns elementOptions  ElementOptions
     */
    private static getImageElementOptions = (item: IItem): ElementOptions => {
        const elementOptions = BBElementOptionsFactory.getInputElementOptions(item);
        elementOptions.className = FormControlStyles.ImageClassName;
        return elementOptions;
    }    
}