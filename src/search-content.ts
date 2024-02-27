import * as Types from './types';
// For initial keyword search

const navigationType: Types.NavigationPath = Types.NavigationPath.KeywordSearch;
let searchResult: Types.SearchResult;
let searchContext: Types.SearchContext;
let searchEvent: Types.SearchEvent;

  // Store navigation type in local storage
  async function storeNavigationType(type: Types.NavigationPath) {
    localStorage.setItem('navigationType', JSON.stringify(type));
  }

  async function storeTargetPaper(containerElement: HTMLElement) {
    let title = null;
    let authors: string[] = [];

    // Find title element within the container element
    const titleElement = containerElement.querySelector('h3.gs_rt a');
    if (titleElement?.textContent) {
        title = titleElement.textContent.trim();
    }

    // Find authors element within the container element
    const authorsDiv = containerElement.querySelector('div.gs_a');
    if (authorsDiv?.textContent) {
      const text = authorsDiv.textContent.trim();
      const authorPattern = /^(.*?)(?:\s*-\s*.*)?(\.{3})?$/;
      //@ts-ignore
      const authorPart = authorPattern.exec(text)[1];
      authors = authorPart.split(',').map(author => {
        return author.trim().replace(/[^\w\s]*$/, '');
    });
    };

    // If title and authors are found, store the target paper in local storage
    if (title && authors.length > 0) {
        const targetPaper = {
            title: title,
            authorNames: authors
        };
        localStorage.setItem('targetPaper', JSON.stringify(targetPaper));
    }
}

// Set the navigation type before triggering the navigation
function navigateToUrl(url: string, navigation: Types.NavigationPath) {
  storeNavigationType(navigation);
  window.location.href = url;
}

// click for navigation to detail-content
document.addEventListener('click', function(event) {
    let clickedElement = event.target as HTMLElement;
    const paperContainer = clickedElement.closest('.gs_r.gs_or.gs_scl');
  
    // author detail search
    const closestAuthorElement = clickedElement.closest('.gs_a a');
  
    // author profile search 
    const closestProfileElement = clickedElement.closest('.gs_rt2');
  
    // Find the closest parent container with class
    const closestContainer = clickedElement.closest('.gs_fl.gs_flb');

    let citedByAnchor = null;
    let relatedArticleAnchor = null;
    if (closestContainer) {
        const anchorTags = closestContainer.querySelectorAll('a');
        if (anchorTags.length >= 4) {
            citedByAnchor = anchorTags[2];
            relatedArticleAnchor = anchorTags[3];
        }

        if (citedByAnchor === clickedElement) {
            event.preventDefault();
            event.stopPropagation(); 
            storeTargetPaper(paperContainer as HTMLElement);
            navigateToUrl((citedByAnchor as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.CitedBy);
        }

        if (relatedArticleAnchor === clickedElement) {
            event.preventDefault();
            event.stopPropagation(); 
            storeTargetPaper(paperContainer as HTMLElement);
            navigateToUrl((relatedArticleAnchor as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.Related);
        }
    }
    
    // Author detail search
    if (closestAuthorElement && (closestAuthorElement as HTMLAnchorElement).getAttribute('href')) {
        event.preventDefault();
        storeTargetPaper(paperContainer as HTMLElement);
        navigateToUrl((closestAuthorElement as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.AuthorDetail);
    }
  
    // author click from author profile
    if (closestProfileElement) {
        event.preventDefault();
        const authorLink = closestProfileElement.querySelector('a');
        if (authorLink) {
            navigateToUrl(authorLink.getAttribute('href') || '', Types.NavigationPath.AuthorProfile);
        }
    }
});

  window.addEventListener('load', () => {
    const currentUrl = new URL(window.location.href);
    let query = currentUrl.searchParams.get("q");
    let page;

    if (query) {
        let startParam = currentUrl.searchParams.get("start");
        if (startParam) {
            page = Math.floor(parseInt(startParam) / 10) + 1;
        } else {
            page = 1;
        }
        searchContext = {
            eventType: "keyword-search",
            searchKeyword: query || "",
            pagination: page || 1
        };
    }
    crawlPapers();
});

function crawlPapers() {
  const papers: Types.PaperEntry[] = [];
  const paperElements = document.querySelectorAll('.gs_r.gs_or.gs_scl');
  paperElements.forEach(paperElement => {
    let title = null;
    let authors: string[] = [];
    const titleElement = paperElement.querySelector('h3.gs_rt a');
    if (titleElement?.textContent) {
      title = titleElement.textContent.trim();
    }

    const authorsDiv = paperElement.querySelector('div.gs_a');
    if (authorsDiv?.textContent) {
      const text = authorsDiv.textContent.trim();
      const authorPattern = /^(.*?)(?:\s*-\s*.*)?(\.{3})?$/;
      //@ts-ignore
      const authorPart = authorPattern.exec(text)[1];
      authors = authorPart.split(',').map(author => {
        return author.trim().replace(/[^\w\s]*$/, '');
    });
    };

    if (title && authors.length > 0) {
      const paper: Types.PaperEntry = {
        title: title,
        authorNames: authors
      };
      papers.push(paper);
    }
  });
  const newSearchResult = {paperEntries: papers};
  updateSearchEvent(searchContext, newSearchResult);
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
      //Response from background script
  });
}