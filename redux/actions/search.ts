export const saveApprovalListnew = (approval:any) => (dispatch:any) => {
  dispatch({
    type: "SAVE_APPROVALLISTNEW",
    payload: approval,
  });
};
