
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("request", request);
    console.log("sender", sender);
    console.log("sendResponse", sendResponse);
    if (request.action == "getSource") {
        const html = document.body.innerHTML;
        sendResponse({ content: html });
    }
});