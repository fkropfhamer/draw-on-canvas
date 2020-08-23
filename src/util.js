export function chunkArray(array, chunkSize) {
    const chunkedArray = [];
    let index = 0;
    
    while (index < array.length) {
        chunkedArray.push(array.slice(index, chunkSize + index));
        index += chunkSize;
    }

    return chunkedArray;
}
 
