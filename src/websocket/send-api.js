
import code from "../constants/msg-code"
import {send} from "./websocket"
import store from "@/store";


export function hallChat(content) {
    send(code.HallChat, content)
}

export function getHallDialog() {
    send(code.GetHallDialog, "")
}

export function getRooms() {
    send(code.GetRooms, "")
}

export function createRoom(from, color) {
    send(code.CreateRoom, {
        from,
        color,
    })
}

export function createRoomVsAI(from, color, type) {
    send(code.CreateRoom, {
        from,
        color,
        type,
    })
}

export function enterRoom(rid, from, role) {
    send(code.EnterRoom, {
        rid,
        from,
        role
    })
}

export function leaveRoom(rid,id) {
    send(code.LeaveRoom, {
        rid,
        id,
    })
}

export function delRoom(rid) {
    send(code.DelRoom, rid)
}

export function roomChat(from, content, rid) {
    send(code.RoomChat, {
        from,
        content,
        rid
    })
}

export function getPlayer() {
    send(code.GetPlayer, "")
}

export function getPlayers() {
    send(code.GetPlayers, "")
}

export function playerRename(name) {
    store.dispatch('playerRename', name)
    send(code.PlayerRename, name)
}

export function setPlayerStatus(status) {
    send(code.SetPlayerStatus, status)
}

export function setReady(rid, id) {
    send(code.SetReady, {
        rid,
        id,
    })
}

export function makeStep(rid, state, name) {
    // console.log(state);
    send(code.MakeStep, {
        rid,
        state,
        name,
    })
}

export function surrender(rid) {
    send(code.Surrender, rid)
}

export function askDraw(rid, consent) {
    send(code.AskDraw, {
        rid,
        consent
    })
}

export function retractStep(rid, id, consent) {
    send(code.RetractStep, {
        rid,
        id,
        consent
    })
}
export function gameOver(rid,matchDetails ,color,cause) {
    send(code.GameOver, {
        rid,
        matchDetails,
        color,
        cause,
    })
}
