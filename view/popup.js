// Initialize button with user's preferred color
let AccountInfo = new Object();

chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
    let curTab = tabs[0];
    console.log("tab", curTab);
    console.log("tab.id", curTab.id);
    AccountInfo = {};
    chrome.tabs.sendMessage(curTab.id, { action: "getSource" }, function (response) {
        console.log(response);
        let content = response.content;
        if (content == null) {
            console.log("Failed to get the html content of the current page, you can check whether the current page has been loaded.")
            return;
        }
        if (curTab.url.indexOf("/posts/") != -1) {
            FindPageId(content)
        } else {
            FindAccountInfo(content);
        }
        let idEle = document.getElementById("account-id")
        let typeEle = document.getElementById("account-type")
        idEle.innerHTML = AccountInfo.uid;
        typeEle.innerText = AccountInfo.type;
    });
});

/**
 * parse facebook post id
 * @param {html.content} content 
 */
function FindPageId(content) {
    const regex = /share_fbid":"(\d+)"/;
    let rets = regex.exec(content);
    if (rets.length == 0) {
        AccountInfo.uid = "Need to visit the account post address"
        AccountInfo.type = "/ You can try to refresh /"
    } else {
        AccountInfo.uid = "Post Id: " + rets[1];
        AccountInfo.type = "Type: Post";
    }
}

/**
 * parse facebook home page html
 * @param {hmtl.content} content 
 */
function FindAccountInfo(content) {
    console.log("Start matching account info.")
    if (content.indexOf("/members/") != -1) {
        ParseGroupInfo(content)
    } else if (content.indexOf("__isCanRenderCIXScreen") != -1 && content.indexOf(`delegate_page":{"id"`) != -1) {
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

    const regex = /id\":\"(\d+)\",\"delegate_page_id\":\"(\d+)\"/gm;
    let ids;
    while ((ids = regex.exec(content)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (ids.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        ids.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
        });
        AccountInfo.uid = "User Id: " + ids[1] + "<br>" + "Page Id: " + ids[2];
        AccountInfo.type = "Type: User / Page (Merge Account)";
        return;
    }
    // 
    const userRegex = /"(\d+)"},"__isCanRenderCIXScreen/gm;
    let userMatch = userRegex.exec(content);
    if (userMatch.length == 0) {
        AccountInfo.uid = "Unknown";
        AccountInfo.type = "Recognition Error";
        return;
    }
    let userId = userMatch[1];
    console.log("userId", userId);
    const pageRegex = /delegate_page":{"id":"(\d+)"/gm;
    let pageMatch = pageRegex.exec(content);
    let pageId = pageMatch[1];
    console.log("pageId", pageId);
    AccountInfo.uid = "User Id: " + userId + "<br>" + "Page Id: " + pageId;
    AccountInfo.type = "Type: User / Page (Merge Account)";
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
    let rex = new RegExp(regx)
    let match = rex.exec(content)
    return match
}