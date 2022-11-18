import { css } from "@emotion/react";
import { getAuthToken } from "../api/auth";

export const ImportPage = () => {
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
          REPOSITORY
        </button>
      </div>
      <div>
        <button
          onClick={async () => {
            const resp = await fetch(
              "/api/import/pullRequest/MDEwOlJlcG9zaXRvcnkyMDA5OTM2NzQ=",
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
          PULL REQUESTS
        </button>
      </div>
    </div>
  );
};
