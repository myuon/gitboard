import useSWR from "swr";
import { getAuthToken } from "./firebase";

export const useSearchPullRequest = (input: {
  createdAtSpan: { start: string; end: string };
}) => {
  return useSWR("/api/pullRequest/search", async (url) => {
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
