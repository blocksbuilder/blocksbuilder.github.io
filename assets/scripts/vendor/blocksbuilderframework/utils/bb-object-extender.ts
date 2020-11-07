// Extend an object with an extension
export class Extender {
    private constructor() {

    }

    public static ExtendObject = (extension, obj) => {
        for (var key in extension) {
            obj[key] = extension[key];
        }
    }
}
