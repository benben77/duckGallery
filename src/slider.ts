import { ISize } from "./util";

const padding = 24;

interface ISlider {
  resize(size: ISize): void;
  setImgOffset(x: number) : void;
  setOffset(offset: number): void;
  destroy(): void;
}

class Slider implements ISlider {
  private url: string;
  private size?: ISize;
  private offset: number = 0;
  private ratio: number = 1;
  private left = 0;
  private top = 0;
  private width = 0;
  private height = 0;
  private imgOffset = 0;

  private $el: HTMLImageElement;

  init(url: string, parent: HTMLElement, offset: number) {
    this.url = url;
    this.offset = offset;
    this.size = null;

    if (!this.$el) {
      const $el = document.createElement('img');
      $el.className = 'duck-gallery--slider';
      this.$el = $el;
    }
    this.$el.style.opacity = '0';
    parent.appendChild(this.$el);

    this.load();
  }

  setOffset(offset: number) {
    this.offset = offset;
    this.imgOffset = 0;
    this.resizeImg();
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
    this.resizeImg();
  }

  private resizeImg() {
    if (!this.$el.complete || !this.size) return;
    const w = this.size.width - 2 * padding;
    const h = this.size.height - 2 * padding;
    const ratio = Math.min(w / this.$el.width , h / this.$el.height);
    const imgW = ratio * this.$el.width;
    const imgH = ratio * this.$el.height;

    this.ratio = ratio;
    this.left = (this.size.width - imgW) / 2 + this.offset * this.size.width;
    this.top = (this.size.height - imgH) / 2;
    this.width = imgW;
    this.height = imgH;
    this.renderImg();

    this.$el.style.opacity = '1';
  }

  private renderImg() {
    this.$el.style.left = `${this.left + this.imgOffset}px`;
    this.$el.style.top = `${this.top}px`;
    this.$el.style.width = `${this.width}px`;
    this.$el.style.height = `${this.height}px`;
  }

  setImgOffset(x: number) {
    this.imgOffset = x;
    this.renderImg();
  }

  destroy() {
    sliderPool.push(this);
    this.$el.parentElement.removeChild(this.$el);
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
