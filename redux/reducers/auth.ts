const INITIAL_STATE = {
  firebase_user_uid: null,
  tituloProyecto: "",
};

export function auth(state = INITIAL_STATE, action: any) {
  switch (action.type) {
    case "UPDATE_FIREBASEUSERUID":
      return { ...state, firebase_user_uid: action.payload };

    case "TITULO_PROYECTO":
      return { ...state, tituloProyecto: action.payload };

    default:
      return state;
  }
}
