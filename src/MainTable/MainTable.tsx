import React, { useState } from "react";
import { connect } from "react-redux";
import { RootState } from "../reducers";

function MainTable({
  Players,
  Positions,
  AddPosition,
  RemovePosition,
  AddPlayer,
  RemovePlayer
}: {
  Players: PlayerState;
  Positions: PositionState;
  AddPosition: (positionName: string) => void;
  RemovePosition: (position: Position) => void;
  AddPlayer: (name: string) => void;
  RemovePlayer: (player: Player) => void;
}) {
  const [newPlayer, setNewPlayerName] = useState("");
  const [newPosition, setNewPositionName] = useState("");

  return (
    <div>
      <table>
        <tr>
          <text>Innings</text>
        </tr>
        {Players.order.map(playerId => {
          return (
            <tr>
              <td>{Players.store[playerId].name}</td>
              <button onClick={() => RemovePlayer(Players.store[playerId])}>
                -
              </button>
            </tr>
          );
        })}
        <tr>
          <input
            value={newPlayer}
            onChange={event => {
              const newPlayerName = event.target.value;
              setNewPlayerName(newPlayerName);
            }}
          />
          <button
            onClick={() => {
              AddPlayer(newPlayer);
              setNewPlayerName("");
            }}
          >
            +
          </button>
        </tr>
      </table>

      <div>
        <details>
          <summary>Position Manager</summary>
          <table>
            <tr>
              <th>Position Name</th>
            </tr>
            {Object.values(Positions.store).map(position => {
              return (
                <tr>
                  <td>{position.name}</td>
                  <button onClick={() => RemovePosition(position)}>
                    -
                  </button>
                </tr>
              );
            })}
            <tr>
              <input
                value={newPosition}
                onChange={event => {
                  const newPositionName = event.target.value;
                  setNewPositionName(newPositionName);
                }}
              />
              <button
                onClick={() => {
                  AddPosition(newPosition);
                  setNewPositionName("");
                }}
              >
                +
              </button>
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
};
type PositionState = { store: Record<number, Position>; nextId: number };
type PlayerState = {
  store: Record<number, Player>;
  nextId: number;
  order: number[];
};
type Player = { name: string; id: number };
type Inning = { positions: Record<number, number> };

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

export const positionReducer = (
  state: PositionState = { store: {}, nextId: 0 },
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
            id
          }
        },
        nextId: state.nextId
      };
    case "REMOVE_POSITION":
      delete state.store[action.Position.id]
      return { ...state };
    default:
      return state;
  }
};

const mapStateToProps = (state: RootState) => ({
  Players: state.Players,
  Positions: state.Positions
});

type AddPlayerAction = { type: "ADD_PLAYER", PlayerName: string };
type RemovePlayerAction = { type: "REMOVE_PLAYER", Player: Player };
type PlayerAction = AddPlayerAction | RemovePlayerAction;
type AddPositionAction = { type: "ADD_POSITION", PositionName: string };
type RemovePositionAction = { type: "REMOVE_POSITION", Position: Position };
type PositionAction = AddPositionAction | RemovePositionAction;

function addPlayer(PlayerName: string): PlayerAction {
  return {
    type: "ADD_PLAYER",
    PlayerName
  }
}

function removePlayer(Player: Player): PlayerAction {
  return {
    type: "REMOVE_PLAYER",
    Player
  }
}

function addPosition(PositionName: string): PositionAction {
  return {
    type: "ADD_POSITION",
    PositionName
  }
}

function removePosition(Position: Position): PositionAction {
  return {
    type: "REMOVE_POSITION",
    Position
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  AddPlayer: (PlayerName: string) => dispatch(addPlayer(PlayerName)),
  RemovePlayer: (Player: Player) => dispatch(removePlayer(Player)),
  AddPosition: (PositionName: string) => dispatch(addPosition(PositionName)),
  RemovePosition: (Position: Position) => dispatch(removePosition(Position))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainTable);
