/// <reference path="../../../bbconfig.ts" />
/// <reference path="../../extensions.ts" />

/// <reference path="../../../models/element/bb-elementoptions.ts" />
/// <reference path="../../../models/enums/bb-enums.ts" />
/// <reference path="../../../models/common/bb-styles.ts" />

/// <reference path="../../../models/enums/bb-enums.ts" />
/// <reference path="../../../models/block/bb-blockmodel.ts" />

/// <reference path="../../helpers/bb-common-helper.ts" />
/// <reference path="../../helpers/bb-formula-helper.ts" />
/// <reference path="../html/bb-htmlfactory.ts" />

import { BBConfig, BBConfig as config } from "../../../bbconfig";
import "../../extensions";

import { ElementOptions } from "../../../models/element/bb-elementoptions";
import { ItemAttributeTypeEnum, InputLabelStyleEnum, ElementEventsEnum, CommonAttributesEnum, InputLabelPositionEnum } from "../../../models/enums/bb-enums";
import { NavbarStyles, FormControlStyles, HeaderControlStyles, FormStyles, GlobalStyles, StepsStyles, ColumnsStyles }
    from "../../../models/common/bb-styles";
import {
    NavbarDirection, ItemTypeEnum, BlockTypeEnum
} from "../../../models/enums/bb-enums";

import { IBlock, IItem, IItemValue, IBBItem }
    from "../../../models/block/bb-blockmodel";

import { Common } from "../../helpers/bb-common-helper";
import { HTMLElementFactory } from "../html/bb-htmlfactory";
import { BBAttributeHelper } from '../../helpers/bb-attribute-helper';
import { IAttribute } from '../../../models/attribute/common/bb-attributesmodel';
import BlocksBuilder from '../builder/bb-builderfactory';
import { ActionTriggerEnum, IAction } from '../../../models/action/bb-actionmodel';
import { BBTriggerHandler } from '../action/factories/bb-triggerhandler';
import { BBElementOptionsFactory } from "./bb-elementoptionsfactory";

class ItemMetaData {
    item: IItem;
    elementOptions: ElementOptions;
    elementContainerClass: string;
    isItemRequired: boolean;
    isIconEnabled: boolean;
    iconClass: string;
    iconName: string;
    itemValue: IItemValue;
    decimalDigits: string;
    hasThousandSeparator: boolean;
    nolabel: boolean;
    hideInputLabel: boolean;
    inputLabelStyle: string;
    inputLabelSize: string;
    inputLabelPosition: string;
    style: string;
    dataModel: string;
    rowId: string;
    rowNo:string;
    containerId: string;
    rootId: string;
    ownerId: string;
}

export enum ElementArgsEnum {
    blocktype = "blocktype",
    classname = "classname",
    containerclassname = "containerclassname",
    hasicon = "hasicon",
    nolabel = "nolabel",
    hideinputlabel = "hideinputlabel",
    inputlabelstyle = "inputlabelstyle",
    inputlabelsize = "inputlabelsize",
    inputlabelposition = "inputlabelposition",
    style = "style",
    datamodel = "datamodel"
}

export class BBElementFactory {
    private constructor() {

    }

    //#region [rgba(0, 205, 30,0.1)] Private methods
    private static getElementIconClassName = {
        [BlockTypeEnum.appnavbar]: NavbarStyles.NavAnchorWithIconClassName
    }

    private static GetBBBlockItem = {
        [ItemTypeEnum.text]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBInput(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.date]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBInput(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.tel]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBInput(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.password]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBInput(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.email]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBInput(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.file]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBInput(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.number]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBNumberInput(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.checkbox]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBCheckbox(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.radio]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBRadio(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.link]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBAnchor(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.select]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBSelect(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.textarea]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBTextArea(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.button]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBButton(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.label]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBLabel(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.span]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBSpan(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.img]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetBBImage(BBElementFactory.getItemMetaData(item, elementArgs)); },
        [ItemTypeEnum.rowblock]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetRowBlock(item, elementArgs); },
        [ItemTypeEnum.colblock]: (item: IItem, elementArgs?: {}): IBBItem => { return BBElementFactory.GetColBlock(item, elementArgs); },
        [ItemTypeEnum.block]: async (item: IItem, elementArgs?: {}): Promise<IBBItem> => { return await BBElementFactory.GetBlock(item, elementArgs); },
    };

    private static addNavbarItems = (parentElement: HTMLElement, block: IBlock) => {
        const items: IItem[] = block.Items;
        const childItems: HTMLElement[] = [];
        items?.forEach((item: IItem) => {
            // check if Icon attribute is enabled
            const iconAttribute: IAttribute = BBElementFactory.getIconAttribute(item.Attributes);
            const iconClassName: IAttribute = BBElementFactory.getIconClassAttribute(item.Attributes);
            // if dropdown menu
            if (item.Type == ItemTypeEnum.block) {
                const subMenuBlock: IBlock = <IBlock>item.Value;

                const dropdownDiv = HTMLElementFactory.AddDiv({
                    className: NavbarStyles.NavDropDownDivClassName
                });

                const anchorItem: IItem = {
                    ID: subMenuBlock.ID,
                    Title: subMenuBlock.Title,
                    Type: ItemTypeEnum.link
                }

                const itemMetadata: ItemMetaData = BBElementFactory.getItemMetaData(anchorItem);
                itemMetadata.elementOptions.className = NavbarStyles.NavItemClassName;
                itemMetadata.isIconEnabled = iconAttribute && true;
                itemMetadata.iconClass = iconAttribute && iconClassName.Value;
                itemMetadata.iconName = iconAttribute && iconAttribute.Value;
                const anchor = <HTMLAnchorElement>BBElementFactory.GetBBAnchor(itemMetadata).Item;

                dropdownDiv.appendChild(anchor);
                childItems.push(dropdownDiv);
                parentElement.appendChild(dropdownDiv);

                if (item.Attributes &&
                    item.Attributes.find(attribute => attribute.Name == "menu-style")) {
                    const menuStyleAttr = item.Attributes.find(attribute =>
                        attribute.Name == "menu-style");
                    if (menuStyleAttr.Value == "mobile") {
                        dropdownDiv.style.display = "none";
                        dropdownDiv.classList.add("mobile-only");
                    }
                }

                BBAttributeHelper.ApplyAttributes(item.Attributes, anchor);
                // add dropdown items div
                const dropdownItemsDiv = HTMLElementFactory.AddDiv({
                    className: NavbarStyles.NavDropDownItemsDivClassName
                });
                dropdownDiv.appendChild(dropdownItemsDiv);
                BBElementFactory.addNavbarItems(dropdownItemsDiv, subMenuBlock);
            } else {
                // add navbar items
                const elementArgs = {
                    [ElementArgsEnum.classname]: NavbarStyles.NavItemClassName,
                    [ElementArgsEnum.blocktype]: BlockTypeEnum.appnavbar,
                    [ElementArgsEnum.containerclassname]: NavbarStyles.NavItemClassName,
                    [ElementArgsEnum.hideinputlabel]: true
                };
                const anchor = BBElementFactory.GetBBItem(item, elementArgs);
                parentElement.appendChild(anchor);
            }
        });
    }

    /**
     * Get icon attribute of bbelement helper
     */
    private static getIconAttribute = (attributes: IAttribute[]): IAttribute => {
        const iconEnabledAttr = BBAttributeHelper.GetAttribute(
            ItemAttributeTypeEnum.icon,
            attributes);
        return iconEnabledAttr;
    }

    /**
     * Determines whether icon is enabled
     */
    private static isIconEnabled = (item: IItem, elementArgs?: {}): boolean => {
        let hasIcon: boolean = false;
        if (item.Attributes && item.Attributes.length > 0)
            hasIcon = item.Attributes.some((attribute: IAttribute) => {
                return (attribute.Name.toLowerCase() == ItemAttributeTypeEnum.icon);
            });
        if (!hasIcon && (elementArgs && elementArgs.hasOwnProperty(ElementArgsEnum.hasicon))) {
            hasIcon = elementArgs[ElementArgsEnum.hasicon];
        }
        return hasIcon;

    }

    /**
     * Get input icon of bbelement helper
     */
    private static getInputIcon = (attributes: IAttribute[]) => {
        let iconAttr: IAttribute;
        if (attributes) {
            iconAttr = attributes.find((attribute: IAttribute) => {
                return attribute.Name.toLowerCase() == ItemAttributeTypeEnum.icon;
            });
        }
        return iconAttr ? iconAttr.Value : config.IconCSS.inputIcon;

    }

    /**
     * Get icon class attribute of bbelement helper
     */
    private static getIconClassAttribute = (attributes: IAttribute[]): IAttribute => {
        return BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.iconclass, attributes);
    }

    /**
     * Get input icon class of bbelement helper
     */
    private static getInputIconClass = (attributes: IAttribute[], elementArgs?: {}) => {
        // let inputIconClass;

        // check if icon class attribute is available, if yes then overwrite icon class from icon class attribute
        const iconClassAttribute = BBElementFactory.getIconClassAttribute(attributes);

        // check if block type is supplied in elementArgs
        // if yes then get icon class suitable for the block type
        const blockType = elementArgs?.hasOwnProperty(ElementArgsEnum.blocktype) &&
            elementArgs[ElementArgsEnum.blocktype];

        const inputIconClass = iconClassAttribute ? iconClassAttribute.Value :
            (blockType && (BBElementFactory.getElementIconClassName.hasOwnProperty(blockType) &&
                BBElementFactory.getElementIconClassName[blockType]));
        return (inputIconClass || config.IconCSS.inputIconClass);
    }

    /**
     * Get icon container class of bbelement helper
     */
    private static getIconContainerClass = () => {
        return config.IconCSS.iconDivClass;
    }

    /**
     * Determines whether required attribute is available
     */
    private static isRequired = (attributes: IAttribute[]) => {
        return attributes?.find(attr => attr.Name == "required") ? true : false;
    }

    private static getItemLabel = (itemMetadata:ItemMetaData):HTMLElement => {
        let inputLabel: HTMLElement;
        (!itemMetadata.nolabel && !Common.IsButtonType(itemMetadata.item.Type)) && (() => {
            inputLabel = HTMLElementFactory.AddLabel({
                className: FormStyles.FieldLabelClassName,
                textContent: itemMetadata.item.Title,
                id: `lbl_${itemMetadata.item.ID}`
            });
            inputLabel.setAttribute("for", itemMetadata.item.ID);
            // hide label if hidden or style is showonchange
            inputLabel.style.display = itemMetadata.inputLabelStyle == InputLabelStyleEnum.showonchange ||
                itemMetadata.hideInputLabel ? "none" : "";
            inputLabel.style.fontSize = itemMetadata.inputLabelSize;
        })();
        return inputLabel;
    }

    /**
     * Get bbitem wrapper of bbelement helper
     */
    private static getBBItemWrapper = (itemMetadata: ItemMetaData, 
        elements: HTMLElement[]): Element => {
        // const styleAttribute = BBAttributeHelper.GetAttribute("style", itemMetadata.item.Attributes);
        // const mainControlDiv = HTMLElementFactory.AddDiv({
        //     className: FormStyles.ControlDivClassName,
        //     style: styleAttribute ? styleAttribute.Value : ""
        // });
        const mainControlDiv = HTMLElementFactory.AddDiv({
            className: FormStyles.ControlDivClassName
        });

        // add wrapper - check if icon is enabled and add icon div
        const wrapper = itemMetadata.isIconEnabled ?
            BBElementFactory.getElementIconDiv(itemMetadata.iconClass,
                itemMetadata.iconName, itemMetadata.elementContainerClass) :
            HTMLElementFactory.AddSpan({ className: itemMetadata.elementContainerClass });

        // add input label
        const inputLabel: HTMLElement = BBElementFactory.getItemLabel(itemMetadata);
        
        const iconSpan = wrapper.querySelector(`#iconSpan`);

        elements.forEach(element => {
            itemMetadata.isIconEnabled && iconSpan &&
                (itemMetadata.item.Type == ItemTypeEnum.button || itemMetadata.item.Type == ItemTypeEnum.link) ?
                    (() => {
                        element.textContent = "";
                        wrapper.removeChild(iconSpan);
                        element.appendChild(iconSpan);
                        itemMetadata.item.Title && 
                            element.appendChild(HTMLElementFactory.AddSpan({textContent:itemMetadata.item.Title}));
                        wrapper.classList.remove(FormStyles.ControlDivClassName);
                        wrapper.appendChild(element);
                    })() : 
                itemMetadata.isIconEnabled && iconSpan &&
                    wrapper.insertBefore(element, wrapper.querySelector('span')) ||
                    wrapper.appendChild(element);

            // itemMetadata.isIconEnabled &&
            //     wrapper.insertBefore(element, wrapper.querySelector('span')) ||
            //     wrapper.appendChild(element);

            // get element
            element = itemMetadata.item.Type == ItemTypeEnum.select ||
                itemMetadata.item.Type == ItemTypeEnum.checkbox ?
                (itemMetadata.item.Type == ItemTypeEnum.select ?
                    <HTMLElement>element.getElementsByTagName(itemMetadata.item.Type)[0] :
                    <HTMLElement>element.getElementsByTagName("input")[0]) :
                element;
            
            // check if item has display style and apply to main control div
            // if item is hidden (display=none) then need to hide main conrol div
            const styleAttribute = BBAttributeHelper.GetAttribute("style", itemMetadata.item.Attributes);
            const isItemHidden = styleAttribute?.Value.toLowerCase().replace(/ /g,'').includes("display:none");
            isItemHidden && (mainControlDiv.style.display = "none"); 
            // hide label if item is hidden
            isItemHidden && inputLabel && (inputLabel.style.display = "none");

            // apply attributes
            if (itemMetadata.item.Attributes) BBAttributeHelper.ApplyAttributes(itemMetadata.item.Attributes, element);

            // set labelid attribute
            if (!itemMetadata.hideInputLabel && !itemMetadata.nolabel &&
                itemMetadata.inputLabelStyle == InputLabelStyleEnum.showonchange)
                element.setAttribute("labelid", inputLabel.id);

            // set other important attributes that helps in finding of the element
            itemMetadata.rootId && element.setAttribute(CommonAttributesEnum.rootid, itemMetadata.rootId);
            itemMetadata.containerId && element.setAttribute(CommonAttributesEnum.containerid, itemMetadata.containerId);
            itemMetadata.ownerId && element.setAttribute(CommonAttributesEnum.ownerid, itemMetadata.ownerId);
            itemMetadata.rowNo && element.setAttribute(CommonAttributesEnum.rowno, itemMetadata.rowNo);
            itemMetadata.rowId && element.setAttribute("rowid", itemMetadata.rowId);
            element.BBSetBlockItemId(itemMetadata.item.ID);
            element.BBSetBlockItemType(itemMetadata.item.Type);
            element.BBSetBlockItemTitle(itemMetadata.item.Title || "");

            // set block-item-element class
            element.BBSetBlockItemElementClass();

            // raise bb-itemelementadded event
            const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbitememelementadded,
            {
                detail: {element:element, rootId:itemMetadata?.rootId}, 
                bubbles: true,
                cancelable: false, 
                composed: true
            });
            dispatchEvent(bbcustomEvent);

            // set data element class        
            if (element.BBExtensions().IsDataElement()) {
                element.BBExtensions().SetDataElementClass();
                // set data model
                if (itemMetadata.dataModel) element.setAttribute("datamodel", itemMetadata.dataModel);

                // raise bb-dateitemelementadded event
                const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbdataitemelementadded,
                {
                    detail: {element:element, rootId:itemMetadata?.rootId}, 
                    bubbles: true,
                    cancelable: false, 
                    composed: true
                });
                dispatchEvent(bbcustomEvent);

                // bind native onchange event
                if (!itemMetadata.item.Actions?.find(a => a.Trigger == ActionTriggerEnum.change)) {
                    const changeAction: IAction = {
                        Trigger: ActionTriggerEnum.change
                    }
                    if (!itemMetadata.item.Actions) itemMetadata.item.Actions = [];
                    itemMetadata.item.Actions.push(changeAction);
                }
            }
            // bind trigger actions
            BBTriggerHandler.Bind(itemMetadata.item, 
                [ActionTriggerEnum.blockload, ActionTriggerEnum.blocksourceload], 
                element);
        });

        // check if item is required and add element to show required field message
        itemMetadata.isItemRequired &&
            wrapper.appendChild(BBElementFactory.getRequiredElement(
                itemMetadata.elementOptions.placeHolder));
        
        // check id item has datestr attribute and add element to show invalid date message
        BBAttributeHelper.HasAttribute(ItemAttributeTypeEnum.datestr, itemMetadata.item?.Attributes) &&
            wrapper.appendChild(HTMLElementFactory.AddSpan({
                id:`P_${itemMetadata.item.ID}`,
                className: 'help is-danger',
                textContent: itemMetadata.item.Title ? `${itemMetadata.item.Title} is invalid` : 'Invalid Date',
                style: 'display:none'
            })
        )

        // set important classes to wrapper
        wrapper.BBSetBlockItemClass();
        wrapper.BBSetBlockItemId(itemMetadata.item.ID);
        wrapper.BBSetBlockItemType(itemMetadata.item.Type);
        wrapper.BBSetBlockItemTitle(itemMetadata.item.Title);
        wrapper.id = `bi_${itemMetadata.item.ID}`;
        itemMetadata.containerId && wrapper.setAttribute(CommonAttributesEnum.containerid, itemMetadata.containerId);
        itemMetadata.rowNo && wrapper.setAttribute(CommonAttributesEnum.rowno, itemMetadata.rowNo);
        itemMetadata.rowId && wrapper.setAttribute("rowid", itemMetadata.rowId);

        // check label position
        const labelPosition = itemMetadata.inputLabelPosition || InputLabelPositionEnum.top;
        labelPosition == InputLabelPositionEnum.top ? (() => {
            inputLabel && mainControlDiv.appendChild(inputLabel);
            mainControlDiv.appendChild(wrapper);
        })() : (labelPosition == InputLabelPositionEnum.left && inputLabel) ?
        (() => {
            // add columns
            const colDiv = HTMLElementFactory.AddDiv({className: ColumnsStyles.ColumnsDivClassName});
            // add left column
            const colLeftDiv = HTMLElementFactory.AddDiv({className: ColumnsStyles.ColumnDivClassName});
            colLeftDiv.appendChild(inputLabel);
            // add right column
            const colRightDiv = HTMLElementFactory.AddDiv({className: ColumnsStyles.ColumnDivClassName});
            colRightDiv.appendChild(wrapper);
            colDiv.appendChild(colLeftDiv);
            colDiv.appendChild(colRightDiv);
            mainControlDiv.appendChild(colDiv);
        })() :
        mainControlDiv.appendChild(wrapper);

        // raise bb-blockitemelementadded event
        const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbblockitemelementadded,
            {
                detail: {element:wrapper, rootId:itemMetadata?.rootId}, 
                bubbles: true,
                cancelable: false, 
                composed: true
            });
        dispatchEvent(bbcustomEvent);

        return mainControlDiv;
    }

    /**
     * Bbitem meta data of bbelement helper
     */
    private static getItemMetaData = (item: IItem, elementArgs?: {}): ItemMetaData => {
        const itemHasIcon = BBElementFactory.isIconEnabled(item, elementArgs);
        const labelStyle = elementArgs?.hasOwnProperty(ElementArgsEnum.inputlabelstyle) ?
            (elementArgs[ElementArgsEnum.inputlabelstyle].length > 0 ?
                elementArgs[ElementArgsEnum.inputlabelstyle] : InputLabelStyleEnum.showalways) :
            InputLabelStyleEnum.showalways;

        const labelSize = elementArgs?.hasOwnProperty(ElementArgsEnum.inputlabelsize) ?
            (elementArgs[ElementArgsEnum.inputlabelsize].length > 0 ?
                elementArgs[ElementArgsEnum.inputlabelsize] : GlobalStyles.ItemLabelSize) :
            GlobalStyles.ItemLabelSize;

        const labelPosition = elementArgs?.hasOwnProperty(ElementArgsEnum.inputlabelposition) ?
            elementArgs[ElementArgsEnum.inputlabelposition] :
            GlobalStyles.ItemLabelPosition;
           
        const itemHiddenLabelAttribute = BBAttributeHelper.GetAttributeValue(ItemAttributeTypeEnum.hideinputlabel,
            item.Attributes).BBToBoolean();

        const noLabel = elementArgs?.hasOwnProperty(ElementArgsEnum.nolabel) ? elementArgs["nolabel"] : false;

        const hideLabel = itemHiddenLabelAttribute ? itemHiddenLabelAttribute :
            (elementArgs?.hasOwnProperty(ElementArgsEnum.hideinputlabel) ?
                elementArgs[ElementArgsEnum.hideinputlabel] :
                (item.Type == ItemTypeEnum.button ? true : false));
    
        const itemDataMmodel = BBAttributeHelper.GetAttributeValue(ItemAttributeTypeEnum.datamodel, item?.Attributes) ?
            BBAttributeHelper.GetAttributeValue(ItemAttributeTypeEnum.datamodel, item.Attributes) :
            (elementArgs?.hasOwnProperty(ElementArgsEnum.datamodel) ?
                elementArgs[ElementArgsEnum.datamodel] : undefined);

        const itemMetaData = {
            item: item,
            elementOptions: BBElementOptionsFactory.GetElementOptions[item.Type](item, elementArgs),
            elementContainerClass: elementArgs?.hasOwnProperty(ElementArgsEnum.containerclassname) ?
                elementArgs[ElementArgsEnum.containerclassname] :
                (itemHasIcon ? BBElementFactory.getIconContainerClass() : 'control'),
            isItemRequired: BBElementFactory.isRequired(item.Attributes),
            isIconEnabled: itemHasIcon,
            iconClass: itemHasIcon &&
                BBElementFactory.getInputIconClass(item.Attributes, elementArgs),
            iconName: itemHasIcon && BBElementFactory.getInputIcon(item.Attributes),
            itemValue: BBElementFactory.GetItemValue(item),
            decimalDigits: item.Type == ItemTypeEnum.number &&
                BBAttributeHelper.GetAttributeValue(ItemAttributeTypeEnum.decimals,
                    item.Attributes),
            hasThousandSeparator: item.Type == ItemTypeEnum.number &&
                BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.thousandseparator,
                    item.Attributes) != null,
            nolabel: noLabel,
            hideInputLabel: hideLabel,
            inputLabelStyle: labelStyle,
            inputLabelSize: labelSize,
            inputLabelPosition: labelPosition,
            style: elementArgs && elementArgs.hasOwnProperty(ElementArgsEnum.style) ?
                elementArgs[ElementArgsEnum.style] : "",
            dataModel: itemDataMmodel,
            containerId: elementArgs?.hasOwnProperty(CommonAttributesEnum.containerid) ? elementArgs[CommonAttributesEnum.containerid] : "",
            rootId: elementArgs?.hasOwnProperty(CommonAttributesEnum.rootid) ? 
                elementArgs[CommonAttributesEnum.rootid] : "",
            ownerId: elementArgs?.hasOwnProperty(CommonAttributesEnum.ownerid) ? 
                elementArgs[CommonAttributesEnum.ownerid] : "",
            rowId: elementArgs?.hasOwnProperty("rowid") ? elementArgs["rowid"] : "",
            rowNo: elementArgs?.hasOwnProperty(CommonAttributesEnum.rowno) ? elementArgs[CommonAttributesEnum.rowno] : "",
        };
        return itemMetaData;
    }

    /**
     * Get required element of bbelement helper
     */
    private static getRequiredElement = (title: string) => {
        return HTMLElementFactory.AddParagraph({
            className: 'help is-danger',
            textContent: title ? `${title} is required` : 'This field is required',
            style: 'display:none'
        });
    }

    /**
     * Get element icon div of bbelement helper
     */
    private static getElementIconDiv = (iconClass: string, iconName: string, containerclassname?: string) => {
        const mainDiv = HTMLElementFactory.AddDiv({
            className: containerclassname ? containerclassname : BBElementFactory.getIconContainerClass()
        });
        const iconSpan = BBElementFactory.GetIconSpan(iconClass, iconName);
        mainDiv.appendChild(iconSpan);
        return mainDiv;
    }
    //#endregion

    //#region [rgba(0, 245, 255,0.1)] Public methods

    /**
     * Get item value as string of bbelement helper
     */
    public static GetItemValueAsString = ((item: IItem): string => {
        if (item.Value) {
            const itemValue: Object = item.Value;
            return itemValue.hasOwnProperty("Value") ?
                (<IItemValue>itemValue).Value : <string>item.Value;
        } else {
            return "";
        }
    });

    /**
     * Get item value of bbelement helper
     */
    public static GetItemValue = ((item: IItem) => {
        const blankItemValue:IItemValue = {
            ID:item.ID,
            DisplayValue:"",
            Value:""
        }
        !item.Value && (item["Value"] = blankItemValue); 
        return <IItemValue>item.Value;
    });

    /**
     * Get icon span of bbelement helper
     */
    public static GetIconSpan = (iconClass: string, iconName: string) => {
        const iconSpan = HTMLElementFactory.AddSpan({ className: iconClass, id:"iconSpan" });
        const icon = HTMLElementFactory.AddI({ className: iconName });
        iconSpan.appendChild(icon);
        return iconSpan;
    }

    /**
     * Add bbnav of bbelement helper
     */
    public static AddBBNav = (block: IBlock, navDirection: NavbarDirection) => {
        const navbarMenuChildDiv = HTMLElementFactory.AddDiv({ className: navDirection });
        BBElementFactory.addNavbarItems(navbarMenuChildDiv, block);
        return navbarMenuChildDiv;
    }

    /**
     * Get bbinput of bbelement helper
     */
    public static GetBBInput = (itemMetadata: ItemMetaData): IBBItem => {
        const inputItems = [];
        const textInput = HTMLElementFactory.AddInput(itemMetadata.elementOptions);
        inputItems.push(textInput);

        (itemMetadata.item.Type == ItemTypeEnum.file) && (() => {
            const downloader = HTMLElementFactory.AddAnchor({id:`download_${itemMetadata.item.ID}`});
            // const downloaderIcon = BBElementFactory.GetIconSpan("icon is-small is-right file-cta", "fa fa-download");
            // downloader.appendChild(downloaderIcon);
            downloader.target = "_blank";
            downloader.href = "";
            downloader.textContent = "";
            inputItems.push(downloader);
        })();

        BBAttributeHelper.HasAttribute(ItemAttributeTypeEnum.datestr, itemMetadata.item?.Attributes) && (() => {
            !BBAttributeHelper.HasAttribute(ItemAttributeTypeEnum.format, 
                itemMetadata.item?.Attributes) && 
                    textInput.setAttribute("format", BBConfig.Localization.DateFormatDisplay);
            textInput.setAttribute(ItemAttributeTypeEnum.datestr, "true");
            //Set Max Length.
            textInput.setAttribute("maxlength", "10");
            //Only allow Numeric Keys.
            textInput.onkeydown = (e:KeyboardEvent) => {
                return Common.IsNumeric(e.keyCode); 
            };
            //Validate Date as User types.
            textInput.onkeyup = (e:KeyboardEvent) => {
                ((textInput.value.length == 2 || textInput.value.length == 5) && e.keyCode != 8) && (textInput.value += BBConfig.Localization.DateSeparator);
                const invalidDateP:HTMLSpanElement = textInput.parentElement.querySelector(`#P_${textInput.id}`);
                textInput.value ? (() => {
                    const isValid = Common.ValidateDate(textInput.value, 
                        textInput.getAttribute(ItemAttributeTypeEnum.format));
                    textInput.setAttribute("valid", Boolean(isValid).toString());
                    isValid ? invalidDateP.style.display = "none" : invalidDateP.style.display = "";
                })() : 
                textInput.value.BBIsEmptyOrWhiteSpace() && (invalidDateP.style.display = "none");
            };
        })();

        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetadata, inputItems),
            Item: textInput
        };
    }

    /**
     * Get bbnumber input of bbelement helper
     */
    public static GetBBNumberInput = (itemMetadata: ItemMetaData): IBBItem => {
        const id = itemMetadata.elementOptions.id != undefined ?
            itemMetadata.elementOptions.id : Common.GetGUID();

        const textElementOptions = itemMetadata.elementOptions;
        textElementOptions.type = 'text';
        textElementOptions.id = `txt_${id}`;
        const numberElementOptions = BBElementOptionsFactory.GetElementOptions[ItemTypeEnum.number](itemMetadata.item);

        // add text input
        const textInput = HTMLElementFactory.AddInput(textElementOptions);
        textInput.setAttribute("wrapper", "true");
        textInput.style.display = "";
        // number input
        const numInput = HTMLElementFactory.AddInput(numberElementOptions);
        numInput.style.display = "none";

        textInput.addEventListener("focus", function (e) {
            const value = textInput.value.BBFormatAsNumber(itemMetadata.decimalDigits);
            numInput.value = value;
            textInput.style.display = "none";
            numInput.style.display = "";
            numInput.focus();
        });

        numInput.addEventListener("blur", function (e) {
            textInput.value = numInput.BBFormattedValue();
            // const value = numInput.value.BBFormatAsNumber(itemMetadata.decimalDigits);
            // textInput.value = itemMetadata.hasThousandSeparator ?
            //     value.BBThousandsSeparator() : value;
            textInput.style.display = "";
            numInput.style.display = "none";
        });

        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetadata, [textInput, numInput]),
            Item: numInput
        };
    }

    /**
     * Get bbanchor of bbelement helper
     */
    public static GetBBAnchor = (itemMetadata: ItemMetaData): IBBItem => {
        const anchor = HTMLElementFactory.AddAnchor(itemMetadata.elementOptions);
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetadata, [anchor]),
            Item: anchor
        }
    }

    /**
     * Get bbsave button of bbelement helper
     */
    public static GetBBSaveButton = (
        buttonID?: string,
        buttonTitle?: string) => {

        const buttonItem: IItem = {
            ID: buttonID ? buttonID : 'btnSave',
            Title: buttonTitle != undefined && buttonTitle,
            Type: ItemTypeEnum.link
        }

        const itemMetadata: ItemMetaData = BBElementFactory.getItemMetaData(buttonItem);
        itemMetadata.elementOptions.className = HeaderControlStyles.AccordionAnchorClassName;
        itemMetadata.elementContainerClass = BBElementFactory.getIconContainerClass();
        itemMetadata.isIconEnabled = true;
        itemMetadata.iconClass = HeaderControlStyles.AccordionSpanClassName;
        itemMetadata.iconName = `fa fa-save ${HeaderControlStyles.AccordionIconColor}`;

        const saveButton = <HTMLAnchorElement>BBElementFactory.GetBBAnchor(itemMetadata).ItemWrapper;
        saveButton.title = "Save";
        return saveButton;
    }

    /**
     * Get bbundo button of bbelement helper
     */
    public static GetBBUndoButton = (
        buttonID?: string,
        buttonTitle?: string) => {

        const buttonItem: IItem = {
            ID: buttonID ? buttonID : 'btnUndo',
            Title: buttonTitle != undefined && buttonTitle,
            Type: ItemTypeEnum.link
        }

        const itemMetadata: ItemMetaData = BBElementFactory.getItemMetaData(buttonItem);
        itemMetadata.elementOptions.className = HeaderControlStyles.AccordionAnchorClassName;
        itemMetadata.elementContainerClass = BBElementFactory.getIconContainerClass();
        itemMetadata.isIconEnabled = true;
        itemMetadata.iconClass = HeaderControlStyles.AccordionSpanClassName;
        itemMetadata.iconName = `fa fa-undo ${HeaderControlStyles.AccordionIconColor}`;

        const undoButton = <HTMLAnchorElement>BBElementFactory.GetBBAnchor(itemMetadata).ItemWrapper;
        undoButton.title = "Cancel";
        return undoButton;
    }

    /**
     * Get bbselect of bbelement helper
     */
    public static GetBBSelect = (itemMetaData: ItemMetaData): IBBItem => {
        const bbSelectDiv = HTMLElementFactory.AddSelect(itemMetaData.elementOptions);
        const selectElement = <HTMLSelectElement>bbSelectDiv.getElementsByTagName('select')[0];
        if (itemMetaData.itemValue.Value && selectElement) {
            // check if item has storedpropname attribute
            const storedPropName = BBAttributeHelper.GetAttributeValue(
                ItemAttributeTypeEnum.storedpropname, itemMetaData.item.Attributes);
            const propName = storedPropName == "DisplayValue" ? storedPropName : "Value";
            selectElement.BBSetSelectedValue(itemMetaData.itemValue[propName], propName);
        }
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetaData, [bbSelectDiv]),
            Item: selectElement
        };
    }

    /**
     * Get bbtext area of bbelement helper
     */
    public static GetBBTextArea = (itemMetaData: ItemMetaData): IBBItem => {
        const textArea = HTMLElementFactory.AddTextArea(itemMetaData.elementOptions);
        itemMetaData?.item?.Value && (textArea.value = itemMetaData.item.Value);
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetaData, [textArea]),
            Item: textArea
        };
    }

    /**
     * Get bbbutton of bbelement helper
     */
    public static GetBBButton = (itemMetaData: ItemMetaData): IBBItem => {
        const button = HTMLElementFactory.AddButton(itemMetaData.elementOptions);
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetaData, [button]),
            Item: button
        };
    }

    /**
     * Get bblabel of bbelement helper
     */
    public static GetBBLabel = (itemMetaData: ItemMetaData): IBBItem => {
        const label = HTMLElementFactory.AddLabel(itemMetaData.elementOptions);
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetaData, [label]),
            Item: label
        };
    }

    /**
     * Get span of bbelement helper
     */
    public static GetBBSpan = (itemMetaData: ItemMetaData): IBBItem => {
        const span = HTMLElementFactory.AddSpan(itemMetaData.elementOptions);
        BBAttributeHelper.HasAttribute(ItemAttributeTypeEnum.datestr, 
            itemMetaData.item?.Attributes) && 
            span.setAttribute(ItemAttributeTypeEnum.datestr, "true");
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetaData, [span]),
            Item: span
        };
    }

    /**
     * Get Image element
     */
    public static GetBBImage = (itemMetadata: ItemMetaData): IBBItem => {
        const figure = HTMLElementFactory.AddFigure(itemMetadata.elementOptions);
        const image = HTMLElementFactory.AddImage({src:itemMetadata.item.Value});
        figure.appendChild(image);
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetadata, [figure]),
            Item: figure
        }
    }


    /**
     * Get bbcheckbox of bbelement helper
     */
    public static GetBBCheckbox = (itemMetaData: ItemMetaData): IBBItem => {
        const label = HTMLElementFactory.AddLabel({
            className: FormControlStyles.CheckboxClassName
        });
        const checkbox = HTMLElementFactory.AddCheckbox(itemMetaData.elementOptions);
        label.appendChild(checkbox);
        label.appendChild(new Text(`\n ${itemMetaData.elementOptions.title && itemMetaData.elementOptions.title} \n`));
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetaData, [label]),
            Item: checkbox
        }
    }

    /**
     * Get bbradio of bbelement helper
     */
    public static GetBBRadio = (itemMetaData: ItemMetaData): IBBItem => {
        const label = HTMLElementFactory.AddLabel({
            className: FormControlStyles.RadioClassName,
            textContent: itemMetaData.elementOptions.title && itemMetaData.elementOptions.title
        });
        const radioInput = HTMLElementFactory.AddRadio(itemMetaData.elementOptions);
        label.appendChild(radioInput);
        return {
            ItemWrapper: BBElementFactory.getBBItemWrapper(itemMetaData, [label]),
            Item: radioInput
        }
    }

    /**
     * Get row block of bbelement helper
     */
    public static GetRowBlock = (item: IItem, elementArgs?: any): IBBItem => {
        // get block information from value
        const block = <IBlock>item.Value.Block;
        const mainDiv = HTMLElementFactory.AddDiv({ className: 'columns' });

        elementArgs.hideinputlabel = true;
        block.Items.forEach(item => {
            const itemLabel = HTMLElementFactory.AddLabel({ className: FormStyles.FieldLabelClassName, textContent: item.Title });
            itemLabel.style.fontSize = GlobalStyles.ItemLabelSize;
            const colDiv = HTMLElementFactory.AddDiv({ className: 'column' });
            const childItem = <IBBItem>BBElementFactory.GetBBBlockItem[item.Type](item, elementArgs);
            colDiv.appendChild(itemLabel);
            colDiv.appendChild(childItem.ItemWrapper);
            mainDiv.appendChild(colDiv);
        });
        return {
            ItemWrapper: mainDiv,
            Item: undefined
        };
    }

    /**
     * Get col block of bbelement helper
     */
    public static GetColBlock = (item: IItem, elementArgs?: any): IBBItem => {
        // get block information from value
        const block = <IBlock>item.Value.Block;
        // add table, data rows
        const table = HTMLElementFactory.AddTable({
            className: 'table', style: 'width:100%'
        });
        elementArgs.hideinputlabel = true;
        block.Items.forEach(item => {
            const tr = HTMLElementFactory.AddTR();
            const th = HTMLElementFactory.AddTH();
            const itemLabel = HTMLElementFactory.AddLabel({ className: FormStyles.FieldLabelClassName, textContent: item.Title });
            itemLabel.style.fontSize = GlobalStyles.ItemLabelSize;
            th.appendChild(itemLabel);
            const td = HTMLElementFactory.AddTD();
            const childItem = <IBBItem>BBElementFactory.GetBBBlockItem[item.Type](item, elementArgs);
            td.appendChild(childItem.ItemWrapper);
            tr.appendChild(th);
            tr.appendChild(td);
            table.tBodies[0].appendChild(tr);
        });
        return {
            ItemWrapper: table,
            Item: undefined
        };
    }

    /**
     * Get block of bbelement helper
     */
    public static GetBlock = async (item: IItem, elementArgs?: {}): Promise<IBBItem> => {
        // get block information from value
        const block = await Common.FetchBlock(item.Value);
        // get block element
        const blockElement = await BlocksBuilder.BuildBlockFromDataAsync(block);
        return {
            ItemWrapper: blockElement,
            Item: undefined
        };
    }

    /**
     * Get bbitem of bbelement helper
     */
    public static GetBBItem = (item: IItem, elementArgs?: {}): Element => {
        return (<IBBItem>BBElementFactory.GetBBBlockItem[item.Type](item, elementArgs)).ItemWrapper;
    }

    /**
     * Get bbsearch of bbelement factory
     */
    public static GetBBSearch = () => {
        const searchDiv = HTMLElementFactory.AddDiv({ className: 'field has-addons' });
        const searchP = HTMLElementFactory.AddParagraph({ className: 'control' });
        const searchButtonP = HTMLElementFactory.AddParagraph({ className: 'control' });
        const searchInput = HTMLElementFactory.AddInput({ className: 'input', type: 'text' });
        searchInput.placeholder = 'Search';
        const searchButton = HTMLElementFactory.AddButton({ className: 'button', textContent: 'Search' });

        searchDiv.appendChild(searchP);
        searchDiv.appendChild(searchButtonP);
        searchP.appendChild(searchInput);
        searchButtonP.appendChild(searchButton);

        return searchDiv;
    }
    //#endregion
}