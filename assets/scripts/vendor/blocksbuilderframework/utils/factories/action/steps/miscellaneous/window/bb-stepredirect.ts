import { IAttribute } from '../../../../../../models/attribute/common/bb-attributesmodel';
import { IStepExecutor, IActionStep, IExecuteResponse, IStepParam, IAPIRequest, StepAttributeEnum } from '../../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../../helpers/bb-elementregistry-helper';
import { BBAttributeHelper } from '../../../../../helpers/bb-attribute-helper';
import { Common } from '../../../../../helpers/bb-common-helper';
import { BBURLParamsCommon } from '../../common/bb-urlparamscommon';

/**
 * Step to redirect to url
 * @description  supply array of IStepParam {"Destination":string}[]
 * @param       Destination     url to redirect
 */
export class BBStepRedirect implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;
    private previousStepData:any;

    /**
    * Execute step to redirect to URL
    * @param    element             Element triggering the action
    * @param    actionStep          Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     stepconfigsource    config source
    * @param    stepData            data from previous step (optional). No use in this step
    */
    Execute(element: Element, actionStep: IActionStep, stepParams: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        this.previousStepData = stepParams;
        return this.redirect();
    }

    private getRedirectURL = async ():Promise<IAPIRequest> => {
        // check stepconfigsource attribute
        const stepconfigsource = BBAttributeHelper.GetAttributeValue(StepAttributeEnum.stepconfigsource, this.StepAttributes);
        if (!stepconfigsource) return null;
        const stepConfig:IAPIRequest = await Common.FetchJSON(stepconfigsource);
        stepConfig.URL += stepConfig.Endpoint ? stepConfig.Endpoint : "";
        // get REST parameters
        stepConfig.REST?.length > 0 && await BBURLParamsCommon.PopulateRESTParams(this.TriggeringElement, stepConfig, this.previousStepData);
        // get query parameters
        stepConfig.Query?.length > 0 && await BBURLParamsCommon.PopulateQueryParameters(this.TriggeringElement, stepConfig, this.previousStepData);
        return stepConfig;
    }

    private redirect = async (): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false };
        try {
            const redirectConfig = await this.getRedirectURL();
            window.open(redirectConfig.URL, redirectConfig.Target, redirectConfig.Features, redirectConfig.Replace);
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}