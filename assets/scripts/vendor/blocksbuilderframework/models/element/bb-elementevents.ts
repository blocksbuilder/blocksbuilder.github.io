export interface IBBCustomEvent {

}

export class BBBlockCustomEvent extends CustomEvent<any> implements IBBCustomEvent {
    constructor(eventName:string, eventData?:{}) {
        super(eventName, eventData);
    }
}

export class BBElementCustomEvent extends CustomEvent<any> implements IBBCustomEvent {
    constructor(eventName:string, eventData?:{}) {
        super(eventName, eventData);
    }
}