import * as Types from './types';

let navigationType: Types.NavigationPath;
let targetPaper: Types.PaperEntry;
let searchContext: Types.SearchContext;

window.addEventListener('load', () => {
    navigationType = JSON.parse(localStorage.getItem('navigationType') || 'null');
    const authorName = document.getElementById('gsc_prf_in')?.textContent?.trim();
    if (navigationType === Types.NavigationPath.AuthorDetail) {
        targetPaper = JSON.parse(localStorage.getItem('targetPaper') || "");
        searchContext = {
            eventType: "author-detail",
            targetPaper: targetPaper,
            authorName: authorName ?? "",
            pagination: 1
        };
    }

    if (navigationType === Types.NavigationPath.AuthorProfile) {
        searchContext = {
            eventType: "author-profile",
            authorName: authorName ?? "",
            pagination: 1
        };
    }
    crawlPapers();
});

// Pagination
const authorProfileShowMore = document.getElementById('gsc_bpf_more');
if (authorProfileShowMore) {
    authorProfileShowMore.addEventListener('click', function() {
        setTimeout(crawlPapers, 1500); 
    });
}

document.addEventListener('click', function(event) {
    let clickedElement = event.target as HTMLElement;
    const closestAuthorElement = clickedElement.closest('.gs_ai_name a');
    if (closestAuthorElement && (closestAuthorElement as HTMLAnchorElement).getAttribute('href')) {
        event.preventDefault();
        navigateToUrl((closestAuthorElement as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.AuthorProfile);
    }
});

function navigateToUrl(url: string, navigation: Types.NavigationPath) {
    storeNavigationType(navigation);
    window.location.href = url;
  }


async function storeNavigationType(type: Types.NavigationPath) {
    localStorage.setItem('navigationType', JSON.stringify(type));
  }

function crawlPapers() {
    const paperEntries: Types.PaperEntry[] = [];
    const tableBody = document.getElementById('gsc_a_b');
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr.gsc_a_tr');
        rows.forEach(row => {
            const titleLink = row.querySelector('td.gsc_a_t a');

            //@ts-ignore
            const paperTitle = titleLink.textContent.trim();

            const authorsDiv = row.querySelector('td.gsc_a_t div.gs_gray');
            //@ts-ignore
            const authorString = authorsDiv.textContent.trim().replace(/\.{3}\s*$/, '');
            const authors = authorString.split(',');
            const trimmedAuthors = authors.map(author => author.trim());
            const paperEntry = {
                title: paperTitle,
                authorNames: trimmedAuthors
            };
            paperEntries.push(paperEntry);
        });
        const newSearchResult = {paperEntries: paperEntries};
        updateSearchEvent(searchContext, newSearchResult);
    }
}

function updateSearchEvent(context: Types.SearchContext, result: Types.SearchResult) {
    const newSearchEvent: Types.SearchEvent = {
        context: context,
        result: result,
    };
  
    console.log(newSearchEvent);
    chrome.storage.local.set({SearchEvent: JSON.stringify(newSearchEvent)});
    sendMessageToBackgroundScript(newSearchEvent);
  }
  
function sendMessageToBackgroundScript(event: Types.SearchEvent) {
    chrome.runtime.sendMessage({type: 'SearchEventChange', event: event}, response => {
        //Response from background
    });
}
