import { graphql } from "@octokit/graphql";
import {
  GetPullRequestsDocument,
  GetPullRequestsQuery,
  GetPullRequestsQueryVariables,
} from "../generated/client";

export const getPullRequests = (
  token: string | undefined,
  owner: string,
  repositoryName: string,
  baseRefName: string,
  after: string | null
) => {
  return graphql<GetPullRequestsQuery>(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    GetPullRequestsDocument.loc!.source.body,
    {
      owner,
      name: repositoryName,
      baseRefName,
      after,
      headers: {
        authorization: `token ${token}`,
      },
    } as GetPullRequestsQueryVariables
  );
};
