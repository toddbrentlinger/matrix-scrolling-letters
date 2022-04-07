'use strict';

class MatrixScrollingLettersDrop {
    /**
     * 
     * @param {Element} element 
     * @param {Number} index
     */
    constructor(element, index) {
        this.setNewDrop(element, index);
    }

    setNewDrop(newElement, newIndex) {
        this.element = newElement;
        this.index = newIndex;

        if (!this.element) debugger;
        this.element.classList.remove('drop-clear', 'wet');
        this.element.style.color = '';
        this.element.classList.add('drop');
    }
}

class MatrixScrollingLettersDropClear {
    /**
     * 
     * @param {Element} element 
     * @param {Number} index
     */
     constructor(element, index) {
        this.setNewDropClear(element, index);
    }

    setNewDropClear(newElement, newIndex) {
        this.element = newElement;
        this.index = newIndex;
        this.element.classList.remove('drop', 'wet');
        this.element.style.color = '';
        this.element.classList.add('drop-clear');
    }
}

class MatrixScrollingLettersColumn {
    /**
     * Constructor for MatrixScrollingLettersColumn class.
     * @constructor
     * @param {Element} colElement 
     * @param {NodeList} rowsNodeList 
     */
    constructor(colElement, rowsNodeList) {
        this.element = colElement;
        this.drops = [];
        this.dropClears = [];

        if (!rowsNodeList)
        rowsNodeList = this.element.querySelectorAll('.row');
        
        this.rows = Array.from(rowsNodeList);
    }

    tick() {
        //if (this.drops.length || this.dropClears.length) debugger;
        // Drops
        let drop;
        for (let i = this.drops.length - 1; i >= 0; i--) {
            drop = this.drops[i];
            // Change row with drop to 'wet' with random font color lightness
            drop.element.classList.remove('drop');
            drop.element.classList.add('wet');
            drop.element.style.color = `hsl(120, 100%, ${10 + Math.floor(Math.random() * 41)}%)`; // 10-50

            // Move drop to next row OR remove drop if at bottom of column
            if (drop.index >= this.rows.length - 1) {
                // Remove drop
                this.drops.splice(i, 1);
            } else {
                if (!this.rows[drop.index + 1]) debugger;
                // Lower drop
                drop.setNewDrop(this.rows[drop.index + 1], drop.index + 1);
            }
        }

        // Drop-Clears
        let dropClear;
        for (let i = this.dropClears.length - 1; i >= 0; i--) {
            dropClear = this.dropClears[i];
            // Remove 'drop-clear' class
            dropClear.element.classList.remove('drop-clear');

            // Move drop-clear to next row OR remove drop-clear
            if (dropClear.index >= this.rows.length - 1) {
                // Remove drop-clear
                this.dropClears.splice(i, 1);
            } else {
                // Lower drop
                dropClear.setNewDropClear(this.rows[dropClear.index + 1], dropClear.index + 1);
            }
        }
    }

    addDrop(rowElement, index) {
        const newDrop = new MatrixScrollingLettersDrop(rowElement, index);
        // If no drops in column, push to array
        if (!this.drops.length) 
            this.drops.push(newDrop);
        else { // Else set newDrop into sorted position of this.drops
            for (let i = 0; i < this.drops.length; i++) {
                if (index < this.drops[i].index) {
                    this.drops.splice(i, 0, newDrop);
                    break;
                }
            }
        }
    }

    addDropClear(rowElement, index) {
        const newDropClear = new MatrixScrollingLettersDropClear(rowElement, index);
        // If no drop-clears in column, push to array
        if (!this.dropClears.length)
            this.dropClears.push(newDropClear);
        else { // Set newDropClear into sorted position of this.dropClears
            for (let i = 0; i < this.dropClears.length; i++) {
                if (index < this.dropClears[i].index) {
                    this.dropClears.splice(i, 0, newDropClear);
                    break;
                }
            }
        }
    }

    addRandomDrop() {
        const rowIndicesToAddClass = [];
        // Find row indices with no 'drop', 'wet', or 'drop-clear' class (only 'row')
        this.rows.forEach((row, index) => {
            if (!row.classList.contains('drop') && !row.classList.contains('wet') && !row.classList.contains('drop-clear'))
                rowIndicesToAddClass.push(index);
        });
        if (!rowIndicesToAddClass) return;
        
        // Pick random row index to add drop
        const randIndex = rowIndicesToAddClass[Math.floor(Math.random() * rowIndicesToAddClass.length)];

        // Add class 'drop' to random row
        this.addDrop(this.rows[randIndex], randIndex);
    }

    addRandomDropClear() {
        const rowIndicesToAddClass = [];
        // Find row indices with no 'drop', 'wet', or 'drop-clear' class (only 'row')
        this.rows.forEach((row, index) => {
            if (!row.classList.contains('drop') && !row.classList.contains('wet') && !row.classList.contains('drop-clear'))
                rowIndicesToAddClass.push(index);
        });
        if (!rowIndicesToAddClass) return;
        
        // Pick random row index to add drop-clears
        const randIndex = rowIndicesToAddClass[Math.floor(Math.random() * rowIndicesToAddClass.length)];

        // Add class 'drop-clear' to random row
        this.addDropClear(this.rows[randIndex], randIndex);
    }
}

class MatrixScrollingLetters {
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
    constructor(tickInterval = 300, randDropsToAddPerTick = 5) {
        this.mainNode = document.querySelector('main');

        this.updateRowsNColumnsCount();
        window.addEventListener('resize', function() {
            this.updateRowsNColumnsCount();
        }.bind(this));

        this.randDropsToAddPerTick = randDropsToAddPerTick;
        this.tickInterval = tickInterval;
        this.isPlaying = false;
        this.play();
    }

    // Getters/Setters

    // Methods

    /** Runs at every interval of scrolling letters. */
    tick() {
        // Tick each column
        this.columns.forEach(col => col.tick());

        // Get random number of drops to add
        const dropsToAdd = Math.floor(Math.random() * this.randDropsToAddPerTick) + 1;
        const dropClearsToAdd = Math.floor(Math.random() * this.randDropsToAddPerTick) + 1;

        // Add drops and drop-clears to random columns
        let randColIndex;
        for (let i = 0; i < dropsToAdd; i++) {
            randColIndex = Math.floor(Math.random() * this.columns.length);
            this.columns[randColIndex].addRandomDrop();
        }
        for (let i = 0; i < dropClearsToAdd; i++) {
            randColIndex = Math.floor(Math.random() * this.columns.length);
            this.columns[randColIndex].addRandomDropClear();
        }
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
                newRow.textContent = String.fromCodePoint(MatrixScrollingLetters.getRandomCharCode());
                newCol.append(newRow);
                rowsPerColumn.push(newRow);
            }
            this.mainNode.append(newCol);
            this.columns.push(new MatrixScrollingLettersColumn(newCol, rowsPerColumn));
        }
    }    
}

// (function () {
//     const matrixScrollingLetters = new MatrixScrollingLetters();
// })();
const matrixScrollingLetters = new MatrixScrollingLetters();

// str.codePointAt(index)
// Old Italic: 𐌀 (66304) - 𐌚 (66330) [27]
// Japanese Katakana: ア (12450) - ン (12531) [82]
// Arabic Numerals: ٠ (1632) - ٩ (1641) [10]

function getRandomCharCodeUnitTests(numTests = 10000) {
    let failCount = 0;
    unitTest: for (let i = 0; i < numTests; i++) {
        const rand = getRandomCharCode();
        for (const charSet of CHAR_CODES) {
            if (rand >= charSet[0] && rand <= charSet[1]) {
                continue unitTest;
            }
        }
        failCount++;
    }
    console.log(`Tests Failed: ${failCount}`);
}