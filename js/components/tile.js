class Tile extends HTMLElement {
  get size() {
    return parseInt(this.getAttribute('size'));
  }

  set size(value) {
    this.setAttribute('size', value)
  }

  get row() {
    return parseInt(this.getAttribute('row'));
  }

  set row(value) {
    this.setAttribute('row', value)
  }

  get column() {
    return parseInt(this.getAttribute('column'));
  }

  set column(value) {
    this.setAttribute('column', value)
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (Number.isInteger(this.size) &&
      Number.isInteger(this.row) &&
      Number.isInteger(this.column)) {
      this.style.width = this.size;
      this.style.height = this.size;
      this.style.left = this.size * this.column;
      this.style.top = this.size * this.row;
    }
  }

}

Tile.observedAttributes = [
  'size',
  'row',
  'column',
];
customElements.define('x-tile', Tile);
