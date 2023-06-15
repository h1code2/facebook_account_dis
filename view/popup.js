// Initialize button with user's preferred color
let AccountInfo = new Object();

chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
    let curTab = tabs[0];
    console.log("tab", curTab);
    console.log("tab.id", curTab.id);
    AccountInfo = {};
    chrome.tabs.sendMessage(curTab.id, { action: "getSource" }, function (response) {
        let content = response.content;
        if (content == null) {
            console.log("Failed to get the html content of the current page, you can check whether the current page has been loaded.")
            return;
        }
        FindAccountInfo(content);
        let idEle = document.getElementById("account-id")
        let typeEle = document.getElementById("account-type")
        idEle.innerHTML = AccountInfo.uid;
        typeEle.innerText = AccountInfo.type;
        console.log('Value currently is ' + JSON.stringify(content));
    });
});

/**
 * parse facebook home page html
 * @param {hmtl.content} content 
 */
function FindAccountInfo(content) {
    console.log("Start matching account info.")
    if (content.indexOf("/members/") != -1) {
        ParseGroupInfo(content)
    } else if (content.indexOf("__isCanRenderCIXScreen") != -1) {
        ParseUserOrPageInfo(content)
    } else if (content.indexOf('owner":{"__typename":"Page","id":"') != -1) {
        ParsePageInfo(content)
    } else if (content.indexOf("selectedID") != -1) {
        ParseUserInfo(content)
    } else {
        console.log("unknown exception!")
        AccountInfo.uid = "Need to visit the home page address"
        AccountInfo.type = "/ You can try to refresh /"
    }

}

/**
 * parse user info
 * @param {html.content} content 
 */
function ParseUserInfo(content) {
    let uidMatch = exp("profile_owner\":{\"id\":\"(.*?)\"", content)
    if (uidMatch != null) {
        AccountInfo.uid = "User Id: " + uidMatch[1];
        AccountInfo.type = "Type: User";
    } else {
        console.log("Match failed.")
    }
}

/**
 * parse page info
 * @param {html.content} content 
 */
function ParsePageInfo(content) {
    // let uidMatch = exp("owner\":{\"__typename\":\"Page\",\"id\":\"(.*?)\"", content)
    let uidMatch = exp("pageID\":\"(.*?)\"", content)
    if (uidMatch != null) {
        AccountInfo.uid = "Page Id: " + uidMatch[1];
        AccountInfo.type = "Type: Page";
    } else {
        console.log("Match failed.")
    }
}


/**
 * parse merge account (user and page)
 * @param {html.content} content 
 */
function ParseUserOrPageInfo(content) {
    let userMatch = exp("__typename\":\"User\",\"id\":\"(.*?)\"},\"__isCanRenderCIXScreen", content)
    let pageMatch = exp("delegate_page\":{\"id\":\"(.*?)\"", content)
    console.log(userMatch)
    console.log(pageMatch)
    if (userMatch != null && pageMatch != null) {
        AccountInfo.uid = "User Id: " + userMatch[1] + "<br>" + "Page Id: " + pageMatch[1]
        AccountInfo.type = "Type: User / Page (Merge Account)"
    } else {
        ParseUserInfo(content)
    }
}

/**
 * parse group info
 * @param {html.content} content 
 */
function ParseGroupInfo(content) {
    let uidMatch = exp("\"groupID\":\"(.*?)\"", content)
    if (uidMatch != null) {
        AccountInfo.uid = "Group Id: " + uidMatch[1];
        AccountInfo.type = "Type: Group";
    } else {
        console.log("Match failed.")
    }
}

/**
 * reg utils
 * @param {*} regx 
 * @param {*} content 
 * @returns 
 */
function exp(regx, content) {
    let rex = new RegExp(regx, "g")
    let match = rex.exec(content)
    return match
}