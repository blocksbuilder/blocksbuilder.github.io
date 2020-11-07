import { IElementAttributes, IAttribute } from '../../attribute/common/bb-attributesmodel';
import { BBAttributeHelper } from '../../../utils/helpers/bb-attribute-helper';
import { ControlAttributeTypeEnum } from '../../enums/bb-enums';
import { BBAttributes } from '../../attribute/common/bb-attributesbase';

export class BBAccordionAttributes extends BBAttributes implements IElementAttributes  {
    public IsExpanded: boolean = true;
    public IsHeaderSticky: boolean = false;
    public TargetContainerID: string = "";
    public BackgroundColor: string = "";
    public Color: string = "";
    public IconColor: string = "";
    // public AddSaveButton: boolean = false;
    // public AddUndoButton: boolean = false;

    LoadAttributes(attributes: IAttribute[]) {
        // load all the attributes
        super.LoadCommonAttributes(attributes, this);
        // check if expanded attribute is available. If not, expand it by default
        let expandedAttributeValue = BBAttributeHelper.GetAttributeValue(ControlAttributeTypeEnum.isexpanded, attributes);
        if (expandedAttributeValue == "") this.IsExpanded = true;
    }
}
