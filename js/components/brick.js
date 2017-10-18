class Brick extends HTMLElement {
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

  get value() {
    return parseInt(this.getAttribute('value'));
  }

  set value(value) {
    this.setAttribute('value', value)
  }

  get merged() {
    return this.getAttribute('merged') === "true" ? true : false;
  }

  set merged(value) {
    this.setAttribute('merged', value)
  }

  get dirty() {
    return this.getAttribute('dirty') === "true" ? true : false;
  }

  set dirty(value) {
    this.setAttribute('dirty', value)
  }

  get new() {
    return this.getAttribute('new') === "true" ? true : false;
  }

  set new(value) {
    this.setAttribute('new', value)
  }

  get markedForDestruction() {
    return this.getAttribute('markedForDestruction') === "true" ? true : false;
  }

  set markedForDestruction(value) {
    this.setAttribute('markedForDestruction', value)
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    const positionAttrbites = ['size', 'row', 'column'];
    if(oldValue === newValue) {
      return;
    }
    if (positionAttrbites.indexOf(attr) > -1 &&
        Number.isInteger(this.size) &&
        Number.isInteger(this.row) &&
        Number.isInteger(this.column)) {
      this.style.width = this.size;
      this.style.height = this.size;
      this.style.left = this.size * this.column;
      this.style.top = this.size * this.row;
      this.style.lineHeight = this.size + 'px';
    }
    if (attr === 'value' && this.valueLabel) {
      this.valueLabel.innerText = this.value;
    }
    if(attr === 'merged' && !this.merged) {
      return;
    }
    this.dirty = true;    
  }

  connectedCallback() {
    this.merged = false;    
    this.dirty = false;
    this.new = true;
    setTimeout(() => this.new = false, 200);    
    this.valueLabel = document.createElement('h1');
    this.valueLabel.innerText = this.value;
    this.appendChild(this.valueLabel);
  }

  markForDestruction() {
    this.markedForDestruction = true;
    setTimeout(() => this.remove() ,200);    
  }

  merge() {
    this.merged = true;
    this.value *= 2;
    setTimeout(() => this.merged = false, 100);    
  }

}

Brick.observedAttributes = [
  'size',
  'row',
  'column',
  'value',
  'merged',
];
customElements.define('x-brick', Brick);
