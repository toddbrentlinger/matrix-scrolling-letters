'use strict';

/*
TODO:
- Put all drops and drop-clears into same array sorted by row index number
  to reduce script size and function count.
- Reduce Drop and DropClear classes by putting more repeated code into Drop 
  base class.
 */

class MatrixScrollDrop {
    /**
     * @constructor
     * @param {Element} element
     */
    constructor(element) {
        this.set(element);
    }

    /**
     * 
     * @param {Element} newElement
     */
    set(newElement) {
        this.element = newElement;

        // Remove styling if class is 'wet'. Shouldn't have to remove 'drop-clear'.
        this.element.classList.remove('wet');
        this.element.style.color = '';

        this.element.classList.add('drop');

        this.element.textContent = String.fromCodePoint(MatrixScroll.getRandomCharCode());
    }

    /**
     * 
     * @returns {Element|null} Element drop was moved to OR null if at bottom of column
     */
    incrementDown() {
        // Change row with class 'drop' to 'wet' with random font color lightness
        this.element.classList.remove('drop');
        this.element.classList.add('wet');
        this.element.style.color = `hsl(120, 100%, ${10 + Math.floor(Math.random() * 41)}%)`; // 10-50

        // Move drop to next row OR return null if at bottom of column
        const nextRow = this.element.nextSibling; // Null if at bottom of column
        if (nextRow)
            this.set(nextRow);
        return nextRow;
    }
}

class MatrixScrollDropClear extends MatrixScrollDrop {
    /**
     * 
     * @param {Element} newElement
     */
    set(newElement) {
        this.element = newElement;
        
        // Remove styling if class is 'wet'. Shouldn't have to remove 'drop'.
        this.element.classList.remove('wet');
        this.element.style.color = '';

        this.element.classList.add('drop-clear');
    }

    /**
     * 
     * @returns {Element|null} Element drop was moved to OR null if at bottom of column
     */
     incrementDown() {
        // Remove 'drop-clear' class
        this.element.classList.remove('drop-clear');

        // Move drop to next row OR return null if at bottom of column
        const nextRow = this.element.nextSibling; // Null if at bottom of column
        if (nextRow)
            this.set(nextRow);
        return nextRow;
    }
}

class MatrixScrollColumn {
    /**
     * Constructor for MatrixScrollColumn class.
     * @constructor
     * @param {Element} colElement 
     * @param {NodeList} rowsNodeList 
     */
    constructor(colElement, rowsNodeList) {
        this.drops = [];
        this.dropClears = [];

        // If no rows provided in arguments, query all 'row' class nodes in column
        if (!rowsNodeList)
            rowsNodeList = colElement.querySelectorAll('.row');

        this.rows = Array.from(rowsNodeList);
    }

    /** Repeatedly called on set interval. */
    tick() {
        // Increment Drops and Drop-Clears
        this.incrementDrops();
        this.incrementDropClears();

        // Add new drops and drop-clears
        this.addRandomDropsAndDropClears();
    }

    incrementDrops() {
        let drop;
        // Loop in reverse since removing an element would skip next item in loop
        for (let i = this.drops.length - 1; i >= 0; i--) {
            drop = this.drops[i];
            // If incrementing drop returns null, remove drop from array of drops
            if (!drop.incrementDown()) {
                this.drops.splice(i, 1);
            }
        }
    }

    incrementDropClears() {
        // Loop in reverse since removing an element would skip next item in loop
        let dropClear;
        for (let i = this.dropClears.length - 1; i >= 0; i--) {
            dropClear = this.dropClears[i];
            // If incrementing drop-clear returns null, remove drop-clear from array of drop-clears
            if (!dropClear.incrementDown()) {
                this.dropClears.splice(i, 1);
            }
        }
    }

    addRandomDropsAndDropClears(dropLikelihood = 0.01, dropClearLikelihood = 0.02) {
        const bShouldAddDrop = Math.random() < dropLikelihood;
        const bShouldAddDropClear = Math.random() < dropClearLikelihood;

        // Return if should NOT add either drop or clear
        if (!bShouldAddDrop && !bShouldAddDropClear) return;

        // Find row indices with no 'drop', 'wet', or 'drop-clear' class (only 'row')
        // const emptyRowsNodeArr = Array.from(
        //     this.element.querySelectorAll(':not(.drop):not(.wet):not(.drop-clear)')
        // );
        const emptyRowsNodeArr = this.rows.filter(row => () => {
            const classList = row.classList;
            return (!classList.contains('drop') && !classList.contains('wet') && !classList.contains('drop-clear'));
        });

        // If no empty rows, add drop-clear to first row and return
        if (!emptyRowsNodeArr) {
            debugger;
            this.addDropClearToRow(this.rows[0]);
            return;
        }

        let randRow, randRowIndex;
        if (bShouldAddDrop) {
            // Pick random empty row index to add drop
            randRowIndex = Math.floor(Math.random() * emptyRowsNodeArr.length);
            randRow = emptyRowsNodeArr[randRowIndex];

            // Add class 'drop' to random row
            this.addDropToRow(randRow);

            // If should add drop clear, remove row from emptyRowsNodeArr before
            if (bShouldAddDropClear)
                emptyRowsNodeArr.splice(randRowIndex, 1);
        }

        if (bShouldAddDropClear) {
            // Pick random empty row index to add drop-clear
            randRowIndex = Math.floor(Math.random() * emptyRowsNodeArr.length);
            randRow = emptyRowsNodeArr[randRowIndex];

            // Add class 'drop-clear' to random row
            this.addDropClearToRow(randRow);
        }
    }

    addDropToRow(rowElement) {
        const newDrop = new MatrixScrollDrop(rowElement);
        // If no drops in column, push to array
        if (!this.drops.length) 
            this.drops.push(newDrop);
        else { // Else set newDrop into sorted position of this.drops
            for (let i = 0; i < this.drops.length; i++) {
                if (+newDrop.element.dataset.row < +this.drops[i].element.dataset.row) {
                    this.drops.splice(i, 0, newDrop);
                    break;
                }
            }
        }
    }

    addDropClearToRow(rowElement) {
        const newDropClear = new MatrixScrollDropClear(rowElement);
        // If no drop-clears in column, push to array
        if (!this.dropClears.length)
            this.dropClears.push(newDropClear);
        else { // Set newDropClear into sorted position of this.dropClears
            for (let i = 0; i < this.dropClears.length; i++) {
                if (+newDropClear.element.dataset.row < +this.dropClears[i].element.dataset.row) {
                    this.dropClears.splice(i, 0, newDropClear);
                    break;
                }
            }
        }
    }
}

class MatrixScroll {
    // Static Properties

    static charCodes = [
        [48, 57], // 0 (48) - 9 (57) [10]
        [1632, 1641],   // Arabic Numerals: ٠ (1632) - ٩ (1641) [10]
        [12450, 12531], // Japanese Katakana: ア (12450) - ン (12531) [82]
        [66304, 66330], // Old Italic: 𐌀 (66304) - 𐌚 (66330) [27]
    ];

    // Static Methods

    static getRandomCharCode() {
        let charCodeLengths = [];
        for (const charCodeSet of this.charCodes) {
            charCodeLengths.push(charCodeSet[1] - charCodeSet[0] + 1);
        }
        let randIndex = Math.floor(Math.random() * charCodeLengths.reduce((prev, curr) => prev + curr));
        for (let i = 0; i < charCodeLengths.length; i++) {
            // Adjust random index if in non-first character set
            if (i > 0) {
                randIndex -= charCodeLengths[i-1];
            }
            // If random index is less than current char code set length, code is inside corresponding character set
            if (randIndex < charCodeLengths[i]) {
                return this.charCodes[i][0] + randIndex;
            }
        }
    }

    // Constructor

    /**
     * @constructor
     * @param {Number} tickInterval 
     * @param {Number} randDropsToAddPerTick 
     */
    constructor(tickInterval = 300) {
        this.mainNode = document.querySelector('main');

        this.updateRowsNColumnsCount();

        window.addEventListener('resize', function() {
            this.updateRowsNColumnsCount();
        }.bind(this));

        this.tickInterval = tickInterval;
        this.isPlaying = false;

        this.play();
    }

    // Methods

    /** Runs at every interval of scrolling letters. */
    tick() {
        // Tick each column
        this.columns.forEach(col => col.tick());
    }

    /** Start tick loops on set interval to play scrolling letters. */
    play() {
        this.intervalID = window.setInterval(function() {
            this.tick();
        }.bind(this), this.tickInterval);
        this.isPlaying = true;
    }

    /**  While scroll is stopped/paused, can play one tick at a time. */
    playNextTick() {
        // Return if already playing
        if (this.isPlaying) return;

        this.tick();
    }

    /** Stops/pauses the scrolling effect. */
    stop() {
        clearInterval(this.intervalID);
        this.isPlaying = false;
    }

    /** Removes all scrolling columns. */
    clear() {
        while (this.mainNode.firstChild) {
            this.mainNode.removeChild(this.mainNode.firstChild);
        }
    }

    /**
     * @todo Only remove/add necessary columns and rows instead of clearing everything.
     */
    updateRowsNColumnsCount() {
        this.columns = [];

        this.clear();

        const htmlNode = document.querySelector('html');
        // Calculate number of columns based on window size
        const clientWidth = htmlNode.clientWidth;
        const columnWidth = +window.getComputedStyle(this.mainNode, null)
            .getPropertyValue('font-size')
            .split('px')[0];
        const numColumns = Math.floor(clientWidth / columnWidth);

        // Calculate number of rows based on window size
        const clientHeight = htmlNode.clientHeight;
        const numRows = Math.floor(clientHeight / (1.5 * columnWidth));

        let newCol, newRow, rowsPerColumn;
        for (let i = 0; i < numColumns; i++) {
            newCol = document.createElement('div');
            newCol.classList.add('col');
            rowsPerColumn = [];
            for (let j = 0; j < numRows; j++) {
                newRow = document.createElement('div');
                newRow.classList.add('row');
                newRow.textContent = String.fromCodePoint(MatrixScroll.getRandomCharCode());
                newRow.dataset.col = i;
                newRow.dataset.row = j;
                newCol.append(newRow);
                rowsPerColumn.push(newRow);
            }
            this.mainNode.append(newCol);
            this.columns.push(new MatrixScrollColumn(newCol, rowsPerColumn));
        }
    }    
}

(function () {
    window.matrixScroll = new MatrixScroll();
})();