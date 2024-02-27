import * as Types from './types';

  // Store navigation type in local storage
  async function storeNavigationType(type: Types.NavigationPath) {
    localStorage.setItem('navigationType', JSON.stringify(type));
  }

  // Store the target paper in local storage
  async function storeTargetPaper(){
  let title = null;
  let authors: string[] = [];
  const titleElement = document.querySelector('h3.gs_rt a');
  if (titleElement?.textContent) {
    title = titleElement.textContent.trim();
  }

  const authorsDiv = document.querySelector('div.gs_a');
  if (authorsDiv?.textContent) {
    const authorsText = authorsDiv.textContent.trim();
    const nbspIndex = authorsText.indexOf('&nbsp;');
    let authorsSubstring = authorsText.substring(0, nbspIndex);
    authors = authorsSubstring.split(',');
    authors = authors.map(author => author.trim());
  }

  if (title && authors.length > 0) {
    const targetPaper: Types.PaperEntry = {
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

document.addEventListener('click', function(event) {
  storeTargetPaper();
  let clickedElement = event.target as HTMLElement;

  // author detail search
  const closestAuthorElement = clickedElement.closest('.gs_a a');

  // author profile search 
  const closestProfileElement = clickedElement.closest('.gs_rt2');
  const closestProfileElement2 = clickedElement.closest('.gs_ai_name');

  // Find the closest parent container with class
  const closestContainer = clickedElement.closest('.gs_fl.gs_flb');

  // Pagination for Search Result
  const paginationElement = clickedElement.closest('.gs_nml a');

  // Pagination for Author profile
  const authorProfileShowMore = clickedElement.closest('.gsc_bpf_more');

  let citedByAnchor = null;
  let relatedArticleAnchor = null;
  if (closestContainer) {
      citedByAnchor = closestContainer.querySelector('a[href^="/scholar?cites="]');
      if (citedByAnchor) {
          event.preventDefault();
          event.stopPropagation(); 
          alert('Fetching cited by');
          navigateToUrl((citedByAnchor as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.CitedBy);
      }
  
      relatedArticleAnchor = closestContainer.querySelector('a[href^="/scholar?q=related:"]');
      if (relatedArticleAnchor) {
          event.preventDefault();
          event.stopPropagation(); // Stop event propagation for related articles link
          alert('Fetching related article');
          navigateToUrl((relatedArticleAnchor as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.Related);
      }
  }
  
  // Author detail search
  if (closestAuthorElement && (closestAuthorElement as HTMLAnchorElement).getAttribute('href')) {
    event.preventDefault();
    alert('Fetching author detail');
    navigateToUrl((closestAuthorElement as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.AuthorDetail);
  }

  // Pagination for Search Result
  if (paginationElement && (paginationElement as HTMLAnchorElement).getAttribute('href')) {
    event.preventDefault();
    alert('Fetching next page');
    navigateToUrl((paginationElement as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.KeywordSearch);
  }

  if (authorProfileShowMore) {
    alert('Fetching more of author profile');
    //TODO
  }

  // author click from author profile
  if (closestProfileElement || closestProfileElement2) {
    event.preventDefault();
    alert('Fetching author profile');
    navigateToUrl((closestProfileElement as HTMLAnchorElement).getAttribute('href') || '', Types.NavigationPath.AuthorProfile);
  }
});

window.addEventListener('load', () => {
  const navigationType = JSON.parse(localStorage.getItem('navigationType') || 'null');
  const targetPaper = localStorage.getItem('targetPaper');
  let SearchContext: Types.SearchContext;
  let SearchEvent: Types.SearchEvent;

  if (navigationType && targetPaper) {
    switch (navigationType) {
      case Types.NavigationPath.KeywordSearch:
        // Handle keyword search navigation
        break;
      case Types.NavigationPath.AuthorDetail:
        SearchContext = {
          eventType: "author-detail",
          targetPaper: JSON.parse(targetPaper),
          authorName: '',
          pagination: 1
        };
        break;
      case Types.NavigationPath.AuthorProfile:
        // Handle author profile navigation
        break;
      case Types.NavigationPath.CitedBy:
        alert("Cited by")
        SearchContext = {
          eventType: "cited-by",
          targetPaper: JSON.parse(targetPaper),
          pagination: 1
        };
        SearchEvent = {
          context: SearchContext,
          result: {
            paperEntries: crawlPapers()
          }
        };
        alert(SearchEvent.result.paperEntries[0].title);
        break;
      case Types.NavigationPath.Related:
        SearchContext = {
          eventType: "related-article",
          targetPaper: JSON.parse(targetPaper),
          pagination: 1
        };
        SearchEvent = {
          context: SearchContext,
          result: {
            paperEntries: crawlPapers()
          }
        };
        console.log(SearchEvent);
        break;
      default:
        break;
    }
  }
});

window.addEventListener('beforeunload', function(event) {
  reset();
});

function reset() {
  localStorage.removeItem('navigationType');
  localStorage.removeItem('targetPaper');
}

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
    }
  });
  return papers;
}

