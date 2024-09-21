import code from "../constants/msg-code"
import receive from "./receive-api"
import { io } from "socket.io-client";

import store from '@/store'



const url = "ws://117.72.75.113"
// const url = "ws://127.0.0.1:5000"
let ws = {}

export function initWebSocket() {
    // console.log(url);
    // ws = new WebSocket(url)

    ws = io(url);

    // console.log(ws);
    // ws.onopen = onOpen
    // ws.onmessage = onMessage
    // ws.onerror = onError

    ws.on("connect", function(){
        // alert('connected')
        // console.log(store.state)
        if(store.getters.player.id!=='x'){
            send(code.userconnect, store.getters.player.id)
        }
    })

    ws.on("message", function(msg){
        // console.log(msg);
        let data = msg.data
        switch(msg.code) {
            case code.Fail:
                receive.fail(data)
                break
            case code.HallChat:
                receive.hallChat(data)
                break
            case code.GetHallDialog:
                receive.getHallDialog(data)
                break
            case code.GetRooms:
                receive.getRooms(data)
                break
            case code.CreateRoom:
                // console.log(data);
                receive.createRoom(data)
                break
            case code.EnterRoom:
                receive.enterRoom(data)
                break
            case code.LeaveRoom:
                receive.leaveRoom(data)
                break
            case code.DelRoom:
                receive.delRoom(data)
                break
            case code.RoomChat:
                receive.roomChat(data)
                break
            case code.GetPlayer:
                receive.getPlayer(data)
                break
            case code.GetPlayers:
                receive.getPlayers(data)
                break
            case code.SetReady:
                receive.setReady(data)
                break
            case code.MakeStep:
                receive.makeStep(data)
                break
            case code.GameOver:
                receive.gameOver(data)
                break
            case code.AskDraw:
                receive.askDraw(data)
                break
            case code.RetractStep:
                receive.retractStep(data)
                break
            case code.userconnect:
                receive.userconnect(data)
                break
            default:
                break
        }
    })

}








// function onMessage(e) {
//     let msg = JSON.parse(e.data)
//     console.log(msg);
//     let data = msg.data
//     switch(msg.code) {
//         case code.Fail:
//             receive.fail(data)
//             break
//         case code.HallChat:
//             receive.hallChat(data)
//             break
//         case code.GetHallDialog:
//             receive.getHallDialog(data)
//             break
//         case code.GetRooms:
//             receive.getRooms(data)
//             break
//         case code.CreateRoom:
//             receive.createRoom(data)
//             break
//         case code.EnterRoom:
//             receive.enterRoom(data)
//             break
//         case code.LeaveRoom:
//             receive.leaveRoom(data)
//             break
//         case code.DelRoom:
//             receive.delRoom(data)
//             break
//         case code.RoomChat:
//             receive.roomChat(data)
//             break
//         case code.GetPlayer:
//             receive.getPlayer(data)
//             break
//         case code.GetPlayers:
//             receive.getPlayers(data)
//             break
//         case code.SetReady:
//             receive.setReady(data)
//             break
//         case code.MakeStep:
//             receive.makeStep(data)
//             break
//         case code.GameOver:
//             receive.gameOver(data)
//             break
//         case code.AskDraw:
//             receive.askDraw(data)
//             break
//         case code.RetractStep:
//             receive.retractStep(data)
//             break
//         default:
//             break
//     }
// }



// function onError() {
//     alert('WebSocket connection to \'' + url + '\' failed')
// }

export function send(code, data) {
    ws.send(JSON.stringify({
        code,
        data
    }))
}

