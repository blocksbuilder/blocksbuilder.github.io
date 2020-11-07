import { BlockTypeEnum } from '../../../models/enums/bb-enums';
import { BBGridAttributes } from '../../../models/attribute/block/bb-gridattributes';
import { IAttribute, IElementAttributes } from "../../../models/attribute/common/bb-attributesmodel";
import { BBFormAttributes } from '../../../models/attribute/block/bb-formattributes';
import { BBAppNavbarAttributes } from '../../../models/attribute/block/bb-appnavbarattributes';
import { BBCardAttributes } from '../../../models/attribute/block/bb-cardattributes';
import { BBMenuAttributes } from '../../../models/attribute/block/bb-menuattributes';
import { BBColumnsAttributes } from '../../../models/attribute/block/bb-columnsattributes';
import { BBStepsAttributes } from '../../../models/attribute/block/bb-stepsattributes';
import { BBTabstripAttributes } from '../../../models/attribute/block/bb-tabstripattributes';
import { BBCardModalAttributes } from '../../../models/attribute/block/bb-cardmodalattributes';
import { BBRootAttributes } from '../../../models/attribute/block/bb-rootattributes';

export class BBBlockAttributesFactory {
    private constructor() {

    }

    private static _attributeProviders = {
        [BlockTypeEnum.card]: () => {return new BBCardAttributes();},
        [BlockTypeEnum.grid]: () => {return new BBGridAttributes();},
        [BlockTypeEnum.form]: () => {return new BBFormAttributes();},
        [BlockTypeEnum.appnavbar]: () => {return new BBAppNavbarAttributes();},
        [BlockTypeEnum.menu]: () => {return new BBMenuAttributes();},
        [BlockTypeEnum.steps]: () => {return new BBStepsAttributes();},
        [BlockTypeEnum.tabstrip]: () => {return new BBTabstripAttributes();},
        [BlockTypeEnum.columns]: () => {return new BBColumnsAttributes();},
        [BlockTypeEnum.cardmodal]: () => {return new BBCardModalAttributes();},
        [BlockTypeEnum.root]: () => {return new BBRootAttributes();},
    }

    static GetBlockAttributes = async (blockType:BlockTypeEnum, attributes:IAttribute[]):Promise<IElementAttributes> => {
        return blockType ? (async () => {
            const blockAttribute:IElementAttributes = BBBlockAttributesFactory._attributeProviders[blockType]();
            await blockAttribute.LoadAttributes(attributes);
            return blockAttribute;        
        })() :
        undefined;
        // if (blockType) {
        //     let blockAttribute:IElementAttributes = BBBlockAttributesFactory._attributeProviders[blockType]();
        //     await blockAttribute.LoadAttributes(attributes);
        //     return blockAttribute;        
        // }
    }
}