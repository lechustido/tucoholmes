// (function () {
//     var log = console.log;
//     console.log = function () {
//         log.call(this, 'My Console!!!');
//         log.apply(this, Array.prototype.slice.call(arguments));
//     };
// }());

// inject.js
(function () {
    var log = console.log;
    var error = console.error;
    console.log = function () {
        // log.call(this, 'My Console!!!');
        log.apply(this, Array.prototype.slice.call(arguments));
        window.postMessage({ type: 'FROM_PAGE', logs: Array.prototype.slice.call(arguments) }, '*');
    };
    console.error = function () {
        error.apply(this, Array.prototype.slice.call(arguments));
        window.postMessage({ type: 'FROM_PAGE_ERROR', logs: Array.prototype.slice.call(arguments) }, '*');
    };
}());