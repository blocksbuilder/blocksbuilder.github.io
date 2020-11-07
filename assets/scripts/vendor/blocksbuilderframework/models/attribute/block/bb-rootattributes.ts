import { IAttribute, IElementAttributes } from "../common/bb-attributesmodel";
import { BBAttributes } from '../common/bb-attributesbase';

export class BBRootAttributes extends BBAttributes implements IElementAttributes {
    public IsRoot:boolean = true;
    LoadAttributes = (attributes:IAttribute[]):Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }
}