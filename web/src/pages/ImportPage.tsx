import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthToken, useAuthToken } from "../api/auth";
import { useRepository } from "../api/repository";
import { useOwnerRelation } from "../api/userOwnerRelation";
import { sleep } from "../helper/sleep";

const useTaskQueue = (options_: { semaphoreSize: number }) => {
  const [state, setState] = useState<boolean[]>([]);
  const [taskQueue, setTaskQueue] = useState<{
    queue: number[];
    semaphore: number;
  }>({
    queue: [],
    semaphore: 0,
  });
  const isRunning = taskQueue.queue.length > 0;
  const promise = useRef<(index: number) => Promise<void>>();
  const options = useRef(options_);

  const runQueue = useCallback(async () => {
    if (taskQueue.queue.length === 0) {
      return;
    }
    if (taskQueue.semaphore >= options.current.semaphoreSize) {
      return;
    }

    const [task, ...rest] = taskQueue.queue;
    setTaskQueue((prev) => {
      return {
        queue: rest,
        semaphore: prev.semaphore + 1,
      };
    });
    setState((prev) => {
      const current = [...prev];
      current[task] = false;
      return current;
    });

    await promise.current?.(task);

    setState((πrev) => {
      const current = [...πrev];
      current[task] = true;
      return current;
    });
    setTaskQueue((prev) => {
      return {
        queue: prev.queue,
        semaphore: prev.semaphore - 1,
      };
    });
  }, [taskQueue]);

  useEffect(() => {
    if (isRunning) {
      runQueue();
    }
  }, [isRunning, runQueue]);

  return {
    start: (tasks: boolean[], do_: (index: number) => Promise<void>) => {
      setState(tasks);
      setTaskQueue({
        queue: tasks.map((_, i) => i),
        semaphore: 0,
      });
      promise.current = do_;
    },
    state,
  };
};

export const ImportPage = () => {
  const { data: repos } = useRepository();
  const { start, state } = useTaskQueue({ semaphoreSize: 3 });

  const { data: relations, mutate: mutateRelations } = useOwnerRelation();
  const { data: token } = useAuthToken();

  return (
    <div
      css={css`
        display: grid;
        gap: 32px;
      `}
    >
      <h2>Import</h2>

      <div>
        <button
          onClick={async () => {
            const resp = await fetch("/api/import/repository", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await getAuthToken()}`,
              },
            });
            if (!resp.ok) {
              console.error("Failed to import repository");
            }
          }}
        >
          IMPORT REPOSITORY
        </button>
      </div>
      <div>
        <button
          onClick={async () => {
            if (!repos) {
              return;
            }
            start(repos.map(() => false) ?? [], async (index: number) => {
              const resp = await fetch(
                `/api/import/pullRequest/${repos[index].id}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await getAuthToken()}`,
                  },
                }
              );
              if (!resp.ok) {
                console.error(index, repos[index], await resp.text());
              }

              await sleep(1000);
            });
          }}
        >
          IMPORT PULL REQUEST
        </button>
      </div>
      <details>
        <summary>Repository</summary>
        <div
          css={css`
            display: grid;
            gap: 16px;
          `}
        >
          {repos?.map((repo, index) => (
            <div key={repo.id}>
              <button
                onClick={async () => {
                  const resp = await fetch(
                    `/api/import/pullRequest/${repo.id}`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getAuthToken()}`,
                      },
                    }
                  );
                  if (!resp.ok) {
                    console.error("Failed to import repository");
                  }
                }}
              >
                IMPORT {repo.name}{" "}
                {state[index] === true
                  ? "✅"
                  : state[index] === false
                  ? "⏳"
                  : null}
              </button>
            </div>
          ))}
        </div>
      </details>

      <h2>User Owner Relation</h2>

      <div>
        {relations?.map((relation) => (
          <div key={`${relation.owner}-${relation.userId}`}>
            <span
              css={css`
                font-weight: 600;
              `}
            >
              {relation.owner}
            </span>{" "}
            - {relation.userId} @{" "}
            {dayjs.unix(relation.createdAt).format("YYYY-MM-DD HH:mm:ss")}
            <button
              css={css`
                margin-left: 16px;
              `}
              onClick={async () => {
                await fetch("/api/admin/userOwnerRelation/delete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    owner: relation.owner,
                    userId: relation.userId,
                  }),
                });

                mutateRelations();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <form
        css={css`
          display: grid;
          gap: 8px;
        `}
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);

          await fetch("/api/admin/userOwnerRelation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              owner: formData.get("owner") as string,
              userId: formData.get("userId") as string,
            }),
          });

          mutateRelations();
        }}
      >
        <label>
          owner name:
          <input
            name="owner"
            type="text"
            css={css`
              margin-left: 8px;
              border: 1px solid #aaa;
            `}
          />
        </label>
        <label>
          user id:
          <input
            name="userId"
            type="text"
            css={css`
              margin-left: 8px;
              border: 1px solid #aaa;
            `}
          />
        </label>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
