import { combineReducers } from "redux";
import { playerReducer as Players } from "./MainTable/MainTable"
import { positionReducer as Positions } from "./MainTable/MainTable"
import { inningReducer as Innings } from "./MainTable/MainTable"

const rootReducer = combineReducers({
    Players,
    Positions,
    Innings
})

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;