import { ISize } from "./util";

const padding = 24;

interface ISlider {
  resize(size: ISize): void;
  setImgOffset(x: number) : void;
  setOffset(offset: number): void;
  dbClick(x: number, y: number): void;
  destroy(): void;
}

class Slider implements ISlider {
  private url: string;
  private size?: ISize;
  private offset: number = 0;
  private ratio: number = -1;
  private scale: number = -1;
  private left = 0;
  private top = 0;
  private width = 0;
  private height = 0;
  private imgOffset = 0;

  private $wrapper: HTMLElement;
  private $el: HTMLImageElement;

  init(url: string, parent: HTMLElement, offset: number) {
    this.url = url;
    this.size = null;

    if (!this.$el) {
      const $el = document.createElement('img');
      $el.className = 'duck-gallery--slider-img';
      this.$el = $el;

      const $wrapper = document.createElement('div');
      $wrapper.className = 'duck-gallery--slider';
      $wrapper.appendChild($el);
      this.$wrapper = $wrapper;
    }
    this.$el.style.opacity = '0';
    parent.appendChild(this.$wrapper);

    this.setOffset(offset);
    this.load();
  }

  setOffset(offset: number) {
    this.offset = offset;
    this.imgOffset = 0;
    this.resizeWrapper();
    if (this.ratio !== -1) return; this.resizeImg();
  }

  setImgOffset(x: number) {
    this.imgOffset = x;
    this.resizeWrapper();
  }

  resizeWrapper() {
    if (!this.size) return;
    this.$wrapper.style.left = `${ this.offset * this.size.width + this.imgOffset }px`;
  }

  private load() {
    this.$el.onload = () => {
      this.resizeImg();
      this.$el.onload = null;
    };
    this.$el.src = this.url;
  }

  resize(size: ISize) {
    this.size = size;
    this.resizeWrapper();
    this.resizeImg();
  }

  private resizeImg() {
    if (!this.$el.complete || !this.size) return;
    const w = this.size.width - 2 * padding;
    const h = this.size.height - 2 * padding;
    const ratio = Math.min(w / this.$el.naturalWidth , h / this.$el.naturalHeight, 1);

    
    this.ratio = ratio;
    this.resizeImgByScale(1, null, null);

    this.$el.style.opacity = '1';
  }

  private resizeImgByScale(scale: number, x: number | null, y: number | null) {
    const originScale = this.scale;
    this.scale = scale;
    const ratio = this.ratio * scale;

    const { naturalWidth, naturalHeight } = this.$el;
    const imgW = ratio * naturalWidth;
    const imgH = ratio * naturalHeight;
    if (x !== null && y != null) {
      // keep the clicked point at the same place after scale
      this.left = x - (x - this.left) * scale / originScale;
      this.top = y - (y - this.top) * scale / originScale;
    } else {
      this.left = this.size.width / 2 - imgW / 2;
      this.top = this.size.height / 2 - imgH / 2;
    }
    
    this.width = imgW;
    this.height = imgH;

    this.renderImg();
  }

  private renderImg() {
    this.$el.style.left = `${this.left}px`;
    this.$el.style.top = `${this.top}px`;
    this.$el.style.width = `${this.width}px`;
    this.$el.style.height = `${this.height}px`;
  }

  dbClick(x: number, y: number) {
    if (this.ratio === -1) return;
    if (this.scale === 1 || this.ratio * this.scale < 1) {
      this.resizeImgByScale(this.scale * 2, x, y);
    } else {
      this.resizeImgByScale(1, null, null);
    }
  }

  destroy() {
    sliderPool.push(this);
    this.$wrapper.parentElement.removeChild(this.$wrapper);
  }
};

const sliderPool: ISlider[] = [];
const sliderFactory = function(url: string, parent: HTMLElement, offset: number): ISlider {
  let slider;
  if (sliderPool.length) slider = sliderPool.pop();
  slider = new Slider();
  slider.init(url, parent, offset);
  return slider;
};

export {
  ISlider,
  sliderFactory,
}
