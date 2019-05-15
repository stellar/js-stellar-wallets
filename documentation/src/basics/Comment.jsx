import styled from "styled-components";

const Comment = styled.div`
  max-width: 800px;
  margin-bottom: 10px;
  padding: 20px;
  background: white;
  margin-top: 30px;

  pre,
  code {
    background: #eee;
    color: #111;
  }

  pre {
    white-space: pre-wrap;
    padding: 20px;
  }
`;

export default Comment;
