import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { xonokai as theme } from "react-syntax-highlighter/dist/styles/prism";

const CodeBlock = ({ language, value }) => (
  <SyntaxHighlighter language={language} style={theme}>
    {value}
  </SyntaxHighlighter>
);

const Markdown = ({ children }) => (
  <ReactMarkdown source={children} renderers={{ code: CodeBlock }} />
);

export default Markdown;
