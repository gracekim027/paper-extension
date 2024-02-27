import * as Types from './types';

let navigationType: Types.NavigationPath;
let targetPaper: Types.PaperEntry;
let searchResult: Types.SearchResult;
let searchContext: Types.SearchContext;
let searchEvent: Types.SearchEvent;

//TODO: const closestProfileElement2 = clickedElement.closest('.gs_ai_name');

// Setter for searchContext
let _searchContext: Types.SearchContext;
Object.defineProperty(window, 'searchContext', {
    set: function(value) {
        _searchContext = value;
        updateSearchEvent();
    },
    get: function() {
        return _searchContext;
    }
});

// Setter for searchResult
let _searchResult: Types.SearchResult;
Object.defineProperty(window, 'searchResult', {
    set: function(value) {
        _searchResult = value;
        updateSearchEvent();
    },
    get: function() {
        return _searchResult;
    }
});

// Function to update searchEvent
function updateSearchEvent() {
    const _searchEvent: Types.SearchEvent = {
        context: _searchContext,
        result: _searchResult
    };
    console.log('SearchEvent has been updated:', _searchEvent);
    searchEvent = _searchEvent; 
}

// First load
window.addEventListener('load', () => {
    console.log("=====Author Content=====")
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
    console.log(searchContext);
    crawlPapers();
});

// Pagination
const authorProfileShowMore = document.getElementById('gsc_bpf_more');
if (authorProfileShowMore) {
    authorProfileShowMore.addEventListener('click', function() {
        setTimeout(crawlPapers, 1500); 
    });
}

// Reset on page unload
window.addEventListener('beforeunload', function(event) {
    console.log("resetting");
    reset();
});

function reset() {
    localStorage.removeItem('navigationType');
    localStorage.removeItem('targetPaper');
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

            const firstDiv = row.querySelector('td.gsc_a_t div.gs_gray');
            //@ts-ignore
            const authorsString = firstDiv.textContent.trim();
            const authors = authorsString.split(',');
            const trimmedAuthors = authors.map(author => author.trim());

            const paperEntry = {
                title: paperTitle,
                authorNames: trimmedAuthors
            };

            console.log(paperEntry);
            paperEntries.push(paperEntry);
        });
        searchResult = {paperEntries: paperEntries};
    }
}
