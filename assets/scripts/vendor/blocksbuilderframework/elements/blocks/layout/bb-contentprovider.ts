import { BBBlock } from '../bb-block';
import { IBlock, IItem } from '../../../models/block/bb-blockmodel';
import { Common } from '../../../utils/helpers/bb-common-helper';
import { BBAttributeHelper } from '../../../utils/helpers/bb-attribute-helper';
import { ItemAttributeTypeEnum, CommonAttributesEnum, BlockAttributeTypeEnum } from '../../../models/enums/bb-enums';
import { HTMLElementFactory } from '../../../utils/factories/html/bb-htmlfactory';
// import { BBBlockFactory } from '../../../utils/factories/block/bb-blockfactory';
import BlocksBuilder from '../../../utils/factories/builder/bb-builderfactory';

export default class BBContentProvider {
    private static _rootId:string;
    private static _containerId:string;
    private static _ownerId:string;
    
    private constructor() {
    }


    public static GetContents = async (rootId:string,
        containerid:string,
        ownerId:string,
        blockData:IBlock,
        contentMainElementType:string = "span", 
        contentMainCSSClass?:string,
        addContentCustomCSSClass?:boolean):Promise<Element[]> => {
        const contentParents:Element[] = [];
        BBContentProvider._rootId = rootId;
        BBContentProvider._containerId = containerid;
        BBContentProvider._ownerId = ownerId;
        // loop through all items and generate content
        for (let index = 0; index < blockData.Items.length; index++) {
            const item = blockData.Items[index];
            // get content source block
            const contentBlock:IBlock = await BBContentProvider.getContentSource(item);
            // get content parent
            const contentParent = await BBContentProvider.getContent(item, contentBlock, 
                contentMainElementType, contentMainCSSClass, addContentCustomCSSClass);
            contentParents.push(contentParent);
        }
        return contentParents;
    }

    private static getContentSource = async (item:IItem) => {
        // get content source
        const contentSource = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.contentsource, 
            item.Attributes).Value;
        // fetch content source block
        return await Common.FetchBlock(contentSource);
    }

    private static getContent = async (item:IItem, contentSource:IBlock,
        contentMainElementType:string = "span", 
        contentMainCSSClass?:string,
        addContentCustomCSSClass?:boolean) => {
        // get target content id
        const contentTargetId = BBAttributeHelper.GetAttributeValue(
            ItemAttributeTypeEnum.targetcontent, 
            item.Attributes);
        
        const mainContentClass = contentMainCSSClass ? contentMainCSSClass : "";
        const customCSSClass = addContentCustomCSSClass ? 
            BBAttributeHelper.GetAttributeValue(CommonAttributesEnum.cssClass, 
                contentSource.Attributes) : 
            ""; 

        // get content parent
        const contentParent = HTMLElementFactory.GetHTMLElement(contentMainElementType, { 
            id:contentTargetId,
            className: `${mainContentClass} ${customCSSClass}`
        });

        contentParent.setAttribute("bb-contentopener", item.ID);
        // generate content elements
        const contentElements:BBBlock[] = await BBContentProvider.generateContentElements(contentSource);
        if (contentElements) {
            contentElements.forEach(contentElement => {
                contentParent.appendChild(contentElement)
            });
        }
        return contentParent;
    }

    private static generateContentElements = async (sourceBlock:IBlock):Promise<BBBlock[]> => {
        // get content block elements
        const contentBlocksElements:BBBlock[] = [];
        // loop thru all items of content block and build blocks
        for (let index = 0; index < sourceBlock?.Items.length; index++) {
            // render block element from block data
            const contentItem = sourceBlock.Items[index];
            const contentItemBlockElement = await BBContentProvider.generateContentElement(contentItem);
            contentBlocksElements.push(contentItemBlockElement);
        }
        return contentBlocksElements;
    }

    private static generateContentElement = async (contentItem:IItem):Promise<BBBlock> => {
        // fetch item block                            
        const itemBlock = await Common.FetchBlock(contentItem.Value);
        // add rootId as attribute
        !itemBlock.Attributes && (itemBlock.Attributes = []);
        itemBlock.Attributes.push(
            {Name:CommonAttributesEnum.rootid, Value:BBContentProvider._rootId},
            {Name:CommonAttributesEnum.containerid, Value:BBContentProvider._containerId},
            {Name:CommonAttributesEnum.ownerid, Value:BBContentProvider._ownerId});
        // render block element from block data
        const contentItemBlockElement = await BlocksBuilder.BuildBlockFromDataAsync(itemBlock);
        return contentItemBlockElement;
    }
}