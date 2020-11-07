import { BBElement } from "../bb-element";
import { ElementEventsEnum, ControlTypeEnum } from "../../models/enums/bb-enums";
import { IElementAttributes, IAttribute } from "../../models/attribute/common/bb-attributesmodel";
import { Common } from '../../utils/helpers/bb-common-helper';
import { BBControlAttributesFactory } from '../../utils/factories/control/bb-controlattributesfactory';
import { IControl } from '../../models/control/bb-controlmodel';
import { HTMLElementFactory } from '../../utils/factories/html/bb-htmlfactory';

export abstract class BBControl extends BBElement {
    private _controlType: ControlTypeEnum;
    private _controlAttributes: IElementAttributes;
    private _controlSource: IControl;

    constructor(controlType?: ControlTypeEnum) {
        // Always call super first in constructor
        super();
        // set block type
        this._controlType = controlType;
        // listen for attribute changed event
        this.addEventListener(ElementEventsEnum.attributechanged, async (event: CustomEvent) => {
            if (event.detail.name == 'bb-controlsource' && event.detail.newValue) {
                this._controlSource = await Common.FetchControl(this.ControlSource);
                this.sendDataBoundNotification();
            }
        });

        // add listener for Data Bound event
        this.addEventListener(ElementEventsEnum.controldatabound, () => {
            // render the block once data is bound
            this.renderControl().then(() => {
                // dispatch block loaded event
                this.RaiseCustomEvent(ElementEventsEnum.controlloaded, true);
            });
        });
    }

    get ControlAttributes(): IElementAttributes {
        return this._controlAttributes;
    }

    get ControlSource() {
        return this.getAttribute('bb-controlsource');
        // if (this.hasAttribute('bb-controlsource')) {
            // return this.getAttribute('bb-controlsource');
        // }
    }

    set ControlSource(value: string) {
        this.setAttribute('bb-controlsource', value);
    }

    get ControlData() {
        return this._controlSource;
    }

    set ControlData(value) {
        this._controlSource = value;
        this.sendDataBoundNotification();
    }

    public renderControl = (): Promise<boolean> => {
        return new Promise(resolve => {
            resolve(true);
        })
    }

    private sendDataBoundNotification = async () => {
        // get control attributes
        this._controlAttributes = BBControlAttributesFactory.GetControlAttributes(this._controlType, this._controlSource.Attributes);
        // add external styles if available
        if (this._controlAttributes?.CSSFiles) {
            HTMLElementFactory.AttachCSSFromList(this, this._controlAttributes.CSSFiles);
        }
        // raise databound event
        this.RaiseCustomEvent(ElementEventsEnum.controldatabound, true);
    }
}
