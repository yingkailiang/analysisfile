/// <reference path="shims.ts" />

declare var TypeScript: any;

class CompliationService {
    output: FileShim;
    settings: IOShim;
    error: FileShim;
    constructor() {
        this.output = new FileShim();
        this.error = new FileShim();
        this.settings = new IOShim();
    }

    compile(source: string):string {
        var compiler = new TypeScript.TypeScriptCompiler(this.output);
        compiler.parseEmitOption(this.settings);
        compiler.parser.errorRecovery = true;
        compiler.setErrorCallback((start, len, message, block) => {
            this.error.Write('Compilation error: ' + message +
                '\n Code block: ' + ' Start position: ' + start + ' Length: ' + len);
        });

        compiler.addUnit(source, "");
        compiler.typeCheck();
        compiler.emitToOutfile(this.output);
        var output = this.output.buffer;
        this.output.buffer = "";
        return output;
    }
}
