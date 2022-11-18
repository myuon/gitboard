import useSWR from "swr";
import { PullRequest } from "../../../shared/model/pullRequest";
import {
  SearchPullRequestInput,
  SearchPullRequestLeadTimeInput,
} from "../../../shared/request/pullRequest";
import { useAuthToken } from "./auth";

export const useSearchPullRequest = (input: SearchPullRequestInput) => {
  const { data: token } = useAuthToken();

  return useSWR<PullRequest[]>(
    token ? [token, "/api/pullRequest/search", input] : null,
    async () => {
      const resp = await fetch("/api/pullRequest/search", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
        method: "POST",
      });
      if (resp.ok) {
        return resp.json();
      }
    }
  );
};

export const useSearchPullRequestLeadTime = (
  input: SearchPullRequestLeadTimeInput
) => {
  const { data: token } = useAuthToken();

  return useSWR<{ id: string; closedAt?: string; firstCommitDate: string }[]>(
    token ? [token, "/api/pullRequest/leadTime/search", input] : null,
    async () => {
      const resp = await fetch("/api/pullRequest/leadTime/search", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
        method: "POST",
      });
      if (resp.ok) {
        return resp.json();
      }
    }
  );
};
