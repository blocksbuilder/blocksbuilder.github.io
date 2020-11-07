import { IAttribute, IElementAttributes } from '../../attribute/common/bb-attributesmodel';
import { GridTypeEnum, GridEditStyleEnum, PositionEnum } from '../../enums/bb-enums';
import { BBAttributes } from '../../attribute/common/bb-attributesbase';

export class BBGridAttributes extends BBAttributes implements IElementAttributes {
    public HeaderSource:string = "";
    public ShowSearch:boolean = false;
    public ShowPagination:boolean = false;
    public GridType:string = "";
    public EditStyle:string = "";
    public AllowDelete:boolean = false;
    public AllowAdd:boolean = false;
    public AllowDeleteAll:boolean = false;
    public PageLength?:string = "5";
    public ActionBarSource: string = "";
    public ActionBarPosition: PositionEnum = PositionEnum.bottom;
//    public BlockItemsContainer:boolean = false;
    public DataModel:string = "";

    LoadAttributes = (attributes:IAttribute[]):Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }

    public get Type(): GridTypeEnum {
        return this.GridType ? 
            <GridTypeEnum>this.GridType : 
            GridTypeEnum.readonly;
    }

    public get GridEditStyle(): GridEditStyleEnum {
        return this.EditStyle ? 
            <GridEditStyleEnum>this.EditStyle : 
            GridEditStyleEnum.readonly;
    }
}