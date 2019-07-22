import React, { useState } from 'react';
import { connect } from 'react-redux';

function MainTable({ Players, AddPlayer }: { Players: Player[], AddPlayer: (name: string) => void }) {
    const [newPlayer, setNewPlayerName] = useState("");

    return <table>
        {
            Players.map(player => <tr>{player.name}</tr>)
        }
        <input value={newPlayer} onChange={(event) => { const newPlayerName = event.target.value; setNewPlayerName(newPlayerName) }}
            onKeyDown={(event) => {
                if (event.keyCode == 13) {
                    AddPlayer(newPlayer);
                    setNewPlayerName("")
                }
            }}></input>
    </table>
}

type Player = { name: string };

export const reducer = (state: Player[] = [], action: any) => {
    switch (action.type) {
        case "ADD_PLAYER":
            return [
                ...state,
                {
                    name: action.PlayerName
                }
            ]
        default:
            return state

    }
}

const mapStateToProps = (state: any) => ({ Players: state.Players })

const mapDispatchToProps = (dispatch: any) => ({ AddPlayer: (PlayerName: string) => dispatch({ type: "ADD_PLAYER", PlayerName }) })

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainTable)