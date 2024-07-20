import stripBom from "strip-bom";
export function prepareData(chunk, runtime) {
    const workChunk = concatLeftChunk(chunk, runtime);
    runtime.csvLineBuffer = undefined;
    const cleanCSVString = cleanUtf8Split(workChunk, runtime).toString("utf8");
    if (!runtime.started) {
        return stripBom(cleanCSVString);
    }
    else {
        return cleanCSVString;
    }
}
function concatLeftChunk(chunk, runtime) {
    if (runtime.csvLineBuffer && runtime.csvLineBuffer.length > 0) {
        return Buffer.concat([runtime.csvLineBuffer, chunk]);
    }
    else {
        return chunk;
    }
}
export function cleanUtf8Split(chunk, runtime) {
    let idx = chunk.length - 1;
    if ((chunk[idx] & (1 << 7)) != 0) {
        while ((chunk[idx] & (3 << 6)) === 128) {
            idx--;
        }
        idx--;
    }
    if (idx != chunk.length - 1) {
        runtime.csvLineBuffer = chunk.subarray(idx + 1);
        return chunk.subarray(0, idx + 1);
    }
    else {
        return chunk;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YUNsZWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RhdGFDbGVhbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFFBQVEsTUFBTSxXQUFXLENBQUM7QUFFakMsTUFBTSxVQUFVLFdBQVcsQ0FBQyxLQUFhLEVBQUUsT0FBcUI7SUFDOUQsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxPQUFPLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztJQUNsQyxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNwQixPQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNqQztTQUFNO1FBQ0wsT0FBTyxjQUFjLENBQUM7S0FDdkI7QUFDSCxDQUFDO0FBQ0QsU0FBUyxlQUFlLENBQUMsS0FBYSxFQUFFLE9BQXFCO0lBQzNELElBQUksT0FBTyxDQUFDLGFBQWEsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDN0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3REO1NBQU07UUFDTCxPQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0gsQ0FBQztBQUNELE1BQU0sVUFBVSxjQUFjLENBQUMsS0FBYSxFQUFFLE9BQXFCO0lBQ2pFLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUN0QyxHQUFHLEVBQUUsQ0FBQztTQUNQO1FBQ0QsR0FBRyxFQUFFLENBQUM7S0FDUDtJQUNELElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEQsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDbkM7U0FBTTtRQUNMLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDIn0=