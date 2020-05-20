const debounce = function(fn: Function, time: number, context: any = window): () => any {
  let timer = 0;
  return function() {
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, time);
  };
};

interface ISize {
  width: number;
  height: number;
}

export {
  debounce,
  ISize,
};
