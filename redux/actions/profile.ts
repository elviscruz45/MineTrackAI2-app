export const update_firebaseUserName = (firebase_name:any) => (dispatch:any) => {
  dispatch({
    type: "UPDATE_FIREBASEUSERNAME",
    payload: firebase_name,
  });
};

export const update_firebasePhoto = (firebase_photo:any) => (dispatch:any) => {
  dispatch({
    type: "UPDATE_FIREBASEPHOTO",
    payload: firebase_photo,
  });
};

export const update_firebaseEmail = (firebase_email:any) => (dispatch:any) => {
  dispatch({
    type: "UPDATE_FIREBASEEMAIL",
    payload: firebase_email,
  });
};

export const update_firebaseProfile = (firebase_profile:any) => (dispatch:any) => {
  dispatch({
    type: "UPDATE_FIREBASEPROFILE",
    payload: firebase_profile,
  });
};

export const update_firebaseUid = (firebase_uid:any) => (dispatch:any) => {
  dispatch({
    type: "UPDATE_FIREBASEID",
    payload: firebase_uid,
  });
};

export const update_approvalQuantity = (firebase_uid:any) => (dispatch:any) => {
  dispatch({
    type: "UPDATE_APPROVALQUANTITY",
    payload: firebase_uid,
  });
};
