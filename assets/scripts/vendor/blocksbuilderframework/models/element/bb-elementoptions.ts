export interface ISelectOption {
    Value: string;
    DisplayValue?: string;
    Selected?: boolean;
}

export class ElementOptions {
    public id?: string;
    public labelFor?: string;
    public className?: string;
    public href?: string;
    public target?: string;
    public textContent?: string;
    public title?: string;
    public type?: string;
    public style?: string;
    public src?: string;
    public alt?: string;
    public display?: string;
    public visibility?: string;
    public selectOptions?: ISelectOption[];
    public value?: string;
    public legend?: string;
    public placeHolder?: string;
    public checked?: boolean;
}
