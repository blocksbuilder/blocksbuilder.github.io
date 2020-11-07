import { IAttribute, IElementAttributes } from "../common/bb-attributesmodel";
import { BBAttributes } from '../common/bb-attributesbase';

export class BBStepsAttributes extends BBAttributes implements IElementAttributes {
    public HeaderSource: string = "";
//    public BlockItemsContainer:boolean = false;

    LoadAttributes = (attributes: IAttribute[]): Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }
}