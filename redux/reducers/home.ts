const INITIAL_STATE = {
  home: "elvis",
  equipmentList: [],
  totalEventServiceAITLIST: null,
  postPerPage: 10,
  servicesData: null,
  approvalList: null,
  refreshGanttRealTime: false,
};

export function home(state = INITIAL_STATE, action: any) {
  switch (action.type) {
    case "SOMETHING":
      return { ...state };
    case "EQUIPMENTLISTUPPER":
      return { ...state, equipmentList: action.payload };
    case "REFRESHGANTTPROGRAMADOREALDATA":
      return { ...state, refreshGanttRealTime: !state.refreshGanttRealTime };

    case "SAVE_TOTALEVENTSERVICEAITLIST":
      return {
        ...state,
        totalEventServiceAITLIST: action.payload,
      };
    case "RESET_POSTPERPAGEHOME":
      return { ...state, postPerPage: action.payload };

    case "UPDATE_APPROVALLIST":
      return { ...state, approvalList: action.payload };

    case "UPDATE_AITSERVICESDATA":
      return { ...state, servicesData: action.payload };
    default:
      return state;
  }
}
