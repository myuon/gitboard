export interface SearchPullRequestInput {
  createdBy?: string;
  createdAtSpan: {
    start: string;
    end: string;
  };
}
