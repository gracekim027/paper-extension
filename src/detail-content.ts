import * as Types from './types';
// For cited, related and author detail

let navigationType: Types.NavigationPath;
let targetPaper: Types.PaperEntry;
let searchResult: Types.SearchResult;
let searchContext: Types.SearchContext;
let searchEvent: Types.SearchEvent;

  // Store navigation type in local storage
  async function storeNavigationType(type: Types.NavigationPath) {
    localStorage.setItem('navigationType', JSON.stringify(type));
  }

  // Store the target paper in local storage
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
        const authorLinks = authorsDiv.querySelectorAll('a');
        authorLinks.forEach(authorLink => {
            //너무 불규칙해서 링크 있는 사람만 author 넣는것으로 대체
            if (authorLink.textContent) authors.push(authorLink.textContent.trim());
    });
    }

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

        if (citedByAnchor) {
            storeTargetPaper(paperContainer as HTMLElement);
            event.preventDefault();
            event.stopPropagation(); 
            navigateToUrl((citedByAnchor as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.CitedBy);
        }

        if (relatedArticleAnchor) {
            storeTargetPaper(paperContainer as HTMLElement);
            event.preventDefault();
            event.stopPropagation(); 
            navigateToUrl((relatedArticleAnchor as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.Related);
        }
}
    
    // Author detail search
    if (closestAuthorElement && (closestAuthorElement as HTMLAnchorElement).getAttribute('href')) {
      event.preventDefault();
      storeTargetPaper(paperContainer as HTMLElement);
      navigateToUrl((closestAuthorElement as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.AuthorDetail);
    }
  });

window.addEventListener('load', () => {
console.log("=====Detail Content=====")
  const navigationType = JSON.parse(localStorage.getItem('navigationType') || 'null');
  const targetPaperString = localStorage.getItem('targetPaper');
  
  const currentUrl = new URL(window.location.href);
  let page;
  let startParam = currentUrl.searchParams.get("start");
  if (startParam) {
    page = Math.floor(parseInt(startParam) / 10) + 1;
} else {
    page = 1;
}

  if (navigationType === Types.NavigationPath.CitedBy) {
    if (targetPaperString) {
        const targetPaper: Types.PaperEntry = JSON.parse(targetPaperString);
        searchContext = {
            eventType: "cited-by",
            targetPaper: targetPaper,
            pagination: page
          };
    }
  }

  if (navigationType === Types.NavigationPath.Related) {
    if (targetPaperString) {
        const targetPaper: Types.PaperEntry = JSON.parse(targetPaperString);
        searchContext = {
            eventType: "related-article",
            targetPaper: targetPaper,
            pagination: page
          };
    }
  }
  console.log(searchContext);
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
      const authorsText = authorsDiv.textContent.trim();
      const nbspIndex = authorsText.indexOf('&nbsp;');
      let authorsSubstring = authorsText.substring(0, nbspIndex);
      authors = authorsSubstring.split(',');
      authors = authors.map(author => author.trim());
    }

    if (title && authors.length > 0) {
      const paper: Types.PaperEntry = {
        title: title,
        authorNames: authors
      };
      papers.push(paper);
      console.log(paper);
    }
  });
  return papers;
}