// Called everytime SearchEvent changes 
import { SearchEvent } from "./types";
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'SearchEventChange') {
        chrome.storage.local.get('SearchEvent', (result) => {
            const storedSearchEvent = result['SearchEvent'];
            const newSearchEvent: SearchEvent | null = storedSearchEvent ? JSON.parse(storedSearchEvent) : null;
            if (newSearchEvent) {
                console.log(newSearchEvent.context.eventType);
            }
});
}
});  