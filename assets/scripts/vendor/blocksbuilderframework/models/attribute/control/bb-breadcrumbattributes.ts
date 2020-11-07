import { IElementAttributes, IAttribute } from '../common/bb-attributesmodel';
import { BBAttributes } from '../common/bb-attributesbase';

export class BBBreadcrumbAttributes extends BBAttributes implements IElementAttributes {
    public Path?: string = "";
    LoadAttributes(attributes: IAttribute[]) {
        super.LoadCommonAttributes(attributes, this);
    }
}