let currentTabId;
let version = "1.0";
let server = "http://127.0.0.1:6789";
const requests = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (request.operation === "start" && tabs.length >= 0) {
      currentTabId = tabs[0].id;
      actualTab = currentTabId;
      chrome.tabs.sendMessage(currentTabId, { type: 'getLocalStorage' });
      console.log("ID de la pestaña actual:", currentTabId);

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
    }else if(request.operation === "stop"){
      this.screenRecorder();
      this.onDetach();
    }
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'localStorage') {
        console.log('LocalStorage desde Content Script:', message.data);
    }
});

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
  chrome.debugger.onEvent.removeListener();
}
// https://chromedevtools.github.io/devtools-protocol/tot/Network
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
          request.set("response_body", response);
          requests.set(params.requestId, request);
          console.log(request);

          requests.delete(params.requestId);
        } else {
          console.log("empty");
        }
      }
    );
  }
}

function filter(url) {
  return url.startsWith("http") && !url.endsWith("css") && !url.endsWith("js");
}


async function screenRecorder(){
    const existingContexts = await chrome.runtime.getContexts({});
    let recording = false;
  
    const offscreenDocument = existingContexts.find(
      (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
    );
  
    // If an offscreen document is not already open, create one.
    if (!offscreenDocument) {
      // Create an offscreen document.
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Recording from chrome.tabCapture API'
      });
    } else {
      recording = offscreenDocument.documentUrl.endsWith('#recording');
    }
  
    if (recording) {
      chrome.runtime.sendMessage({
        type: 'stop-recording',
        target: 'offscreen'
      });
      return;
    }
  
    // Get a MediaStream for the active tab.
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: currentTabId
    });
  
    // Send the stream ID to the offscreen document to start recording.
    chrome.runtime.sendMessage({
      type: 'start-recording',
      target: 'offscreen',
      data: streamId
    });
}
