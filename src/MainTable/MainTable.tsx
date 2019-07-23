import React, { useState } from "react";
import { connect } from "react-redux";
import { RootState } from "../reducers";

function MainTable({
  Players,
  Positions,
  Innings,
  AddPosition,
  RemovePosition,
  AddPlayer,
  RemovePlayer,
  SetPlayerPosition
}: {
  Players: PlayerState;
  Positions: PositionState;
  Innings: InningState;
  AddPosition: (positionName: string) => void;
  RemovePosition: (position: Position) => void;
  AddPlayer: (name: string) => void;
  RemovePlayer: (player: Player) => void;
  SetPlayerPosition: (
    Inning: number,
    Player: Player,
    Position: Position
  ) => void;
}) {
  const [newPlayer, setNewPlayerName] = useState("");
  const [newPosition, setNewPositionName] = useState("");

  return (
    <div>
      <table>
        <tr>
          <td>Innings</td>
          <td />
          {Innings.map((inning, ii) => (
            <td>{ii + 1}</td>
          ))}
        </tr>
        {Players.order.map(playerId => {
          return (
            <tr>
              <td>{Players.store[playerId].name}</td>
              <td>
                <button onClick={() => RemovePlayer(Players.store[playerId])}>
                  -
                </button>
              </td>
              {Innings.map((inning, ii) => (
                <td>
                  <select
                    value={inning.positions[playerId] || "0"}
                    onChange={item => {
                      debugger;
                      SetPlayerPosition(ii, Players.store[playerId], Positions.store[item.target.value as unknown as number])
                    }
                    }
                  >
                    {Object.values(Positions.store).map(position => (
                      <option value={position.id}>{position.name}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          );
        })}
        <tr>
          <td>
            <input
              value={newPlayer}
              onChange={event => {
                const newPlayerName = event.target.value;
                setNewPlayerName(newPlayerName);
              }}
              onKeyDown={event => {
                if (event.keyCode == 13) {
                  AddPlayer(newPlayer);
                  setNewPlayerName("");
                }
              }}
            />
          </td>
          <td>
            <button
              onClick={() => {
                AddPlayer(newPlayer);
                setNewPlayerName("");
              }}
            >
              +
            </button>
          </td>
        </tr>
      </table>

      <div>
        <details>
          <summary>Position Manager</summary>
          <table>
            <tr>
              <th>Position Name</th>
            </tr>
            {Object.values(Positions.store)
              .filter(position => position.removable)
              .map(position => {
                return (
                  <tr>
                    <td>{position.name}</td>
                    <td>
                      <button onClick={() => RemovePosition(position)}>
                        -
                      </button>
                    </td>
                  </tr>
                );
              })}
            <tr>
              <td>
                <input
                  value={newPosition}
                  onChange={event => {
                    const newPositionName = event.target.value;
                    setNewPositionName(newPositionName);
                  }}
                  onKeyDown={event => {
                    if (event.keyCode == 13) {
                      AddPosition(newPosition);
                      setNewPositionName("");
                    }
                  }}
                />
              </td>
              <td>
                <button
                  onClick={() => {
                    AddPosition(newPosition);
                    setNewPositionName("");
                  }}
                >
                  +
                </button>
              </td>
            </tr>
          </table>
        </details>
      </div>
    </div>
  );
}

type Position = {
  name: string;
  id: number;
  minOccupancy: number;
  maxOccupancy: number;
  removable: boolean;
};
type PositionState = { store: Record<number, Position>; nextId: number };
type PlayerState = {
  store: Record<number, Player>;
  nextId: number;
  order: number[];
};
type Player = { name: string; id: number };
type Inning = { positions: Record<number, number> };
type InningState = Inning[];

export const playerReducer = (
  state: PlayerState = { store: {}, nextId: 0, order: [] },
  action: PlayerAction
) => {
  switch (action.type) {
    case "ADD_PLAYER":
      const id = state.nextId;
      state.nextId++;
      return {
        store: {
          ...state.store,
          [id]: {
            name: action.PlayerName,
            id
          }
        },
        nextId: state.nextId,
        order: [...state.order, id]
      };
    case "REMOVE_PLAYER":
      state.order = state.order.filter(
        playerId => playerId !== action.Player.id
      );
      delete state.store[action.Player.id];
      return { ...state };
    default:
      return state;
  }
};

type PositionShorthand = [string, number, number, boolean];
const defaultPositions: PositionShorthand[] = [
  ["-", 0, Number.MAX_SAFE_INTEGER, false],
  ...["P", "1B", "2B", "3B", "SS", "LF", "RF", "CF", "C"].map<
    PositionShorthand
  >(pos => [pos, 1, 1, true])
];
const defaultState: PositionState = {
  store: defaultPositions.map((pos: PositionShorthand, ii: number) => ({
    name: pos[0],
    minOccupancy: pos[1],
    maxOccupancy: pos[2],
    removable: pos[3] || false,
    id: ii
  })),
  nextId: defaultPositions.length
};
export const positionReducer = (
  state: PositionState = defaultState,
  action: PositionAction
) => {
  switch (action.type) {
    case "ADD_POSITION":
      const id = state.nextId;
      state.nextId++;
      return {
        store: {
          ...state.store,
          [id]: {
            name: action.PositionName,
            minOccupancy: 0,
            maxOccupancy: 0,
            removable: true,
            id
          }
        },
        nextId: state.nextId
      };
    case "REMOVE_POSITION":
      delete state.store[action.Position.id];
      return { ...state };
    default:
      return state;
  }
};

export const inningReducer = (
  state: InningState = [...Array(7)].map(id => ({ positions: {} })),
  action: InningAction
) => {
  switch (action.type) {
    case "ADD_INNING":
      return [...state, { positions: {} }];
    case "SET_PLAYER_POSITION":
      const newState = [...state];
      newState[action.Inning].positions[action.Player.id] = action.Position.id;
      return newState;
    default:
      return state;
  }
};

type AddPlayerAction = { type: "ADD_PLAYER"; PlayerName: string };
type RemovePlayerAction = { type: "REMOVE_PLAYER"; Player: Player };
type PlayerAction = AddPlayerAction | RemovePlayerAction;
type AddPositionAction = { type: "ADD_POSITION"; PositionName: string };
type RemovePositionAction = { type: "REMOVE_POSITION"; Position: Position };
type PositionAction = AddPositionAction | RemovePositionAction;
type SetPlayerPositionAction = {
  type: "SET_PLAYER_POSITION";
  Inning: number;
  Player: Player;
  Position: Position;
};
type AddInningAction = { type: "ADD_INNING" };
type InningAction = SetPlayerPositionAction | AddInningAction;

function addPlayer(PlayerName: string): PlayerAction {
  return {
    type: "ADD_PLAYER",
    PlayerName
  };
}

function removePlayer(Player: Player): PlayerAction {
  return {
    type: "REMOVE_PLAYER",
    Player
  };
}

function addPosition(PositionName: string): PositionAction {
  return {
    type: "ADD_POSITION",
    PositionName
  };
}

function removePosition(Position: Position): PositionAction {
  return {
    type: "REMOVE_POSITION",
    Position
  };
}

function setPlayerPosition(
  Inning: number,
  Player: Player,
  Position: Position
): InningAction {
  return {
    type: "SET_PLAYER_POSITION",
    Inning,
    Player,
    Position
  };
}

const mapStateToProps = (state: RootState) => ({
  Players: state.Players,
  Positions: state.Positions,
  Innings: state.Innings
});

const mapDispatchToProps = (dispatch: any) => ({
  AddPlayer: (PlayerName: string) => dispatch(addPlayer(PlayerName)),
  RemovePlayer: (Player: Player) => dispatch(removePlayer(Player)),
  AddPosition: (PositionName: string) => dispatch(addPosition(PositionName)),
  RemovePosition: (Position: Position) => dispatch(removePosition(Position)),
  SetPlayerPosition: (Inning: number, Player: Player, Position: Position) =>
    dispatch(setPlayerPosition(Inning, Player, Position))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainTable);
