import styled from "styled-components";

const Tooltip = styled.div`
  z-index: 10;
  position: absolute;
  top: 20px;
  left: 50%;

  width: 600px;

  padding: 10px;
  background: #f3f3f3;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
`;

export default Tooltip;
