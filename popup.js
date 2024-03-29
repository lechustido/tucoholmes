const tabs =await chrome.tabs.query({});

const startRecordElement =  document.getElementById("startRecord");
 
startRecordElement.addEventListener('click',  (e)=> {
    (async ()=>{
        const response = await chrome.runtime.sendMessage({operation: 'start'});
    })();
 
});


