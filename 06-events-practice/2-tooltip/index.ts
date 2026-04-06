export default class Tooltip {
  public element: HTMLElement | null = null;
  //Singleton
  public static activeMessage: Tooltip | null = null;

  constructor() {
    if (Tooltip.activeMessage) {
      return Tooltip.activeMessage;
    }
    Tooltip.activeMessage = this;

    this.initialize();
  }

  public render(html: string): void {
    const element = document.createElement("template");
    element.innerHTML = `
      <div class="tooltip">
        ${html}
      </div>
    `.trim();

    this.element = element.content.firstElementChild as HTMLElement;
    document.body.append(this.element);
  }

  public initialize() {
    document.addEventListener("pointerover", this.showTooltip);
    document.addEventListener("pointerout", this.hideTooltip);
    document.addEventListener("pointermove", this.moveTooltip);
  }

  private showTooltip = (event: PointerEvent) => {
    console.log("showTooltip");
    const tooltipElement = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-tooltip]",
    );

    if (!tooltipElement) {
      return;
    }

    const tooltipText = tooltipElement.dataset.tooltip;

    if (tooltipText !== undefined) {
      this.render(tooltipText);
    }
  };

  private hideTooltip = () => {
    this.remove();
    this.element = null;
  };

  private moveTooltip = (event: PointerEvent) => {
    if (this.element) {
      const shift = 10;
      const left = event.clientX + shift;
      const top = event.clientY + shift;

      this.element.style.left = `${left}px`;
      this.element.style.top = `${top}px`;
    }
  };

  public destroy() {
    document.removeEventListener("pointerover", this.showTooltip);
    document.removeEventListener("pointerout", this.hideTooltip);
    document.removeEventListener("pointermove", this.moveTooltip);
    this.remove();
  }

  private remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
