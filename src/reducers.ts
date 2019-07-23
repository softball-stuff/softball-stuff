import { combineReducers } from "redux";
import { playerReducer as Players } from "./MainTable/MainTable"
import { positionReducer as Positions } from "./MainTable/MainTable"

export default combineReducers({
    Players,
    Positions
})