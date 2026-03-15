/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  // позволяет выбрать значение из объекта.
  // return (obj) =>
  // {return let result = obj.`${path}`}
  // разделить строку на части
  // Хороший вопрос! В вашем случае нужно разделить строку по точкам и пройтись по цепочке свойств объекта.
  // Строка "props.images.src" должна стать путём: obj.props.images.src
  // Вот решение:
  // как обьединить строку и обьект?
  //   возвращать новую функцию, которая по заданному пути найдет значение в переданном ей объекте и вернет это значение.
  // мы получаем строку но нужно сделать так чтобы это был пусть к свойству
}

// Необходимо реализовать функцию «createGetter». Функция должна принимать строку вида «prop-1.prop-2.prop-n», где «prop-1, …, prop-n» – это свойства объекта разделенные точкой.

// К примеру строка вида «props.images.src» – это путь к свойству «src» следующего объекта:

// const obj = {
//   props: {
//     images: {
//       src: "http://path-to-some-img"
//     }
//   }
// };
// Функция «createGetter» должна возвращать новую функцию, которая по заданному пути найдет значение в переданном ей объекте и вернет это значение.

// function createGetter(field) {
//   /* ... */
// }

// const product = {
//   category: {
//     title: "Goods"
//   }
// }

// const getter = createGetter('category.title');

// console.log(getter(product)); // Goods

//! разбить сплитом на части
//!динамическое обращение к свойствам массива
