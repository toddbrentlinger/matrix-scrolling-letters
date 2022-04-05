'use strict';

class MatrixScrollingLettersColumn {
    /**
     * Constructor for MatrixScrollingLettersColumn class.
     * @constructor
     * @param {Element} colElement 
     * @param {NodeList} rowsNodeList 
     */
    constructor(colElement, rowsNodeList) {
        this.element = colElement;
        if (!rowsNodeList)
            this.rows = this.element.querySelectorAll('.row');
        else
            this.rows = rowsNodeList
    }

    tick() {
        // Lower each drop by one row
        for (let i = this.rows.length - 1; i >= 0; i--) {
            if (this.rows[i].classList.contains('drop')) {
                // Remove class 'drop' and add class 'wet'
                this.rows[i].classList.remove('drop');
                this.rows[i].classList.add('wet');
                // Add class 'drop' to row below
                if (i < this.rows.length - 1) {
                    this.addDrop(this.rows[i + 1]);
                }
            }
        }
    }

    addDrop(row) {
        row.classList.add('drop');
    }

    addRandomDrop() {
        const rowsWithNoDrops = Array.from(this.rows).filter(row => !row.classList.contains('drop'));
        if (!rowsWithNoDrops) return;
        
        // Pick random row to add drop
        const randRow = rowsWithNoDrops[Math.floor(Math.random() * rowsWithNoDrops.length)];

        if (randRow === undefined) {
            console.log('', rowsWithNoDrops, );
        }

        // Add class 'drop' to random row
        this.addDrop(randRow);
    }
}

class MatrixScrollingLetters {
    // Static Properties

    static charCodes = [
        [1632, 1641],   // Arabic Numerals: ٠ (1632) - ٩ (1641) [10]
        [12450, 12531], // Japanese Katakana: ア (12450) - ン (12531) [82]
        [66304, 66330], // Old Italic: 𐌀 (66304) - 𐌚 (66330) [27]
    ];

    // Static Methods

    static getRandomCharCode() {
        let charCodeLengths = []; // 10, 82, 27
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

    constructor(tickInterval = 500, randDropsToAddPerTick = 5) {
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

    tick() {
        // Tick each column
        this.columns.forEach(col => col.tick());

        // Get random number of drops to add
        const dropsToAdd = Math.floor(Math.random() * this.randDropsToAddPerTick) + 1;

        // Add drops to random columns
        let randColIndex;
        for (let i = 0; i < dropsToAdd; i++) {
            randColIndex = Math.floor(Math.random() * this.columns.length);
            this.columns[randColIndex].addRandomDrop();
        }
    }

    play() {
        this.intervalID = window.setInterval(function() {
            this.tick();
        }.bind(this), this.tickInterval);
        this.isPlaying = true;
    }

    playNextTick() {
        // Return if already playing
        if (this.isPlaying) return;

        this.tick();
    }

    stop() {
        clearInterval(this.intervalID);
        this.isPlaying = false;
    }

    clear() {
        // Remove all child nodes in main
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