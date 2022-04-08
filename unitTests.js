'use strict';

const CHAR_CODES = [
    [48, 57], // 0 (48) - 9 (57) [10]
    [1632, 1641],   // Arabic Numerals: ٠ (1632) - ٩ (1641) [10]
    [12450, 12531], // Japanese Katakana: ア (12450) - ン (12531) [82]
    [66304, 66330], // Old Italic: 𐌀 (66304) - 𐌚 (66330) [27]
];

/**
 * 
 * @param {Function} getRandomCharCode Function to return random
 * @param {Number} numTests 
 */
function getRandomCharCodeUnitTests(getRandomCharCode, numTests = 10000) {
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