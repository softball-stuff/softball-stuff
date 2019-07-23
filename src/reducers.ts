import { combineReducers } from "redux";
import { playerReducer as Players } from "./MainTable/MainTable"
import { positionReducer as Positions } from "./MainTable/MainTable"

const rootReducer = combineReducers({
    Players,
    Positions
})

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;