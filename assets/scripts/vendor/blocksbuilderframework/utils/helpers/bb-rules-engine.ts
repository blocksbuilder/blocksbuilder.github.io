import { IRule, ICondition, LogicalOperatorEnum, ComparisonOperatorEnum, ComparisonTypeEnum, IExecuteResponse } from "../../models/action/bb-actionmodel";
import { Common } from "./bb-common-helper";
import { BBElementRegistryHelper } from "./bb-elementregistry-helper";

export class BBRulesEngine {
    private static triggeringElement:Element;
    private static previousStepData:any;

    private static compare = {
        [ComparisonOperatorEnum.equals]: (condition:ICondition, sourceValue:any):boolean => { 
            return BBRulesEngine.compareEquals(condition, sourceValue);
        },
        [ComparisonOperatorEnum.notequal]: (condition:ICondition, sourceValue:any):boolean => {
            return BBRulesEngine.compareNotEqual(condition, sourceValue);
        },
        [ComparisonOperatorEnum.greaterthan]: (condition:ICondition, sourceValue:any):boolean => {
            return BBRulesEngine.compareGreaterThan(condition, sourceValue);
        },
        [ComparisonOperatorEnum.greaterthanorequal]: (condition:ICondition, sourceValue:any):boolean => {
            return BBRulesEngine.compareGreaterThanOrEqual(condition, sourceValue);
        },
        [ComparisonOperatorEnum.lessthan]: (condition:ICondition, sourceValue:any):boolean => {
            return BBRulesEngine.compareLessThan(condition, sourceValue);
        },
        [ComparisonOperatorEnum.lessthanorequal]: (condition:ICondition, sourceValue:any):boolean => {
            return BBRulesEngine.compareLessThanOrEqual(condition, sourceValue);
        },
        [ComparisonOperatorEnum.in]: (condition:ICondition, sourceValue:any):boolean => {
            return BBRulesEngine.compareIn(condition, sourceValue);
        },
        [ComparisonOperatorEnum.minmaxrange]: (condition:ICondition, sourceValue:any):boolean => {
            return BBRulesEngine.compareRange(condition, sourceValue);
        }
    };

    private static convert = {
        [ComparisonTypeEnum.boolean]: (value:string):boolean => { return value.BBToBoolean();},
        [ComparisonTypeEnum.number]: (value:string):number => { return value.toString().BBToNumber();},
        [ComparisonTypeEnum.date]: (value:string):Date => { return new Date(value);},
        [ComparisonTypeEnum.text]: (value:string):string => { return value.toString();},
    }

    private static getSourcePropVal = (sourceValue:any, sourceProp?:string):any => {
        const isJSON = Common.IsValidJSON(sourceValue);
        const parsedValue = isJSON ? JSON.parse(sourceValue) : sourceValue;
        const sourcePropArray = sourceProp && sourceProp.split('.');
        let value = parsedValue;
        sourcePropArray?.forEach((propName:string) => {
            const prop = propName.replace("[", "").replace("]", "");
            value = value[prop];
        });
        return value;
    }

    private static compareEquals = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftValue = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            return BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](leftValue) == 
                BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](condition.Values[0]);
        } catch {
            return true;            
        }
    }

    private static compareNotEqual = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftValue = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            return BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](leftValue) != 
                BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](condition.Values[0]);
        } catch {
            return true;            
        }
    }

    private static compareGreaterThan = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftValue = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            return BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](leftValue) > 
                BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](condition.Values[0]);
        } catch {
            return true;            
        }
    }

    private static compareGreaterThanOrEqual = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftValue = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            return BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](leftValue) >=
                BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](condition.Values[0]);
        } catch {
            return true;            
        }
    }

    private static compareLessThan = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftValue = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            if (!leftValue) return true;
            return BBRulesEngine.convert[condition.ComparisonType.toLowerCase()](leftValue) <
                BBRulesEngine.convert[condition.ComparisonType.toLowerCase()](condition.Values[0]);
        } catch {
            return true;            
        }
    }

    private static compareLessThanOrEqual = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftValue = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            return BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](leftValue) <=
                BBRulesEngine.
                    convert[condition.ComparisonType.toLowerCase()](condition.Values[0]);
        } catch {
            return true;            
        }
    }

    private static compareRange = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftVal = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            const valueToCompare = BBRulesEngine.
                convert[condition.ComparisonType.toLowerCase()](leftVal);
            const firstVal = BBRulesEngine.
                convert[condition.ComparisonType.toLowerCase()](condition.Values[0]);
            const lastVal = BBRulesEngine.
                convert[condition.ComparisonType.toLowerCase()](condition.Values[condition.Values.length-1]);
            return firstVal <= valueToCompare && lastVal >= valueToCompare;
        } catch {
            return true;            
        }
    }

    private static compareIn = (condition:ICondition, sourceValue:any):boolean => {
        try {
            const leftValue = BBRulesEngine.getSourcePropVal(sourceValue, condition.SourcePropName);
            return condition.Values.includes(leftValue);
        } catch {
            return true;            
        }
    }

    public static EvaluateRules = async (triggeringElement:Element, rules:IRule[], 
        previousStepOutput:IExecuteResponse):Promise<boolean> => {
        BBRulesEngine.triggeringElement = triggeringElement;
        BBRulesEngine.previousStepData = previousStepOutput?.Response;
        // loop through all the rules and evaluate
        const rulesEvaluationResult:boolean[] = [];
        for (let index = 0; index < rules.length; index++) {
            const rule = rules[index];
            const ruleEvaluationResult = await BBRulesEngine.EvaluateRule(rule);
            rulesEvaluationResult.push(ruleEvaluationResult);
        }
        return rulesEvaluationResult.every(value => value === true);
    }

    public static EvaluateRule = async (rule:IRule):Promise<boolean> => {
        // loop through conditions and evluate
        const conditionsEvaluationResult:boolean[] = [];
        for (let index = 0; index < rule.Conditions.length; index++) {
            const condition = rule.Conditions[index];
            const conditionEvaluationResult = await BBRulesEngine.EvaluateCondition(condition);
            conditionsEvaluationResult.push(conditionEvaluationResult);
        }

        // return result as per the logical operator
        // AND = all conditions have to be true, OR = one of them have to be true, NOT = none have to be true 
        const allTrue = (value) => value === true;

        !rule.LogicalOperator && (rule["LogicalOperator"] = LogicalOperatorEnum.and);
        const result = rule.LogicalOperator == 
            LogicalOperatorEnum.and ? conditionsEvaluationResult.every(allTrue) :
                rule.LogicalOperator == LogicalOperatorEnum.or ?
                    conditionsEvaluationResult.some(allTrue) :
                    !conditionsEvaluationResult.every(allTrue);
        return result;
    }

    public static EvaluateCondition = async (condition:ICondition):Promise<boolean> => {
        // get source element
        const sourceValue = await BBElementRegistryHelper.GetSourceValue(BBRulesEngine.triggeringElement, 
                condition.Source, BBRulesEngine.previousStepData);
        return BBRulesEngine.compare[condition.Comparison](condition, sourceValue);
    }
}