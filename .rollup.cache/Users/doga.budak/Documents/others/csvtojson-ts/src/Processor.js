export class Processor {
    converter;
    params;
    runtime;
    constructor(converter) {
        this.converter = converter;
        this.params = converter.parseParam;
        this.runtime = converter.parseRuntime;
    }
}
//# sourceMappingURL=Processor.js.map