export const likePost = (uri: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "LIKEPOST",
      payload: uri,
    });
  } catch (error) {
    alert(error);
  }
};

export const unlikePost = (item: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "UNLIKEPOST",
      payload: item,
    });
  } catch (error) {
    alert(error);
  }
};

export const comentaryPost = (uri: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "COMENTARYPOST",
      payload: uri,
    });
  } catch (error) {
    alert(error);
  }
};

export const EquipmentListUpper = (list: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "EQUIPMENTLISTUPPER",
      payload: list,
    });
  } catch (error) {
    alert(error);
  }
};
export const saveTotalEventServiceAITList = (item: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "SAVE_TOTALEVENTSERVICEAITLIST",
      payload: item,
    });
  } catch (error) {
    alert(error);
  }
};

export const resetPostPerPageHome = (item: any) => (dispatch: any) => {
  const newItem = item + 5;
  try {
    dispatch({
      type: "RESET_POSTPERPAGEHOME",
      payload: newItem,
    });
  } catch (error) {
    alert(error);
  }
};

export const updateAITServicesDATA = (item: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "UPDATE_AITSERVICESDATA",
      payload: item,
    });
  } catch (error) {
    alert(error);
  }
};

export const update_approvalList = (firebase_uid: any) => (dispatch: any) => {
  dispatch({
    type: "UPDATE_APPROVALLIST",
    payload: firebase_uid,
  });
};
