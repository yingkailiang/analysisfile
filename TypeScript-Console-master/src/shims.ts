class FileShim {
    buffer: string;
    constructor() {
        this.buffer = "";
    }
    public Write(input: string) {
        this.buffer += input;
    }
    public WriteLine(input: string) {
        this.buffer += input;
    }
    public Close() {
    }
}

class IOShim {
    public createFile(fileName: any, useUTF8: any): any {
        return new FileShim();
    }
}
