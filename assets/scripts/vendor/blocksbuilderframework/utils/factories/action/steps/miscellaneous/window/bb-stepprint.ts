import { IAttribute } from '../../../../../../models/attribute/common/bb-attributesmodel';
import { IStepExecutor, IActionStep, IExecuteResponse, IStepParam, IAPIRequest, StepAttributeEnum } from '../../../../../../models/action/bb-actionmodel';
import { BBAttributeHelper } from '../../../../../helpers/bb-attribute-helper';
import { Common } from '../../../../../helpers/bb-common-helper';
import { BBURLParamsCommon } from '../../common/bb-urlparamscommon';
import { BBStepsCommon } from '../../common/bb-stepscommon';

/**
 * Step to print screen
 */
export class BBStepPrint implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;
    private previousStepData:any;

    /**
    * Execute step to print screen
    * @param    element             Element triggering the action
    * @param    actionStep          Action Step information. 
    * @param    stepParams          this step needs no parameters
    */
    Execute(element: Element, actionStep: IActionStep, stepParams: any): Promise<IExecuteResponse> {
        return this.print();
    }

    private print = async (): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false };
        try {
            BBStepsCommon.WindowPrint();
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}