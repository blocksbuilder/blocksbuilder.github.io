import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, IStepExecutor, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';

/**
 * Step for String interpolation
 * @description  supply array of IStepParam [{"Source1":string}, {"Source2":string}, {"Destination":string}]
 * @param       Source          one or multiple source attributes 
 * @param       Destination     one destination attribute with string to interpolate
 */
export class BBInterpolate implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Step for String interpolation
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Source":string, "Destination":string}[]
    * @param    Source          one or multiple source attributes 
    * @param    Destination     one destination attribute with string to interpolate
    * @param    stepData        data from previous step (optional). It is not used in this step
    */
    Execute(element: Element, actionStep: IActionStep, stepData: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.interpolate();
    }

    /**
     * Interpolate string
     * @param stepData data from previous step (optional)
     */
    private interpolate = async (): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false };
        try {
            // get params attribute from StepAttributes
            const params: any = this.StepAttributes.find(a => a.Name.toLowerCase() == "params");
            !params && (() => {
                response.Status = false;
                response.Response = "Invalid Step Parameters";
                return response;
            })();
            // parse params value
            const stepParams: IStepParam[] = params.Value;
            // get destination string to interpolate
            let destParam = stepParams.find(a => a.Destination?.length>0);
            let destString = destParam.Destination;
            // loop through paramValues (IStepParam) and set values
            for (let index = 0; index < stepParams.length; index++) {
                const stepParam = stepParams[index];
                if (!stepParam.Destination) {
                    // get source value
                    const sourceValue = await BBElementRegistryHelper.GetSourceValue(this.TriggeringElement, 
                        stepParam.Source, null, stepParam.Format, stepParam.ValueProperty);
                    // interpolate string
                    const textToFind = "${" + index.toString().trim() + "}";
                    destString = destString.replace(textToFind, sourceValue);
                }
            }
            response.Status = true;
            response.Response = destString;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}