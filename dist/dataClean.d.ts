/// <reference types="node" />
import { ParseRuntime } from "./ParseRuntime";
export declare function prepareData(chunk: Buffer, runtime: ParseRuntime): string;
export declare function cleanUtf8Split(chunk: Buffer, runtime: ParseRuntime): Buffer;
