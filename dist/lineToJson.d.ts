import { Converter } from "./Converter";
export default function (csvRows: string[][], conv: Converter): JSONResult[];
export type JSONResult = {
    [key: string]: any;
};
export declare function checkType(item: string, head: string, headIdx: number, conv: Converter): any;
export declare function numberType(item: string): string | number;
export declare function stringType(item: string): string;
export declare function dynamicType(item: string): any;
