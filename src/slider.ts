import { ISize } from "./util";

const padding = 24;

interface ISlider {
  resize(size: ISize): void;
  destroy(): void;
}

class Slider implements ISlider {
  private url: string;

  private $el: HTMLImageElement;
  private size?: ISize;
  private ratio: number = 1;

  init(url: string, parent: HTMLElement) {
    this.url = url;
    this.size = null;

    if (!this.$el) {
      const $el = document.createElement('img');
      $el.className = 'duck-gallery--slider';
      this.$el = $el;
    }
    parent.appendChild(this.$el);

    this.load();
  }

  private load() {
    this.$el.src = this.url;
    this.$el.onload = () => {
      this.resizeImg();
      this.$el.onload = null;
    };
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
    this.$el.style.left = `${(this.size.width - imgW) / 2}px`;
    this.$el.style.top = `${(this.size.height - imgH) / 2}px`;
    this.$el.style.width = `${imgW}px`;
    this.$el.style.height = `${imgH}px`;
  }

  destroy() {
    sliderPool.push(this);
  }

  /**
   * TODO:
   * 双击放大
   * 手势放大
   * 左滑右滑
   */
};

const sliderPool: ISlider[] = [];
const sliderFactory = function(url: string, parent: HTMLElement): ISlider {
  let slider;
  if (sliderPool.length) slider = sliderPool.pop();
  slider = new Slider();
  slider.init(url, parent);
  return slider;
};

export {
  ISlider,
  sliderFactory,
}
