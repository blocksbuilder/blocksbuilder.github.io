import { IAttribute, IElementAttributes } from "../common/bb-attributesmodel";
import { BBAttributes } from '../common/bb-attributesbase';
import { PositionEnum } from '../../enums/bb-enums';

export class BBTabstripAttributes extends BBAttributes implements IElementAttributes {
    public HeaderSource: string = "";
    public ActionBarSource: string = "";
    public ActionBarPosition: PositionEnum = PositionEnum.bottom;
//    public BlockItemsContainer:boolean = false;

    LoadAttributes = (attributes: IAttribute[]): Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }
}