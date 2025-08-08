export const update_firebaseUserUid =
  (firebase_uid: any) => (dispatch: any) => {
    dispatch({
      type: "UPDATE_FIREBASEUSERUID",
      payload: firebase_uid,
    });
  };

export const titulo_proyecto = (item: any) => (dispatch: any) => {
  dispatch({
    type: "TITULO_PROYECTO",
    payload: item,
  });
};
