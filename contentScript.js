let readConsole = false;
var script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "getLocalStorage") {
    // Obtener el localStorage
    const localStorageData = { ...localStorage }; // Copiar el localStorage a un objeto
    // Enviar el localStorage al background script
    chrome.runtime.sendMessage({
      type: "localStorage",
      data: localStorageData,
    });
  }else if(message.type === "startReadingConsole"){
    readConsole = true;
    window.addEventListener(
        "message",
        function (event) {
          // Solo aceptamos mensajes de nosotros mismos
          if (event.source != window) return;
    
          if (event.data.type && event.data.type == "FROM_PAGE") {
            chrome.runtime.sendMessage({
              type: "consolelog",
              data: event.data.logs,
            });
          }
        },
        false
      );
  }
});

debugger
script = document.createElement("script");

script.src = chrome.runtime.getURL("inject.js");
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
  this.remove();
};


window.addEventListener("message", function (event) {
  if(readConsole === true){
    if(event.data.type === "FROM_PAGE_ERROR"){
      let dataTosend = event.data.logs[1].stack !== undefined ? event.data.logs[1].stack : event.data.logs[1].message;
      chrome.runtime.sendMessage({
        type: "consoleError",
        data: dataTosend,
      });
    }else if(event.data.type === "FROM_PAGE_LOG"){
      let dataTosend = event.data.logs[0];
      if(dataTosend !== ''){
        chrome.runtime.sendMessage({
          type: "consoleLog",
          data: dataTosend,
        });
      }
  
    }
  }
  
})

