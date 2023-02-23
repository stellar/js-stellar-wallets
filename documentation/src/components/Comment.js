import React from "react";
import styled from "styled-components";

import { Markdown } from "./Markdown";

const El = styled.div`
  max-width: 800px;
  margin-bottom: 10px;
  padding: 20px;
  background: white;
  margin-top: 30px;
  word-break: break-word;
`;

export const Comment = ({ summary }) => (
  <El>
    <Markdown>
      {summary.reduce((accumulator, { text }) => accumulator + text, "")}
    </Markdown>
  </El>
);
