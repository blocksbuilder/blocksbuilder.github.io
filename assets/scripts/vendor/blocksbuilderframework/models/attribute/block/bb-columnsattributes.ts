import { IAttribute, IElementAttributes } from "../common/bb-attributesmodel";
import { BBAttributes } from '../common/bb-attributesbase';
import { PositionEnum, InputLabelStyleEnum } from '../../enums/bb-enums';

export class BBColumnsAttributes extends BBAttributes implements IElementAttributes {
    public HeaderSource: string = "";
    public ActionBarSource: string = "";
    public ActionBarPosition: PositionEnum = PositionEnum.bottom;
    // public IconEnabled: boolean = false;
    // public HideInputLabel:boolean = false;
    // public InputLabelStyle:InputLabelStyleEnum = InputLabelStyleEnum.showalways;
    // public InputLabelSize:string = "small";
//    public BlockItemsContainer:boolean = false;
        
    LoadAttributes = (attributes: IAttribute[]): Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }
}