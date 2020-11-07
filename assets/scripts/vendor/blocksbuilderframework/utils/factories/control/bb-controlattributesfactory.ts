import { ControlTypeEnum } from '../../../models/enums/bb-enums';
import { IAttribute, IElementAttributes } from "../../../models/attribute/common/bb-attributesmodel";
import { BBAccordionAttributes } from '../../../models/attribute/control/bb-accordionattributes';
import { BBBannerAttributes } from '../../../models/attribute/control/bb-bannerattributes';
import { BBBreadcrumbAttributes } from '../../../models/attribute/control/bb-breadcrumbattributes';
import { BBPaginationAttributes } from '../../../models/attribute/control/bb-paginationattributes';
import { BBTileAttributes } from '../../../models/attribute/control/bb-tileattributes';

export class BBControlAttributesFactory {
    private constructor() {

    }

    private static _attributeProviders = {
        [ControlTypeEnum.accordion]: () => {return new BBAccordionAttributes();},
        [ControlTypeEnum.banner]: () => {return new BBBannerAttributes();},
        [ControlTypeEnum.breadcrumb]: () => {return new BBBreadcrumbAttributes();},
        [ControlTypeEnum.pagination]: () => {return new BBPaginationAttributes();},
        [ControlTypeEnum.tile]: () => {return new BBTileAttributes();},
    }

    static GetControlAttributes = (controlType:ControlTypeEnum, attributes:IAttribute[]):IElementAttributes => {
        return controlType ? (() => {
            const controlAttributes:IElementAttributes = BBControlAttributesFactory._attributeProviders[controlType]();
            controlAttributes.LoadAttributes(attributes);
            return controlAttributes;
        })() :
        undefined;
        // if (controlType) {
        //     let controlAttributes:IElementAttributes = BBControlAttributesFactory._attributeProviders[controlType]();
        //     controlAttributes.LoadAttributes(attributes);
        //     return controlAttributes;
        // }
    }
}