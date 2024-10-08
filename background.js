let currentTabId;
let chatTabId;
let version = "1.0";
let server = "http://127.0.0.1:6789";
const requests = new Map();
let isRecording = false;
//Contabilizador de segundos
let timer = 0;
//Almacena el intervalo de tiempo
let interval;

let sesionData = {};
sesionData.consoleLogs = [];
sesionData.consoleError = [];
sesionData.localStorage = {};
sesionData.requests = [];

//#region Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (request.operation === "start" && tabs.length > 0) {
      interval = setInterval(actualizarContador, 1000);
      isRecording = true;
      currentTabId = tabs[0].id;
      actualTab = currentTabId;
      chrome.tabs.sendMessage(currentTabId, { type: "getLocalStorage" });
      chrome.tabs.sendMessage(currentTabId, { type: "startReadingConsole" });
      if (currentTabId) {
        chrome.debugger.detach({ tabId: currentTabId });
      }
      currentTabId = parseInt(currentTabId);
      if (currentTabId < 0) {
        return;
      }
      server = request.server;
      chrome.debugger.attach(
        {
          tabId: currentTabId,
        },
        version,
        onAttach.bind(null, currentTabId)
      );
      chrome.debugger.onDetach.addListener(debuggerDetachHandler);
      sendResponse({ status: 0 });
      this.screenRecorder();
    } else if (request.operation === "stop") {
      clearInterval(interval);
      this.intervalo = null;
      chrome.tabs.sendMessage(currentTabId, { type: "stopReadingConsole" });
      this.screenRecorder();
      this.onDetach();
      isRecording = false;
    } else if (tabs.length === 0) {
      console.log("sin pestañas activas");
    }
  });
});
//#endregion Listener
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "localStorage") {
    sesionData.localStorage = message.data;
  }
});

//#region Llamadas http
function debuggerDetachHandler() {
  requests.clear();
}
function onAttach(tabId) {
  chrome.debugger.sendCommand(
    {
      tabId: tabId,
    },
    "Network.enable"
  );

  chrome.debugger.onEvent.addListener(allEventHandler);
}

function onDetach() {
  chrome.debugger.detach({ tabId: currentTabId });
}
function allEventHandler(debuggeeId, message, params) {
  if (currentTabId != debuggeeId.tabId) {
    return;
  }
  // get request data
  if (message == "Network.requestWillBeSent") {
    if (params.request && filter(params.request.url)) {
      const detail = new Map();
      detail.set("request", params.request);
      requests.set(params.requestId, detail);
    }
  }

  // get response data
  if (message == "Network.responseReceived") {
    if (params.response && filter(params.response.url)) {
      const request = requests.get(params.requestId);
      if (request === undefined) {
        console.log(params.requestId, "#not found request");
        return;
      }
      request.set("response", params.response);
      chrome.debugger.sendCommand(
        {
          tabId: debuggeeId.tabId,
        },
        "Network.getCookies",
        {
          urls: [params.response.url],
        },
        function (response) {
          request.set("cookies", response.cookies);
        }
      );
      requests.set(params.requestId, request);
    }
  }

  if (message == "Network.loadingFinished") {
    const request = requests.get(params.requestId);
    if (request === undefined) {
      console.log(params.requestId, "#not found request");
      return;
    }

    chrome.debugger.sendCommand(
      {
        tabId: debuggeeId.tabId,
      },
      "Network.getResponseBody",
      {
        requestId: params.requestId,
      },
      function (response) {
        if (response) {
          let newRequestData = {};
          request.set("response_body", response);
          requests.set(params.requestId, request);
          var values = Array.from(request.values());
          newRequestData.headers = values[0].headers;
          newRequestData.status = values[1].status;
          newRequestData.timers = values[1].timing;
          newRequestData.responseHeaders = values[1].headers;
          newRequestData.url = values[0].url;
          newRequestData.method = values[0].method;
          newRequestData.response = values[3].body;
          newRequestData.timer = timer;
          if(newRequestData.method === 'POST'){
            newRequestData.postData = values[0].postData;
          }
          sesionData.requests.push(newRequestData);

          requests.delete(params.requestId);
        } else {
          console.log("empty");
        }
      }
    );
  }
}

function filter(url) {
  return url.startsWith("https") && !url.endsWith("css") && !url.endsWith("js");
}
//#endregion Llamadas http

//#region Grabar la pantalla
async function screenRecorder() {
  const existingContexts = await chrome.runtime.getContexts({});
  let recording = false;

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === "OFFSCREEN_DOCUMENT"
  );

  // If an offscreen document is not already open, create one.
  if (!offscreenDocument) {
    // Create an offscreen document.
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Recording from chrome.tabCapture API",
    });
  } else {
    recording = offscreenDocument.documentUrl.endsWith("#recording");
  }

  if (recording) {
    chrome.runtime.sendMessage({
      type: "stop-recording",
      target: "offscreen",
    });
    return;
  }

  // Get a MediaStream for the active tab.
  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: currentTabId,
  });

  // Send the stream ID to the offscreen document to start recording.
  chrome.runtime.sendMessage({
    type: "start-recording",
    target: "offscreen",
    data: streamId,
  });
}
//#endregion Grabar la pantalla

//#region Obtener los datos de la consola
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let consoleData = {
    error: request.data,
    timer:timer
  }
  if (request.type === "consoleLog" && isRecording === true) {
    sesionData.consoleLogs.push(consoleData);
  } else if (request.type === "consoleError" && isRecording === true) {
    sesionData.consoleError.push(consoleData);
  }
});
//#endregion Obtener los datos de la consola


//#region Generar los datos de la grabación de la pantalla
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "recordingComplete") {
    let videoData = {
      base64: message.data,
      timer:timer
    }
    sesionData.video = videoData;
    console.log(sesionData);
    console.log(JSON.stringify(sesionData));
    sesionData = {};
    timer = 0;
    sesionData.consoleLogs = [];
    sesionData.consoleError = [];
    sesionData.localStorage = {};
    sesionData.requests = [];
    // Aquí puedes hacer algo con el video en base64, como guardarlo o procesarlo.
  }
});
//#endregion Generar los datos de la grabación de la pantalla

//#region Contabilizador de segundos de eventos
const actualizarContador = () => {
  timer++;
};
//#endregion Contabilizador de segundos de eventos

//#region Instalación de la libraría
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ask-for-help", 
    title: "¡Ayudame a continuar!",
    contexts: ["all"], 
  });
});
//#endregion Instalación de la libraría


//#region Callbacks de botones de menú
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ask-for-help") {
    chatTabId = tab.id;
    chrome.action.setPopup({
      popup: './chat/popup-chat.html'  // Cambia al popup alternativo
    });

    // Luego, abre el popup (simulando un clic en el icono de la extensión)
    chrome.action.openPopup();
  }
});

//TODO: Refactorizar esto
// Este listener y el cambio de color es para hacer un ejemplo práctico de la interacción entre el popup y el background.js,
// debe ser refactorizado cuando se implemente la lógica real
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.operation === 'updateDom'){
    chrome.scripting.executeScript({
      target: { tabId: chatTabId },
      function: changeElementColor,
      args:[ request.type]
    });
  }
  
});

function changeElementColor(type) {
  if(type === 'button'){
    const button = [...document.querySelectorAll(type)].find(btn => btn.textContent.includes('Ir a formulario'));
    if (button) {
      button.style.backgroundColor = 'yellow';
    }
  }else if(type === 'form'){
    const matInputs = document.querySelectorAll('mat-form-field, input');
    console.log(matInputs)
    matInputs.forEach(input => {
        // Aplicar el color de fondo solo a los inputs dentro de mat-form-field
        if (input.tagName === 'INPUT') {
            input.style.backgroundColor = 'yellow';
        } 
    });
  }

}
//Refactorizar esto


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Verificar si el cambio es una actualización de la URL
  if (changeInfo.status === 'complete' && tab.url === "http://localhost:4200/ai-form") {
    // Enviar un mensaje al popup
    chrome.runtime.sendMessage({ action: "urlMatched" });
}
});
//#endregion Callbacks de botones de menú