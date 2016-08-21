'use strict';

// Tests
// function makeTest (item, inv, expected) {
//     var made = canMake(item, inv);
//     var passed = Object.equals(expected, made);

//     console.log('Test to make ' + item + ': ' + passed);
//     if (!passed) {
//         console.log('expected: ');
//         console.log(expected);
//         console.log('actual: ');
//         console.log(made);
//     }
// }

// function canMakeTest () {
//     makeTest('Suspension Fluid', {'Carbon': 100}, {'Carbon': 50});
//     makeTest('Electron Vapor', {'Carbon': 100, 'Plutonium': 100},
//              {'Suspension Fluid': {'Carbon': 50}, 'Plutonium': 100});
//     makeTest('Antimatter', {'Carbon': 100, 'Plutonium': 100, 'Zinc': 100, 'Heridium': 150},
//              {'Electron Vapor': {'Suspension Fluid': {'Carbon': 50}, 'Plutonium': 100}, 'Zinc': 20, 'Heridium': 50});
// }

// Taken from http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
Object.equals = function (x, y) {
    if (x === y) return true;
    // if both x and y are null or undefined and exactly the same

    if (!(x instanceof Object) || !(y instanceof Object)) return false;
      // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) return false;
      // they must have the exact same prototype chain, the closest we can do is
      // test there constructor.

    for (var p in x) {
        if (!x.hasOwnProperty(p)) continue;
        // other properties were tested using x.constructor === y.constructor

        if (!y.hasOwnProperty(p)) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if (x[p] === y[p]) continue;
        // if they have the same strict value or identity then they are equal

        if (typeof (x[p]) !== 'object') return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal

        if (!Object.equals(x[p], y[p])) return false;
        // Objects and Arrays must be tested recursively
    }

    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
        // allows x[ p ] to be set to undefined
    }
    return true;
}

// From http://stackoverflow.com/questions/979662/how-to-detect-pressing-enter-on-keyboard-using-jquery
$.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode === '13') {
                fnc.call(this, ev);
            }
        })
    })
}

// From http://stackoverflow.com/a/2866613/1665365
/*
decimalSep: character used as deciaml separtor, it defaults to '.' when omitted
thousandsSep: char used as thousands separator, it defaults to ',' when omitted
*/
// eslint-disable-next-line no-extend-native
Number.prototype.toMoney = function (decimals, decimalSep, thousandsSep) {
    var n = this;
    var c = isNaN(decimals) ? 2 : Math.abs(decimals); // if decimal is zero we must take it, it means user does not want to show any decimal
    var d = decimalSep || '.'; // if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

    /*
    according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
    the fastest way to check for not defined parameter is to use typeof value === 'undefined'
    rather than doing value === undefined.
    */
    var t = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep; // If you don't want to use a thousands separator you can pass empty string as thousandsSep value

    var sign = (n < 0) ? '-' : '';

    // Extracting the absolute value of the integer part of the number and converting to string
    var i = parseInt(n = Math.abs(n).toFixed(c)) + '';

    var j = ((j = i.length) > 3) ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
}

// Taken from  https://codepad.co/snippet/zRykJud8
// eslint-disable-next-line no-extend-native
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// eslint-disable-next-line no-extend-native
String.prototype.titleize = function () {
    var stringArray = this.split(' ');
    stringArray = stringArray.map(function (str) {
        return str.capitalize();
    });
    return stringArray.join(' ');
}

