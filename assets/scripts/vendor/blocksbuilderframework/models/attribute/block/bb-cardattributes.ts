import { IAttribute, IElementAttributes } from "../../attribute/common/bb-attributesmodel";
import { BBAttributes } from '../../attribute/common/bb-attributesbase';

export class BBCardAttributes extends BBAttributes implements IElementAttributes {
    public CardTopImageSrc: string = "";
    public CardLeftImageSrc: string = "";
    public CardContent:string = "";
//    public BlockItemsContainer:boolean = false;

    LoadAttributes = (attributes:IAttribute[]):Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }
}