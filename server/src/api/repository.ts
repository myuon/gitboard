import { graphql } from "@octokit/graphql";
import {
  GetRepositoriesDocument,
  GetRepositoriesQuery,
  GetRepositoriesQueryVariables,
} from "../generated/client";

export const getRepositories = (token: string | undefined, owner: string) => {
  return graphql<GetRepositoriesQuery>(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    GetRepositoriesDocument.loc!.source.body,
    {
      login: owner,
      headers: {
        authorization: `token ${token}`,
      },
    } as GetRepositoriesQueryVariables
  );
};
