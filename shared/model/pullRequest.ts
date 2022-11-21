import { median } from "../helper/array";
import { hoursMins } from "../helper/time";

export interface PullRequest {
  id: string;
  owner: string;
  repositoryId: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdBy: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  leadTimeSec?: number;
}

export const summaryOfActivity = (prs: PullRequest[]) => {
  return {
    count: prs.length,
    leadTimeMedian: median(
      prs
        .filter((p) => p.state === "MERGED")
        .map((p) => p.leadTimeSec) as number[]
    ),
  };
};
