type SortOrder = "asc" | "desc";

type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "custom";
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

export default class SortableTable {
  private headersConfig: SortableTableHeader[];
  private data: SortableTableData[];
  private sorted?: SortableTableSort;
  private isSortLocally: boolean;

  public element: HTMLElement;

  constructor(
    headersConfig: SortableTableHeader[] = [],
    { data = [], sorted, isSortLocally = true }: Options = {},
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.element = this.render();
    if (this.sorted) {
      this.sort(this.sorted.id, this.sorted.order);
    }
    this.initListeners();
  }

  private render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.classList.add("sortable-table");

    const header = document.createElement("div");
    header.setAttribute("data-element", "header");
    header.classList.add("sortable-table__header", "sortable-table__row");

    header.innerHTML = this.headersConfig
      .map(
        ({ id, title, sortable }) => `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `,
      )
      .join("");

    wrapper.append(header);
    wrapper.append(this.renderBody());

    return wrapper;
  }

  private renderBody(): HTMLElement {
    const body = document.createElement("div");
    body.setAttribute("data-element", "body");
    body.classList.add("sortable-table__body");

    const rows = this.data
      .map((row) => {
        const cells = this.headersConfig
          .map(({ id, template }) => {
            const cellValue = row[id];
            return template
              ? template(cellValue)
              : `<div class="sortable-table__cell">${cellValue}</div>`;
          })
          .join("");
        return `<a href="/products/${row.id}" class="sortable-table__row">${cells}</a>`;
      })
      .join("");

    body.innerHTML = rows;
    return body;
  }

  public sort(field: string, order: SortOrder) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer();
    }
  }

  private sortOnClient(field: string, order: SortOrder) {
    const sortColumnConfig = this.headersConfig.find((col) => col.id === field);

    const type = sortColumnConfig?.sortType;
    if (!sortColumnConfig || !sortColumnConfig.sortable) {
      return;
    }
    const directions = { asc: 1, desc: -1 };

    if (type === "string") {
      this.data = [...this.data].sort(
        (a, b) =>
          directions[order] *
          String(a[field]).localeCompare(String(b[field]), ["ru", "en"], {
            caseFirst: "upper",
            sensitivity: "variant",
          }),
      );
    } else if (type === "number") {
      this.data = [...this.data].sort(
        (a, b) => directions[order] * (Number(a[field]) - Number(b[field])),
      );
    } else if (type === "custom" && sortColumnConfig.customSorting) {
      const customSorting = sortColumnConfig.customSorting;
      this.data = [...this.data].sort((a, b) => {
        return directions[order] * customSorting(a, b);
      });
    }

    const allCells = this.element.querySelectorAll("[data-id]");
    allCells.forEach((cell) => cell.removeAttribute("data-order"));

    const activeCell = this.element.querySelector(`[data-id="${field}"]`);

    activeCell?.setAttribute("data-order", order);

    this.element.querySelector('[data-element="body"]')?.remove();
    this.element.append(this.renderBody());
  }

  private sortOnServer() {}

  private initListeners(): void {
    this.element.addEventListener("pointerdown", this.clickOnHeader);
  }

  private clickOnHeader = (event: PointerEvent) => {
    //дженерик
    const cell = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-id]",
    );

    if (!cell) {
      return;
    }

    const field = cell.dataset.id;
    const currentOrder = cell.dataset.order;
    const newOrder = currentOrder === "desc" ? "asc" : "desc";
    if (!field) return;
    this.sort(field, newOrder);
  };

  public destroy() {
    if (!this.element) {
      return;
    }
    this.element.removeEventListener("pointerdown", this.clickOnHeader);
    this.element.remove();
  }
}
