export interface SearchPullRequestInput {
  createdBy?: string;
  createdAtSpan: {
    start: string;
    end: string;
  };
}

export interface SearchPullRequestLeadTimeInput {
  ids?: string[];
}
