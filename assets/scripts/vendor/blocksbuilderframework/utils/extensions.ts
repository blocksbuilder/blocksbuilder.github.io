interface String {
    BBToDataType(dataType:string, escape?:boolean):any;
    BBToBoolean():boolean;
    BBToNumber():number;
    BBThousandsSeparator(): string;
    BBIsEmpty():boolean;  
    BBIsEmptyOrWhiteSpace():boolean;
    BBFormatAsNumber(decimals:string):string;
}

String.prototype.BBToDataType = function(this: string, dataType:string, escape?:boolean) {
    const retValue = 
        dataType === "text" ? 
            (escape ? `"${this.toString()}"` : this.toString()) :
        dataType === "number" ? this.BBToNumber() :
        dataType == "boolean" &&
            (escape ? `"${this.BBToBoolean()}"` : this.BBToBoolean());
    return retValue;
}

String.prototype.BBToBoolean = function(this: string) {
    return ((String(this).trim().toLowerCase() === 'yes' 
        || String(this).trim().toLowerCase() === 'true' 
        || String(this).trim() == '1') ? true : false);
}

String.prototype.BBToNumber = function(this: string) {
    return (this.BBIsEmptyOrWhiteSpace() ? 
        0 : Number.parseFloat(String(this)));
}

String.prototype.BBThousandsSeparator = function(this: string) {  
    return this.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}  

String.prototype.BBIsEmpty = function(this:string) {
    return (String(this) == null || String(this) === ""); 
}

String.prototype.BBIsEmptyOrWhiteSpace = function(this:string) {
    return (String(this).trim().BBIsEmpty());
}

String.prototype.BBFormatAsNumber = function(decimals:string) {
    let returnValue:string = '';
    String(this) && (() => {
        const fractionDigits = decimals ? decimals.BBToNumber() : 0;
        returnValue = Number(String(this).replace(/,/g, '')).toFixed(fractionDigits);    
    })();
    return returnValue;
}

class BBFConstants {
    public DATA_ELEMENT_CLASS:string = 'dataelement';
    public DATA_MODIFIED:string = 'bb-data-modified';
    public BLOCK_ITEM_CLASS:string = 'block-item';
    public BLOCK_ITEM_ELEMENT_CLASS:string = 'block-item-element';
    public BLOCK_ITEMID_ATTRIBUTE:string = 'bb-itemid';
    public BLOCK_ITEMTYPE_ATTRIBUTE:string = 'bb-itemtype';
    public BLOCK_ITEMTITLE_ATTRIBUTE:string = 'bb-title';
    public BLOCK_ROWID_ATTRIBUTE:string = 'rowid';
    public BLOCK_ROWNO_ATTRIBUTE:string = 'rowno';
}

class BBFExtensions {
    private _parentElement:Element = null;
    constructor(element) {
        this._parentElement = element;
    }

    public IsDataElement = () => {
        return (!this._parentElement.hasAttribute("static") 
            && (this._parentElement.nodeName.toLocaleLowerCase() === 'select' ||
            this._parentElement.nodeName.toLocaleLowerCase() === 'input' ||
            this._parentElement.nodeName.toLocaleLowerCase() === 'textarea' ||
            this._parentElement.nodeName.toLocaleLowerCase() === 'label') ) ? true : false;
    }
    // // marks element as data element if it is one
    public SetDataElementClass = () => {
        if (this.IsDataElement()) {
            this._parentElement.className += ` ${this._parentElement.BBConstants().DATA_ELEMENT_CLASS}`;
        }
    
    }
}

interface HTMLInputElement {
    BBFormattedValue():string;    
}

HTMLInputElement.prototype.BBFormattedValue = function(this:HTMLInputElement):string {
    return getFormattedValue(this, this.value);
    // const formattedValue = this.type === "number" ? (() => {
    //     // get decimals attribute
    //     const decimalDigits = this.getAttribute("decimals") || "";
    //     // get thousandseparator attribute
    //     const hasThousandSeparator = (this.getAttribute("thousandseparator") || "").BBToBoolean(); 
    //     let value = this.value.BBFormatAsNumber(decimalDigits);
    //     hasThousandSeparator && (value = value.BBThousandsSeparator()); 
    //     return value;
    // })() :
    // this.value;
    // return formattedValue;
}

Object.defineProperty(HTMLSelectElement, "text", { get: getSelectedText })

function getSelectedText(this:HTMLSelectElement):string {
    return this.selectedOptions[0].text;
}

interface Element {
    BBExtensions():BBFExtensions;
    BBConstants():BBFConstants;
    BBIsDataElement():boolean;
    // marks element as data element if it is one
    BBSetDATA_ELEMENT_CLASS():void;
    BBGetDataElements():Element[];
    BBGetBlockItemElements():Element[];
    BBGetModifiedDataElements():Element[];
    BBToggleDataModifiedAttribute():void;
    BBRemoveDataModifiedAttribute():void;
    BBSetDataModifiedAttribute():void;
    BBGetDataModifiedAttribute():string;
    BBGetDataItemValue():any;
    BBSetDataItemValue(value:string):void;
    BBResetRequiredFieldValidation():boolean;
    BBSetBlockItemClass():void;
    BBSetBlockItemElementClass():void;
    BBGetBlockItems():Element[];
    BBGetBlockItemValue():any;
    BBSetBlockItemValue(value:string):void;
    BBGetBlockItemId():string;
    BBSetBlockItemId(value:string):void;
    BBGetBlockItemType():string;
    BBSetBlockItemType(value:string):void;
    BBGetBlockItemTitle():string;
    BBSetBlockItemTitle(value:string):void;
    BBGetBlockRowId():string;
    BBSetBlockRowId(value:string):void;
    BBGetBlockRowNo():string;
    BBSetBlockRowNo(value:string):void;

    BBGetDataElementClassName():string;
    BBGetDataModifiedClassName():string;
    BBGetBlockItemClassName():string;
    BBGetBBBlockItemAttributeName():string;
    BBGetBlockItemTypeAttributeName():string;
    BBGetBlockItemTitleAttributeName():string;
    // BBGetBlockRowIdAttributeName():string;
    // BBGetBlockRowNoAttributeName():string;
}

const getByClassAll = (parent:Element, className:string) => {
    const mainElement = parent.shadowRoot ? parent.shadowRoot : parent;
    return mainElement.querySelectorAll(` .${className}`);
}

const getByClass = (parent:Element, className:string, getAll:boolean = false) => {
    const mainElement = parent.shadowRoot ? parent.shadowRoot : parent;
    return mainElement.querySelector(` .${className}`);
}

const getByAttributeAll = (parent:Element, attributeName:string, attributeValue:string) => {
    const mainElement = parent.shadowRoot ? parent.shadowRoot : parent;
    return mainElement.querySelectorAll(`[${attributeName}="${attributeValue}"]`);
}

const getByAttribute = (parent:Element, attributeName:string, attributeValue:string) => {
    const mainElement = parent.shadowRoot ? parent.shadowRoot : parent;
    return mainElement.querySelector(`[${attributeName}="${attributeValue}"]`);
}

const getElementValue = (element:Element, value) => {
    let dataItemValue = value;
    // check for dropdowns
    if (value.hasOwnProperty("Value") || value.hasOwnProperty("DisplayValue")) {
        dataItemValue = value["DisplayValue"] || value["Value"];
    } else if (typeof value == 'object') {
        dataItemValue = JSON.parse(value)["DisplayValue"] || JSON.parse(value)["Value"];
    }
    // check for format
    dataItemValue = getFormattedValue(element, dataItemValue);
    return dataItemValue;
}

const getFormattedValue = (element:Element, value) => {
    // get decimals attribute
    const decimalDigits = element.getAttribute("decimals") || "";
    // get thousandseparator attribute
    const hasThousandSeparator = (element.getAttribute("thousandseparator") || "").BBToBoolean(); 
    value = decimalDigits.BBToNumber() > 0 ? value.toString().BBFormatAsNumber(decimalDigits) : value;
    value = hasThousandSeparator ? value.toString().BBThousandsSeparator() : value;
    return value;
}

Element.prototype.BBExtensions = function(this:Element) {
    return new BBFExtensions(this);
}

Element.prototype.BBConstants = function(this:Element) {
    return new BBFConstants();
}

Element.prototype.BBGetDataModifiedAttribute = function(this:Element):string {
    return this.getAttribute(this.BBConstants().DATA_MODIFIED);
}

Element.prototype.BBToggleDataModifiedAttribute = function(this:Element) {
    this.toggleAttribute(this.BBConstants().DATA_MODIFIED);
}

Element.prototype.BBRemoveDataModifiedAttribute = function(this:Element) {
    this.hasAttribute(this.BBConstants().DATA_MODIFIED) && 
        this.removeAttribute(this.BBConstants().DATA_MODIFIED);
}

Element.prototype.BBSetDataModifiedAttribute = function(this:Element) {
    this.setAttribute(this.BBConstants().DATA_MODIFIED,'true');
}

Element.prototype.BBIsDataElement = function(this:Element) {
    return (this.nodeName.toLocaleLowerCase() === 'select' ||
        this.nodeName.toLocaleLowerCase() === 'input' ||
        this.nodeName.toLocaleLowerCase() === 'textarea' ||
        this.nodeName.toLocaleLowerCase() === 'label' ) ? true : false;
}

Element.prototype.BBSetDATA_ELEMENT_CLASS = function(this:Element) {
    this.BBIsDataElement() && (this.className += ` ${this.BBConstants().DATA_ELEMENT_CLASS}`); 
}

Element.prototype.BBGetDataElements = function(this:Element) {
    return Array.from(getByClassAll(this, this.BBConstants().DATA_ELEMENT_CLASS));
}

Element.prototype.BBGetBlockItemElements = function(this:Element) {
    return Array.from(getByClassAll(this, this.BBConstants().BLOCK_ITEM_ELEMENT_CLASS));
}

Element.prototype.BBGetModifiedDataElements = function(this:Element) {
    return Array.from(getByAttributeAll(this, this.BBConstants().DATA_MODIFIED, "true"));
}

Element.prototype.BBGetBlockItemValue = function(this:Element):any {
    const dataItem = this.classList.contains(this.BBConstants().DATA_ELEMENT_CLASS) ? 
        this : 
        getByClass(this, this.BBConstants().DATA_ELEMENT_CLASS); 
    return dataItem ? dataItem.BBGetDataItemValue() : this.textContent;
}

Element.prototype.BBSetBlockItemValue = function(this:Element, value:string) {
    const dataItems = getByClassAll(this, this.BBConstants().DATA_ELEMENT_CLASS); 
    dataItems.length == 0 ? (() => {
        // get block-item-element
        // set text content
        const blockItemElement = getByClass(this, this.BBConstants().BLOCK_ITEM_ELEMENT_CLASS);
        let dataItemValue = getElementValue(this, value);
        blockItemElement.textContent = dataItemValue;
    })() : 
    (() => {
        dataItems.forEach(dataItem => {
            dataItem.BBSetDataItemValue(value);
        });
    })();
}

Element.prototype.BBGetBlockItemId = function(this:Element):string {
    return this.getAttribute(this.BBConstants().BLOCK_ITEMID_ATTRIBUTE) || "";
}

Element.prototype.BBSetBlockItemId = function(this:Element, value:string) {
    this.setAttribute(this.BBConstants().BLOCK_ITEMID_ATTRIBUTE, value);
}

Element.prototype.BBGetBlockRowId = function(this:Element):string {
    return this.getAttribute(this.BBConstants().BLOCK_ROWID_ATTRIBUTE) || "";
}

Element.prototype.BBSetBlockRowId = function(this:Element, value:string) {
    this.setAttribute(this.BBConstants().BLOCK_ROWID_ATTRIBUTE, value);
}

Element.prototype.BBGetBlockRowNo = function(this:Element):string {
    return this.getAttribute(this.BBConstants().BLOCK_ROWNO_ATTRIBUTE) || "";
}

Element.prototype.BBSetBlockRowNo = function(this:Element, value:string) {
    this.setAttribute(this.BBConstants().BLOCK_ROWNO_ATTRIBUTE, value);
}

Element.prototype.BBGetBlockItemType = function(this:Element):string {
    return this.getAttribute(this.BBConstants().BLOCK_ITEMTYPE_ATTRIBUTE) || "";
}

Element.prototype.BBSetBlockItemType = function(this:Element, value:string) {
    this.setAttribute(this.BBConstants().BLOCK_ITEMTYPE_ATTRIBUTE, value);
}

Element.prototype.BBGetBlockItemTitle = function(this:Element):string {
    return this.getAttribute(this.BBConstants().BLOCK_ITEMTITLE_ATTRIBUTE) || "";
}

Element.prototype.BBSetBlockItemTitle = function(this:Element, value:string) {
    this.setAttribute(this.BBConstants().BLOCK_ITEMTITLE_ATTRIBUTE, value);
}

Element.prototype.BBGetDataItemValue = function(this:Element):any {
    let dataItemValue:any;
    this.nodeName.toLocaleLowerCase() === 'select' ? (() => {
        const selectElement = <HTMLSelectElement>this;
        if (selectElement.options.length > 0) {
            // check for attribute storedpropname
            const storedPropName = selectElement.getAttribute("storedpropname") || "both";
            dataItemValue = storedPropName == "both" ? 
                JSON.stringify({
                    "Value":selectElement.options[selectElement.selectedIndex].value, 
                    "DisplayValue":selectElement.options[selectElement.selectedIndex].text}) :
                storedPropName == "DisplayVlue" ? selectElement.options[selectElement.selectedIndex].text :
            selectElement.options[selectElement.selectedIndex].value;
        }
    })() :
    this.nodeName.toLocaleLowerCase() === 'input' ? (() => {
        (<HTMLInputElement>this).type == "checkbox" ?
            dataItemValue = (<HTMLInputElement>this).checked.toString() :
        (<HTMLInputElement>this).type == "file" ?
            dataItemValue = (<HTMLInputElement>this).files[0] :
        dataItemValue = (<HTMLInputElement>this).value;
    })() :
    this.nodeName.toLocaleLowerCase() === 'textarea' ? 
        (dataItemValue = (<HTMLTextAreaElement>this).value) :
    dataItemValue = this.textContent

    return dataItemValue;
}

Element.prototype.BBSetDataItemValue = function(this:Element, value:string):void {
    // do not clear values of static field
    if (this.hasAttribute("static")) return null;
    // get root
    const root:any = document.querySelector('bb-root');
    this.nodeName.toLocaleLowerCase() === 'select' ? (() => {
        const selectElement = <HTMLSelectElement>this;
        value ? (() => {
            let dataItemValue;
            if (value.hasOwnProperty("Value") || value.hasOwnProperty("DisplayValue")) {
                dataItemValue = value;
            } else {
                dataItemValue = typeof value == 'object' ? JSON.parse(value) : value;
            }
            const searchByValue = dataItemValue.hasOwnProperty("DisplayValue") ? false : true;
            const selectedItem = searchByValue ? 
                Array.from(selectElement.options).
                    find((item:HTMLOptionElement) => item.value == dataItemValue) :
                Array.from(selectElement.options).
                    find((item:HTMLOptionElement) => item.text == dataItemValue["DisplayValue"]);
            selectedItem && (selectElement.selectedIndex = selectedItem.index);
        })() :
        (() => {
            selectElement?.options.length > 0 && (selectElement.selectedIndex = 0);
        })();
    })() :
    this.nodeName.toLocaleLowerCase() === 'input' ? (() => {
        (<HTMLInputElement>this).type == "checkbox" ?
            (<HTMLInputElement>this).checked = value?.toString().BBToBoolean() :
        (this as HTMLInputElement).type == "number" && root ? (() => {
            (<HTMLInputElement>this).value = value;
            // get text wrapper of number input and set value
            const rowNo = this.getAttribute("rowno");
            const wrapperUniqueId = `${this.getAttribute("containerid")}.txt_${this.id}${rowNo ? "." + rowNo : ""}`;
            const wrapper = root.BBElementRegistry.FindElementByUniqueId(wrapperUniqueId);
            wrapper && wrapper.BBSetDataItemValue((<HTMLInputElement>this).BBFormattedValue());
        })() :
        (this as HTMLInputElement).type == "date" ? (() => {
            const dateValue = value ? new Date(value).toISOString().substring(0,10) : "";
            (<HTMLInputElement>this).value = dateValue;
        })() :
        (<HTMLInputElement>this).type == "file" ? (() => {
            // get downloader object (anchor)
            // set href
            const rowNo = this.getAttribute("rowno");
            const downloaderId = `${this.getAttribute("containerid")}.download_${this.id}${rowNo ? "." + rowNo : ""}`;
            const downloaderAnchor:HTMLAnchorElement = root.BBElementRegistry.FindElementByUniqueId(downloaderId);
            (value && downloaderAnchor) ? (() => {
                downloaderAnchor.href = value;
                downloaderAnchor.textContent = "Download";
            })() :
            (!value && downloaderAnchor) && (() => {
                downloaderAnchor.href = "";
                downloaderAnchor.textContent = "";
            })();
        })() :
        (<HTMLInputElement>this).value = value;
    })() :
    this.nodeName.toLocaleLowerCase() === 'textarea' ? 
        (<HTMLTextAreaElement>this).value = value :
    this.textContent = getElementValue(this, value);
}

Element.prototype.BBResetRequiredFieldValidation = function(this:Element):boolean {
    let isRequiredAndMissingValue = false;
    this.hasAttribute('required') && (() => {
        const elementDiv = this.tagName.toLowerCase() == "select" ? 
            this.parentElement?.parentElement?.parentElement :
        this.classList.contains("checkbox") ? 
            this.parentElement.parentElement : 
        this.parentElement;
        elementDiv && (() => {
            elementDiv.querySelector('p').style.display = 'none';
            let value = this.tagName.toLowerCase() == "select" ? 
                JSON.parse(this.BBGetDataItemValue()).Value : 
                this.BBGetDataItemValue();
            (this["type"] == "file" && value) && (value = value["name"]);
            (!value || value?.BBIsEmptyOrWhiteSpace()) ? (() => {
                elementDiv.querySelector('p').style.display = '';
                isRequiredAndMissingValue = true;
            })() :
            elementDiv.querySelector('p').style.display = 'none'
        })();
    })();
    return isRequiredAndMissingValue;
}

Element.prototype.BBSetBlockItemClass = function(this:Element) {
    this.classList.add(this.BBConstants().BLOCK_ITEM_CLASS);
}

Element.prototype.BBSetBlockItemElementClass = function(this:Element) {
    this.classList.add(this.BBConstants().BLOCK_ITEM_ELEMENT_CLASS);
}

Element.prototype.BBGetBlockItems =  function(this:Element):Element[] {
    return Array.from(getByClassAll(this, this.BBConstants().BLOCK_ITEM_CLASS)); 
}

interface HTMLSelectElement {
    BBSetSelectedValue(value:string, propName?:string):void;
}

HTMLSelectElement.prototype.BBSetSelectedValue = function(this:HTMLSelectElement, value:any, propName?:string):void {
    const valueToFind = value?.hasOwnProperty("Value") ? value.Value : value;
    const findPropName = propName && propName == "DisplayValue" ? "text" : "value";
    const selectedOption = Array.from(this.options).find(selectOption => selectOption[findPropName] == valueToFind);
    this.selectedIndex = selectedOption?.index;
}