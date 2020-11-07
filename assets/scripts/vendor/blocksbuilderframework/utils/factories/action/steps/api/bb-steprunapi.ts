import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, StepAttributeEnum, IStepExecutor, IExecuteResponse, StepDataFormatEnum, IAPIRequest, IStepParam, IAPIParam } from '../../../../../models/action/bb-actionmodel';
import { BBAttributeHelper } from '../../../../helpers/bb-attribute-helper';
import { Common } from '../../../../helpers/bb-common-helper';
import { BBConfig } from '../../../../../bbconfig';
import { IItemValue } from '../../../../../models/block/bb-blockmodel';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';
import { BBURLParamsCommon } from '../common/bb-urlparamscommon';

export class BBRunAPI implements IStepExecutor {
    StepAttributes: IAttribute[];
    CurrentElement: Element;
    CurrentRow: HTMLTableRowElement;
    private previousStepData:any;

    Execute(element: Element, actionStep: IActionStep, stepParams: any): Promise<IExecuteResponse> {
        this.previousStepData = stepParams;
        this.StepAttributes = actionStep.Attributes;
        this.CurrentElement = element;
        return this.runAPI(element, stepParams);
    }

    private getAPIRequest = async ():Promise<IAPIRequest> => {
        // check stepconfigsource attribute
        const stepconfigsource = BBAttributeHelper.GetAttributeValue(StepAttributeEnum.stepconfigsource, this.StepAttributes);
        if (!stepconfigsource) return null;
        const apiConfig:IAPIRequest = await Common.FetchJSON(stepconfigsource);
        // get API URL
        apiConfig.URL.toLowerCase() == "clientconfig" ?
            apiConfig.URL = BBConfig.ClientConfig[apiConfig.URLConfigName] :
        (async () => {
            const apiURLconfigName = apiConfig.URLConfigName ? apiConfig.URLConfigName : 0;
            const apiSourceObj = await Common.FetchJSON(apiConfig.URL);
            apiConfig.URL = `${apiSourceObj[apiURLconfigName]}`;
        })();
        apiConfig.URL += apiConfig.Endpoint ? apiConfig.Endpoint : "";
        // get api REST parameters
        //apiConfig.REST?.length > 0 && await this.populateRESTParams(apiConfig);
        apiConfig.REST?.length > 0 && await BBURLParamsCommon.PopulateRESTParams(this.CurrentElement, apiConfig, this.previousStepData);
        // get api query parameters
        //apiConfig.Query?.length > 0 && await this.populateQueryParameters(apiConfig);
        apiConfig.Query?.length > 0 && await BBURLParamsCommon.PopulateQueryParameters(this.CurrentElement, apiConfig, this.previousStepData);
        // get body parameters
        apiConfig.Body?.length > 0 && await this.populateBodyParameters(apiConfig);
        // get header parameters
        apiConfig.Headers?.length > 0 && await this.populateHeaderParameters(apiConfig);
        // generate fetch request options
        apiConfig.RequestOptions = this.getRequestOptions(apiConfig);
        // get content type 
        let contentType = apiConfig.Headers && apiConfig.Headers?.length > 0 ? 
        apiConfig.Headers.find(h => 
            h.Params.find(p => 
                p.Destination?.toLowerCase() == "content-type"))?.Params[0]?.Value :
        'application/json';
        // set default content type to "application/json" 
        !contentType && (contentType = "application/json"); 
        // set content type 
        contentType == 'application/json' && 
            (apiConfig.RequestOptions.headers  = { 'Content-Type': contentType});

        // check contentType, method and set body as per the content type 
        apiConfig.Method.toUpperCase() == "POST" && (() => {
            // get data source attribute
            const dataSource = BBAttributeHelper.
                GetAttributeValue(StepAttributeEnum.datasource,
                this.StepAttributes);
            // set body data
            const data = dataSource == "previous_step" ? this.previousStepData : dataSource;

            data && contentType == "application/json" ?
                apiConfig.RequestOptions["body"] = JSON.stringify(data) :
            !data && apiConfig.Body?.length > 0 && contentType == "application/json" ?
                apiConfig.RequestOptions["body"] = JSON.stringify(apiConfig.Body[0].Params) :
            !data && apiConfig.Body?.length > 0 && contentType == "multipart/form-data" && 
                (apiConfig.RequestOptions["body"] = this.getFormData(apiConfig.Body));
        })();
        return apiConfig;
    }

    private populateBodyParameters = async (apiConfig:IAPIRequest) => {
        for (let i = 0; i < apiConfig.Body.length; i++) {
            const body = apiConfig.Body[i];
            for (let j = 0; j < body.Params.length; j++) {
                const stepParam = body.Params[j];
                
                !stepParam.Value && (
                    stepParam.Value = await BBElementRegistryHelper.GetSourceValue(this.CurrentElement, 
                        stepParam.Source, this.previousStepData, stepParam.Format, stepParam.ValueProperty));
                // use caster if supplied.
                stepParam.Caster && (stepParam.Value = `${stepParam.Caster}(${stepParam.Value})`);
                // overwrite source field with block-itemid to make key/value pair
                const sourceElement = BBElementRegistryHelper.GetElement(this.CurrentElement, stepParam.Source);
                stepParam.Source = sourceElement?.BBGetBlockItemId() || `key_${j}`;
            }
        }
    }

    private populateHeaderParameters = async (apiConfig:IAPIRequest) => {
        for (let i = 0; i < apiConfig.Headers.length; i++) {
            const headerParam = apiConfig.Headers[i];
            for (let j = 0; j < headerParam.Params.length; j++) {
                const stepParam = headerParam.Params[j];
                !stepParam.Value && (
                    stepParam.Value = await BBElementRegistryHelper.GetSourceValue(this.CurrentElement, 
                        stepParam.Source, this.previousStepData, stepParam.Format, stepParam.ValueProperty));
            }
        }
    }

    private runAPI = async (element: Element, stepParams: any): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false };
        try {
            // check stepconfigsource attribute
            const apiRequestConfig = await this.getAPIRequest();
            if (apiRequestConfig) {
                // check if method is POST and body is empty
                const apiResponse = await this.executeFetchRequest(apiRequestConfig);
                response.Status = true;
                const fetchResponse = await apiResponse.json();
                response.Response = apiRequestConfig.ResponseMapping ? 
                    fetchResponse[apiRequestConfig.ResponseMapping] : fetchResponse;

                // check if transformation is needed
                const outputFormat = BBAttributeHelper.GetAttributeValue(StepAttributeEnum.outputformat,
                    this.StepAttributes);

                if (outputFormat && outputFormat == StepDataFormatEnum.itemvalues) {
                    // transform response to ItemValues
                    // loop through response.Response and create itemvalues array
                    if (response?.Response) {
                        const itemValues = [];
                        for (let index = 0; index < Object.keys(response.Response).length; index++) {
                            const itemValue: IItemValue = {
                                ID: Object.keys(response.Response)[index],
                                Value: Object.values(response.Response)[index]
                            };
                            itemValues.push(itemValue);
                        }
                        response.Response = itemValues;
                    }
                }
            }
        } catch (error) {
            response.Status = false;
            response.Error = error;
        }
        return response;
    }

    private executeFetchRequest = async (apiRequst:IAPIRequest): Promise<Response> => {
        return await fetch(apiRequst.URL, apiRequst.RequestOptions);
    }

    private getRequestOptions = (apiRequst:IAPIRequest, requestBody?: any): RequestInit => {
        const requestOptions: RequestInit = {
            method: apiRequst.Method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        };
        return requestOptions;
    }

    private getFormData = (body:IAPIParam[]) => {
        const formData = new FormData();
        body.forEach(apiParam => {
            apiParam.Params.forEach(param => {
                param.Value && formData.append(param.Source, param.Value);
            });
        });
        return formData;
    }
}