import React from "react";
import styled from "styled-components";

import Markdown from "./Markdown";

const El = styled.div`
  max-width: 800px;
  margin-bottom: 10px;
  padding: 20px;
  background: white;
  margin-top: 30px;
  word-break: break-word;
`;

const Comment = ({ shortText, text }) => (
  <El>
    <Markdown>{shortText}</Markdown>
    <Markdown>{text}</Markdown>
  </El>
);

export default Comment;
