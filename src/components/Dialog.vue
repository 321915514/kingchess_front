<template>
    <div class="container">
        <div class="header">
            <span class="title">{{$t('lang.dialog.dialog')}}</span>
        </div>
        <div class="scrollbar">
            <div class="line" v-for="(item, index) in dialog" :key="index">
                <span style="font-size: xx-small">{{item.time}}</span>
                <br>
                <span :style="{ color: item.from === $store.getters.player.name? 'green' : 'red' }" >{{ item.from }}: {{ item.content }}</span>
                <!-- <span class="content_other">{{ item.from }}: {{ item.content }}</span> -->
            </div>
        </div>
        <div class="emoji_and_input">
            <el-input id="emojiInput" ref="inputRef" size="mini" type="text" v-model="input"  @keyup.enter.native="onSend" placeholder="请输入"/>
            
            <el-popover placement="right-start" trigger="click">
                <picker :include="['people','Smileys']" :showSearch="false" :showPreview="false" :showCategories="false" @select="addEmoji" />
                <svg class="emoji-button"  slot="reference" t="1726862782562"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4329" width="25" height="25"><path d="M516.95 929.6c-229.95 0-416.7-186.75-416.7-416.7C100.25 282.95 287 96.2 516.95 96.2s416.7 186.75 416.7 416.7c0 229.5-186.75 416.7-416.7 416.7z m0-788.4c-204.75 0-371.7 166.5-371.7 371.7s166.5 371.7 371.7 371.7c204.75 0 371.7-166.5 371.7-371.7s-166.5-371.7-371.7-371.7z" fill="#17abe3" p-id="4330"></path><path d="M516.95 834.65c-168.75 0-306-137.25-306-306 0-12.6 9.9-22.5 22.5-22.5s22.5 9.9 22.5 22.5c0 144 117 261 261 261s261-117 261-261c0-12.6 9.9-22.5 22.5-22.5s22.5 9.9 22.5 22.5c0 168.75-137.25 306-306 306z" fill="#17abe3" p-id="4331"></path><path d="M361.25 377.45m-25.2 0a25.2 25.2 0 1 0 50.4 0 25.2 25.2 0 1 0-50.4 0Z" fill="#17abe3" p-id="4332"></path><path d="M672.65 377.45m-25.2 0a25.2 25.2 0 1 0 50.4 0 25.2 25.2 0 1 0-50.4 0Z" fill="#17abe3" p-id="4333"></path></svg>
                <!-- <svg class="emoji-button"  slot="reference" t="1726862782562"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4329" width="3.5vh" height="3.5vh"><path d="M516.95 929.6c-229.95 0-416.7-186.75-416.7-416.7C100.25 282.95 287 96.2 516.95 96.2s416.7 186.75 416.7 416.7c0 229.5-186.75 416.7-416.7 416.7z m0-788.4c-204.75 0-371.7 166.5-371.7 371.7s166.5 371.7 371.7 371.7c204.75 0 371.7-166.5 371.7-371.7s-166.5-371.7-371.7-371.7z" fill="#1296db" p-id="4330"></path><path d="M516.95 834.65c-168.75 0-306-137.25-306-306 0-12.6 9.9-22.5 22.5-22.5s22.5 9.9 22.5 22.5c0 144 117 261 261 261s261-117 261-261c0-12.6 9.9-22.5 22.5-22.5s22.5 9.9 22.5 22.5c0 168.75-137.25 306-306 306z" fill="#1296db" p-id="4331"></path><path d="M361.25 377.45m-25.2 0a25.2 25.2 0 1 0 50.4 0 25.2 25.2 0 1 0-50.4 0Z" fill="#1296db" p-id="4332"></path><path d="M672.65 377.45m-25.2 0a25.2 25.2 0 1 0 50.4 0 25.2 25.2 0 1 0-50.4 0Z" fill="#1296db" p-id="4333"></path></svg> -->
                <!-- <el-button size="mini" class="emoji-button"  slot="reference"></el-button> -->
            </el-popover>
            <el-button size="mini"  @click="onSend" class="send-button">{{$t('lang.dialog.send')}}</el-button>
        </div>
    </div>
</template>

<script>
    import {hallChat, roomChat} from "../websocket/send-api";

    
    import { Picker } from "emoji-mart-vue"; //引入组件
  
    export default {
        name: "Dialog",
        props: ['roomId'],
        data() {
            return {
                input: '',
                dialog: [],
            }
        },
        methods: {
            onSend() {
                if (this.input !== '') {
                    if (this.roomId === 'hall') {
                        hallChat({name: this.$store.getters.player.name, input:this.input})
                    }
                    else {
                        roomChat(this.$store.getters.player.name, this.input, this.roomId)
                       
                    }
                    this.input = ''
                }
            },
            onEmoji() {
                this.$refs.picker.showPicker()
            },
            addDialogMsg(msg) {
                if (this.dialog.length >= 10) {
                    this.dialog.splice(0, 1)
                }
                this.dialog.push(msg)
            },
         
            addEmoji(e) {
                if(this.roomId !== 'hall'){
                    let elInput_room = document.getElementById('emojiInput'); //根据id选择器选中对象

                    let txt_room_ = this.input;
                    // console.log(txt_room_);


                    
                    var startPos_room = txt_room_.length;// input 第0个字符到选中的字符
                    // alert(startPos_room);
                    
                    var endPos_room = elInput_room.selectionEnd;// 选中的字符到最后的字符
                    // console.log(endPos_room);
                    // alert(startPos_room);
                    
                    if (startPos_room === undefined || endPos_room === undefined) return

                    
                    // 将表情添加到选中的光标位置
                    var result_room = txt_room_.substring(0, startPos_room) + e.native
                    elInput_room.value = result_room;// 赋值给input的value

                    // console.log(elInput_room.value);
                    
                    // 重新定义光标位置
                    elInput_room.focus();
                    elInput_room.selectionStart = startPos_room + e.native.length;
                    elInput_room.selectionEnd = startPos_room + e.native.length;
                    // console.log(result_room);
                    
                    this.input  = result_room// 赋值给表单中的的字段
                }else{
                    var elInput = document.getElementById('emojiInput'); //根据id选择器选中对象
                    var startPos = elInput.selectionStart;// input 第0个字符到选中的字符
                    // alert(startPos);
                    // console.log(this.input);
                    
                    // console.log(startPos);
                    
                    var endPos = elInput.selectionEnd;// 选中的字符到最后的字符
                    // console.log(endPos);
                    
                    if (startPos === undefined || endPos === undefined) return
                    var txt = elInput.value;
                    // console.log(txt);
                    
                    // 将表情添加到选中的光标位置
                    var result = txt.substring(0, startPos) + e.native + txt.substring(endPos)
                    elInput.value = result;// 赋值给input的value

                    // console.log(elInput.value);
                    
                    // 重新定义光标位置
                    elInput.focus();
                    elInput.selectionStart = startPos + e.native.length;
                    elInput.selectionEnd = startPos + e.native.length;
                    // console.log(result);
                    
                    this.input  = result// 赋值给表单中的的字段
                }
            },
        },

        components:{
            Picker
        },

        computed: {
            dialogMsg() {
                if (this.roomId === 'hall') {
                    return this.$store.getters.hallDialogMsg
                }
                else {
                    return this.$store.getters.roomChatDTO
                }
            },
            
            
        },
        watch: {
            dialogMsg(newMsg) {
                // console.log(newMsg);
                
                if (this.roomId !== 'hall' && newMsg.rid !== this.roomId) {
                    return
                }
                this.addDialogMsg(newMsg)
            },
        },
        mounted() {
            if (this.roomId === 'hall') {
                let date = new Date()
                this.$store.dispatch('setHallDialogMsg', {
                    time: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay() + ' '
                    + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
                    from: '系统消息',
                    content: 'Settings里设置语言'
                })
            }else{
                let date = new Date()
                this.$store.dispatch('setRoomChatDTO', {
                    time: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay() + ' '
                    + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
                    from: '系统消息',
                    content: 'Settings里设置语言',
                    rid: this.roomId
                })
            }



        }
    }
</script>

<style scoped>
    .container {
        margin-top: 3%;
    }
    .scrollbar {
        height: calc(32.1vh);
        min-height: 280px;
    }
    .header {
        border-bottom: 1px solid lightgrey;
        padding: 2% 0 2% 5%;
    }
    .title {
        padding-top: 100px;
    }
    .line {
        margin-top: 5px;
        margin-left: 3%;
        font-size: medium;
    }
    .input {
        width: 80%;
    }
    .send-button {
        width: 20%;
    }
    .emoji-mart[data-v-7bc71df8] {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column;
        flex-direction: column;
        height: 420px;
        color: #ffffff !important;
        border: 1px solid #d9d9d9;
        border-radius: 5px;
        background: #fff;
}
.emoji_and_input{
    display: flex;
    justify-items: flex-end;
    justify-content: space-between
    
}


</style>