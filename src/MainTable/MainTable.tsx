import React, { useState } from "react";
import { connect } from "react-redux";
import { RootState } from "../reducers";

function MainTable({
  Players,
  Positions,
  Innings,
  AddPlayer,
  RemovePlayer,
  ExpandPlayer,
  AddPlayerPreference,
  RemovePlayerPreference,
  AddPosition,
  RemovePosition,
  SetPlayerPosition,
  AddInning,
  LockInning
}: {
  Players: PlayerState;
  Positions: PositionState;
  Innings: InningState;
  AddPlayer: (name: string) => void;
  RemovePlayer: (player: Player) => void;
  ExpandPlayer: (player: Player) => void;
  AddPlayerPreference: (player: Player, position: Position) => void;
  RemovePlayerPreference: (player: Player, position: Position) => void;
  AddPosition: (positionName: string) => void;
  RemovePosition: (position: Position) => void;
  SetPlayerPosition: (
    Inning: number,
    Player: Player,
    Position: Position
  ) => void;
  AddInning: () => void;
  LockInning: (Inning: number) => void;
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
            <td style={{ cursor: "pointer" }} onClick={() => LockInning(ii)}>
              {ii + 1}{" "}
              {inning.locked ? (
                <i className="em em-lock" />
              ) : (
                <i className="em em-unlock" />
              )}
            </td>
          ))}
        </tr>
        {Players.order.map(playerId => {
          return [
            <tr>
              <td
                style={{ cursor: "pointer" }}
                onClick={() => ExpandPlayer(Players.store[playerId])}
              >
                {Players.store[playerId].name}
              </td>
              <td />
              {Innings.map((inning, ii) => (
                <td>
                  {inning.locked === true ? (
                    Positions.store[inning.positions[playerId] || 0].name
                  ) : (
                    <select
                      value={inning.positions[playerId] || "0"}
                      onChange={item => {
                        SetPlayerPosition(
                          ii,
                          Players.store[playerId],
                          Positions.store[
                            (item.target.value as unknown) as number
                          ]
                        );
                      }}
                    >
                      {Object.values(Positions.store).map(position => (
                        <option value={position.id}>{position.name}</option>
                      ))}
                    </select>
                  )}
                </td>
              ))}
            </tr>,
            playerId === Players.expanded ? (
              <tr>
                <td>
                  <button onClick={() => RemovePlayer(Players.store[playerId])}>
                    Remove Player
                  </button>
                </td>
                <td>Preferences:</td>
                {/** Only create one select for each chosen position + 1 empty. For each chosen positon selected, have to call remove chosen position followed by add chosen position. For the empty just call add new position. 
                Kyle says have fun, get some sleep. */}
                {Innings.map((inning, ii) => (
                  <td>
                    {inning.locked === true ? (
                      Positions.store[inning.positions[playerId] || 0].name
                    ) : (
                      <select
                        value={inning.positions[playerId] || "0"}
                        onChange={event => {
                          AddPlayerPreference(
                            Players.store[playerId],
                            Positions.store[(event.target.value as unknown) as number]
                          );
                        }}
                      >
                        {Object.values(Positions.store).map(position => (
                          <option value={position.id}>{position.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                ))}
              </tr>
            ) : null
          ];
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
          <summary style={{ cursor: "pointer" }}>Position Manager</summary>
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
  expanded: number;
};
type Player = { name: string; id: number; preferences: number[] };
type Inning = { positions: Record<number, number>; locked: boolean };
type InningState = Inning[];

export const playerReducer = (
  state: PlayerState = { store: {}, nextId: 0, order: [], expanded: -1 },
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
            id,
            preferences: []
          }
        },
        nextId: state.nextId,
        order: [...state.order, id],
        expanded: state.expanded
      };
    case "REMOVE_PLAYER":
      state.order = state.order.filter(
        playerId => playerId !== action.Player.id
      );
      delete state.store[action.Player.id];
      return { ...state };
    case "EXPAND_PLAYER":
      return {
        ...state,
        expanded: action.Player.id
      };
    case "ADD_PREFERENCE":
      state.store[action.Player.id].preferences.concat(action.Position.id)
      return {...state};
    case "REMOVE_PREFERENCE":
      delete state.store[action.Player.id].preferences[action.Position.id];
      return {...state};
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
  state: InningState = [...Array(7)].map(id => ({
    positions: {},
    locked: false
  })),
  action: InningAction
) => {
  const newState = [...state];
  switch (action.type) {
    case "ADD_INNING":
      return [...state, { positions: {}, locked: false }];
    case "SET_PLAYER_POSITION":
      newState[action.Inning].positions[action.Player.id] = action.Position.id;
      return newState;
    case "LOCK_INNING":
      newState[action.Inning].locked = !newState[action.Inning].locked;
      return newState;
    default:
      return state;
  }
};

type AddPlayerAction = { type: "ADD_PLAYER"; PlayerName: string };
type RemovePlayerAction = { type: "REMOVE_PLAYER"; Player: Player };
type ExpandPlayerAction = { type: "EXPAND_PLAYER"; Player: Player };
type AddPlayerPreferenceAction = {
  type: "ADD_PREFERENCE";
  Player: Player;
  Position: Position;
};
type RemovePlayerPreferenceAction = {
  type: "REMOVE_PREFERENCE";
  Player: Player;
  Position: Position;
};
type PlayerAction =
  | AddPlayerAction
  | RemovePlayerAction
  | ExpandPlayerAction
  | AddPlayerPreferenceAction
  | RemovePlayerPreferenceAction;
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
type LockInningAction = { type: "LOCK_INNING"; Inning: number };
type InningAction =
  | SetPlayerPositionAction
  | AddInningAction
  | LockInningAction;

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

function expandPlayer(Player: Player): PlayerAction {
  return {
    type: "EXPAND_PLAYER",
    Player
  };
}

function addPlayerPreference(Player: Player, Position: Position): PlayerAction {
  return {
    type: "ADD_PREFERENCE",
    Player,
    Position
  };
}

function removePlayerPreference(
  Player: Player,
  Position: Position
): PlayerAction {
  return {
    type: "REMOVE_PREFERENCE",
    Player,
    Position
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

function addInning(): InningAction {
  return {
    type: "ADD_INNING"
  };
}

function lockInning(Inning: number): InningAction {
  return {
    type: "LOCK_INNING",
    Inning
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
  ExpandPlayer: (Player: Player) => dispatch(expandPlayer(Player)),
  AddPlayerPreference: (Player: Player, Position: Position) =>
    dispatch(addPlayerPreference(Player, Position)),
  RemovePlayerPreference: (Player: Player, Position: Position) =>
    dispatch(removePlayerPreference(Player, Position)),
  AddPosition: (PositionName: string) => dispatch(addPosition(PositionName)),
  RemovePosition: (Position: Position) => dispatch(removePosition(Position)),
  SetPlayerPosition: (Inning: number, Player: Player, Position: Position) =>
    dispatch(setPlayerPosition(Inning, Player, Position)),
  AddInning: () => dispatch(addInning()),
  LockInning: (Inning: number) => dispatch(lockInning(Inning))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainTable);
