import { IAttribute, IElementAttributes } from "../../attribute/common/bb-attributesmodel";
import { BBAttributes } from '../../attribute/common/bb-attributesbase';
import { PositionEnum, InputLabelStyleEnum } from '../../enums/bb-enums';

export class BBFormAttributes extends BBAttributes implements IElementAttributes {
    public AddSaveButton: boolean = true;
    public AddCancelButton: boolean = true;
    public HeaderSource: string = "";
    public ActionBarSource: string = "";
    public ActionBarPosition: PositionEnum = PositionEnum.bottom;
    public IconEnabled: boolean = false;
    // public HideInputLabel:boolean = false;
    // public InputLabelStyle:InputLabelStyleEnum = InputLabelStyleEnum.showalways;
    // public InputLabelSize:string = "small";
//    public BlockItemsContainer:boolean = false;
    public DataModel:string = "";

    LoadAttributes = (attributes:IAttribute[]):Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }
}