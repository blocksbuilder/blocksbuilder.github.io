export class BBStepsCommon {
    public static WindowPrint = async () => {
        setTimeout(() => {
            window.print();
        }, 500);
    }
}