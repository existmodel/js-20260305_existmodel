/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }
  let result = "";

  for (const char of string) {
    const repeatLimit = char.repeat(size);
    const isLimitReached = result.endsWith(repeatLimit);

    if (!isLimitReached) {
      result += char;
    }
  }
  return result;
}
