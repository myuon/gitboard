import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PullRequest,
  summaryOfActivity,
} from "../../../shared/model/pullRequest";
import { useAuthGuard } from "../api/auth";
import { useSearchPullRequest } from "../api/pullRequest";

export const IndexPage = () => {
  useAuthGuard();

  const span = {
    start: dayjs().subtract(1, "week").format("YYYY-MM-DD"),
    end: dayjs().format("YYYY-MM-DD"),
  };
  const { data: prs } = useSearchPullRequest({
    createdAtSpan: span,
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
        <h2>
          This Week ({span.start} - {span.end})
        </h2>

        <table
          css={css`
            th,
            td {
              padding: 8px 8px;
            }

            th,
            tr:nth-of-type(even) {
              background-color: #f1f3f5;
            }
          `}
        >
          <thead>
            <tr
              css={css`
                display: contents;
                font-weight: 600;
                text-align: left;
              `}
            >
              <th>Member</th>
              <th># of PR</th>
              <th>Lead Time</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(prByCreatedBy ?? {})
              .sort((a, b) => (a[0] > b[0] ? 1 : -1))
              .map(([createdBy, prs]) => {
                const summary = summaryOfActivity(prs);

                return (
                  <tr key={createdBy}>
                    <td>
                      <Link
                        to={`/user/${createdBy}`}
                        css={css`
                          font-weight: bold;
                        `}
                      >
                        {createdBy}
                      </Link>
                    </td>
                    <td>{summary.count}</td>
                    <td>{summary.leadTimeMedian.toFixed(2)} hrs</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    </div>
  );
};
