import styled from "styled-components";

const Comment = styled.div`
  max-width: 600px;
  margin-bottom: 10px;
  padding: 20px;
  background: white;

  &:not(:first-child) {
    margin-top: 30px;
  }
`;

export default Comment;
