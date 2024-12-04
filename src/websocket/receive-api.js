
import store from "../store";
import router from "@/router";

export default {
    fail(data) {
        alert(data)
    },
    hallChat(dialogMsg) {
        store.dispatch('setHallDialogMsg', dialogMsg)
    },
    async getHallDialog(dialog) {
        for (let dialogMsg of dialog) {
             await this.hallChat(dialogMsg)
        }
    },
    getRooms(rooms) {
        // console.log(rooms);
        
        store.dispatch('setRooms', rooms)
    },
    createRoom(room) {
        store.dispatch('addRoom', room)
        this.enterRoom(room)
    },
    enterRoom(room) {
        // alert("加入房间")
        store.dispatch('setRoom', room)
        // console.log(room);
        store.dispatch('addTab', room).then(() => {
            store.dispatch('changeTab', room.id)
            store.dispatch(('setPlayerTable'), {
                roomId: room.id,
                players: room.spectators
            })
            store.dispatch('setMatchDetails', {
                roomId: room.id,
                host: room.host,
                challenger: room.challenger
            })
            store.dispatch('setChessboard', {
                roomId: room.id,
                steps: room.steps
            })

        })
    },
    leaveRoom(room) {
        // store.dispatch('addTab', room).then(() => {
            
            store.dispatch('setPlayerTable', {
                roomId: room.id,
                players: room.spectators
            })
            store.dispatch('setMatchDetails', {
                roomId: room.id,
                host: room.host,
                challenger: room.challenger
            })

            store.dispatch('setChessboard', {
                roomId: room.id,
                steps: room.steps
            })
            store.dispatch('setRoom', room)
        // })
    },
    delRoom(roomId) {
        store.dispatch('removeTab', roomId)
        store.dispatch('delRoomById', roomId)
    },
    roomChat(roomChatDTO) {
        // console.log(roomChatDTO);
        store.dispatch('setRoomChatDTO', roomChatDTO)
    },

    getPlayer(player) {
        store.dispatch('setPlayer', player)
    },
    getPlayers(players) {
        let playerTable = {
            roomId: 'hall',
            players
        }
        store.dispatch('setPlayerTable', playerTable)
    },
    setReady(room) {
        // console.log(room);
        store.dispatch('setMatchDetails', {
            roomId: room.id,
            host: room.host,
            challenger: room.challenger
        })
        store.dispatch('setRoom', room)
    },
    makeStep(step) {
        store.dispatch('setStep', step)
    },
    gameOver(gameOverDTO) {
        store.dispatch('setGameOverDTO', gameOverDTO)
    },
    askDraw(drawDTO) {
        store.dispatch('setDrawDTO', drawDTO)
    },
    retractStep(retractDTO) {
        store.dispatch('setRetractDTO', retractDTO)
    },
    userconnect(msg){
        // console.log(msg);
        const currentPath = window.location.pathname;
        if(msg.msg == true && currentPath !== '/login'){
            router.replace({name:'login'})
        }
    },
    roomExpire(msg){
        const rids = msg.rid
        const uids = msg.uid
        // console.log(store.getters.tabs);
        uids.forEach(uid=>{
            if(uid == store.getters.player.id){
                alert("您已掉线，请重新登录")
                store.dispatch('setPlayer',{})
            }
        })

        rids.forEach((rid, i)=>{
            store.getters.tabs.forEach(tab=>{
                if(store.getters.activeTabKey == rid){
                    store.dispatch("changeTab",'hall')
                }
                if(tab.roomId == rid){
                    store.dispatch("removeTab",rid)
                    store.dispatch('delRoomById',rid)
                }
            })

            // if(store.getters.activeTabKey == rid){
            //     store.dispatch("changeTab",'hall')
            //     store.dispatch('removeTab', rid)
            //     store.dispatch('delRoomById',rid)
            // }
            // store.dispatch('removeTab', rid)
            // store.dispatch('delRoomById',rid)
            
        })
    },
    userLogin(msg){
        // console.log(msg);
        // alert(msg)
        if(msg.t<=0){
            alert("您已掉线，请重新登录")
            const currentPath = window.location.pathname;
            if(currentPath !== '/login'){
                router.replace({name:'login'})
            }
        }
    },
    ttlRoom(msg){
        // console.log(msg);
        // console.log(msg.t);
        
        // alert(msg)
        if(msg.t<=0){
            store.getters.tabs.forEach(tab=>{
                if(store.getters.activeTabKey == msg.rid){
                    store.dispatch("changeTab",'hall')
                }

                  if(tab.roomId == msg.rid){
                    store.dispatch("removeTab",msg.rid)
                    store.dispatch('delRoomById',msg.rid)
                }
            })
        }else{
            store.dispatch('setRoomChatDTO', msg)
        }

    }
}



// export function