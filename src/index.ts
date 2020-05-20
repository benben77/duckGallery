import { debounce, ISize } from "./util";
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
  private currentSlide: ISlider;
  private sliders: ISlider[];

  constructor({ images, index, parent }: IGalleryOpts) {
    this.images = images;
    this.currentIndex = index || 0;

    this.$root = parent || document.body;
    const $el = document.createElement('div');
    const positionClsStr = parent ? 'absolute' : 'fixed';
    $el.className = `duck-gallery ${positionClsStr}`;
    this.$root.appendChild($el);
    $el.addEventListener('click', (ev) => {
      if (ev.target === this.$el) {
        this.destroy();
      }
    });
    this.$el = $el;
    
    this.addSliders();

    window.addEventListener('resize', debounce(this.resize, 300, this));
    this.resize();
  }

  private addSliders() {
    this.currentSlide = sliderFactory(this.images[this.currentIndex], this.$el);
    this.sliders = [this.currentSlide];
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
    this.$root.removeChild(this.$el);
    window.removeEventListener('resize', this.resize);
    this.sliders.forEach(x => x.destroy());
    this.sliders.length = 0;
  }
}

const duckGallery = function(opts: IGalleryOpts): Gallery {
  const gallery = new Gallery(opts);
  return gallery;
};

export default duckGallery;
