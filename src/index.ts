import { debounce, ISize, isTouchDevice } from "./util";
import { sliderFactory, ISlider } from "./slider";

interface IGalleryOpts {
  images: string[],
  index?: number,
  parent?: HTMLElement;
}

class Gallery {
  private images: string[];
  private currentIndex: number;
  private size: ISize;

  private $root: HTMLElement;
  private $el: HTMLElement;
  private sliders: ISlider[];

  private isTouch = isTouchDevice();
  private onMouseDown: (ev: MouseEvent | TouchEvent) => void;
  private onMouseMove: (ev: MouseEvent | TouchEvent) => void;
  private onMouseUp: (ev: MouseEvent | TouchEvent) => void;
  private isMoving = false;
  private moveStartX = 0;
  private isInAnimation = false;
  private imgOffset = 0;

  constructor({ images, index, parent }: IGalleryOpts) {
    this.images = images;
    this.currentIndex = index || 0;

    this.$root = parent || document.body;
    const $el = document.createElement('div');
    const positionClsStr = parent ? 'absolute' : 'fixed';
    $el.className = `duck-gallery ${positionClsStr}`;
    this.$root.appendChild($el);
    let dbClickCount = 0;
    $el.addEventListener('click', (ev) => {
      const { target } = ev;
      if (target instanceof HTMLElement && target.className === 'duck-gallery--slider') {
        this.destroy();
      } else {
        dbClickCount += 1;
        if (dbClickCount === 1) {
          setTimeout(() => {
            if (dbClickCount >= 2) {
              this.dbClick(ev);
            }
            dbClickCount = 0;
          }, 500);
        }
      }
    });
    this.$el = $el;
    
    this.addSliders();

    window.addEventListener('resize', debounce(this.resize, 300, this));
    this.resize();

    this.onMouseDown = this.mouseDown.bind(this);
    this.onMouseMove = this.mouseMove.bind(this);
    this.onMouseUp = this.mouseUp.bind(this);
    if (this.isTouch) {
      window.addEventListener('touchstart', this.onMouseDown);
      window.addEventListener('touchmove', this.onMouseMove);
      window.addEventListener('touchend', this.onMouseUp);
    } else {
      window.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
    }
  }

  private dbClick(ev: MouseEvent) {
    const { clientX, clientY } = ev;
    this.sliders[1].dbClick(clientX, clientY);
  }

  private mouseDown(ev: MouseEvent | TouchEvent) {
    if (this.isInAnimation) return;
    this.isMoving = true;
    if (ev instanceof MouseEvent) {
      this.moveStartX = ev.clientX;
    } else {
      const touch = ev.changedTouches[0];
      this.moveStartX = touch.clientX;
    }
  }

  private mouseMove(ev: MouseEvent | TouchEvent) {
    if (!this.isMoving) return;
    let x = 0;
    if (ev instanceof MouseEvent) {
      x = ev.clientX;
    } else {
      const touch = ev.changedTouches[0];
      x = touch.clientX;
    }
    this.imgOffset = x - this.moveStartX;
    this.onSlideMove();
  }

  private mouseUp() {
    this.isMoving = false;
    if(Math.abs(this.imgOffset) < 10) {
      this.imgOffset = 0;
      this.onSlideMove();
      return;
    }

    let targetOffset = 0;
    if(Math.abs(this.imgOffset) > this.size.width / 2) {
      targetOffset = this.imgOffset > 0 ? this.size.width : -this.size.width;
    }

    this.isInAnimation = true;
    const timer = setInterval(() => {
      if (Math.abs(this.imgOffset - targetOffset) > 10) {
        this.imgOffset -= (this.imgOffset - targetOffset) * 0.2;
        this.onSlideMove();
      } else {
        this.imgOffset = targetOffset;
        clearInterval(timer);
        this.isInAnimation = false;
        this.onSlideMove();
        if (targetOffset > 0) {
          this.prev();
        } else if (targetOffset < 0) {
          this.next();
        }
        this.imgOffset = 0;
      }
    }, 50);
  }

  prev() {
    this.currentIndex = this.getIndex(this.currentIndex - 1);
    const oldSlider = this.sliders.pop();
    oldSlider.destroy();
    this.sliders.forEach((slider, i) => {
      slider.setOffset(i);
    });
    const newSlider = sliderFactory(this.getImageUrl(-1), this.$el, -1);
    this.sliders.unshift(newSlider);
    newSlider.resize(this.size);
  }

  next() {
    this.currentIndex = this.getIndex(this.currentIndex + 1);
    const oldSlider = this.sliders.shift();
    oldSlider.destroy();
    this.sliders.forEach((slider, i) => {
      slider.setOffset(i - 1);
    });
    const newSlider = sliderFactory(this.getImageUrl(1), this.$el, 1);
    this.sliders.push(newSlider);
    newSlider.resize(this.size);
  }

  private onSlideMove() {
    const { imgOffset } = this;
    this.sliders.forEach(slider => {
      slider.setImgOffset(imgOffset);
    });
  }

  private addSliders() {
    this.sliders = [
      sliderFactory(this.getImageUrl(-1), this.$el, -1),
      sliderFactory(this.getImageUrl(0), this.$el, 0),
      sliderFactory(this.getImageUrl(1), this.$el, 1),
    ];
  }

  private getImageUrl(offset) {
    const { images } = this;
    return images[this.getIndex(this.currentIndex + offset)];
  }

  private getIndex(index: number) {
    const { length } = this.images;
    if (index < 0) {
      index += length;
    } else if (index >= length) {
      index -= length;
    }
    return index;
  }

  resize() {
    const size = {
      width: this.$el.offsetWidth,
      height: this.$el.offsetHeight,
    };
    this.size = size;
    this.sliders.forEach(x => {
      x.resize(size);
    });
  }
  
  destroy() {
    if (this.isInAnimation) return;

    if (this.isTouch) {
      window.removeEventListener('touchstart', this.onMouseDown);
      window.removeEventListener('touchmove', this.onMouseMove);
      window.removeEventListener('touchend', this.onMouseUp);
    } else {
      window.removeEventListener('mousedown', this.onMouseDown);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
    };
    window.removeEventListener('resize', this.resize);

    this.$root.removeChild(this.$el);

    this.sliders.forEach(x => x.destroy());
    this.sliders.length = 0;
  }

  /**
   * TODO:
   * 手势放大
   * 双指拖动
   * 事件：currentIndex改变
   */
}

const duckGallery = function(opts: IGalleryOpts): Gallery {
  const gallery = new Gallery(opts);
  return gallery;
};

export default duckGallery;
