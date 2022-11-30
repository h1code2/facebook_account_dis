// Initialize button with user's preferred color
let AccountInfo = new Object();

chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
    let curTab = tabs[0];
    console.log("tab", curTab);
    console.log("tab.id", curTab.id);
    AccountInfo = {};
    //向tab发送请求
    chrome.tabs.sendMessage(curTab.id, { action: "getSource" }, function (response) {
        let content = response.content;
        if (content == null) {
            console.log("获取当前页面html内容失败，可检查当前页面是否已完成加载！")
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
 * 匹配用户信息
 */
function FindAccountInfo(content) {
    debugger;
    console.log("开始匹配账号信息!")
    if (content.indexOf("/members/") != -1) {
        ParseGroupInfo(content)
    } else if (content.indexOf("__isCanRenderCIXScreen") != -1) {
        ParseUserOrPageInfo(content)
    } else if (content.indexOf('owner":{"__typename":"Page","id":"') != -1) {
        ParsePageInfo(content)
    } else if (content.indexOf("selectedID") != -1) {
        ParseUserInfo(content)
    } else {
        console.log("未知情况，需要检查代码！")
        AccountInfo.uid = "请确定当前页面是账号主页"
        AccountInfo.type = "/ 识别失败 /"
    }

}

/**
 * 解析个人账号信息
 */
function ParseUserInfo(content) {
    let uidMatch = exp("profile_owner\":{\"id\":\"(.*?)\"", content)
    if (uidMatch != null) {
        AccountInfo.uid = "用户 ID: " + uidMatch[1];
        AccountInfo.type = "类 型: User";
    } else {
        console.log("匹配异常！")
    }
}

/**
 * 解析公共主页信息
 */
function ParsePageInfo(content) {
    // let uidMatch = exp("owner\":{\"__typename\":\"Page\",\"id\":\"(.*?)\"", content)
    let uidMatch = exp("pageID\":\"(.*?)\"", content)
    if (uidMatch != null) {
        AccountInfo.uid = "主页 ID: " + uidMatch[1];
        AccountInfo.type = "类 型: Page";
    } else {
        console.log("匹配异常！")
    }
}

/**
 * 解析个人账号或者主页信息
 */
function ParseUserOrPageInfo(content) {
    // 判断是否是合并账号
    let userMatch = exp("User\",\"id\":\"(.*?)\"},\"__isCanRenderCIXScreen\":\"Photo", content)
    let pageMatch = exp("delegate_page\":{\"id\":\"(.*?)\"", content)
    console.log(userMatch)
    console.log(pageMatch)
    if (userMatch != null && pageMatch != null) {
        // 合并账号逻辑
        AccountInfo.uid = "用户 ID: " + userMatch[1] + "<br>" + "主页 ID: " + pageMatch[1]
        AccountInfo.type = "类 型: User / Page (合并账号)"
    } else {
        // 个人账号逻辑
        ParseUserInfo(content)
    }
}

/**
 * 解析群组信息
 */
function ParseGroupInfo(content) {
    let uidMatch = exp("\"groupID\":\"(.*?)\"", content)
    if (uidMatch != null) {
        AccountInfo.uid = "群组 ID: " + uidMatch[1];
        AccountInfo.type = "类 型: Group";
    } else {
        console.log("匹配异常！")
    }
}

/**
 * 通过正则查询内容
 * @param {} regx
 * @returns
 */
function exp(regx, content) {
    let rex = new RegExp(regx, "g")
    let match = rex.exec(content)
    return match
}