import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { xonokai as theme } from "react-syntax-highlighter/dist/styles/prism";

const El = styled.div`
  max-width: 800px;
  margin-bottom: 10px;
  padding: 20px;
  background: white;
  margin-top: 30px;

  code {
    background: #eee;
    color: #111;
  }
`;

const CodeBlock = ({ language, value }) => (
  <SyntaxHighlighter language={language} style={theme}>
    {value}
  </SyntaxHighlighter>
);

const Comment = ({ shortText, text }) => (
  <El>
    <ReactMarkdown source={shortText} renderers={{ code: CodeBlock }} />
    <ReactMarkdown source={text} renderers={{ code: CodeBlock }} />
  </El>
);

export default Comment;
