/*chrome.webNavigation.onCommitted.addListener(
    (details) => {
        if (details.url.includes("https://scholar.google/scholar")) {
            let url = new URL(details.url);
            let query = url.searchParams.get("q");

            let scriptToInject;
            if (query) {
                if (query.startsWith("related")) {
                    scriptToInject = "detail_content.js";
                } else {
                    scriptToInject = "search_content.js";
                }
            }
            chrome.tabs.executeScript(details.tabId, { file: scriptToInject });
        }
    },
    { url: [
        { hostEquals: "scholar.google.com" },
        { hostEquals: "scholar.google.co.kr" }
    ]}
);*/