class Game extends HTMLElement {
  get size() {
    return parseInt(this.getAttribute('size'));
  }

  set size(value) {
    this.setAttribute('size', value)
  }

  get points() {
    return parseInt(this.getAttribute('points'));
  }

  set points(value) {
    this.setAttribute('points', value)
  }
  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr === 'points') {
      this.pointsDisplay.innerText = this.points;
    }
  }

  connectedCallback() {
    this.states = [];
    let lastEventStamp = 0;
    document.addEventListener('keydown', (event) => {
      if (event.timeStamp - lastEventStamp < 200) {
        return;
      }
      lastEventStamp = event.timeStamp;
      switch (event.code) {
        case "ArrowUp":
          this.moveUp();
          break;
        case "ArrowRight":
          this.moveRight();
          break;
        case "ArrowDown":
          this.moveDown();
          break;
        case "ArrowLeft":
          this.moveLeft();
          break;
      }
    });
    const gamePanel = document.createElement('div');
    gamePanel.classList.add('game-panel');
    const pointsWrapper = document.createElement('h2');
    const pointsLabel = document.createElement('span');
    pointsLabel.innerText = 'Score: ';
    this.pointsDisplay = document.createElement('span');
    pointsWrapper.appendChild(pointsLabel);
    pointsWrapper.appendChild(this.pointsDisplay);
    gamePanel.appendChild(pointsWrapper);
    this.points = 0;
    this.undoButton = document.createElement('button');
    this.undoButton.innerText = 'Undo';
    this.undoButton.disabled = false;
    
    gamePanel.appendChild(this.undoButton);
    this.appendChild(gamePanel);
    this.undoButton.addEventListener('click', (event) => {
      this.undo();
    });
    this.tileSize = this.offsetWidth / this.size;
    const numberOfTiles = this.size * this.size;
    const tiles = new Array(numberOfTiles).fill(null).map((_, index) => {
      const tile = document.createElement('x-tile');
      tile.column = index % this.size;
      tile.row = Math.floor(index / this.size);
      tile.size = this.tileSize;
      this.appendChild(tile);

      return tile;
    });
    this.putRandomBrick();
  }

  putRandomBrick() {
    const freeTiles = this.getFreeTiles();
    const randomTileIndex = this.randomIntFromInterval(0, freeTiles.length - 1);
    const randomTile = freeTiles[randomTileIndex];
    this.putBrick(randomTile);

  }

  putBrick(tile, value) {
    const brick = document.createElement('x-brick');
    brick.column = tile.column;
    brick.row = tile.row;
    brick.size = tile.size;
    brick.value = value || (Math.random() > 0.9 ? 4 : 2);
    this.appendChild(brick);
  }

  getFreeTiles() {
    const bricks = this.querySelectorAll('x-brick');
    let tiles = Array.from(this.querySelectorAll('x-tile'));
    bricks.forEach((brick) => {
      tiles = tiles.filter(
        (tile) => !(tile.row === brick.row && tile.column === brick.column)
      )
    });
    return tiles;
  }

  // ty stackoverflow
  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  moveUp() {
    this.moveBricks('row', true);
  }

  moveRight() {
    this.moveBricks('column', false);
  }

  moveDown() {
    this.moveBricks('row', false);
  }

  moveLeft() {
    this.moveBricks('column', true);
  }

  moveBricks(key, toTopOrLeft) {
    this.setState();
    const groupKey = key === 'row' ? 'column' : 'row';
    const brickGroups = this.groupBricks(groupKey, key, !toTopOrLeft);
    brickGroups.forEach((group) => {
      let lastBrick;
      group.forEach((brick) => {
        if (!lastBrick) {
          brick[key] = toTopOrLeft ? 0 : this.size - 1;
        } else {
          if (lastBrick.value === brick.value && lastBrick.merged === false) {
            lastBrick.merge();
            brick.markForDestruction();
            brick[key] = lastBrick[key];
            return;
          } else {
            brick[key] = parseInt(lastBrick[key]) + (toTopOrLeft ? 1 : -1);
          }
        }
        lastBrick = brick;
      });
    });
    const dirtyBricks = this.querySelectorAll('x-brick[dirty="true"]');
    if (dirtyBricks.length) {
      dirtyBricks.forEach((brick) => brick.dirty = false);
      this.putRandomBrick();
      if (!this.canMove()) {
        this.innerHTML = `
        <iframe width="560" height="315" src="https://www.youtube.com/embed/u2ycDWywGls?rel=0&amp;controls=0&amp;showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen></iframe>
        `;
      }
    }
  }

  canMove() {
    const freeTiles = this.getFreeTiles();
    if (freeTiles.length > 0) {
      return true;
    }
    let canMatch = false;
    const bricksPerColumns = this.groupBricks('column', 'row', false);
    const bricksPerRows = this.groupBricks('row', 'column', false);
    const checkIfNextIsMatch = (brick, index, collection) => {
      if (canMatch) {
        return;
      }
      const next = collection[index + 1];
      if (next && next.value === brick.value) {
        canMatch = true;
      }
    };

    bricksPerColumns.forEach((column) => column.forEach(checkIfNextIsMatch));
    bricksPerRows.forEach((row) => row.forEach(checkIfNextIsMatch));
    return canMatch;
  }

  groupBricks(groupKey, sortKey, reverse) {
    const brickGroups = new Array(this.size);
    let bricks = Array.from(this.querySelectorAll('x-brick:not([markedForDestruction="true"])'));
    for (let i = 0; i < this.size; i++) {
      brickGroups[i] = bricks.filter((brick) => parseInt(brick[groupKey]) === i);
      brickGroups[i].sort((b1, b2) => {
        return b1[sortKey] - b2[sortKey]
      });
      if (reverse) {
        brickGroups[i].reverse();
      }
    }
    return brickGroups;
  }

  setState() {
    const state = {
      bricks: Array.from(this.querySelectorAll('x-brick')).map((brick) => brick.cloneNode()),
      points: this.points,
    }

    this.states.push(state);
    this.undoButton.disabled = false;
    

  }

  undo() {
    if (this.states.length > 0) {
      this.querySelectorAll('x-brick').forEach((brick) => brick.remove());
      const state = this.states.pop();
      state.bricks.forEach((brick) => this.appendChild(brick));
      this.points = state.points;
      if (this.states.length === 0) {
        this.undoButton.disabled = true;
      }
    }
  }
}
  Game.observedAttributes = [
    'points',
  ];
  customElements.define('x-game', Game);
