/// <reference path="../element/bb-elementoptions.ts" />
/// <reference path="./../enums/bb-enums.ts" />

import { ISelectOption } from '../element/bb-elementoptions';
import { BlockTypeEnum, ItemTypeEnum, BlockAttributeTypeEnum} from './../enums/bb-enums'
import { Observer } from '../common/bb-observer';
import { IAttribute } from '../attribute/common/bb-attributesmodel';
import { IElement } from '../element/bb-elementmodel';
import { IAction } from '../action/bb-actionmodel';

export interface IPagable {
    PageObserver: Observer;   // observer for pagination
}

export interface IElementProps {
    ID: string;
    Title?: string;
    Sequence?: number;
    Attributes?: IAttribute[];
    Actions?: IAction[];
}

export type ElementType = ItemTypeEnum | BlockTypeEnum | string;

// export interface IItemType {
//     Type: ItemTypeEnum;
// }

export interface IItemType {
    Type: ElementType;
}

// export interface IBlockType {
//     Type: BlockTypeEnum;
// }

export interface IBlockType {
    Type: ElementType;
}

export interface IBlockProps extends IElementProps, IBlockType {
    Type: ElementType; // BlockTypeEnum;
}

export interface IItem extends IElementProps, IItemType {
    /**
     * Item Type 
     */
    Type: ElementType; //ItemTypeEnum;
    /**
     * Optional property. Stores Value of the item 
     */
    Value?: any;
}

export interface IDataSource {

}

export interface IItemValue extends IDataSource  {
    ID: string;
    Value: any;
    DisplayValue?: string;
    Options?: ISelectOption[];
    IsDirty?: boolean;
}

export interface IRow extends IDataSource {
    RowNo: number;
    ItemValues: IItemValue[];
    RowID?: string;
    IsDeleted?: boolean;
    IsNew?: boolean;
    IsDirty?: boolean;
}

export interface IBlockItems {
    Items:IItem[];
    Rows?:IRow[];
}

export interface IBlock extends IElement, IBlockProps, IBlockItems {
    Sequence?: number;
    Type: ElementType; // BlockTypeEnum;
    Items: IItem[];
    Rows?: IRow[];
    ItemValues?:IItemValue[];
    //GetAttribute(attributeType:BlockAttributeTypeEnum):IAttribute;
}

export interface IBlockTemplate {
    Blocks: IBlock[];
}

export interface IFormulaItem {
    ID:string;
    ContainerType?:string;
}

export interface IFormula {
    Type: string;
    Items?: IFormulaItem[];
    Target?: IFormulaItem[];
    Expression?: string;
}

export interface IBBItem {
    ItemWrapper?:Element,
    Item:Element
}

export interface IRegistry {
    TargetElement:Element;
    ContainerId:string;
    RowNo?:string;
    UniqueId:string;
}

export interface IBBElementRegistry {
    ContainerElements: IRegistry[];
    LayoutElements: IRegistry[];
    DataBlockElements: IRegistry[];
    DataElements: IRegistry[];
    BlockItemElements: IRegistry[];
    Elements: IRegistry[];
    ModifiedElements: IRegistry[];

    FindContainerElementByUniqueId(uniqueId:string) : Element;
    FindLayoutElementByUniqueId(uniqueId:string) : Element;
    FindDataBlockElementByUniqueId(uniqueId:string) : Element;
    FindDataElementByUniqueId(uniqueId:string) : Element;
    FindBlockItemElementByUniqueId(uniqueId:string) : Element;
    FindElementByUniqueId(uniqueId:string) : Element;
    FindElementRegistryByUniqueId(uniqueId:string) : IRegistry;
    FindModifiedElementRegistryByUniqueId(uniqueId:string) : IRegistry;
}