chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    debugger
    if (message.type === 'getLocalStorage') {
        // Obtener el localStorage
        const localStorageData = { ...localStorage }; // Copiar el localStorage a un objeto
        // Enviar el localStorage al background script
        chrome.runtime.sendMessage({ type: 'localStorage', data: localStorageData });
    }
});