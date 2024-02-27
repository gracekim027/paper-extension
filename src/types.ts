export interface SearchEvent {
    context: SearchContext;
    result: SearchResult;
}

export type SearchContext =
    | SearchContextKeywordSearch
    | SearchContextCitedBy
    | SearchContextRelatedArticle
    | SearchContextAuthorDetail
    | SearchContextAuthorProfile;

export interface SearchContextKeywordSearch {
    eventType: "keyword-search";
    searchKeyword: string;
    pagination: number;  // should be 1 for initial search
}

export interface SearchContextCitedBy {
    eventType: "cited-by";
    targetPaper: PaperEntry;
    pagination: number;  // should be 1 for initial search
}

export interface SearchContextRelatedArticle {
    eventType: "related-article";
    targetPaper: PaperEntry;
    pagination: number;  // should be 1 for initial search
}

export interface SearchContextAuthorDetail {
    eventType: "author-detail";
    targetPaper: PaperEntry;
    authorName: string;
    pagination: number;  // should be 1 for initial search
}

export interface SearchContextAuthorProfile {
    eventType: "author-profile";
    authorName: string;
    pagination: number;  // should be 1 for initial search
}

export interface SearchResult {
    paperEntries: PaperEntry[];    
}

export interface PaperEntry {
    title: string;
    authorNames: string[];
}

export enum NavigationPath {
    KeywordSearch = 'keywordSearch',
    AuthorDetail = 'authorElement',
    AuthorProfile = 'profileElement',
    CitedBy = 'citedByAnchor',
    Related = 'relatedArticleAnchor',
}