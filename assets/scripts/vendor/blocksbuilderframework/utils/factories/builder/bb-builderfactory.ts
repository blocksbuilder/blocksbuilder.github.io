import { BBConfig } from '../../../bbconfig';
import { BlockTypeEnum, ItemTypeEnum, CommonAttributesEnum, BlockAttributeTypeEnum, ItemAttributeTypeEnum } from '../../../models/enums/bb-enums';
import { BBBlock } from '../../../elements/blocks/bb-block';
import { IBlock, IItem } from '../../../models/block/bb-blockmodel';
import { BBBlockFactory } from '../block/bb-blockfactory';
import { Common } from '../../helpers/bb-common-helper';
import { IAttribute, IElementAttributes } from '../../../models/attribute/common/bb-attributesmodel';
import { BBElement } from '../../../elements/bb-element';
import { ElementArgsEnum, BBElementFactory } from '../element/bb-elementfactory';
import { BBAttributeHelper } from '../../helpers/bb-attribute-helper';

export default class BlocksBuilder {
    private constructor() {

    }
    public static Configuration = () => {
        return BBConfig;
    }

    public static async BuildBlockFromDataAsync(blockData: IBlock): Promise<BBBlock> {
        return new Promise(resolve => {
            const block: BBBlock = BBBlockFactory.GetBlock(blockData.Type);
            block.BlockData = blockData;
            resolve(block);
        });
    }

    public static async BuildBlockAsync(blockSourceURL:string, 
        isOwner?:boolean,
        ...attributes:IAttribute[]) : Promise<BBBlock> {
        const blockData: IBlock = await Common.FetchBlock(blockSourceURL);
        !blockData?.Attributes && (blockData.Attributes = []);
        attributes.forEach(attribute => {
            blockData?.Attributes.push(attribute);
        });
        const block:BBBlock = BBBlockFactory.GetBlock(blockData?.Type);
        block.IsOwner = isOwner;
        block.BlockData = blockData;
        return block;
    }

    public static async BuildBBElementAsync(item:IItem, rootId:string, 
        containerId:string, blockAttributes:any,
        isOwner?:boolean): Promise<Element> {
        let bbElement:Element;
        if (item.Type == ItemTypeEnum.block) {
            // get block element
            bbElement = await BlocksBuilder.BuildBlockAsync(item.Value,
                isOwner,
                {Name:CommonAttributesEnum.rootid, Value:rootId},
                {Name:CommonAttributesEnum.containerid, Value:containerId},
                {Name:CommonAttributesEnum.ownerid, Value:blockAttributes?.OwnerId});
        } else {
            const elementArgs = {
                [ElementArgsEnum.hasicon]:blockAttributes?.IconEnabled,
                [BlockAttributeTypeEnum.hideinputlabel]:blockAttributes?.HideInputLabel,
                [BlockAttributeTypeEnum.inputlabelstyle]:blockAttributes?.InputLabelStyle,
                [BlockAttributeTypeEnum.inputlabelsize]:blockAttributes?.InputLabelSize,
                [BlockAttributeTypeEnum.inputlabelposition]:blockAttributes?.InputLabelPosition,
                [BlockAttributeTypeEnum.datamodel]:blockAttributes?.DataModel,
                [CommonAttributesEnum.containerid]:containerId,
                [CommonAttributesEnum.rootid]:rootId,
                [CommonAttributesEnum.ownerid]:blockAttributes?.OwnerId,
                [BlockAttributeTypeEnum.nolabel]:blockAttributes?.NoLabel,
                [CommonAttributesEnum.rowno]:blockAttributes?.RowNo,
                "rowid":blockAttributes?.RowId
            };

            blockAttributes?.AllowEdit !=undefined && 
                !blockAttributes?.AllowEdit.toString().BBIsEmptyOrWhiteSpace() &&
                blockAttributes.AllowEdit.toString().BBToBoolean() === false && (() => {
                    // let classNameAttribute:IAttribute = 
                    //     BBAttributeHelper.GetAttribute(CommonAttributesEnum.cssClass, item.Attributes);
                    // !classNameAttribute && {Name: "cssclass", Value: }
                    item.Type = ItemTypeEnum.span;
                })();
    
            bbElement = BBElementFactory.GetBBItem(item, elementArgs);
        }
        return bbElement;
    }
}
