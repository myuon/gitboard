import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { Repository } from "../../../shared/model/repository";
import { useSearchPullRequest } from "../api/pullRequest";
import { useSearchRepository } from "../api/repository";
import { assertIsDefined } from "../helper/assertIsDefined";

export const UserPage = () => {
  const { name } = useParams<{ name: string }>();
  assertIsDefined(name);

  const { data: prs } = useSearchPullRequest({
    createdBy: name,
    createdAtSpan: {
      start: dayjs().add(-1, "month").format("YYYY-MM-DD"),
      end: dayjs().format("YYYY-MM-DD"),
    },
  });
  const { data: repos } = useSearchRepository({
    ids: prs?.map((pr) => pr.repositoryId) ?? [],
  });
  const repositoryById = repos?.reduce((acc, repo) => {
    acc[repo.id] = repo;
    return acc;
  }, {} as Record<string, Repository>);

  return (
    <div
      css={css`
        display: grid;
        gap: 24px;
      `}
    >
      <h2>{name}</h2>

      <ul
        css={css`
          display: grid;
          gap: 16px;
          list-style: none;
        `}
      >
        {prs?.map((pr) => {
          const repo = repositoryById?.[pr.repositoryId];

          return (
            <li
              key={pr.id}
              css={css`
                display: grid;
                gap: 4px;
              `}
            >
              <h3>
                <a href={pr.url} target="_blank" rel="noreferrer">
                  #{pr.number}
                </a>{" "}
                {pr.title}
              </h3>
              <p>
                {repo?.owner}/{repo?.name}・
                {dayjs(pr.createdAt).format("YYYY-MM-DD")}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
