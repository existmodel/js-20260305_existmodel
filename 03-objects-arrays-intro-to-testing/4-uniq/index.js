/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const uniqueSet = new Set(arr); //создает новый set обьект
  return Array.from(uniqueSet);
}

// set

// возвращает новый массив уникальных значений
// set.forEach((value, valueAgain, set) => {
//   alert(value);
// });

// перебрать все элементы и добавить в новый массив?

// Статический Array.from()метод создает новый, поверхностно скопированный Array экземпляр из итерируемого или массивоподобного объекта.
