/**
 * BBColumns - Columns powered by Flexbox A simple way to build responsive columns
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { ItemAttributeTypeEnum, ItemTypeEnum, BlockTypeEnum, PositionEnum, CommonAttributesEnum, BlockAttributeTypeEnum, ElementEventsEnum } from "../../../../models/enums/bb-enums";
import { IBlock, IItem } from "../../../../models/block/bb-blockmodel";
import { BBColumnsAttributes } from '../../../../models/attribute/block/bb-columnsattributes';
import { BBBlock } from "../../../blocks/bb-block";
import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";
import { BBAttributeHelper } from '../../../../utils/helpers/bb-attribute-helper';
import { Common } from '../../../../utils/helpers/bb-common-helper';
import { BBAccordion } from '../../../controls/accordion/bb-accordion';
import { BBElementFactory, ElementArgsEnum } from '../../../../utils/factories/element/bb-elementfactory';
import { BBControlFactory } from '../../../../utils/factories/control/bb-controlfactory';
import BlocksBuilder from '../../../../utils/factories/builder/bb-builderfactory';

export class BBColumns extends BBBlock {
    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.columns);
    }

    /**
     * Gets block attributes
     */
    get BlockAttributes(): BBColumnsAttributes {
        return <BBColumnsAttributes>super.BlockAttributes;
    }

    // get RootId():string {
    //     return this.BlockAttributes?.RootId ? this.BlockAttributes?.RootId : 
    //         this.BlockAttributes?.BlockItemsContainer ? this.id :  
    //         ""; 
    // }

    /**
     * Renders the block
     * @returns Promise<boolean>
     */
    renderBlock = async (): Promise<boolean> => {
        const columnsClassName = `${this.StylesMapping.ColumnsStyles.ColumnsDivClassName} ${this.BlockAttributes.CSSClass}`;

        // get shadow root
        const shadow = this.shadowRoot;

        // columns parent div
        const columnsDiv = HTMLElementFactory.AddDiv({
            className: columnsClassName,
            id: "columnsDiv"
        });

        const headerElement = HTMLElementFactory.AddSpan();
        shadow.appendChild(headerElement);

        // add block header if enabled
        ((<BBColumnsAttributes>this.BlockAttributes).HeaderSource) && (async () => {
            const accordion = <BBAccordion>await BBControlFactory.BuildControlAsync(
                (<BBColumnsAttributes>this.BlockAttributes).HeaderSource);
                accordion && (() => {
                // set target container id
                headerElement.appendChild(accordion);
                accordion.ControlAttributes.TargetContainerID = "columnsDiv";
            })();
        })();

        // get all the columns
        const childColumns = await this.getColumns();
        childColumns.forEach(columnDiv => {
            columnsDiv.appendChild(columnDiv);
        });

        shadow.appendChild(columnsDiv);

        this.BlockAttributes.ActionBarSource && (async () => {
            const hr = HTMLElementFactory.GetHTMLElement("hr");
            const actionBar = await BlocksBuilder.BuildBlockAsync(
                this.BlockAttributes.ActionBarSource,
                false,
                {Name:CommonAttributesEnum.rootid, Value:this.RootId},
                {Name:CommonAttributesEnum.containerid, Value:this.id},
                {Name:CommonAttributesEnum.ownerid, Value: this.OwnerId}                
            );
            // const actionBar = await BlocksBuilder.BuildBlockFromDataSourceAsync(
            //     BlockTypeEnum.columns, this.BlockAttributes.ActionBarSource);
            const actionBarPosition = this.BlockAttributes?.ActionBarPosition || PositionEnum.bottom;
            actionBarPosition == PositionEnum.top ? (() => {
                const header = HTMLElementFactory.AddHeader();
                header.appendChild(actionBar);
                header.appendChild(hr);
                shadow.insertBefore(header, columnsDiv);
            })() :
            (() => {
                const footer = HTMLElementFactory.AddFooter();
                footer.appendChild(hr);
                footer.appendChild(actionBar);
                shadow.appendChild(footer);
            })();
        })();

        //if (!this.BlockAttributes?.BlockItemsContainer) {
            // raise bb-containerblockadded event
            const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbcontainerblockadded,
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
     * Gets columns
     */
    private getColumns = async (): Promise<Element[]> => {
        const columns: Element[] = [];
        // loop through all the items and render blocks/controls
        for (let index = 0; index < this.BlockData.Items.length; index++) {
            const item = this.BlockData.Items[index];
            // add container class if available
            const columnClassName = `${this.StylesMapping.ColumnsStyles.ColumnDivClassName} ${BBAttributeHelper.GetAttributeValue(ItemAttributeTypeEnum.containerCssClass, item.Attributes)}`;
            const columnDivElement = HTMLElementFactory.AddDiv({className: columnClassName});
            if (item.Type != ItemTypeEnum.column) {
                const columnElement = await this.getColumnChildElement(item);
                columnElement && columnDivElement.appendChild(columnElement);
            } else {
                // const style = BBAttributeHelper.GetAttributeValue("style", item.Attributes);
                // columnDivElement.style. = style
            }
            columns.push(columnDivElement);
        }
        return columns;
    }

    /**
     * Gets child element of the column
     */
    private getColumnChildElement = async (item: IItem): Promise<Element> => {
        let columnElement: Element;
        if (item.Type == ItemTypeEnum.block) {
            // fetch block from value
            const columnBlock: IBlock = await Common.FetchBlock(item.Value);
            if (columnBlock) {
                !columnBlock.Attributes && (columnBlock.Attributes = [])
                columnBlock.Attributes.push({Name:CommonAttributesEnum.rootid, Value:this.RootId},
                    {Name:CommonAttributesEnum.containerid, Value:this.id},
                    {Name:CommonAttributesEnum.ownerid, Value:this.OwnerId});
                columnElement = await BlocksBuilder.BuildBlockFromDataAsync(columnBlock);
            }
        } else {
            const cssClassName = BBAttributeHelper.GetAttributeValue(CommonAttributesEnum.cssClass,
                item.Attributes);

            columnElement = await BlocksBuilder.BuildBBElementAsync(item, 
                this.RootId, this.id, this.BlockAttributes);
            // add class to element if available
            const foundElements = columnElement.getElementsByTagName(item.Type);
            if (foundElements && cssClassName) {
                Array.from(foundElements).forEach((element: HTMLElement) => {
                    element.className += ` ${cssClassName}`;
                });
            }
            // add data block uniqueid
            const dataBlockUniqueId = `${this.BlockAttributes.ContainerId}.${this.id}`;
            const dataElements = columnElement.BBGetBlockItemElements();
            dataElements.forEach(element => {
                element.setAttribute(CommonAttributesEnum.containeruniqueid, dataBlockUniqueId);
                element.setAttribute(CommonAttributesEnum.containertype, "ContainerElements");
            });
        }
        return columnElement;
    }

}

// Define the new element
window.customElements.define('bb-columns', BBColumns);