import { IAttribute, IElementAttributes } from "../../attribute/common/bb-attributesmodel";
import { BBAttributes } from '../../attribute/common/bb-attributesbase';

export class BBCardModalAttributes extends BBAttributes implements IElementAttributes {
    public ShowCloseButton: boolean = true;
    public ShowSaveButton: boolean = true;
    public ShowCancelButton: boolean = true;
    public ModalSource:string = "";
    public ModalWidth = "";
    // public BlockItemsContainer:boolean = false;

    LoadAttributes = (attributes:IAttribute[]):Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            resolve(true);
        });
    }
}