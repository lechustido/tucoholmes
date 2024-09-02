// popup_alternativo.js

document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Array de respuestas simuladas de la IA
    const aiResponses = [
        "Hola, ¿en qué puedo ayudarte?",
        "Lo primero es pulsar sobre el botón para ir al formulario.",
        "Ahora debes rellenar todos los campos del formulario",
        "¡Eso suena interesante!",
        "¿Hay algo más que te gustaría saber?"
    ];
    
    let aiResponseIndex = 0;

    // Función para agregar un mensaje al chat
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Desplazarse hacia abajo automáticamente
    }

    // Mostrar el primer mensaje de la IA al cargar la página
    addMessage(aiResponses[aiResponseIndex], 'ai');
    aiResponseIndex = (aiResponseIndex + 1) % aiResponses.length; // Preparar el siguiente mensaje de la IA

    // Manejar el envío del mensaje del usuario
    sendButton.addEventListener('click', function() {
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;
        
        // Agregar el mensaje del usuario al chat
        addMessage(userMessage, 'user');
        userInput.value = ''; // Limpiar el input
        
        // Simular una respuesta de la IA
        setTimeout( async function() {
            addMessage(aiResponses[aiResponseIndex], 'ai');
            aiResponseIndex = (aiResponseIndex + 1) % aiResponses.length; // Ciclar a través de las respuestas
            if(aiResponseIndex === 2){
                const response = await chrome.runtime.sendMessage({ operation: "updateDom", type: 'button' });
            }
            
        }, 1000); // Simula un pequeño retraso para la respuesta de la IA
    });

    // También se puede enviar el mensaje con la tecla Enter
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.action === "urlMatched") {
            // Avanzar al siguiente mensaje de la IA automáticamente
            addMessage(aiResponses[aiResponseIndex], 'ai');
            aiResponseIndex = (aiResponseIndex + 1) % aiResponses.length;
            const response = await chrome.runtime.sendMessage({ operation: "updateDom", type: 'form' });
        }
    });
});

