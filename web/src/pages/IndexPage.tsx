import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PullRequest } from "../../../shared/model/pullRequest";
import { useAuthGuard } from "../api/auth";
import { useSearchPullRequest } from "../api/pullRequest";

export const IndexPage = () => {
  useAuthGuard();

  const { data: prs } = useSearchPullRequest({
    createdAtSpan: {
      start: dayjs().subtract(1, "week").format("YYYY-MM-DD"),
      end: dayjs().format("YYYY-MM-DD"),
    },
  });

  const prByCreatedBy = useMemo(
    () =>
      prs?.reduce((acc, pr) => {
        if (!acc[pr.createdBy]) {
          acc[pr.createdBy] = [];
        }

        acc[pr.createdBy].push(pr);
        return acc;
      }, {} as Record<string, PullRequest[]>),
    [prs]
  );

  return (
    <div
      css={css`
        display: grid;
        gap: 24px;
      `}
    >
      <h1>GitBoard</h1>

      <section
        css={css`
          display: grid;
          gap: 16px;
        `}
      >
        <h2>This Week</h2>

        <div
          css={css`
            display: grid;
            gap: 8px;
          `}
        >
          {Object.entries(prByCreatedBy ?? {})
            .sort((a, b) => b[1].length - a[1].length)
            .map(([createdBy, prs]) => (
              <div
                key={createdBy}
                css={css`
                  display: grid;
                  gap: 8px;
                `}
              >
                <Link
                  to={`/user/${createdBy}`}
                  css={css`
                    font-weight: bold;
                  `}
                >
                  {createdBy} ({prs.length})
                </Link>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};
