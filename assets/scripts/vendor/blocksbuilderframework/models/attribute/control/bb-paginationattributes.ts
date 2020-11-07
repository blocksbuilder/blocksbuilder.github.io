import { IElementAttributes, IAttribute } from '../../attribute/common/bb-attributesmodel';
import { BBAttributes } from '../../attribute/common/bb-attributesbase';

export class BBPaginationAttributes extends BBAttributes implements IElementAttributes {
    public TargetContainerID?: string = "";
    public PageLength?:string = "5";

    LoadAttributes(attributes: IAttribute[]) {
        super.LoadCommonAttributes(attributes, this);
    }
}
