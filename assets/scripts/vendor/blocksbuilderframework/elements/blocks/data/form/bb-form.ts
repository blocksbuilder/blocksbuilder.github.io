/**
 * BBCard - Highly customizable Form control
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { BlockTypeEnum, PositionEnum, CommonAttributesEnum, ItemAttributeTypeEnum, ElementEventsEnum } from "../../../../models/enums/bb-enums";
import { IItem, IItemValue, IDataSource } from "../../../../models/block/bb-blockmodel";
import { BBAccordion } from "../../../controls/accordion/bb-accordion";
import { FormStyles } from "../../../../models/common/bb-styles";
import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";
import { BBFormAttributes } from '../../../../models/attribute/block/bb-formattributes';
import { BBAttributeHelper } from '../../../../utils/helpers/bb-attribute-helper';
import { BBControlFactory } from '../../../../utils/factories/control/bb-controlfactory';
import BlocksBuilder from '../../../../utils/factories/builder/bb-builderfactory';
import { BBDataBlock } from "../bb-datablock";
import { Common } from "../../../../utils/helpers/bb-common-helper";
import { BBConfig } from "../../../../bbconfig";

export class BBForm extends BBDataBlock {
    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.form);
    }

    /**
     * Gets header of the block
     * @returns header<BBAccordion>
     */
    get Header() {
        return <BBAccordion>this.shadowRoot.querySelector('bb-accordion');
    }

    get BlockAttributes(): BBFormAttributes {
        return <BBFormAttributes>super.BlockAttributes;
    }

    // get RootId():string {
    //     return this.BlockAttributes?.RootId ? this.BlockAttributes?.RootId : 
    //         this.BlockAttributes?.BlockItemsContainer ? this.id :  
    //         ""; 
    // }

    /**
     * Bind item values to existing fields of the form
     * @param  <IItemValue[]> itemValues
     */
    BindData = (itemValues:IDataSource[]):Promise<boolean> => {
        return new Promise(resolve => {
            this.bindData(itemValues as IItemValue[]);
            resolve(true);
        });
    }

    RebindData = async ():Promise<boolean> => {
        // get all block data items
        const blockDataItems:IItem[] = await this.GetBlockDataItemsAll(this.BackedUpData.Items);
        // get block items
        const blockItems:Element[] = this.BBGetBlockItems();
        // loop through all block items and set values from block data items
        blockItems.forEach(blockItem => {
            const blockDataItem = blockDataItems.find(item => item.ID == blockItem.BBGetBlockItemId());
            blockItem.BBSetBlockItemValue(blockDataItem.Value);
        });
        return true;
    }

    /**
     * Renders the block
     * @returns Promise<boolean>
     */
    renderBlock = async ():Promise<boolean> => {
        const iconEnabled: boolean = this.BlockAttributes.IconEnabled;

        const mainDiv = HTMLElementFactory.AddForm();
        // add form div
        const formDiv = HTMLElementFactory.AddDiv({ id: 'formDiv' });

        this.IsBlockEditable = true;

        // add block header if enabled
        if (this.BlockAttributes.HeaderSource) {
            const headerElement = <BBAccordion> await BBControlFactory.BuildControlAsync(
                (<BBFormAttributes>this.BlockAttributes).HeaderSource);
            // set target container id
            headerElement.ControlAttributes.TargetContainerID = "formDiv";
            headerElement.setAttribute(CommonAttributesEnum.ownerid, (this.OwnerId));
            mainDiv.appendChild(headerElement);
            mainDiv.appendChild(HTMLElementFactory.GetHTMLElement('br'));
        }
        mainDiv.appendChild(formDiv);
        // add parent element to shadow
        this.shadowRoot.appendChild(mainDiv);
        // add fields
        for (let index = 0; index < this.BlockData.Items.length; index++) {
            const item = this.BlockData.Items[index];
            const itemElement = await this.getFieldDiv(item, iconEnabled);
            formDiv.appendChild(itemElement);
        }

        // TODO - need to revisit
        // Apply block level attributes
        if (this.BlockData.Attributes) {
            const formulaAttribute = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.formula, this.BlockData.Attributes);
            formulaAttribute && await BBAttributeHelper.ApplyAttribute(formulaAttribute, 
                formDiv, null);
        }

        if (this.BlockAttributes.ActionBarSource) {
            const hr = HTMLElementFactory.GetHTMLElement("hr");
            const actionBar = await BlocksBuilder.BuildBlockAsync(
                this.BlockAttributes.ActionBarSource,
                false,
                {Name:CommonAttributesEnum.rootid, Value:this.RootId},
                {Name:CommonAttributesEnum.ownerid, Value:this.OwnerId});
    
            let actionBarPosition = PositionEnum.bottom;
            if (this.BlockAttributes.ActionBarPosition) 
                actionBarPosition = this.BlockAttributes.ActionBarPosition;
            if (actionBarPosition == PositionEnum.top) {
                const header = HTMLElementFactory.AddHeader();
                header.appendChild(actionBar);
                header.appendChild(hr);
                mainDiv.insertBefore(header, formDiv);
            } else {
                const footer = HTMLElementFactory.AddFooter();
                footer.appendChild(hr);
                footer.appendChild(actionBar);
                mainDiv.appendChild(footer);
            }
        }

        //if (!this.BlockAttributes?.BlockItemsContainer) {
            // raise bb-datablockadded event
            const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbdatablockadded,
                {
                    detail: {element:this, rootId:this.BlockAttributes?.RootId}, 
                    bubbles: true,
                    cancelable: false, 
                    composed: true
                });
            dispatchEvent(bbcustomEvent);
        //}
        return true;
    }

    /**
     * Gets Field Div field div consisting an instance of BBItem
     * @param item<IItem>
     * @param iconEnabled<boolean>
     * @returns HTMLDivElement
     */
    private getFieldDiv = async (item: IItem, iconEnabled: boolean): Promise<HTMLDivElement> => {
        const bbElement:Element = await BlocksBuilder.BuildBBElementAsync(item, 
            this.RootId, this.id, this.BlockAttributes);
        // add data block uniqueid
        const dataBlockUniqueId = `${this.BlockAttributes.ContainerId}.${this.id}`;
        const dataElements = bbElement.BBGetBlockItemElements();
        dataElements.forEach(element => {
            element.setAttribute(CommonAttributesEnum.containeruniqueid, dataBlockUniqueId);
            element.setAttribute(CommonAttributesEnum.containertype, "DataBlockElements");
        });
        
        const fieldDiv = HTMLElementFactory.AddDiv({ className: FormStyles.FieldDivClassName });
        fieldDiv.appendChild(bbElement);
        fieldDiv.style.display = (<HTMLElement>bbElement).style.display; 
        return fieldDiv;
    }

    /**
     * Bind item values to existing fields of the form
     */
    private bindData = (itemValues:IItemValue[]) => {
        // set itemvalues
        this.BlockData.ItemValues = itemValues;
        // backup data
        this.BackupData();
        itemValues && (() => {
            // get all input with class dataelement
            const dataElements = this.shadowRoot.getElementById("formDiv").BBGetBlockItems();
            itemValues.forEach(element => {
                const blockItem = this.BlockData?.Items?.find(item => item.ID == element.ID);
                // get dataelement
                const dataElement =  dataElements.find(inputElement => inputElement.id == `bi_${element.ID}`);
                // set value
                (dataElement) && (() => {
                    const valueToSet = BBAttributeHelper.HasAttribute(ItemAttributeTypeEnum.datestr, 
                        blockItem?.Attributes) ?
                        Common.FormatDateValue(element.Value, BBConfig.Localization.DateFormatDisplay, 
                            BBConfig.Localization.DateFormatTransform) :
                        element.Value;
                    dataElement.BBSetBlockItemValue(valueToSet);
                })();
            });
        })();
    }
}

// Define the new element
window.customElements.define('bb-form', BBForm);