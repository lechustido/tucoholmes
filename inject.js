(function () {
     console.log = function (params) {
      var args = Array.prototype.slice.call(arguments);
      window.postMessage({ type: 'FROM_PAGE_LOG', logs:args });
      //console.log(args)
       // log.apply(this, Array.prototype.slice.call(arguments));
     };
    console.error = function () {
      var args = Array.prototype.slice.call(arguments);
      window.postMessage({ type: 'FROM_PAGE_ERROR', logs:args });
    };
}());