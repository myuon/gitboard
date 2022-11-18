import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useSearchPullRequest } from "../api/pullRequest";
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
        {prs?.map((pr) => (
          <li
            key={pr.id}
            css={css`
              display: grid;
            `}
          >
            <h3>
              #{pr.number} {pr.title}
            </h3>
            <p>{dayjs(pr.createdAt).format("YYYY-MM-DD")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
