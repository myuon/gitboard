import { css } from "@emotion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthToken } from "../api/auth";
import { useRepository } from "../api/repository";
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
          IMPORT ALL
        </button>
      </div>
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
                const resp = await fetch(`/api/import/pullRequest/${repo.id}`, {
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
    </div>
  );
};
