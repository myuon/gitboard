import { css } from "@emotion/react";
import { getAuthToken } from "../api/firebase";

export const ImportPage = () => {
  return (
    <div
      css={css`
        display: grid;
        gap: 32px;
      `}
    >
      <h2>Import</h2>

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
  );
};
