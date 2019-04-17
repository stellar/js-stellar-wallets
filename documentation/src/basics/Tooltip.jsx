import styled from "styled-components";

const Tooltip = styled.div`
  z-index: 10;
  position: absolute;
  top: 20px;
  left: 50%;

  padding: 10px;
  background: white;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
`;

export default Tooltip;
