import styled from "styled-components";

export const TagItem: any = styled.div`
  position: relative;
  border-radius: 20px;
  border: 1px solid #dc3545;
  background-color: ${(props: any) => props.selected ? '#dc3545' : 'white'};
  color: ${(props: any) => props.selected ? 'white' : '#dc3545'};
  padding: 3px 10px;
  margin-right: 10px;
  cursor: pointer;
  transition: all .3s ease;
  
  &:hover {
    background-color: #ffe1e4;
  }
`

export const TagContainer: any = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  overflow: scroll;
  width: 100%;
  padding-bottom: 15px;

  .actions-tag-wrapper {
    position: absolute;
    right: 0;
    top: 0;
    background: white;
    padding: 10px;
    display: flex;
    align-items: center;
    
    justify-content: center;
    font-size: 18px;
    z-index: 9;
  }
`;

export const TagNameInput = styled.input`
  width: 100%;
  border: unset;
  border-bottom: 1px solid #c1c1c1;
  border-radius: 0;
  font-size: 18px;
  &:focus {
    outline: unset;
  }
`

