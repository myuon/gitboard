import { css } from "@emotion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthToken } from "../api/auth";
import { useRepository } from "../api/repository";

const useTaskQueue = (options_: { semaphoreSize: number }) => {
  const [state, setState] = useState<boolean[]>([]);
  const [taskQueue, setTaskQueue] = useState<number[]>([]);
  const [semaphore, setSemaphore] = useState(0);
  const isRunning = taskQueue.length > 0;
  const promise = useRef<(index: number) => Promise<void>>();
  const options = useRef(options_);

  const runQueue = useCallback(async () => {
    if (taskQueue.length === 0) {
      return;
    }
    if (semaphore >= options.current.semaphoreSize) {
      return;
    }

    const [task, ...rest] = taskQueue;
    setTaskQueue(rest);
    setSemaphore((p) => p + 1);
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
    setSemaphore((p) => p - 1);
  }, [promise, semaphore, taskQueue]);

  useEffect(() => {
    if (isRunning) {
      runQueue();
    }
  }, [isRunning, runQueue]);

  return {
    start: (tasks: boolean[], do_: (index: number) => Promise<void>) => {
      setState(tasks);
      setTaskQueue(tasks.map((_, i) => i));
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
