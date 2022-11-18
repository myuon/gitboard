import { css } from "@emotion/react";
import { getAuthToken } from "../api/auth";
import { useRepository } from "../api/repository";

export const ImportPage = () => {
  const { data: repos } = useRepository();

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
      <div
        css={css`
          display: grid;
          gap: 16px;
        `}
      >
        {repos?.map((repo) => (
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
              IMPORT {repo.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
