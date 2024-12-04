<template>
    <div class="container">
        <div class="header">
            <span class="title">{{$t('lang.roomTable.chessRoomList')}}</span>
            <el-button size="mini" @click="onCreateRoom" style="float: right; margin-right: 10px">{{$t('lang.roomTable.createRoom')}}</el-button>
            <el-button size="mini" @click="onRefresh" style="float: right; margin-right: 10px">{{$t('lang.roomTable.refresh')}}</el-button>
        </div>

        <el-dialog custom-dialog :title="dialogTitle" :visible.sync="dialog.visible" width="25%" style="border-radius: 15vh;">
            <el-form>
                <el-form-item :label="$t('lang.roomTable.dialog.color')">
                    <el-select v-model="dialog.color">
                        <el-option :label="$t('lang.color.black')" :value="0"></el-option>
                        <el-option :label="$t('lang.color.white')" :value="1"></el-option>
                    </el-select>
                </el-form-item>


                <el-form-item label="与AI对弈">
                    <el-radio-group v-model="dialog.radio">
                        <el-radio :label="true">是</el-radio>
                        <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                
                <el-form-item label="AI水平" v-if="dialog.radio == true">
                    <el-select v-model="dialog.type" placeholder="请选择">
                        <el-option label="随机" :value="0"></el-option>
                        <el-option label="专家知识" :value="1"></el-option>
                        <el-option label="Alpha Beta" :value="2"></el-option>
                        <el-option label="resnet" :value="3"></el-option>
                        <el-option label="vit" :value="4"></el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="onDialogConfirm" size="small">{{$t('lang.pop.confirm')}}</el-button>
                <el-button @click="dialog.visible = false" size="small">{{$t('lang.pop.cancel')}}</el-button>
            </div>
        </el-dialog>

        <el-table :data="rooms" class="scrollbar" :show-header="false">
            <el-table-column label="room">
                <div slot-scope="props" style="display: inline-block">
                    <div :class="getChessClass(props.row.host)"></div>
                    <div style="float: left">{{props.row.host.name}} vs {{props.row.challenger.name}}</div>
                    <div :class="getChessClass(props.row.challenger)"></div>
                </div>
            </el-table-column>
            <el-table-column align="right">
                <template slot-scope="scope">
                    <el-button size="mini" @click="onChallenge(scope.row)" v-if="challengeShow(scope.row)" >{{$t('lang.roomTable.challenge')}}</el-button>
                    <el-button size="mini" @click="onSpectate(scope.row)"  v-if="spectateShow(scope.row)" >{{$t('lang.roomTable.spectate')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {createRoom, enterRoom, getRooms,createRoomVsAI,roomExpire,userLogin} from "@/websocket/send-api"
    import color from "@/constants/color"
    import {setPlayerStatus} from "../websocket/send-api";
    import eventBus from "@/utils/event-bus";

    export default {
        name: "RoomTable",
        data() {
            return {
                dialog: {
                    visible: false,
                    color: color.black,
                    radio: false,
                    type: 0,
                },
                // disable: false,
            }
        },
        methods: {
            onDialogConfirm() {
                // alert(this.dialog.radio)
                if (this.dialog.radio) {
                    createRoomVsAI(this.$store.getters.player.id, this.dialog.color, this.dialog.type)
                    this.dialog.radio = false
                }else {
                    createRoom(this.$store.getters.player.id, this.dialog.color)
                }
                this.$store.dispatch('setStep', {})
                this.dialog.visible = false

                
            },
            onCreateRoom() {
               
                userLogin(this.$store.getters.player.id)
                this.dialog.visible = true
            },
            onChallenge(room) {
                enterRoom(room.id, this.$store.getters.player.id, "challenger")
                // getRooms()
            },
            onSpectate(room) {
                enterRoom(room.id, this.$store.getters.player.id, "spectator")
                if (this.$store.getters.player.status === "leisure") {
                    setPlayerStatus("spectating")
                }
            },
            onRefresh() {
                userLogin(this.$store.getters.player.id)
                getRooms()
            },
            getChessClass(player) {
                if (player.id !== '' && player.color === color.black) {
                    return 'black'
                }
                else if (player.id !== '' && player.color === color.white) {
                    return 'white'
                }
                return ''
            },
            challengeShow(room) {
                
                return room.challenger.id != null && room.challenger.id === "" && room.host.id != this.$store.getters.player.id
            },

            spectateShow(room){
                // console.log(room.challenger.id);
                // console.log(room.host.id);
                // console.log(this.$store.getters.player.id);
                
                return room.challenger.id != this.$store.getters.player.id && room.host.id != this.$store.getters.player.id
            },


            startPolling() {
                this.pollingInterval = setInterval(() => {
                    // 轮询逻辑
                    roomExpire()
                }, 1000);
            },
            stopPolling() {
                clearInterval(this.pollingInterval);
            },

        },
        computed: {
            // disable(){
            //     if(this.$store.getters.matchDetails.challenger.id != ''){
            //         return true
            //     }else{
            //         return false
            //     }
            // },
            dialogTitle() {
                return this.$t('lang.roomTable.dialog.title')
            },
            rooms() {
                return this.$store.getters.rooms
            }
        },



        mounted() {
            this.startPolling();
            getRooms()      
        //     eventBus.$on('chessboard-to-roomtable', (data) => {
        //         this.receivedData = data;
        // });
        },

    //     watch: {
    //     // 监听rooms数组中每个元素的challenger.id属性的变化
    //     rooms: {
    //         handler(newRooms, oldRooms) {
    //             if (!newRooms.length) {
    //                     // 列表为空时的处理逻辑，这里可以根据需求进行设置         
    //                 return;
    //             }
    //             // 遍历新的rooms数组，检查每个元素的challenger.id变化
    //             newRooms.forEach((newRoom, index) => {
    //                 const oldRoom = oldRooms[index];
    //                 if (newRoom.challenger && oldRoom.challenger && newRoom.challenger.id!== oldRoom.challenger.id) {
    //                     if(newRoom.challenger.id!= null && newRoom.challenger.id!== ""){
    //                         this.disable = true
    //                     }else{
    //                         this.disable = false
    //                     }
    //                 }
    //             });
    //         },
    //         deep: true
    //     }
    // },
       

        beforeDestroy(){
            this.stopPolling();
        },

    }
</script>

<style scoped>
    .container {
        margin-left: 2%;
        margin-right: 2%;
        height: 100%;
        /* display: flex;
        flex-direction: column; */
    }
    .scrollbar {
        height: calc(69.9vh);
        min-height: 415px;
    }
    .header {
        border-bottom: 1px solid lightgrey;
        padding: 2% 0 2% 5%;
    }
    .title {
        padding-top: 100px;
    }
    .custom-dialog .el-dialog {
        border-radius: 10px; /* 设置圆角大小 */
    }
@media screen and (max-width: 768px) {
 .el-dialog {
    margin: auto;
    position: relative;
  }
}
</style>