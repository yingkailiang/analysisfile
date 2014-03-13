class HistoryProvider {
    historyStack = [];
    currentIndex:number = 0;

    constructor() {
    }

    push(data: string): void {
        this.historyStack[this.currentIndex] = data;
        this.currentIndex += 1;
    }

    next(): string {
        if (this.currentIndex < this.historyStack.length && this.historyStack.length > 0) {
            this.currentIndex += 1;
            return this.historyStack[this.currentIndex];
        }
        return null;
    }

    previous(): string {
        if (this.currentIndex > 0) {
            this.currentIndex -= 1;
            return this.historyStack[this.currentIndex];
        }
        return null;
    }

}