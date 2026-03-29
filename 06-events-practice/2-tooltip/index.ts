export default class Tooltip {
  public element: HTMLElement | null = null;
  //Singleton
  public static activeMessage: Tooltip | null = null;

  constructor() {
    this.element;

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

  private initialize() {
    document.addEventListener("pointerover", this.showTooltip);
    document.addEventListener("pointerout", this.hideTooltip);
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

  public destroy() {
    if (!this.element) {
      return;
    }
    document.removeEventListener("pointerover", this.showTooltip);
    document.removeEventListener("pointerout", this.hideTooltip);
    this.remove();
  }

  private remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
