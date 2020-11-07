import { IItem } from "../../../../models/block/bb-blockmodel";
import { IAction, ActionStageEnum, PreActionAttributeEnum, IExecuteResponse, ErrorActionAttributeEnum, IActionStep, StepAttributeEnum } from "../../../../models/action/bb-actionmodel";
import { BBActionAttributeFactory } from "./bb-actionattributefactory";
import { BBAttributeHelper } from "../../../helpers/bb-attribute-helper";
import { BBActionStepFactory } from "./bb-stepfactory";
import { BBElementRegistryHelper } from "../../../helpers/bb-elementregistry-helper";
import { BBRulesEngine } from "../../../helpers/bb-rules-engine";
import { CommonAttributesEnum, ElementEventsEnum } from "../../../../models/enums/bb-enums";
import { BBRoot } from "../../../../elements/blocks/containers/root/bb-root";

export class BBTriggerCommon {
    /**
     * Determines whether step can be executed
     */
    private static canExecuteStep = (ignoreStepError: boolean, previousStepResponse: IExecuteResponse): boolean => {
        return ignoreStepError || (!previousStepResponse || !previousStepResponse?.Error);
    }
    /**
     * Executes the trigger
     */
    public static ExecuteTrigger = async (element: Element, item: IItem, action: IAction): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false, Response: [] };
        // add progress spinner Starts **************************** 
        const spinnerClass = "spinner";
        // get root
        const rootContainer = BBElementRegistryHelper.GetBBRoot(element);
        rootContainer && rootContainer.classList.toggle(spinnerClass);
        // add progress spinner Ends **************************** 

        try {
            // PRE ACTION
            // check if ignoreStepError attribute is set on action
            const ignoreStepError: boolean = BBAttributeHelper.GetAttributeValue(PreActionAttributeEnum.ignoresteperror, action.Attributes).BBToBoolean();
            // apply pre action attributes
            BBActionAttributeFactory.ApplyActionAttributes(element, action, ActionStageEnum.pre, item);
            
            // execute steps
            let previousStepOutput: IExecuteResponse;

            for (let index = 0; index < action?.Steps?.length; index++) {
                // let stopExecution = false;
                const actionStep = action.Steps[index];
                // check if step can be executed
                let canStepBeExecuted = BBTriggerCommon.canExecuteStep(ignoreStepError, previousStepOutput);
                // execute step if can be executed
                if (canStepBeExecuted) {
                    // evaluate rules (if available)
                    const ruleEvaluatedSuccess = actionStep.Rules ? await BBRulesEngine.EvaluateRules(element, 
                        actionStep.Rules, previousStepOutput) : true;
                    if (ruleEvaluatedSuccess) {
                        previousStepOutput = await BBTriggerCommon.ExecuteStep(actionStep.Name, 
                            element, actionStep, previousStepOutput, item);

                        // check if step resulted in an error and show error notification and hide loading
                        canStepBeExecuted = BBTriggerCommon.canExecuteStep(ignoreStepError, previousStepOutput);
                        if (!canStepBeExecuted) {
                            BBTriggerCommon.stopStepsExecution(element, previousStepOutput, action, actionStep, rootContainer);
                            break;
                        }
                    } else {
                        previousStepOutput = {Status:!actionStep.Rules[0]?.IsBusinessRule, 
                            Response:"Rule evaluation failed", 
                            Error: actionStep.Rules[0].IsBusinessRule ? 
                                new Error(actionStep.Rules[0].Message || "Business Rule validation failure") : null};
                    }
                } else {
                    // check if previous step resulted in an error and show error notification and hide loading
                    BBTriggerCommon.stopStepsExecution(element, previousStepOutput, action, actionStep, rootContainer);
                    break;
                }
                // append step response
                const stepResponse = {
                    StepNo: index,
                    sStepStatus: previousStepOutput?.Status, StepResponse: previousStepOutput?.Response
                };
                response.Response.push(stepResponse);
            }
            // POST ACTION
            // apply post action attributes
            previousStepOutput?.Status &&
                (BBActionAttributeFactory.ApplyActionAttributes(element, action,
                    ActionStageEnum.post, item));
            response.Status = true;
        } catch (error) {
            // remove progress spinner on error
            rootContainer && rootContainer.classList.toggle(spinnerClass);
            response.Status = false;
            response.Error = error;
            // apply error action attributes
            BBActionAttributeFactory.ApplyActionAttributes(element, action, ActionStageEnum.error, item);
            BBActionAttributeFactory.HideLoading(element);
        } finally {
            // remove progress spinner
            rootContainer && rootContainer.classList.remove(spinnerClass);
            BBActionAttributeFactory.HideLoading(element);
        }
        return response;
    }

    public static ExecuteStep = async (actionStepName:string, 
        element:Element, 
        actionStep:IActionStep, 
        previousStepOutput:IExecuteResponse, 
        item:IItem):Promise<IExecuteResponse> => {
        let response:IExecuteResponse;
        try {
            BBTriggerCommon.dispatchStepProgressStatusEvent(element, 
                undefined, StepAttributeEnum.stepprogressstartmessage, actionStep);
            
            response = await BBActionStepFactory.ActionStepProvider[actionStepName](element,actionStep, 
                previousStepOutput?.Response, item);            

            const progressMessageType = response.Status ? 
                StepAttributeEnum.stepprogresssendmessage : 
                StepAttributeEnum.stepprogressserrormessage;
            
            BBTriggerCommon.dispatchStepProgressStatusEvent(element, undefined, progressMessageType, actionStep);
        } catch (error) {
            BBTriggerCommon.dispatchStepProgressStatusEvent(element, 
                undefined, StepAttributeEnum.stepprogressserrormessage, actionStep);
        }
        return response;
    }

    private static stopStepsExecution = (element:Element, 
        previousStepOutput:IExecuteResponse, action:IAction, 
        actionStep:IActionStep, rootContainer:BBRoot) => {
        // check if previous step resulted in an error and show error notification and hide loading
        previousStepOutput?.Error && (() => {
            const errorNotification = BBAttributeHelper.GetAttributeValue(ErrorActionAttributeEnum.failurenotification,
                action.Attributes);
            const errorMessage = BBAttributeHelper.GetAttributeValue(StepAttributeEnum.stepprogressserrormessage, 
                actionStep.Attributes) || previousStepOutput.Error?.message || ""; 
            rootContainer && 
                rootContainer.
                    ShowProgressModal(`${errorMessage}, ${errorNotification}`, true, true);
        })();
        BBActionAttributeFactory.HideLoading(element);
    }

    private static dispatchStepProgressStatusEvent = (
        element:Element, 
        message?:string,
        stepProgressAttributeName?:StepAttributeEnum, 
        stepInfo?:IActionStep, ) => {

        const progressMessage = message ? 
            message :
            (stepProgressAttributeName && stepInfo) ?
                BBAttributeHelper.GetAttributeValue(stepProgressAttributeName, 
                    stepInfo.Attributes) :
            "";
        
        progressMessage && (() => {
            const isErrorMessage = progressMessage == StepAttributeEnum.stepprogressserrormessage;
            // get rootid
            const rootId = element.getAttribute(CommonAttributesEnum.rootid);
            // raise bb-itemelementadded event
            const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbstepstatuschanged,
                {
                    detail: {element:element, rootId:rootId, message:progressMessage, isError:isErrorMessage}, 
                    bubbles: true,
                    cancelable: false, 
                    composed: true
                });
            dispatchEvent(bbcustomEvent);
        })();
    }    
}