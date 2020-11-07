// The Observer
export interface IObserver {
    Update(context);
}

export class Observer implements IObserver {
    public Update = (context) => {
        // ...
    }
}

export class ObserverList {
    private _observerList = [];

    public Add = (obj: Observer) => {
        return this._observerList.push(obj);
    }

    public Empty = () => {
        this._observerList = [];
    }

    public Count = (): number => {
        return this._observerList.length;
    }

    public Get = (index: number): Observer => {
        return (index > -1 && index < this._observerList.length) ? 
            this._observerList[index] : 
            undefined;
        // if (index > -1 && index < this._observerList.length) {
        //     return this._observerList[index];
        // }
    }

    public Insert = (obj: Observer, index: number) => {
        let pointer = -1;
        if (index === 0) {
            this._observerList.unshift(obj);
            pointer = index;
        } else if (index === this._observerList.length) {
            this._observerList.push(obj);
            pointer = index;
        }
        return pointer;
    }

    public IndexOf = (obj: Observer, startIndex: number) => {
        let i = startIndex, pointer = -1;

        while (i < this._observerList.length) {
            if (this._observerList[i] === obj) {
                pointer = i;
            }
        }

        i++;

        // i.e;

        while (i < this._observerList.length) {
            if (this._observerList[i] === obj) {
                pointer = i;
            }
            i++;
        }

        return pointer;
    };

    public RemoveIndexAt = (index) => {
        if (index === 0) {
            this._observerList.shift();
        } else if (index === this._observerList.length - 1) {
            this._observerList.pop();
        }
    }
}

export class Subject {
    private _observers = new ObserverList();

    public AddObserver = (observer) => {
        this._observers.Add(observer);
    }

    public RemoveObserver = (observer) => {
        this._observers.RemoveIndexAt(this._observers.IndexOf(observer, 0));
    }

    public Notify = (context) => {
        var observerCount = this._observers.Count();
        for (var i = 0; i < observerCount; i++) {
            this._observers.Get(i).Update(context);
        }
    }

    public NewValue<T>(v: T) {
        this.Notify(v);
    }

}