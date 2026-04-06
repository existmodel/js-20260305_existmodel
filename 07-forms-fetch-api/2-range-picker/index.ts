interface Options {
  from?: Date;
  to?: Date;
}

export default class RangePicker {
  public element: HTMLElement;
  private from: Date;
  private to: Date | null;
  private showingDate: Date;

  constructor({ from = new Date(), to = new Date() }: Options = {}) {
    this.from = from;
    this.to = to;
    this.showingDate = new Date(this.from);
    this.element = this.render();
    this.addEventListeners();
  }

  public render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild as HTMLElement;
    return this.element;
  }

  private getTemplate(): string {
    let toText = "";
    if (this.to !== null) {
      toText = this.formatDate(this.to);
    }

    return `<div class="rangepicker">
  <div class="rangepicker__input" data-element="input">
    <span data-element="from">${this.formatDate(this.from)}</span> -
    <span data-element="to">${toText}</span>
  </div>
  <div class="rangepicker__selector" data-element="selector"></div>
</div>
    `;
  }
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private selectDate(date: Date): void {
    if (this.to !== null) {
      this.from = date;
      this.to = null;
      this.updateCalendarSelection();
    } else {
      this.to = date;
      //перестановка границ диапазона
      if (this.to < this.from) {
        const oldFrom = this.from;
        this.from = this.to;
        this.to = oldFrom;
      }

      this.element.querySelector('[data-element="from"]')!.textContent =
        this.formatDate(this.from);
      this.element.querySelector('[data-element="to"]')!.textContent =
        this.formatDate(this.to);

      this.element.dispatchEvent(
        new CustomEvent("date-select", {
          bubbles: true,
          detail: { from: this.from, to: this.to },
        }),
      );

      this.renderSelectorContent();
    }
  }

  private renderCalendar(date: Date): string {
    const monthName = date.toLocaleDateString("ru-RU", { month: "long" });
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const firstDayWeek = firstDay.getDay();
    let startDay;
    if (firstDayWeek === 0) {
      startDay = 7;
    } else {
      startDay = firstDayWeek;
    }

    let days = "";

    for (let day = 1; day <= lastDay; day++) {
      const currentDate = new Date(year, month, day);
      let style = "";
      if (day === 1) {
        style = `style="--start-from: ${startDay}"`;
      }

      let selectedClass = "";
      if (currentDate.toDateString() === this.from.toDateString())
        selectedClass = "rangepicker__selected-from";
      else if (this.to && currentDate.toDateString() === this.to.toDateString())
        selectedClass = "rangepicker__selected-to";
      else if (this.to && currentDate > this.from && currentDate < this.to)
        selectedClass = "rangepicker__selected-between";

      days += `<button type="button" class="rangepicker__cell ${selectedClass}" data-value="${currentDate.toISOString()}" ${style}>${day}</button>`;
    }

    return `
    <div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time>${monthName}</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div><div>Вт</div><div>Ср</div>
        <div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">
        ${days}
      </div>
    </div>
  `;
  }

  private renderSelectorContent(): void {
    const selector = this.element.querySelector(
      '[data-element="selector"]',
    ) as HTMLElement;

    const firstMonth = this.renderCalendar(this.showingDate);
    const secondMonth = this.renderCalendar(
      new Date(this.showingDate.getFullYear(), this.showingDate.getMonth() + 1),
    );

    const calendarsHtml = firstMonth + secondMonth;
    const hasControls =
      selector.querySelector(".rangepicker__selector-control-left") !== null;

    if (hasControls) {
      const calendars = selector.querySelectorAll(".rangepicker__calendar");
      for (const calendar of calendars) {
        calendar.remove();
      }
      selector.insertAdjacentHTML("beforeend", calendarsHtml);
      return;
    }

    selector.innerHTML =
      '<div class="rangepicker__selector-arrow"></div>' +
      '<div class="rangepicker__selector-control-left"></div>' +
      '<div class="rangepicker__selector-control-right"></div>' +
      calendarsHtml;
  }

  private addEventListeners(): void {
    document.addEventListener("click", this.handleDocumentClick, true);
    this.element.addEventListener("click", this.handleElementClick);
  }

  private handleDocumentClick = (event: MouseEvent): void => {
    if (!this.element.contains(event.target as HTMLElement)) {
      this.element.classList.remove("rangepicker_open");
    }
  };

  private handleElementClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;

    if (target.closest('[data-element="input"]')) {
      this.element.classList.toggle("rangepicker_open");
      if (this.element.classList.contains("rangepicker_open")) {
        this.renderSelectorContent();
      }
    } else if (target.closest(".rangepicker__selector-control-left")) {
      this.showingDate.setMonth(this.showingDate.getMonth() - 1);
      this.renderSelectorContent();
    } else if (target.closest(".rangepicker__selector-control-right")) {
      this.showingDate.setMonth(this.showingDate.getMonth() + 1);
      this.renderSelectorContent();
    } else {
      const cell = target.closest(".rangepicker__cell") as HTMLElement | null;
      if (cell !== null) {
        const dateString = cell.dataset.value;
        if (dateString !== undefined) {
          this.selectDate(new Date(dateString));
        }
      }
    }
  };

  private updateCalendarSelection(): void {
    const cells =
      this.element.querySelectorAll<HTMLElement>(".rangepicker__cell");

    for (const cell of cells) {
      const cellDate = new Date(cell.dataset.value!);

      cell.classList.remove(
        "rangepicker__selected-from",
        "rangepicker__selected-to",
        "rangepicker__selected-between",
      );

      if (cellDate.toDateString() === this.from.toDateString()) {
        cell.classList.add("rangepicker__selected-from");
      } else if (
        this.to &&
        cellDate.toDateString() === this.to.toDateString()
      ) {
        cell.classList.add("rangepicker__selected-to");
      } else if (this.to && cellDate > this.from && cellDate < this.to) {
        cell.classList.add("rangepicker__selected-between");
      }
    }
  }

  public remove(): void {
    document.removeEventListener("click", this.handleDocumentClick, true);
    this.element.removeEventListener("click", this.handleElementClick);

    this.element.remove();
  }

  public destroy(): void {
    this.remove();
    this.from = new Date();
    this.to = null;
  }
}
