const tabs = await chrome.tabs.query({});

const startRecordElement = document.getElementById("startRecord");
const stopRecordElement = document.getElementById("stopRecord");
startRecordElement.style.display = "block";
stopRecordElement.style.display = "none";

chrome.storage.local.get("state", (data) => {
  if (data.state === "recording") {
    startRecordElement.style.display = "none";
    stopRecordElement.style.display = "block";
  }
});

startRecordElement.addEventListener("click", (e) => {
  (async () => {
    startRecordElement.style.display = "none";
    stopRecordElement.style.display = "block";
    chrome.storage.local.set({ state: "recording" });
  //  chrome.browserAction.setIcon({ path: 'icons/recording.png' });
    const response = await chrome.runtime.sendMessage({ operation: "start" });
  })();
});

stopRecordElement.addEventListener("click", (e) => {
  (async () => {
    startRecordElement.style.display = "block";
    stopRecordElement.style.display = "none";
    chrome.storage.local.set({ state: "stopped" });
    const response = await chrome.runtime.sendMessage({ operation: "stop" });
  })();
});
