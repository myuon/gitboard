import useSWR from "swr";
import { getAuthToken } from "./firebase";
import { PullRequest } from "../../../shared/model/pullRequest";
import { SearchPullRequestInput } from "../../../shared/request/pullRequest";

export const useSearchPullRequest = (input: SearchPullRequestInput) => {
  return useSWR<PullRequest[]>("/api/pullRequest/search", async (url) => {
    const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(input),
      method: "POST",
    });
    if (resp.ok) {
      return resp.json();
    }
  });
};
