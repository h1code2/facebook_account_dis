
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action);
    if (request.action == "getSource") {
        const html = document.body.innerHTML;
        sendResponse({ content: html });
    }
});