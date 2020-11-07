import { IAPIRequest, IStepParam } from "../../../../../models/action/bb-actionmodel";
import { BBElementRegistryHelper } from "../../../../helpers/bb-elementregistry-helper";

export class BBURLParamsCommon {
    public static PopulateRESTParams = async (triggeringElement:Element, apiConfig:IAPIRequest, previousStepData?:any) => {
        for (let i = 0; i < apiConfig.REST.length; i++) {
            const restParam = apiConfig.REST[i];
            for (let j = 0; j < restParam.Params.length; j++) {
                const stepParam = restParam.Params[j];
                !stepParam.Value && (
                    stepParam.Value = await BBURLParamsCommon.getEncodedSourceValue(triggeringElement, 
                        stepParam.Source, 
                        previousStepData, 
                        stepParam.Format, 
                        stepParam.Prefix, 
                        stepParam.Suffix,
                        stepParam.ValueProperty));
                apiConfig.URL += `${stepParam.Value}/`;
            }
        }
    }

    public static PopulateQueryParameters = async (triggeringElement:Element, apiConfig:IAPIRequest, previousStepData?:any) => {
        let canAppend = false;
        for (let i = 0; i < apiConfig.Query.length; i++) {
            const queryParam = apiConfig.Query[i];
            for (let index = 0; index < queryParam.Params.length; index++) {
                const stepParam = queryParam.Params[index];
                let sourceValue = stepParam.Source ? 
                    await BBURLParamsCommon.getEncodedSourceValue(triggeringElement, stepParam.Source, previousStepData, 
                        stepParam.Format, stepParam.Prefix, stepParam.Suffix, stepParam.ValueProperty) :
                    "";
                sourceValue = stepParam.DataType?.toLowerCase() == "datestr" ? `BBDATESTR_${sourceValue}` : sourceValue;
                // use caster if supplied.
                stepParam.Caster && (sourceValue = `${stepParam.Caster}(${sourceValue})`);
                !stepParam.Value ? 
                    (stepParam.Value = sourceValue) : 
                    (stepParam.Destination = sourceValue ? sourceValue : stepParam.Destination); 
            }
            queryParam?.Type?.toLowerCase() == "json" ?
                (() => {
                    apiConfig.URL += `${!canAppend ? '?' : '&'}${queryParam.Name}=${BBURLParamsCommon.getParamsValueInJSON(queryParam.Params)}`;
                    canAppend = true;
                })() :
            queryParam?.IncludeInQuery ? 
                (() => {
                    apiConfig.URL += `${!canAppend ? '?' : '&'}${queryParam.Name}=`;
                    canAppend = true;
                    // loop through and append each param value
                    // note: this should be changed to read param.value instead of param.Destination
                    queryParam.Params.forEach(param => {
                        apiConfig.URL += `${param.Value},`;
                    });
                    // remove extra ","
                    apiConfig.URL = apiConfig.URL.charAt(apiConfig.URL.length-1) == "," ? apiConfig.URL.slice(0, -1) : apiConfig.URL;
                })() :
            queryParam.Params.forEach(param => {
                const comparisonOperator = param.Comparison || "=";
                param.Value && !param.Destination ?
                    apiConfig.URL += `${!canAppend ? '?' : ','}${param.Value}` :
                param.Value && param.Destination &&
                    (apiConfig.URL += `${!canAppend ? '?' : '&'}${param.Destination || ""}${comparisonOperator}${param.Value}`);
                param.Value && (canAppend = true);
            });
        }
    }

    private static getEncodedSourceValue = async (triggeringElement:Element, source:string, 
        stepData?:any, format?:string, prefix?:string, suffix?:string, valueProperty?:string):Promise<any> => {
        let sourceValue =  await BBElementRegistryHelper.GetSourceValue(triggeringElement, 
            source, stepData, format, valueProperty);
        sourceValue != undefined && (sourceValue = encodeURIComponent(sourceValue));
        sourceValue && (sourceValue = `${prefix || ""}${sourceValue}${suffix || ""}`);
        return sourceValue;
    }

    private static getParamsValueInJSON = (params:IStepParam[]) => {
        let paramsValueJSON = "{";
        params.forEach(p => {
            const paramValue = p.Value.toString().BBToDataType((p.DataType ? p.DataType : "text"), true); 
            paramsValueJSON += `"${p.Destination}":${paramValue},`; 
        });
        paramsValueJSON = `${paramsValueJSON.substring(0, paramsValueJSON.length - 1)}}`;
        return paramsValueJSON;
    }
}