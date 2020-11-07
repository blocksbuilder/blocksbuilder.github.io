import { IItemValue } from '../../models/block/bb-blockmodel';
import { BBBlock } from '../../elements/blocks/bb-block';

export class BBBlockHelper {
    private constructor() {

    }

    /**
     * Binds data with one or multiple BBForm elements
     */
    public static BindFormData = 
        (itemValues:IItemValue[], ...elements:BBBlock[]):Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                let allDataElements:Element[] = [];
                // loop thru all the elements and get data elements
                elements.forEach(element => {
                    //element.ClearData();
                    allDataElements = allDataElements.concat(element.BBGetDataElements());
                });
                // loop thru all item values supplied and bind data
                itemValues.forEach(itemValue => {
                    // get HTMLElement
                    let element =  allDataElements.find(inputElement => 
                        inputElement.id == itemValue.ID);
                    // set value
                    element && element.BBSetDataItemValue(itemValue.Value); 
                });
                resolve(true);
            } catch (error) {
                reject(new Error(`Unable to bind data ${(<Error>error).message}`));
            }
        });
    }    
}