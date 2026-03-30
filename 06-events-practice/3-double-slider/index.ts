type DoubleSliderSelected = {
  from: number;
  to: number;
};

interface Options {
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  selected?: DoubleSliderSelected;
}

export default class DoubleSlider {
  public element: HTMLElement;
  public min: number;
  public max: number;
  private formatValue: (value: number) => string;

  private elems: Record<string, HTMLElement> = {};
  private dragging: HTMLElement | null = null;

  private shiftX = 0;
  private selected: DoubleSliderSelected;

  constructor({ min = 0, max = 100, formatValue, selected }: Options = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue ?? ((value) => String(value));
    this.selected = selected ?? { from: min, to: max };
    this.element = this.render();
    this.initialize();
  }

  private render(): HTMLElement {
    const element = document.createElement("div");
    element.className = "range-slider";
    element.innerHTML = `
      <span data-element="from">${this.formatValue(this.selected.from)}</span>
      <div data-element="inner" class="range-slider__inner">
        <span data-element="progress" class="range-slider__progress"></span>
        <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
        <span data-element="thumbRight" class="range-slider__thumb-right"></span>
      </div>
      <span data-element="to">${this.formatValue(this.selected.to)}</span>
    `;

    for (const el of element.querySelectorAll<HTMLElement>("[data-element]")) {
      this.elems[el.dataset.element!] = el;
    }

    element.ondragstart = () => false;

    return element;
  }

  private initialize() {
    this.update();

    this.elems.thumbLeft.addEventListener("pointerdown", this.onPointerDown);
    this.elems.thumbRight.addEventListener("pointerdown", this.onPointerDown);
  }
  private onPointerDown = (event: PointerEvent) => {
    event.preventDefault();

    this.dragging = event.currentTarget as HTMLElement;

    const rect = this.dragging.getBoundingClientRect();

    this.shiftX =
      this.dragging === this.elems.thumbLeft
        ? rect.right - event.clientX
        : rect.left - event.clientX;

    this.element.classList.add("range-slider_dragging");
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
  };

  private onPointerMove = (event: PointerEvent) => {
    event.preventDefault();
    if (!this.dragging) return;
    const innerRect = this.elems.inner.getBoundingClientRect();

    if (this.dragging === this.elems.thumbLeft) {
      let leftRatio =
        (event.clientX - innerRect.left + this.shiftX) / innerRect.width;
      if (leftRatio < 0) leftRatio = 0;

      const leftPercent = leftRatio * 100;

      const rightPercent = parseFloat(this.elems.thumbRight.style.right);

      const safeLeft =
        leftPercent + rightPercent > 100 ? 100 - rightPercent : leftPercent;

      this.elems.thumbLeft.style.left = `${safeLeft}%`;
      this.elems.progress.style.left = `${safeLeft}%`;

      this.elems.from.innerHTML = this.formatValue(this.getValue().from);
    } else {
      let rightRatio =
        (innerRect.right - event.clientX - this.shiftX) / innerRect.width;
      if (rightRatio < 0) rightRatio = 0;
      const rightPercent = rightRatio * 100;

      const leftPercent = parseFloat(this.elems.thumbLeft.style.left);
      const safeRight =
        leftPercent + rightPercent > 100 ? 100 - leftPercent : rightPercent;

      this.elems.thumbRight.style.right = `${safeRight}%`;
      this.elems.progress.style.right = `${safeRight}%`;

      this.elems.to.innerHTML = this.formatValue(this.getValue().to);
    }
  };

  private onPointerUp = () => {
    this.dragging = null;
    this.element.classList.remove("range-slider_dragging");
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);

    this.element.dispatchEvent(
      new CustomEvent("range-select", {
        detail: this.getValue(),
        bubbles: true,
      }),
    );
  };

  private getValue(): DoubleSliderSelected {
    return {
      from: Math.round(
        this.min +
          0.01 *
            parseFloat(this.elems.thumbLeft.style.left) *
            (this.max - this.min),
      ),
      to: Math.round(
        this.max -
          0.01 *
            parseFloat(this.elems.thumbRight.style.right) *
            (this.max - this.min),
      ),
    };
  }

  private update() {
    const range = this.max - this.min;

    const leftPercent = ((this.selected.from - this.min) / range) * 100;

    const rightPercent = ((this.max - this.selected.to) / range) * 100;

    this.elems.progress.style.left = leftPercent + "%";
    this.elems.progress.style.right = rightPercent + "%";
    this.elems.thumbLeft.style.left = leftPercent + "%";
    this.elems.thumbRight.style.right = rightPercent + "%";
    this.elems.from.innerHTML = this.formatValue(this.selected.from);
    this.elems.to.innerHTML = this.formatValue(this.selected.to);
  }

  public destroy() {
    this.element.remove();
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  }
}
