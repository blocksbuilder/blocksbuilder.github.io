//import { BBStepCommon } from '../common/bb-stepcommon';
import { IAttribute } from '../../../../../../models/attribute/common/bb-attributesmodel';
import { IStepExecutor, IActionStep, IExecuteResponse, IStepParam } from '../../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../../helpers/bb-elementregistry-helper';
import { BBGrid } from '../../../../../../elements/blocks/data/grid/bb-grid';

/**
 * Step to unhide the hidden grid columns by step "hidegridcols"
 * @description  supply array of IStepParam {"Destination":string, "Value":"col1,col2,col3"}[]
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
 */
export class BBUnHideGridColumns implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute unhide the hidden grid columns by step "hidegridcols"
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Destination":string, "Value":"col1,col2,col3"}[]
    * @param    Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
    * @param    Value           comma seperated string of column ids
    * @param    stepData        data from previous step (optional). No use in this step
    */
    Execute(element:Element, actionStep: IActionStep, stepParams: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.unHideGridColumns();
    }

    private unHideGridColumns = async ():Promise<IExecuteResponse> => {
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
            // loop through paramValues (IStepParam) and clear data blocks
            stepParams.forEach((stepParam:IStepParam) => {
                // get destination
                const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, 
                    stepParam.Destination);
                // loop through data blocks and clear values
                destinationBlocks.forEach((gridBlock:BBGrid) => {
                    // get table
                    const table = gridBlock.shadowRoot.querySelector("table");
                    // get all headers
                    const headers = Array.from(table.querySelectorAll("th"));
                    // get all the cells
                    const cells = Array.from(table.querySelectorAll("td"));

                    // unhide cells that were hidden before
                    const hiddenHeaders = headers?.filter(h => h.classList.contains("bb-step-hidden"));
                    hiddenHeaders?.length > 0 && hiddenHeaders.forEach(h => {
                        h.classList.remove("bb-step-hidden");
                        h.style.display="";
                    });
                    // unhide cells that were hidden before
                    const hiddenCells = cells?.filter(c => c.classList.contains("bb-step-hidden"));
                    hiddenCells?.length > 0 && hiddenCells.forEach(c => {
                        c.classList.remove("bb-step-hidden");
                        c.style.display="";
                    });
                });
            });
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}