import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useSearchPullRequest } from "../api/pullRequest";

export const IndexPage = () => {
  const { data: prs } = useSearchPullRequest({
    createdAtSpan: {
      start: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
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
      <h1>GitBoard</h1>

      <h2>This Month</h2>

      <div
        css={css`
          display: grid;
          gap: 8px;
        `}
      >
        {prs?.map((pr) => (
          <div key={pr.id}>
            #{pr.number} {pr.title}
          </div>
        ))}
      </div>
    </div>
  );
};
