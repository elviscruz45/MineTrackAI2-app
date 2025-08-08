const INITIAL_STATE = {};

export function activity(state = INITIAL_STATE, action:any) {
  switch (action.type) {
    case "SOMETHING":
      return { ...state };
    default:
      return state;
  }
}
