import { IAttribute } from '../attribute/common/bb-attributesmodel';
import { IAction } from '../action/bb-actionmodel';

export interface IElement {
    ID: string;
    Title?: string;
    Attributes?: IAttribute[];
    Actions?: IAction[];
}
