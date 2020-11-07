import { IElementAttributes, IAttribute } from '../../attribute/common/bb-attributesmodel';
import { BBAttributes } from '../../attribute/common/bb-attributesbase';

export class BBBannerAttributes extends BBAttributes implements IElementAttributes {
    LoadAttributes(attributes: IAttribute[]) {
        super.LoadCommonAttributes(attributes, this);
    }
}
