export interface PullRequest {
  id: string;
  owner: string;
  repositoryId: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdBy: string;
  closedAt: string;
  createdAt: string;
  updatedAt: string;
}
