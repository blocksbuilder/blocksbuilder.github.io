import { PreActionAttributeEnum, PostActionAttributeEnum, ActionStageEnum, IAction, ErrorActionAttributeEnum } from "../../../../models/action/bb-actionmodel";
import { IItem } from "../../../../models/block/bb-blockmodel";
import { BBAttributeHelper } from "../../../helpers/bb-attribute-helper";
import { BBCardModal } from "../../../../elements/blocks/containers/modals/cardmodal/bb-cardmodal";
import { BBElementRegistryHelper } from "../../../helpers/bb-elementregistry-helper";
import { BBStepsCommon } from "../steps/common/bb-stepscommon";

export class BBActionAttributeFactory {
    private static preActionAttributeProvider = {
        [PreActionAttributeEnum.showloading]:(element:Element, action:IAction, item?:IItem) => { 
                BBActionAttributeFactory.toggleLoading(PreActionAttributeEnum.showloading, element, action);
        },
        [PreActionAttributeEnum.showprogress]:(element:Element, action:IAction, item?:IItem) => { 
            BBActionAttributeFactory.showProgress(PreActionAttributeEnum.showprogress, element, action);
        }
    }

    private static errorActionAttributeProvider = {
        [ErrorActionAttributeEnum.showloading]:(element:Element, action:IAction, item?:IItem) => 
            { 
                BBActionAttributeFactory.HideLoading(element);
            },
        [ErrorActionAttributeEnum.failurenotification]:(element:Element, action:IAction, item?:IItem) => 
            { 
                BBActionAttributeFactory.showErrorNotification(ErrorActionAttributeEnum.failurenotification, element, action);
            }
    }

    private static postActionAttributeProvider = {
            [PostActionAttributeEnum.showloading]:(element:Element, action:IAction, item?:IItem) => 
                { 
                    BBActionAttributeFactory.toggleLoading(PostActionAttributeEnum.showloading, element, action);
                },
            [PostActionAttributeEnum.successnotification]:(element:Element, action:IAction, item?:IItem) => 
                { 
                    BBActionAttributeFactory.showSuccessNotification(PostActionAttributeEnum.successnotification, element, action);
                },
            [PostActionAttributeEnum.showcardmodal]:(element:Element, action:IAction, item?:IItem) => 
                { 
                    BBActionAttributeFactory.showCardModal(PostActionAttributeEnum.showcardmodal, element, action);
                },
            [PostActionAttributeEnum.hidecardmodal]:(element:Element, action:IAction, item?:IItem) => 
                { 
                    BBActionAttributeFactory.hideCardModal(PostActionAttributeEnum.hidecardmodal, element, action);
                },
            [PostActionAttributeEnum.hideprogress]:(element:Element, action:IAction, item?:IItem) => 
                { 
                    BBActionAttributeFactory.hideProgress(PostActionAttributeEnum.hideprogress, element, action);
                },
            [PostActionAttributeEnum.print]:(element:Element, action:IAction, item?:IItem) => 
                { 
                    BBActionAttributeFactory.printPreview(PostActionAttributeEnum.hideprogress, element, action);
                },
    }

    private static actionAttributeProvider = {
        [ActionStageEnum.pre]:(element:Element, actionAttributeName:string, action:IAction, item?:IItem) => 
            {
                BBActionAttributeFactory.preActionAttributeProvider.hasOwnProperty(actionAttributeName) && 
                    BBActionAttributeFactory.preActionAttributeProvider[actionAttributeName](element, action, item);
            },
        [ActionStageEnum.post]:(element:Element, actionAttributeName:string, action:IAction, item?:IItem) => 
            {
                BBActionAttributeFactory.postActionAttributeProvider.hasOwnProperty(actionAttributeName) &&
                    BBActionAttributeFactory.postActionAttributeProvider[actionAttributeName](element, action, item);
            },
        [ActionStageEnum.error]:(element:Element, actionAttributeName:string, action:IAction, item?:IItem) => 
            {
                BBActionAttributeFactory.errorActionAttributeProvider.hasOwnProperty(actionAttributeName) &&
                    BBActionAttributeFactory.errorActionAttributeProvider[actionAttributeName](element, action, item);
            },
    }

    private static toggleLoading = (actionAttributeName:string, element:Element, action:IAction) => {
        // const canShowLoading = BBAttributeHelper.GetAttributeValue(actionAttributeName, action.Attributes).BBToBoolean();
        element.classList.toggle("is-loading");
    }

    private static showProgress = (actionAttributeName:string, element:Element, action:IAction) => {
        const rootContainer = BBElementRegistryHelper.GetBBRoot(element);
        rootContainer && rootContainer.ShowProgressModal();
    }

    private static hideProgress = (actionAttributeName:string, element:Element, action:IAction) => {
        const rootContainer = BBElementRegistryHelper.GetBBRoot(element);
        rootContainer && rootContainer.HideProgressModal();
    }
   
    private static showSuccessNotification = (actionAttributeName:string, element:Element, action:IAction) => {
        const successNotification = BBAttributeHelper.GetAttributeValue(actionAttributeName, action.Attributes);
        const rootContainer = BBElementRegistryHelper.GetBBRoot(element);
        rootContainer && rootContainer.ShowProgressModal(successNotification, true, false);
    }

    private static showCardModal = (actionAttributeName:string, element:Element, action:IAction) => {
        const elementRegistry = BBElementRegistryHelper.GetBBElementRegistry(element);
        const cardModalId = BBAttributeHelper.GetAttributeValue(actionAttributeName, action.Attributes);
        const bbCardModal = <BBCardModal> elementRegistry.FindContainerElementByUniqueId(cardModalId);
        bbCardModal && bbCardModal.Toggle();
    }

    private static hideCardModal = (actionAttributeName:string, element:Element, action:IAction) => {
        BBActionAttributeFactory.showCardModal(actionAttributeName, element, action);
    }

    private static printPreview = (actionAttributeName:string, element:Element, action:IAction) => {
        BBStepsCommon.WindowPrint();
    }

    private static showErrorNotification = (actionAttributeName:string, element:Element, action:IAction) => {
        const errorNotification = BBAttributeHelper.GetAttributeValue(actionAttributeName, action.Attributes);
        const rootContainer = BBElementRegistryHelper.GetBBRoot(element);
        rootContainer && rootContainer.ShowProgressModal(errorNotification, true, true);
    }

    public static ApplyActionAttributes = (element:Element, action:IAction, 
        actionStage:ActionStageEnum, item?:IItem) => {

        for (let index = 0; index < action?.Attributes?.length; index++) {
            const actionAttributeName = action.Attributes[index].Name;
            BBActionAttributeFactory.actionAttributeProvider[actionStage](element, actionAttributeName, action, item);
        }
    }

    public static HideLoading = (element:Element) => {
        element.classList.contains("is-loading") && element.classList.remove("is-loading");
    }
}
