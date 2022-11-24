import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { hoursMins } from "../../../shared/helper/time";
import {
  PullRequest,
  summaryOfActivity,
} from "../../../shared/model/pullRequest";
import { useAuthGuard } from "../api/auth";
import { useSearchPullRequest } from "../api/pullRequest";
import { useSchedule as useLastSchedule } from "../api/schedule";

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
        if (!(pr.createdBy in acc)) {
          acc[pr.createdBy] = [];
        }

        acc[pr.createdBy].push(pr);
        return acc;
      }, {} as Record<string, PullRequest[]>),
    [prs]
  );
  const prAuthorSummary = useMemo(() => {
    if (!prByCreatedBy) {
      return undefined;
    }

    const result = Object.entries(prByCreatedBy).map(([name, prs]) => {
      return {
        name,
        prs,
        summary: summaryOfActivity(prs),
      };
    });
    result.sort((a, b) => (a.name > b.name ? 1 : -1));

    return result;
  }, [prByCreatedBy]);
  const sortByCount = useMemo(
    () =>
      [...(prAuthorSummary ?? [])]?.sort(
        (a, b) => (b.summary?.count ?? 0) - (a.summary?.count ?? 0)
      ),
    [prAuthorSummary]
  );
  const sortByLeadTime = useMemo(
    () =>
      [...(prAuthorSummary ?? [])]?.sort(
        (a, b) =>
          (a.summary?.leadTimeMedian ?? 0) - (b.summary?.leadTimeMedian ?? 0)
      ),
    [prAuthorSummary]
  );

  const { data: lastSchedule } = useLastSchedule();

  return (
    <div
      css={css`
        display: grid;
        gap: 24px;
      `}
    >
      <h1>GitBoard</h1>

      <p>
        {lastSchedule
          ? `Last synced at ${dayjs
              .unix(lastSchedule.createdAt)
              .add(9, "hour")
              .format("YYYY/MM/DD HH:mm:ss")}`
          : "No data"}
      </p>

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
            {prAuthorSummary?.map((item) => {
              return (
                <tr key={item.name}>
                  <td>
                    <Link
                      to={`/user/${item.name}`}
                      css={css`
                        font-weight: bold;
                      `}
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td>
                    {item.summary.count}
                    <span
                      css={css`
                        margin-left: 4px;
                      `}
                    >
                      {item.name === sortByCount[0].name
                        ? "🥇"
                        : item.name === sortByCount[1].name
                        ? "🥈"
                        : item.name === sortByCount[2].name
                        ? "🥉"
                        : ""}
                    </span>
                  </td>
                  <td>
                    {hoursMins(item.summary.leadTimeMedian)}
                    <span
                      css={css`
                        margin-left: 4px;
                      `}
                    >
                      {item.name === sortByLeadTime[0].name
                        ? "🥇"
                        : item.name === sortByLeadTime[1].name
                        ? "🥈"
                        : item.name === sortByLeadTime[2].name
                        ? "🥉"
                        : ""}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};
