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
    console.log = function () {
        // log.call(this, 'My Console!!!');
        log.apply(this, Array.prototype.slice.call(arguments));
        window.postMessage({ type: 'FROM_PAGE', logs: Array.prototype.slice.call(arguments) }, '*');
    };
}());