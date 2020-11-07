import { ControlTypeEnum } from "../../../models/enums/bb-enums";
import { BBTile } from "../../../elements/controls/tile/bb-tile";
import { BBAccordion } from "../../../elements/controls/accordion/bb-accordion";
import { BBBreadCrumb } from "../../../elements/controls/breadcrumb/bb-breadcrumb";
import { BBPagination } from "../../../elements/controls/pagination/bb-pagination";
import { BBBanner } from "../../../elements/controls/banner/bb-banner";
import { IControl } from '../../../models/control/bb-controlmodel';
import { BBControl } from '../../../elements/controls/bb-control';
import { BBElement } from '../../../elements/bb-element';
import { Common } from '../../helpers/bb-common-helper';
import { IAttribute } from '../../../models/attribute/common/bb-attributesmodel';

export class BBControlFactory {
    private constructor() {

    }

    private static controlProvider = {
        [ControlTypeEnum.accordion]: () => { return new BBAccordion(); },
        [ControlTypeEnum.pagination]: () => { return new BBPagination(); },
        [ControlTypeEnum.banner]: () => { return new BBBanner(); },
        [ControlTypeEnum.breadcrumb]: () => { return new BBBreadCrumb(); },
        [ControlTypeEnum.tile]: () => { return new BBTile(); }
    }

    public static async BuildControlAsync(elementSource: string,
        ...overrideAttributes: IAttribute[]): Promise<BBElement> {
        try {
            const elementModel = await Common.FetchJSON(elementSource);
            return await BBControlFactory.BuildControlFromControlSourceAsync(elementModel, overrideAttributes);
        } catch (error) {
            return null;
        }
    }

    public static async BuildControlFromControlSourceAsync(controlSource: IControl,
        overrideAttributes?: IAttribute[]): Promise<BBControl> {
        return new Promise((resolve, reject) => {
            !controlSource && reject("Unable to build control");

            (overrideAttributes && controlSource) && (() => {
                controlSource?.Attributes?.length == 0 ?
                    controlSource.Attributes = overrideAttributes :
                    (overrideAttributes.forEach(atttibute => {
                        const foundAttr = controlSource.Attributes.find(attr => attr.Name == atttibute.Name);
                        foundAttr ? foundAttr.Value = atttibute.Value :
                            controlSource.Attributes.push(atttibute);
                    }));
            })();
            // // check if attributes needs to be overridden 
            // if (overrideAttributes && controlSource) {
            //     controlSource?.Attributes?.length == 0 ?
            //         controlSource.Attributes = overrideAttributes :
            //         (overrideAttributes.forEach(atttibute => {
            //             const foundAttr = controlSource.Attributes.find(attr => attr.Name == atttibute.Name);
            //             foundAttr ? foundAttr.Value = atttibute.Value :
            //                 controlSource.Attributes.push(atttibute);
            //         }));
            // }
            const bbControl: BBControl = BBControlFactory.controlProvider[controlSource?.Type]();
            bbControl.ControlData = controlSource;
            resolve(bbControl);
        });
    }
}
