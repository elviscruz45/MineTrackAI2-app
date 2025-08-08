export const savePhotoUri = (uri: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "SAVE_PHOTO_URI",
      payload: uri,
    });
  } catch (error) {
    alert(error);
  }
};

export const saveActualServiceAIT = (item: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "SAVE_ACTUALSERVICEAIT",
      payload: item,
    });
  } catch (error) {
    alert(error);
  }
};

export const saveActualPostFirebase = (item: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "SAVE_ACTUALPOSTFIREBASE",
      payload: item,
    });
  } catch (error) {
    alert(error);
  }
};

export const saveActualAITServicesFirebaseGlobalState =
  (item: any) => (dispatch: any) => {
    try {
      dispatch({
        type: "SAVE_ACTUALSERVICEAITLIST",
        payload: item,
      });
    } catch (error) {
      alert(error);
    }
  };

export const saveTotalUsers = (item: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "SAVE_TOTALUSERS",
      payload: item,
    });
  } catch (error) {
    alert(error);
  }
};
export const saveTotalActivities = (item: any) => (dispatch: any) => {
  try {
    dispatch({
      type: "SAVE_TOTALACTIVITIES",
      payload: item,
    });
  } catch (error) {
    alert(error);
  }
};
