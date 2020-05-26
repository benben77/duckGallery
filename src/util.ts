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

const isTouchDevice = function(): boolean {
  try {  
    document.createEvent('TouchEvent');  
    return true;  
  } catch (e) {  
    return false;  
  }
}

interface ISize {
  width: number;
  height: number;
}

interface IGallery {
  isInAnimation: Boolean;
}

interface ISlider {
  readonly isScaled: boolean;
  resize(size: ISize): void;
  setImgOffset(x: number) : void;
  setOffset(offset: number): void;
  dbClick(x: number, y: number, gallery: IGallery): void;
  move(x: number, y: number): void;
  destroy(): void;
}

export {
  debounce,
  isTouchDevice,
  ISize,
  IGallery,
  ISlider,
};
