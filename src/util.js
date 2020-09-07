/**
 *
 * @param {array} array
 * @param {number} chunkSize
 */
export function chunkArray(array, chunkSize) {
  const chunkedArray = [];
  let index = 0;

  while (index < array.length) {
    chunkedArray.push(array.slice(index, chunkSize + index));
    index += chunkSize;
  }

  return chunkedArray;
}

export function downloadURI(uri, name) {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
