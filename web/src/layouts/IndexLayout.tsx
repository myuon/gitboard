import { css } from "@emotion/react";
import { Link, Outlet } from "react-router-dom";
import { useTokenRefresher } from "../api/auth";

export const IndexLayout = () => {
  useTokenRefresher();

  return (
    <div
      css={css`
        display: grid;
        gap: 16px;
      `}
    >
      <nav>
        <ul
          css={css`
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            list-style: none;
          `}
        >
          <li>
            <Link to="/">INDEX</Link>
          </li>
          <li>
            <Link to="/import">IMPORT</Link>
          </li>
          <li>
            <Link to="/login">LOGIN</Link>
          </li>
        </ul>
      </nav>
      <main
        css={css`
          margin-bottom: 80px;
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};
