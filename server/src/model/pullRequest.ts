export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdBy: string;
  closedAt?: string;
}
