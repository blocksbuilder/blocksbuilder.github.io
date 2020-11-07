import { ControlTypeEnum } from '../enums/bb-enums';
import { IElement } from '../element/bb-elementmodel';

export interface IControl extends IElement {
    Type: ControlTypeEnum;
}
