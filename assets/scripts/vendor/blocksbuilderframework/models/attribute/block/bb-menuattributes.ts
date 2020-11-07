import { IAttribute, IElementAttributes } from "../common/bb-attributesmodel";
import { BBAttributes } from '../common/bb-attributesbase';
import { BBAttributeHelper } from "../../../utils/helpers/bb-attribute-helper";
import { BlockAttributeTypeEnum } from "../../enums/bb-enums";

export class BBMenuAttributes extends BBAttributes implements IElementAttributes {
    public IsExpanded: boolean = false;
    LoadAttributes = (attributes: IAttribute[]): Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            // check if expanded attribute is available. If not, expand it by default
            const expandedAttributeValue = BBAttributeHelper.GetAttributeValue(BlockAttributeTypeEnum.isexpanded, attributes);
            if (expandedAttributeValue == "") this.IsExpanded = true;
            resolve(true);
        });
    }
}