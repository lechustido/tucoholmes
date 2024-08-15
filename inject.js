(function () {
  // 1. Guardar las referencias originales
  var originalConsoleLog = console.log;
  var originalConsoleError = console.error;

  // 2. Sobrescribir las funciones para capturar los logs
  console.log = function (params) {
      var args = Array.prototype.slice.call(arguments);
      window.postMessage({ type: 'FROM_PAGE_LOG', logs: args });
      // originalConsoleLog.apply(this, args); // Si deseas también mostrar el log en la consola
  };

  console.error = function () {
      var args = Array.prototype.slice.call(arguments);
      window.postMessage({ type: 'FROM_PAGE_ERROR', logs: args });
      // originalConsoleError.apply(this, args); // Si deseas también mostrar el error en la consola
  };

  // 3. Escuchar eventos para restaurar las funciones originales
  window.addEventListener('message', function(event) {
      if (event.data.type === 'stopConsole') {
          // Restaurar las funciones originales
          console.log = originalConsoleLog;
          console.error = originalConsoleError;
      }
  }, false);
}());

/*chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'startReadingConsole') {
    loadMsg = true;
  }else if(request.type === 'stopReadingConsole'){
    loadMsg = false;
  }
});*/
/*
window.addEventListener('message', function(event) {
  if (event.data.type === 'startConsole') {
    loadMsg = true;
  }else if(event.data.type === 'stopConsole'){
    loadMsg = false;
  }
}, false);*/