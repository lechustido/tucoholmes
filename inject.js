(function () {
    var log = console.log;
    var error = console.error;
    // console.log = function (params) {
    //     log.apply(this, Array.prototype.slice.call(arguments));
    // };
    console.error = function () {
      var args = Array.prototype.slice.call(arguments);
      window.postMessage({ type: 'FROM_PAGE_ERROR', logs:args });
    };
}());