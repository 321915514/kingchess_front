<template>
    <el-container>
        <el-header style="height: 20px; display: block; text-align: center">
            <span v-if="!started" style="font-size: large; font-weight: bold">{{ title }}</span>
            <el-button size="mini" style="float: right"
                @click="onExit()">{{ $t('lang.chessboard.button.exit') }}</el-button>
        </el-header>
        <el-main>
            <!-- <canvas :id="roomId" @click="onClick">Your browser doesn't support canvas</canvas> -->
            <div :id="roomId" :disabled="isDisabled" class="container" @click="handleclick($event)">
                <!-- handleclick  handleBoard is ai api-->
                <canvas id="board" ref="myboard"></canvas>
                <!-- <canvas id="chess" ref="mychess"></canvas> -->
                <!-- <canvas id="black" ref="myblack"></canvas> -->
            </div>

        </el-main>
        <el-footer align="center" style="height: 20px">
            <audio ref="down" src="../assets/audio/down.mp3"></audio>
            <audio ref="eat" src="../assets/audio/eat.mp3"></audio>
            <el-button size="mini" @click="onRetract()"
                :disabled="buttonDisabled">{{ $t('lang.chessboard.button.retract') }}</el-button>
            <el-button size="mini" @click="onSurrender()"
                :disabled="buttonDisabled">{{ $t('lang.chessboard.button.surrender') }}</el-button>
            <!-- <el-button size="mini" @click="onDraw()" :disabled="buttonDisabled">{{$t('lang.chessboard.button.draw')}}</el-button> -->
        </el-footer>
    </el-container>
</template>


<script>
// import { ElStep } from 'element-ui/types/step';

// import  Board  from './board';
// import { getData } from '../api/index'
// import * as echarts from 'echarts';
// import { log10 } from 'core-js/core/number';
// import { reactive } from 'vue';

// import { ref } from 'vue'
// import { beginGame, selectMove } from '@/api';

// import constant from "../constants/color";
import { askDraw, delRoom, leaveRoom, makeStep, gameOver, retractStep, surrender } from "../websocket/send-api";
import { setPlayerStatus } from "../websocket/send-api";


export default {
    name: "ChessBoard",
    props: ['roomId'],
    data() {
        return {
            current: 50,
            // boardInstance: null as Board | null,
            arr: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, -1, -1, -1, 0], [0, -1, 0, -1, 0], [0, -1, -1, -1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
            isBlack: true,
            boardcontext: null,
            isStone: false,
            stone: { x: -1, y: -1 },
            play_out: 0,
            width: 6 * 50,
            height: 10 * 50,
            boardElement: null,
            ana_id: null,
            state: { board: Array, move: '', eat: '', player: 0, winner: 0, play_out: 0, eat_c: 0 },
            states: [],
            eat_chess: 0,
            // options : [
            //     {
            //         value: '1',
            //         label: '国王',
            //     },
            //     {
            //         value: '-1',
            //         label: '大臣',
            //     },
            // ],
            // player: ref('')

            // canvas, 
            steps: [],
            myColor: -1,
            title: this.$t('lang.chessboard.message.clickReady'), // this.$t('lang.chessboard.message.clickReady')
            started: false,
            waitResponse: false,
            isDisabled: true

        }
    },


    // setup(){
    //     let board = reactive([[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,-1,-1,-1,0],[0,-1,0,-1,0],[0,-1,-1,-1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]]);
    // },





    mounted() {
        this.boardElement = this.$refs.myboard;
        // this.whiteElement = this.$refs.mywhite;
        // this.blackElement = this.$refs.myblack;
        if (this.boardElement) {
            // new Board(this.boardLength, canvasElement, this.boardArr);
            this.boardElement.width = 6 * this.current;
            this.boardElement.height = 10 * this.current;
            this.boardcontext = this.boardElement.getContext('2d');

            if (this.boardcontext != null) {
                this.drawboard();
                // console.log(this.arr);
                // this.init_board();
            }
        }
        // if (this.whiteElement) {
        //     // new Board(this.boardLength, canvasElement, this.boardArr);
        //     this.whiteElement.width = 6 * this.current;
        //     this.whiteElement.height = 10 * this.current;
        //     this.whitecontext = this.whiteElement.getContext('2d');
        // }
        // if (this.blackElement) {
        //     // new Board(this.boardLength, canvasElement, this.boardArr);
        //     this.blackElement.width = 6 * this.current;
        //     this.blackElement.height = 10 * this.current;
        //     this.blackcontext = this.blackElement.getContext('2d');
        // }

        // this.init_board();

    },
    methods: {

        // modify(){
        //     this.play_out++;
        // },


        // onClick(e) {
        //         if (this.chessboardDisabled) {
        //             return
        //         }
        //         let x = e.offsetX
        //         let y = e.offsetY
        //         let i = Math.floor(x / d)
        //         let j = Math.floor(y / d)
        //         if (!this.hasStep(i, j)) {
        //             this.chess(i, j)
        //             makeStep(this.roomId, i, j)
        //         }
        //     },
        onRetract() {
            this.waitResponse = true
            this.$message.info(this.$t('lang.chessboard.message.retractSent'))
            retractStep(this.roomId, this.$store.getters.player.id, 1)
        },
        onExit() {
            this.$store.dispatch('removeTab', this.roomId)

            if (this.$store.getters.player.id === this.$store.getters.matchDetails.host.id) {
                delRoom(this.roomId)
                // 设置对手
                // this.$store.dispatch('setChallenger', {})
            } else {

                leaveRoom(this.roomId, this.$store.getters.player.id)
            }
            setPlayerStatus("leisure")
        },
        onSurrender() {
            surrender(this.roomId)
            if (this.myColor == 0) {
                gameOver(this.roomId, this.$store.getters.matchDetails, 'black', 'surrender')
            }
            else if (this.myColor == 1) {
                gameOver(this.roomId, this.$store.getters.matchDetails, 'white', 'surrender')
            }
        },
        // onDraw() {
        //     this.waitResponse = true
        //     this.$message.info(this.$t('lang.chessboard.message.drawSent'))
        //     askDraw(this.roomId, 1)
        // },

        // handlePlayGame(){
        //     this.blackcontext.clearRect(0, 0, this.width, this.height);
        //     this.whitecontext.clearRect(0, 0, this.width, this.height);
        //     this.arr = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, -1, -1, -1, 0], [0, -1, 0, -1, 0], [0, -1, -1, -1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
        //     this.init_board();
        //     this.play_out==0;
        //     this.states = [];
        //     let player_json = JSON.stringify({"player":this.value});
        //     console.log(player_json);
        //     // beginGame(player_json).then((data)=>{
        //     //     if(data.data.result){
        //     //         this.blackcontext.clearRect(0, 0, this.width, this.height);
        //     //         this.whitecontext.clearRect(0, 0, this.width, this.height);
        //     //         this.arr = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, -1, -1, -1, 0], [0, -1, 0, -1, 0], [0, -1, -1, -1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
        //     //         this.init_board();
        //     //         alert(data.data.result);
        //     //     }else if(data.data.bot_move){
        //     //         let arrX = -1;
        //     //         let arrY = -1;
        //     //         let arrX_ = -1;
        //     //         let arrY_ = -1;
        //     //         let moves = data.data.bot_move.split("");
        //     //         arrX = parseInt(moves[0]);
        //     //         arrY = parseInt(moves[1]);
        //     //         arrX_ = parseInt(moves[2]);
        //     //         arrY_ = parseInt(moves[3]);

        //     //         this.modify_arr(arrX, arrY, 0);
        //     //         this.modify_arr(arrX_, arrY_, 1);

        //     //         // 处理跳

        //     //         if (this.is_jump(arrX, arrY, arrX_, arrY_)) {
        //     //                     // 需要删除中间的棋子
        //     //                     // console.log("跳");
        //     //                     // const distance = Math.sqrt(Math.pow(Math.abs(this.stone.x - arrX), 2) + Math.pow((Math.abs(this.stone.y - arrY)), 2));
        //     //                     const coord = arrX * 5 + arrY;
        //     //                     const coord_ = arrX_ * 5 + arrY_;
        //     //                     // this.modify_arr(this.stone.x, this.stone.y, 0);
        //     //                     const coord_eat = ((coord + coord_) / 2) | 0
        //     //                     // console.log(coord_eat);

        //     //                     this.modify_arr(coord_eat / 5 | 0, coord_eat % 5 | 0, 0);
        //     //                     this.eat_chess++;
        //     //                     // this.modify_arr(arrX, arrY, 1);

        //     //                     // console.log(this.arr);

        //     //                     this.play_out++;

        //     //                     // 刷新白的棋子
        //     //                     this.whitecontext.clearRect(0, 0, this.width, this.height);

        //     //                     //    this.drawboard();
        //     //                     this.init_white_board();
        //     //         }

        //     //         // 跳完
        //     //         this.blackcontext.clearRect(0, 0, this.width, this.height);

        //     //         //    this.drawboard();
        //     //         this.init_black_board();


        //     //         this.isStone = false;
        //     //         // this.stone.x = -1;
        //     //         // this.stone.y = -1;
        //     //         this.play_out++;
        //     //         this.isBlack = !this.isBlack;
        //     //         this.blackElement.style.zIndex = 2;
        //     //         this.whiteElement.style.zIndex = 3;
        //     //     }

        //     // });
        // },


        //  人机对弈 api
        // handleSelectMove(state){
        //     // console.log("请求");

        //     // let state_json = JSON.stringify(state);
        //     // console.log(state_json);
        //     // selectMove(state_json).then((data)=>{
        //     //     console.log(data.data.bot_move);

        //     //     let bot_move_str = data.data.bot_move;
        //     //     let arrX = -1;
        //     //     let arrY = -1;
        //     //     let arrX_ = -1;
        //     //     let arrY_ = -1;
        //     //     if(bot_move_str.length == 2){ // 只能是白棋
        //     //         let moves = data.data.bot_move.split("");
        //     //         console.log(moves);

        //     //         arrX = parseInt(moves[0]);
        //     //         arrY = parseInt(moves[1]);

        //     //         this.modify_arr(arrX, arrY, -1);

        //     //     }else if(bot_move_str.length == 4){ // 黑棋
        //     //         let moves = data.data.bot_move.split("");
        //     //         arrX = parseInt(moves[0]);
        //     //         arrY = parseInt(moves[1]);
        //     //         arrX_ = parseInt(moves[2]);
        //     //         arrY_ = parseInt(moves[3]);

        //     //         this.modify_arr(arrX, arrY, 0);
        //     //         this.modify_arr(arrX_, arrY_, 1);

        //     //         // 处理跳

        //     //         if (this.is_jump(arrX, arrY, arrX_, arrY_)) {
        //     //                     // 需要删除中间的棋子
        //     //                     console.log("跳");
        //     //                     // const distance = Math.sqrt(Math.pow(Math.abs(this.stone.x - arrX), 2) + Math.pow((Math.abs(this.stone.y - arrY)), 2));
        //     //                     const coord = arrX * 5 + arrY;
        //     //                     const coord_ = arrX_ * 5 + arrY_;
        //     //                     // this.modify_arr(this.stone.x, this.stone.y, 0);
        //     //                     const coord_eat = ((coord + coord_) / 2) | 0
        //     //                     // console.log(coord_eat);

        //     //                     this.modify_arr(coord_eat / 5 | 0, coord_eat % 5 | 0, 0);
        //     //                     this.eat_chess++;
        //     //                     // this.modify_arr(arrX, arrY, 1);

        //     //                     // console.log(this.arr);

        //     //                     this.play_out++;

        //     //                     // 刷新白的棋子
        //     //                     this.whitecontext.clearRect(0, 0, this.width, this.height);

        //     //                     //    this.drawboard();
        //     //                     this.init_white_board();
        //     //         }

        //     //         // 跳完
        //     //         this.blackcontext.clearRect(0, 0, this.width, this.height);

        //     //         //    this.drawboard();
        //     //         this.init_black_board();


        //     //         this.isStone = false;
        //     //         // this.stone.x = -1;
        //     //         // this.stone.y = -1;
        //     //         this.play_out++;
        //     //         // this.isBlack = !this.isBlack;
        //     //         this.blackElement.style.zIndex = 2;
        //     //         this.whiteElement.style.zIndex = 3;
        //     //     }


        //     //     // 修改数据和ui
        //     //     // this.modify_arr(arrX, arrY, -1);
        //     //     console.log(this.arr);

        //     //     // 修改ui
        //     //     // this.draw_chess((arrY+1)*this.current,(arrX+1)*this.current,'#fff'); //添加白
        //     //     // this.boardElement.width = 6*this.current;
        //     //     this.whitecontext.clearRect(0, 0, this.width, this.height);

        //     //     // this.drawboard();
        //     //     this.init_white_board();
        //     //     this.isBlack = !this.isBlack;
        //     //     this.play_out++;
        //     //     // state: { board: Array, move: '', eat: '', player: 0, winner: 0, play_out:0},
        //     //     this.modify_state(String(arrX) + String(arrY), '-1', -1, 0, this.play_out);
        //     //     // 发送请求
        //     //     // this.isBlack = !this.isBlack;
        //     //     this.blackElement.style.zIndex = 3;
        //     //     this.whiteElement.style.zIndex = 2;
        //     //     return;



        //     // })
        // },




        drawboard() {
            // let canvas = document.createElement('canvas');

            // canvas.width = 6*this.current;
            // canvas.height = 10*this.current;
            // document.body.append(canvas);
            // let context = canvas.getContext('2d');
            // 画棋盘

            if (this.boardcontext != null) {
                for (let i = 3; i < 8; i++) {
                    // 划线
                    this.boardcontext.moveTo(this.current, this.current * i);
                    this.boardcontext.lineTo(5 * this.current, this.current * i);
                    this.boardcontext.stroke();
                }

                for (let i = 1; i < 6; i++) {
                    // 划线
                    this.boardcontext.moveTo(this.current * i, this.current * 3);
                    this.boardcontext.lineTo(this.current * i, 7 * this.current);
                    if (i == 3) {
                        this.boardcontext.moveTo(this.current * 3, this.current);
                        this.boardcontext.lineTo(this.current * 3, this.current * 9);
                    }
                    this.boardcontext.stroke();
                }

                this.boardcontext.moveTo(this.current, this.current);
                this.boardcontext.lineTo(5 * this.current, this.current);
                // this.context.stroke();

                this.boardcontext.moveTo(this.current * 2, this.current * 2);
                this.boardcontext.lineTo(4 * this.current, this.current * 2);
                // this.context.stroke();



                this.boardcontext.moveTo(this.current * 2, this.current * 8);
                this.boardcontext.lineTo(4 * this.current, this.current * 8);
                // this.context.stroke();

                this.boardcontext.moveTo(this.current, this.current * 9);
                this.boardcontext.lineTo(5 * this.current, this.current * 9);
                // this.context.stroke();

                this.boardcontext.moveTo(this.current, this.current);
                this.boardcontext.lineTo(this.current * 5, this.current * 5);
                // this.context.stroke();
                this.boardcontext.moveTo(this.current * 5, this.current);
                this.boardcontext.lineTo(this.current, this.current * 5);
                // this.context.stroke();
                this.boardcontext.moveTo(this.current, this.current * 3);
                this.boardcontext.lineTo(this.current * 5, this.current * 7);
                // this.context.stroke();
                this.boardcontext.moveTo(this.current * 5, this.current * 3);
                this.boardcontext.lineTo(this.current, this.current * 7);
                // this.context.stroke();

                this.boardcontext.moveTo(this.current, this.current * 5);
                this.boardcontext.lineTo(this.current * 5, this.current * 9);
                // this.context.stroke();
                this.boardcontext.moveTo(this.current * 5, this.current * 5);
                this.boardcontext.lineTo(this.current, this.current * 9);
                this.boardcontext.stroke();

            }

        },

        init_board() {
            if (this.boardcontext != null) {
                this.boardcontext.clearRect(0, 0, this.width, this.height);
                this.drawboard();
                for (let i = 0; i < this.arr.length; i++) {
                    for (let j = 0; j < this.arr[0].length; j++) {
                        // console.log(i,j);
                        let x = this.current * (j + 1);
                        let y = this.current * (i + 1);
                        // this.context.arc(x,y,10,0,2*Math.PI);
                        if (this.arr[i][j] === 1) {
                            this.boardcontext.beginPath();
                            // console.log(i, j);
                            this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);

                            let g = this.boardcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
                            g.addColorStop(0, '#ccc');
                            g.addColorStop(1, '#000');
                            this.boardcontext.fillStyle = g;
                            this.boardcontext.fill();
                            // this.boardcontext.stroke();
                            this.boardcontext.closePath();
                        }
                        if (this.arr[i][j] === -1) {
                            this.boardcontext.beginPath();
                            this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);
                            let g = this.boardcontext.createRadialGradient(x + 5, y + 5, 0, x + 5, y + 5, 10);
                            g.addColorStop(0, '#666');
                            g.addColorStop(1, '#fff');
                            this.boardcontext.fillStyle = g;
                            this.boardcontext.fill();
                            this.boardcontext.closePath();
                            // this.boardcontext.stroke();
                        }

                    }
                }
            }
        },


        init_remain_board(origin_x, origin_y, color) {
            for (let i = 0; i < this.arr.length; i++) {
                for (let j = 0; j < this.arr[0].length; j++) {
                    // console.log(i,j);
                    let x = this.current * (j + 1);
                    let y = this.current * (i + 1);
                    // this.context.arc(x,y,10,0,2*Math.PI);
                    if (i != origin_x || j != origin_y) {
                        if (color == '#000') {
                            if (this.arr[i][j] === 1) {
                                this.boardcontext.beginPath();
                                // console.log(i, j);
                                this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);

                                let g = this.boardcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
                                g.addColorStop(0, '#ccc');
                                g.addColorStop(1, '#000');
                                this.boardcontext.fillStyle = g;
                                this.boardcontext.fill();
                                this.boardcontext.closePath();
                            }
                        } else if (color == '#fff') {
                            if (this.arr[i][j] === -1) {
                                this.boardcontext.beginPath();
                                this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);
                                let g = this.boardcontext.createRadialGradient(x + 5, y + 5, 0, x + 5, y + 5, 10);
                                g.addColorStop(0, '#666');
                                g.addColorStop(1, '#fff');
                                this.boardcontext.fillStyle = g;
                                this.boardcontext.fill();
                                this.boardcontext.closePath();
                            }
                        }


                    }

                }
            }

        },

        // init_white_board() {
        //     if (this.whitecontext != null) {
        //         for (let i = 0; i < this.arr.length; i++) {
        //             for (let j = 0; j < this.arr[0].length; j++) {
        //                 // console.log(i,j);
        //                 let x = this.current * (j + 1);
        //                 let y = this.current * (i + 1);
        //                 // this.context.arc(x,y,10,0,2*Math.PI);
        //                 // if(this.arr[i][j] === 1){
        //                 //     this.blackcontext.beginPath();
        //                 //     // console.log(i, j);
        //                 //     this.blackcontext.arc(x,y,10,0,2*Math.PI);

        //                 //     let g = this.blackcontext.createRadialGradient(x-5,y-5,0,x-5,y-5,10);
        //                 //     g.addColorStop(0,'#ccc');
        //                 //     g.addColorStop(1,'#000');
        //                 //     this.blackcontext.fillStyle = g;
        //                 //     this.blackcontext.fill();
        //                 //     this.blackcontext.closePath();
        //                 // }
        //                 if (this.arr[i][j] === -1) {
        //                     this.whitecontext.beginPath();
        //                     this.whitecontext.arc(x, y, 10, 0, 2 * Math.PI);
        //                     let g = this.whitecontext.createRadialGradient(x + 5, y + 5, 0, x + 5, y + 5, 10);
        //                     g.addColorStop(0, '#666');
        //                     g.addColorStop(1, '#fff');
        //                     this.whitecontext.fillStyle = g;
        //                     this.whitecontext.fill();
        //                     this.whitecontext.closePath();
        //                 }

        //             }
        //         }
        //     }
        // },

        // init_black_board() {
        //     if (this.blackcontext != null) {
        //         for (let i = 0; i < this.arr.length; i++) {
        //             for (let j = 0; j < this.arr[0].length; j++) {
        //                 // console.log(i,j);
        //                 let x = this.current * (j + 1);
        //                 let y = this.current * (i + 1);
        //                 // this.context.arc(x,y,10,0,2*Math.PI);
        //                 if (this.arr[i][j] === 1) {
        //                     this.blackcontext.beginPath();
        //                     // console.log(i, j);
        //                     this.blackcontext.arc(x, y, 10, 0, 2 * Math.PI);

        //                     let g = this.blackcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
        //                     g.addColorStop(0, '#ccc');
        //                     g.addColorStop(1, '#000');
        //                     this.blackcontext.fillStyle = g;
        //                     this.blackcontext.fill();
        //                     this.blackcontext.closePath();
        //                 }
        //                 // if(this.arr[i][j] === -1){
        //                 //     this.whitecontext.beginPath();
        //                 //     this.whitecontext.arc(x,y,10,0,2*Math.PI);
        //                 //     let g = this.whitecontext.createRadialGradient(x+5,y+5,0,x+5,y+5,10);
        //                 //     g.addColorStop(0,'#666');
        //                 //     g.addColorStop(1,'#fff');
        //                 //     this.whitecontext.fillStyle = g;
        //                 //     this.whitecontext.fill();
        //                 //     this.whitecontext.closePath();
        //                 // }

        //             }
        //         }
        //     }
        // },


        modify_arr(x, y, z) {
            const row = this.arr[x];
            if (row) {
                // 使用 this.$set 修改对象的属性  
                this.$set(row, y, z);
            }

        },

        init_shadow_board(arrX, arrY) {
            if (this.boardcontext != null) {
                this.init_board()
                for (let i = 0; i < this.arr.length; i++) {
                    for (let j = 0; j < this.arr[0].length; j++) {
                        // console.log(i,j);
                        let x = this.current * (j + 1);
                        let y = this.current * (i + 1);
                        // this.context.arc(x,y,10,0,2*Math.PI);
                        if (this.arr[i][j] === 1 && i == arrX && j == arrY) {

                            this.boardcontext.shadowColor = 'rgba(255, 255, 255, 0.5)'; // 阴影颜色  
                            this.boardcontext.shadowOffsetX = 5; // 阴影水平偏移量  
                            this.boardcontext.shadowOffsetY = 5; // 阴影垂直偏移量  
                            this.boardcontext.shadowBlur = 8; // 阴影模糊度

                            this.boardcontext.beginPath();
                            // console.log(i, j);
                            this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);

                            let g = this.boardcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
                            g.addColorStop(0, '#ccc');
                            g.addColorStop(1, '#000');
                            this.boardcontext.fillStyle = g;
                            this.boardcontext.fill();
                            this.boardcontext.closePath();

                            // 清除阴影设置，以便后续绘图不受影响（如果需要的话）  
                            this.boardcontext.shadowColor = 'transparent';
                            this.boardcontext.shadowOffsetX = 0;
                            this.boardcontext.shadowOffsetY = 0;
                            this.boardcontext.shadowBlur = 0;


                        }
                        else if (this.arr[i][j] === 1) {
                            this.boardcontext.beginPath();
                            // console.log(i, j);
                            this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);

                            let g = this.boardcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
                            g.addColorStop(0, '#ccc');
                            g.addColorStop(1, '#000');
                            this.boardcontext.fillStyle = g;
                            this.boardcontext.fill();
                            this.boardcontext.closePath();
                        }

                        // if(this.arr[i][j] === -1){
                        //     this.whitecontext.beginPath();
                        //     this.whitecontext.arc(x,y,10,0,2*Math.PI);
                        //     let g = this.whitecontext.createRadialGradient(x+5,y+5,0,x+5,y+5,10);
                        //     g.addColorStop(0,'#666');
                        //     g.addColorStop(1,'#fff');
                        //     this.whitecontext.fillStyle = g;
                        //     this.whitecontext.fill();
                        //     this.whitecontext.closePath();
                        // }

                    }
                }
            }
        },




        // init_black_shadow_board(arrX, arrY) {
        //     if (this.blackcontext != null) {
        //         for (let i = 0; i < this.arr.length; i++) {
        //             for (let j = 0; j < this.arr[0].length; j++) {
        //                 // console.log(i,j);
        //                 let x = this.current * (j + 1);
        //                 let y = this.current * (i + 1);
        //                 // this.context.arc(x,y,10,0,2*Math.PI);
        //                 if (this.arr[i][j] === 1 && i == arrX && j == arrY) {

        //                     this.blackcontext.shadowColor = 'rgba(255, 255, 255, 0.5)'; // 阴影颜色  
        //                     this.blackcontext.shadowOffsetX = 5; // 阴影水平偏移量  
        //                     this.blackcontext.shadowOffsetY = 5; // 阴影垂直偏移量  
        //                     this.blackcontext.shadowBlur = 8; // 阴影模糊度

        //                     this.blackcontext.beginPath();
        //                     // console.log(i, j);
        //                     this.blackcontext.arc(x, y, 10, 0, 2 * Math.PI);

        //                     let g = this.blackcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
        //                     g.addColorStop(0, '#ccc');
        //                     g.addColorStop(1, '#000');
        //                     this.blackcontext.fillStyle = g;
        //                     this.blackcontext.fill();
        //                     this.blackcontext.closePath();

        //                     // 清除阴影设置，以便后续绘图不受影响（如果需要的话）  
        //                     this.blackcontext.shadowColor = 'transparent';
        //                     this.blackcontext.shadowOffsetX = 0;
        //                     this.blackcontext.shadowOffsetY = 0;
        //                     this.blackcontext.shadowBlur = 0;


        //                 }
        //                 else if (this.arr[i][j] === 1) {
        //                     this.blackcontext.beginPath();
        //                     // console.log(i, j);
        //                     this.blackcontext.arc(x, y, 10, 0, 2 * Math.PI);

        //                     let g = this.blackcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
        //                     g.addColorStop(0, '#ccc');
        //                     g.addColorStop(1, '#000');
        //                     this.blackcontext.fillStyle = g;
        //                     this.blackcontext.fill();
        //                     this.blackcontext.closePath();
        //                 }

        //                 // if(this.arr[i][j] === -1){
        //                 //     this.whitecontext.beginPath();
        //                 //     this.whitecontext.arc(x,y,10,0,2*Math.PI);
        //                 //     let g = this.whitecontext.createRadialGradient(x+5,y+5,0,x+5,y+5,10);
        //                 //     g.addColorStop(0,'#666');
        //                 //     g.addColorStop(1,'#fff');
        //                 //     this.whitecontext.fillStyle = g;
        //                 //     this.whitecontext.fill();
        //                 //     this.whitecontext.closePath();
        //                 // }

        //             }
        //         }
        //     }
        // },


        // init_white_shadow_board(arrX, arrY) {
        //     if (this.whitecontext != null) {
        //         for (let i = 0; i < this.arr.length; i++) {
        //             for (let j = 0; j < this.arr[0].length; j++) {
        //                 // console.log(i,j);
        //                 let x = this.current * (j + 1);
        //                 let y = this.current * (i + 1);
        //                 // this.context.arc(x,y,10,0,2*Math.PI);
        //                 // if(this.arr[i][j] === 1){
        //                 //     this.blackcontext.beginPath();
        //                 //     // console.log(i, j);
        //                 //     this.blackcontext.arc(x,y,10,0,2*Math.PI);

        //                 //     let g = this.blackcontext.createRadialGradient(x-5,y-5,0,x-5,y-5,10);
        //                 //     g.addColorStop(0,'#ccc');
        //                 //     g.addColorStop(1,'#000');
        //                 //     this.blackcontext.fillStyle = g;
        //                 //     this.blackcontext.fill();
        //                 //     this.blackcontext.closePath();
        //                 // }
        //                 if (this.arr[i][j] === -1 && i == arrX && j == arrY) {

        //                     this.blackcontext.shadowColor = 'rgba(0, 0, 0, 0.5)'; // 阴影颜色  
        //                     this.blackcontext.shadowOffsetX = 5; // 阴影水平偏移量  
        //                     this.blackcontext.shadowOffsetY = 5; // 阴影垂直偏移量  
        //                     this.blackcontext.shadowBlur = 8; // 阴影模糊度

        //                     this.whitecontext.beginPath();
        //                     this.whitecontext.arc(x, y, 10, 0, 2 * Math.PI);
        //                     let g = this.whitecontext.createRadialGradient(x + 5, y + 5, 0, x + 5, y + 5, 10);
        //                     g.addColorStop(0, '#666');
        //                     g.addColorStop(1, '#fff');
        //                     this.whitecontext.fillStyle = g;
        //                     this.whitecontext.fill();
        //                     this.whitecontext.closePath();

        //                     // 清除阴影设置，以便后续绘图不受影响（如果需要的话）  
        //                     this.blackcontext.shadowColor = 'transparent';
        //                     this.blackcontext.shadowOffsetX = 0;
        //                     this.blackcontext.shadowOffsetY = 0;
        //                     this.blackcontext.shadowBlur = 0;


        //                 } else if (this.arr[i][j] === -1) {
        //                     this.whitecontext.beginPath();
        //                     this.whitecontext.arc(x, y, 10, 0, 2 * Math.PI);
        //                     let g = this.whitecontext.createRadialGradient(x + 5, y + 5, 0, x + 5, y + 5, 10);
        //                     g.addColorStop(0, '#666');
        //                     g.addColorStop(1, '#fff');
        //                     this.whitecontext.fillStyle = g;
        //                     this.whitecontext.fill();
        //                     this.whitecontext.closePath();
        //                 }

        //             }
        //         }
        //     }
        // },

        modify_state(m, e, p, w, play_count) {
            this.$set(this.state, "board", this.arr);
            this.$set(this.state, "move", m + "");
            this.$set(this.state, "eat", e + '');
            this.$set(this.state, "player", p);
            this.$set(this.state, "winner", w);
            this.$set(this.state, "play_out", play_count);
            this.$set(this.state, "eat_c", this.eat_chess);
            // console.log("state", this.state);

            this.states.push(this.state);
            // this.states.at.push(this.state);

            // console.log(this.states);

        },


        neighbors(coord) {
            // let coord = row * 9 + col; // 22 2,4
            // console.log(coord);
            let row = Math.floor(coord / 9) // 4
            let col = (coord % 9) // 8

            // console.log(row,col);

            if (coord === 0) {
                return [
                    [row + 2, col],
                    [row + 1, col + 1],
                    [row + 4, col],
                    [row + 2, col + 2],

                ];
            } else if (coord === 2) {
                return [
                    [row + 1, col],
                    [row + 1, col + 1],
                    [row, col + 1],
                    [row + 2, col],
                    [row + 2, col + 2],
                    [row, col + 2],
                ];
            } else if (coord === 8) {
                return [
                    [row + 2, col],
                    [row + 1, col - 1],
                    [row + 4, col],
                    [row + 2, col - 2],
                ];
            } else if (coord === 10) {
                return [
                    [row + 1, col],
                    [row + 1, col + 1],
                    [row - 1, col - 1],
                    [row + 2, col],
                    [row + 2, col + 2],

                ];
            } else if (coord === 16) {
                return [
                    [row + 1, col],
                    [row - 1, col + 1],
                    [row + 1, col - 1],
                    [row + 2, col],
                    [row + 2, col - 2],

                ];
            } else if (coord === 18) {
                return [
                    [row + 2, col],
                    [row, col + 1],
                    [row - 2, col],
                    [row, col + 2],

                ];
            } else if (coord === 19) {
                return [
                    [row + 1, col],
                    [row, col + 1],
                    [row - 1, col],
                    [row, col - 1],
                    [row, col + 2],

                ];
            } else if (coord === 25) {
                return [
                    [row + 1, col],
                    [row, col + 1],
                    [row - 1, col],
                    [row, col - 1],
                    [row, col - 2],

                ];
            } else if (coord === 26) {
                return [
                    [row + 2, col],
                    [row - 2, col],
                    [row, col - 1],
                    [row, col - 2],

                ];
            } else if (coord === 28) {
                return [
                    [row - 1, col + 1],
                    [row - 1, col],
                    [row + 1, col - 1],
                    [row - 2, col + 2],
                    [row - 2, col],

                ];
            } else if (coord === 29) {
                return [
                    [row + 1, col],
                    [row, col + 1],
                    [row - 1, col],
                    [row, col + 2],
                    [row - 2, col],

                ];
            } else if (coord === 33) {
                return [
                    [row + 1, col],
                    [row - 1, col],
                    [row, col - 1],
                    [row - 2, col],
                    [row, col - 2],

                ];
            } else if (coord === 34) {
                return [
                    [row + 1, col + 1],
                    [row - 1, col],
                    [row - 1, col - 1],
                    [row - 2, col],
                    [row - 2, col - 2],

                ];
            } else if (coord === 36) {
                return [
                    [row - 1, col + 1],
                    [row - 2, col],
                    [row - 2, col + 2],
                    [row - 4, col],

                ];
            } else if (coord === 38) {
                return [
                    [row, col + 1],
                    [row - 1, col + 1],
                    [row - 1, col],
                    [row, col + 2],
                    [row - 2, col + 2],
                    [row - 2, col],

                ];
            } else if (coord === 42) {
                return [
                    [row - 1, col],
                    [row - 1, col - 1],
                    [row, col - 1],
                    [row - 2, col],
                    [row - 2, col - 2],
                    [row, col - 2],

                ];
            } else if (coord === 44) {
                return [
                    [row - 2, col],
                    [row - 1, col - 1],
                    [row - 4, col],
                    [row - 2, col - 2],

                ];
            } else {
                return [
                    [row + 1, col],
                    [row + 1, col + 1],
                    [row, col + 1],
                    [row - 1, col + 1],
                    [row - 1, col],
                    [row - 1, col - 1],
                    [row, col - 1],
                    [row + 1, col - 1],
                    [row + 2, col],
                    [row + 2, col + 2],
                    [row, col + 2],
                    [row - 2, col + 2],
                    [row - 2, col],
                    [row - 2, col - 2],
                    [row, col - 2],
                    [row + 2, col - 2],

                ];
            }
        },

        legal_pos(arr_) {
            // 0 为row,1为col
            let temp = arr_[0]
            arr_[0] = arr_[1]
            arr_[1] = temp
            if (arr_[0] >= 0 && arr_[1] >= 0 && arr_[0] < 9 && arr_[1] < 5) {
                if ((arr_[0] != 0 && arr_[1] != 1) || (arr_[0] != 0 && arr_[1] != 3) || (arr_[0] != 1 && arr_[1] != 0) || (arr_[0] != 1 && arr_[1] != 4) || (arr_[0] != 7 && arr_[1] != 0) || (arr_[0] != 7 && arr_[1] != 4) || (arr_[0] != 8 && arr_[1] != 1) || (arr_[0] != 8 && arr_[1] != 3)) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        },

        legal_black(e) {
            // 判断黑棋的位置
            // 需要判断黑棋的位置
            // console.log(this.arr);
            let kings = []
            for (let i = 0; i < this.arr.length; i++) {
                for (let j = 0; j < this.arr[i].length; j++) {
                    if (this.arr[i][j] == 1) {
                        // console.log(i,j);   
                        kings.push(i + j * 9)
                    }
                }
            }
            // console.log(kings);

            let count = 0
            let neighbors_sum = 0
            for (let i = 0; i < kings.length; i++) {
                // kings
                //继续
                let neighbors = this.neighbors(kings[i])
                // console.log(neighbors);
                for (let j = 0; j < neighbors.length; j++) {
                    if (this.legal_pos(neighbors[j])) {
                        neighbors_sum++
                        if (this.arr[neighbors[j][0]][neighbors[j][1]] != 0) {
                            count++
                        }
                    }
                }
            }
            // console.log(neighbors_sum);
            // console.log(count);
            if (count === neighbors_sum) {

                // this.$alert('游戏结束,白棋胜利');
                // if()
                gameOver(this.roomId, this.$store.getters.matchDetails, 'white', 'no_move')

                e.preventDefault();
                e.stopPropagation();

                return;

            }


        },



        legal_kings() {
            // 判断黑棋的位置
            // 需要判断黑棋的位置
            // console.log(this.arr);
            let kings = []
            for (let i = 0; i < this.arr.length; i++) {
                for (let j = 0; j < this.arr[i].length; j++) {
                    if (this.arr[i][j] == 1) {
                        // console.log(i,j);   
                        kings.push(i + j * 9)
                    }
                }
            }
            // console.log(kings);

            let count = 0
            let neighbors_sum = 0
            for (let i = 0; i < kings.length; i++) {
                // kings
                //继续
                let neighbors = this.neighbors(kings[i])
                // console.log(neighbors);
                for (let j = 0; j < neighbors.length; j++) {
                    if (this.legal_pos(neighbors[j])) {
                        neighbors_sum++
                        if (this.arr[neighbors[j][0]][neighbors[j][1]] != 0) {
                            count++
                        }
                    }
                }
            }
            // console.log(neighbors_sum);
            // console.log(count);
            if (count === neighbors_sum) {

                // this.$alert('游戏结束,白棋胜利');
                // if()
                gameOver(this.roomId, this.$store.getters.matchDetails, 'white', 'no_move')



                return;

            }


        },




        handleclick(e) {


            // check
            if (this.chessboardDisabled) {
                return
            }
            // console.log('playout');
            // console.log(this.play_out);

            // this.modify();
            // console.log(this.play_out);

            let { offsetX, offsetY } = e;

            // console.log(e.offsetX,e.offsetY);
            let half = this.current / 2;

            if (offsetX < 25 || offsetY < 25 || offsetY > (this.current * 10) - this.current / 2 || offsetX > (this.current * 6) - this.current / 2) {
                return;
            }
            // 2
            if (offsetX < 2 * this.current - half && half + this.current < offsetY && offsetY < 2 * this.current + half) {
                return;
            }

            if (offsetX > 4 * this.current + half && half + this.current < offsetY && offsetY < 2 * this.current + half) {
                return;
            }
            //8
            if (offsetX < 2 * this.current - half && half + this.current * 7 < offsetY && offsetY < 8 * this.current + half) {
                return;
            }

            if (offsetX > 4 * this.current + half && half + this.current * 7 < offsetY && offsetY < 8 * this.current + half) {
                return;
            }


            if (offsetX > this.current + half && offsetX < (3 * this.current) - half && half < offsetY && offsetY < this.current + half) {
                return;
            }

            if (offsetX > this.current * 3 + half && offsetX < (5 * this.current) - half && half < offsetY && offsetY < this.current + half) {
                return;
            }

            // 9
            if (offsetX > this.current + half && offsetX < (3 * this.current) - half && this.current * 9 - half < offsetY && offsetY < this.current * 9 + half) {
                return;
            }

            if (offsetX > this.current * 3 + half && offsetX < (5 * this.current) - half && this.current * 9 - half < offsetY && offsetY < this.current * 9 + half) {
                return;
            }



            let x = Math.floor((offsetX + half) / this.current) * this.current;
            let y = Math.floor((offsetY + half) / this.current) * this.current;



            let arrX = (y / this.current) - 1;

            let arrY = (x / this.current) - 1;

            // console.log('this myColor');

            // console.lo

            // 接续写
            if (this.myColor == 0) {
                if (this.arr[arrX][arrY] == 1 && !this.isStone) { // 黑棋点击的第一次
                    this.boardcontext.clearRect(0, 0, this.width, this.height);
                    this.init_shadow_board(arrX, arrY);
                    // this.init_board();
                    this.isStone = true;
                    this.stone = { x: arrX, y: arrY }
                    // console.log(this.isPlaying);
                    if (this.isPlaying) {
                        this.$refs.down.play()
                    }
                    return;
                }
                // 黑棋第一走子完

                // 判断黑子走的第二个位置
                if (this.isStone && this.stone.x != -1 && this.stone.y != -1) { // 有子
                    // console.log('有子');
                    if (this.arr[this.stone.x][this.stone.y] == 1) { // 黑棋

                        if (this.arr[arrX][arrY] == -1) { // 判断这一步是不是白棋上
                            this.$message.error("不能落在白子上");
                            this.stone = { x: -1, y: -1 };
                            this.isStone = false;
                            this.boardcontext.clearRect(0, 0, this.width, this.height);
                            this.init_board();
                            return;
                        }

                        if (this.arr[arrX][arrY] == 1) {
                            this.$message.info("走子取消");
                            this.stone = { x: -1, y: -1 };
                            this.isStone = false;
                            this.boardcontext.clearRect(0, 0, this.width, this.height);
                            this.init_board();
                            return;
                        }


                        // 判断规则

                        const distance = Math.sqrt(Math.pow(Math.abs(this.stone.x - arrX), 2) + Math.pow((Math.abs(this.stone.y - arrY)), 2));

                        if (this.is_legal(this.stone.x, this.stone.y, arrX, arrY) && distance <= 2 * Math.sqrt(2) || this.is_legal(this.stone.x, this.stone.y, arrX, arrY) && distance == 4) {

                            // 判断规则结束
                            // if 合法
                            if (this.is_jump(this.stone.x, this.stone.y, arrX, arrY)) {
                                // 需要删除中间的棋子
                                // console.log("跳");

                                // const distance = Math.sqrt(Math.pow(Math.abs(this.stone.x - arrX), 2) + Math.pow((Math.abs(this.stone.y - arrY)), 2));
                                const coord = this.stone.x * 5 + this.stone.y;
                                const coord_ = arrX * 5 + arrY;
                                this.modify_arr(this.stone.x, this.stone.y, 0);
                                const coord_eat = ((coord + coord_) / 2) | 0
                                // console.log(coord_eat);

                                this.modify_arr(coord_eat / 5 | 0, coord_eat % 5 | 0, 0);
                                this.eat_chess++;
                                this.modify_arr(arrX, arrY, 1);

                                // console.log(this.arr);

                                this.play_out++;

                                // 刷新棋子
                                this.boardcontext.clearRect(0, 0, this.width, this.height);
                                this.init_board();

                                // 判断胜负
                                if (this.eat_chess >= 11) { // 胜利
                                    // 记录数据
                                    this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), String(coord_eat / 5 | 0) + String(coord_eat % 5 | 0), 1, 1, this.play_out);
                                    // 发送请求


                                    makeStep(this.roomId, this.state, this.$store.getters.player.name)


                                    //游戏结束
                                    // this.$alert('游戏结束,黑方胜');
                                    gameOver(this.roomId, this.$store.getters.matchDetails, 'black', 'eat_11')

                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;

                                }

                                // 跳吃，且没胜利
                                // 记录数据
                                this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), String(coord_eat / 5 | 0) + String(coord_eat % 5 | 0), 1, 0, this.play_out);
                                // 发送请求
                                this.waitResponse = true;

                                makeStep(this.roomId, this.state, this.$store.getters.player.name)

                                if (this.isPlaying) {
                                    this.$refs.down.play()
                                    this.$refs.eat.play()
                                    // ADD 5-16
                                    // this.handleSelectMove(this.state);
                                }

                            } else { // 没有跳

                                const coord = this.stone.x * 5 + this.stone.y;
                                const coord_ = arrX * 5 + arrY;

                                // const mid_chess =  Math.abs(coord+coord_)/2
                                // // console.log(mid_chess);

                                // console.log(mid_chess/5|0,mid_chess%5|0);


                                if ((coord == 0 && coord_ == 2) || (coord == 2 && coord_ == 0) || (coord == 2 && coord_ == 4) || (coord == 4 && coord_ == 2) || (coord == 40 && coord_ == 42) || (coord == 42 && coord_ == 40) || (coord == 42 && coord_ == 44) || (coord == 44 && coord_ == 42) || distance == 1 || distance == Math.sqrt(2)) {

                                    this.modify_arr(this.stone.x, this.stone.y, 0);
                                    // console.log(this.arr);
                                    this.modify_arr(arrX, arrY, 1);
                                    this.play_out++;
                                    // 记录数据
                                    this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), '-1', 1, 0, this.play_out);
                                    // 发送请求
                                    this.waitResponse = true;
                                    makeStep(this.roomId, this.state, this.$store.getters.player.name)

                                    if (this.isPlaying) {
                                        this.$refs.down.play()
                                    }
                                    // this.handleSelectMove(this.state);
                                } else {
                                    this.$message.error('落子不合法');
                                    this.stone = { x: -1, y: -1 };
                                    this.isStone = false;
                                    this.boardcontext.clearRect(0, 0, this.width, this.height);
                                    this.init_board();
                                    return;
                                }

                            }


                            this.boardcontext.clearRect(0, 0, this.width, this.height);
                            this.init_board();


                            this.isStone = false;
                            // this.stone.x = -1;
                            // this.stone.y = -1;
                            this.stone = { x: -1, y: -1 }
                            // this.play_out++;
                            // this.isBlack = !this.isBlack;
                            // this.blackElement.style.zIndex = 2;
                            // this.whiteElement.style.zIndex = 3;

                            return;
                        } else {
                            this.$message.error('落子不合法');
                            this.stone = { x: -1, y: -1 };
                            this.isStone = false;
                            this.boardcontext.clearRect(0, 0, this.width, this.height);
                            this.init_board();
                            return;
                        }


                    }

                }
            }

            if (this.myColor === 1) {



                if (!this.isStone) { // 第一次点击
                    if (this.arr[arrX][arrY] == 0 && this.play_out <= 32) { // 小于32伦

                        this.modify_arr(arrX, arrY, -1);

                        this.boardcontext.clearRect(0, 0, this.width, this.height);
                        this.init_board();

                        this.play_out++;
                        this.modify_state(String(arrX) + String(arrY), "-1", -1, 0, this.play_out);
                        // 发送请求
                        this.waitResponse = true;
                        makeStep(this.roomId, this.state, this.$store.getters.player.name)
                        if (this.isPlaying) {
                            this.$refs.down.play()
                        }
                        this.legal_black(e)

                        return;
                    } else if (this.arr[arrX][arrY] == -1 && this.play_out > 32) {
                        this.boardcontext.clearRect(0, 0, this.width, this.height);
                        this.init_shadow_board(arrX, arrY);
                        // this.init_board();
                        this.isStone = true;
                        this.stone = { x: arrX, y: arrY }
                        // console.log(this.isPlaying);
                        if (this.isPlaying) {
                            this.$refs.down.play()
                        }


                        // console.log('记录白棋');

                        // console.log(this.stone);
                        // console.log('白棋结束');

                        return;
                    }

                }

                // 白棋第二部


                else if (this.isStone && this.stone.x != -1 && this.stone.y != -1) {

                    // console.log(this.isStone);
                    // console.log(this.stone);

                    if (this.arr[this.stone.x][this.stone.y] == -1) {
                        if (this.play_out <= 32) {
                            return;
                        } else {
                            if (this.arr[arrX][arrY] == 1) { // 判断这一步是不是白棋上
                                this.$message.error("不能落在黑子上");
                                this.stone = { x: -1, y: -1 };
                                this.isStone = false;
                                this.boardcontext.clearRect(0, 0, this.width, this.height);
                                this.init_board();


                                return;
                            }

                            if (this.arr[arrX][arrY] == -1) {
                                this.$message.info("走子取消");
                                this.stone = { x: -1, y: -1 };
                                this.isStone = false;
                                this.boardcontext.clearRect(0, 0, this.width, this.height);
                                this.init_board();

                                return;
                            }

                            // 判断合法
                            const distance = Math.sqrt(Math.pow(Math.abs(this.stone.x - arrX), 2) + Math.pow((Math.abs(this.stone.y - arrY)), 2));
                            if(this.is_legal(this.stone.x, this.stone.y, arrX, arrY) && (distance <= Math.sqrt(2)) || (distance === 2 && this.is_legal(this.stone.x, this.stone.y, arrX, arrY))){
                                
                            this.modify_arr(this.stone.x, this.stone.y, 0);
                            this.modify_arr(arrX, arrY, -1);


                            this.play_out++

                            // 修改ui，先执行动画

                            // this.drawRoute(this.stone.x,this.stone.y,arrX,arrY,'#fff')
                            // this.boardElement.width = 6 * this.current;
                            // this.drawRoute((this.stone.x + 1) * this.current, (this.stone.y + 1) * this.current, (arrY + 1) * this.current, (arrX + 1) * this.current, '#fff', this.stone.x, this.stone.y)

                            this.boardcontext.clearRect(0, 0, this.width, this.height);
                            // this.drawboard();
                            this.init_board();


                            // this.isBlack = !this.isBlack;

                            // 记录数据
                            this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), '-1', -1, 0, this.play_out);
                            // 请求

                            this.waitResponse = true;


                            this.isStone = false;
                            // this.stone.x = -1;
                            // this.stone.y = -1;
                            this.stone = { x: -1, y: -1 }



                            makeStep(this.roomId, this.state, this.$store.getters.player.name)
                            if (this.isPlaying) {
                                this.$refs.down.play()
                            }

                            this.legal_black(e)

                            return;

                            }else{
                                this.$message.error('落子不合法');
                                this.stone = { x: -1, y: -1 };
                                this.isStone = false;
                                this.boardcontext.clearRect(0, 0, this.width, this.height);
                                this.init_board();
                                return;
                            }


                        }
                    }
                }





            }



        },




        handleBoard(e) {

            if (this.chessboardDisabled) {
                return
            }

            // this.modify();
            // console.log(this.play_out);

            let { offsetX, offsetY } = e;

            // console.log(e.offsetX,e.offsetY);
            let half = this.current / 2;

            if (offsetX < 25 || offsetY < 25 || offsetY > (this.current * 10) - this.current / 2 || offsetX > (this.current * 6) - this.current / 2) {
                return;
            }
            // 2
            if (offsetX < 2 * this.current - half && half + this.current < offsetY && offsetY < 2 * this.current + half) {
                return;
            }

            if (offsetX > 4 * this.current + half && half + this.current < offsetY && offsetY < 2 * this.current + half) {
                return;
            }
            //8
            if (offsetX < 2 * this.current - half && half + this.current * 7 < offsetY && offsetY < 8 * this.current + half) {
                return;
            }

            if (offsetX > 4 * this.current + half && half + this.current * 7 < offsetY && offsetY < 8 * this.current + half) {
                return;
            }


            if (offsetX > this.current + half && offsetX < (3 * this.current) - half && half < offsetY && offsetY < this.current + half) {
                return;
            }

            if (offsetX > this.current * 3 + half && offsetX < (5 * this.current) - half && half < offsetY && offsetY < this.current + half) {
                return;
            }

            // 9
            if (offsetX > this.current + half && offsetX < (3 * this.current) - half && this.current * 9 - half < offsetY && offsetY < this.current * 9 + half) {
                return;
            }

            if (offsetX > this.current * 3 + half && offsetX < (5 * this.current) - half && this.current * 9 - half < offsetY && offsetY < this.current * 9 + half) {
                return;
            }



            let x = Math.floor((offsetX + half) / this.current) * this.current;
            let y = Math.floor((offsetY + half) / this.current) * this.current;



            let arrX = (y / this.current) - 1;

            let arrY = (x / this.current) - 1;

            // console.log(arrX, arrY);


            // 思路 先判断数组的值，如果数组的值为1，也就是黑色棋子，ui设置透明度，数据并且存储值。

            // if(this[arrX][arrY] == 1 || this[arrX][arrY] == -1){ // 
            // this.isBlack = !this.isBlack;

            if (!this.isStone && this.arr[arrX][arrY] == 0 && this.play_out <= 32 && !this.isBlack) { // 没有子
                // console.log('无子');

                this.modify_arr(arrX, arrY, -1);
                // console.log(this.arr);

                // 修改ui
                // this.draw_chess((arrY+1)*this.current,(arrX+1)*this.current,'#fff'); //添加白
                // this.boardElement.width = 6*this.current;
                this.boardcontext.clearRect(0, 0, this.width, this.height);

                // this.drawboard();
                this.init_board();
                this.isBlack = !this.isBlack;
                this.play_out++;
                // state: { board: Array, move: '', eat: '', player: 0, winner: 0, play_out:0},
                this.modify_state(String(arrX) + String(arrY), "-1", -1, 0, this.play_out);
                // 发送请求
                this.handleSelectMove(this.state);
                // this.isBlack = !this.isBlack;
                // this.blackElement.style.zIndex = 3;
                // this.whiteElement.style.zIndex = 2;
                return;
            } else {
                if (this.isStone && this.stone.x != -1 && this.stone.y != -1 && this.isBlack) { // 有子
                    // console.log('有子');
                    if (this.arr[this.stone.x][this.stone.y] == 1) { // 黑棋

                        if (this.arr[arrX][arrY] == -1) { // 判断这一步是不是白棋上
                            this.$alert("不能落在白子上！！！");
                            this.stone = { x: -1, y: -1 };
                            this.isStone = false;

                            this.boardcontext.clearRect(0, 0, this.width, this.height);

                            //    this.drawboard();
                            this.init_board();

                            return;
                        }

                        if (this.arr[arrX][arrY] == 1) {
                            this.$alert("走子取消");
                            this.stone = { x: -1, y: -1 };
                            this.isStone = false;
                            this.boardcontext.clearRect(0, 0, this.width, this.height);

                            //    this.drawboard();
                            this.init_board();

                            return;
                        }


                        // 判断规则

                        const distance = Math.sqrt(Math.pow(Math.abs(this.stone.x - arrX), 2) + Math.pow((Math.abs(this.stone.y - arrY)), 2));

                        if (this.is_legal(this.stone.x, this.stone.y, arrX, arrY) && distance <= 2 * Math.sqrt(2) || this.is_legal(this.stone.x, this.stone.y, arrX, arrY) && distance == 4) {


                            // 判断规则结束

                            // if 合法
                            if (this.is_jump(this.stone.x, this.stone.y, arrX, arrY)) {
                                // 需要删除中间的棋子
                                // console.log("跳");

                                // const distance = Math.sqrt(Math.pow(Math.abs(this.stone.x - arrX), 2) + Math.pow((Math.abs(this.stone.y - arrY)), 2));
                                const coord = this.stone.x * 5 + this.stone.y;
                                const coord_ = arrX * 5 + arrY;
                                this.modify_arr(this.stone.x, this.stone.y, 0);
                                const coord_eat = ((coord + coord_) / 2) | 0
                                // console.log(coord_eat);

                                this.modify_arr(coord_eat / 5 | 0, coord_eat % 5 | 0, 0);
                                this.eat_chess++;
                                this.modify_arr(arrX, arrY, 1);

                                // console.log(this.arr);

                                this.play_out++;

                                // 刷新白的棋子
                                this.boardcontext.clearRect(0, 0, this.width, this.height);

                                //    this.drawboard();
                                this.init_board();


                                // 判断胜负
                                if (this.eat_chess >= 11) { // 胜利
                                    // 记录数据
                                    this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), String(coord_eat / 5 | 0) + String(coord_eat % 5 | 0), 1, 1, this.play_out);
                                    // 发送请求


                                    //游戏结束
                                    // alert('游戏结束,黑方胜');

                                    e.preventDefault();
                                    e.stopPropagation();

                                    return;

                                }

                                // 跳吃，且没胜利
                                // 记录数据
                                this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), String(coord_eat / 5 | 0) + String(coord_eat % 5 | 0), 1, 0, this.play_out);
                                // 发送请求
                                // ADD 5-16
                                this.handleSelectMove(this.state);


                            } else { // 没有跳

                                const coord = this.stone.x * 5 + this.stone.y;
                                const coord_ = arrX * 5 + arrY;

                                // const mid_chess =  Math.abs(coord+coord_)/2
                                // // console.log(mid_chess);

                                // console.log(mid_chess/5|0,mid_chess%5|0);


                                if ((coord == 0 && coord_ == 2) || (coord == 2 && coord_ == 0) || (coord == 2 && coord_ == 4) || (coord == 4 && coord_ == 2) || (coord == 40 && coord_ == 42) || (coord == 42 && coord_ == 40) || (coord == 42 && coord_ == 44) || (coord == 44 && coord_ == 42) || distance == 1 || distance == Math.sqrt(2)) {

                                    this.modify_arr(this.stone.x, this.stone.y, 0);
                                    // console.log(this.arr);
                                    this.modify_arr(arrX, arrY, 1);
                                    this.play_out++;
                                    // 记录数据
                                    this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), '-1', 1, 0, this.play_out);
                                    // 发送请求
                                    this.handleSelectMove(this.state);
                                } else {
                                    this.$alert('落子不合法');

                                    this.stone = { x: -1, y: -1 };
                                    this.isStone = false;

                                    this.boardcontext.clearRect(0, 0, this.width, this.height);

                                    //    this.drawboard();
                                    this.init_board();


                                    return;
                                }

                            }




                            // this.modify_arr(this.stone.x, this.stone.y, 0);
                            // console.log(this.arr);
                            // this.modify_arr(arrX, arrY, 1);


                            // console.log(this.arr);



                            // this.arr[arrX][arrY] = 1;
                            // 判断吃子



                            // 最后改ui
                            //(this.stone.y)*this.current
                            // console.log(this.stone);

                            // console.log((this.stone.x + 1) * this.current, (this.stone.y + 1) * this.current);

                            // const startTime = Date.now();  
                            // this.drawRoute((this.stone.x + 1) * this.current, (this.stone.y + 1) * this.current, (arrY + 1) * this.current, (arrX + 1) * this.current, '#000')
                            // const endTime = Date.now() - startTime;
                            // this.drawRoute((this.stone.x + 1) * this.current, (this.stone.y + 1) * this.current, (arrY + 1) * this.current, (arrX + 1) * this.current, '#000', this.stone.x, this.stone, y)
                            // // this.boardElement.width = 6*this.current;


                            // console.log(endTime);



                            this.boardcontext.clearRect(0, 0, this.width, this.height);

                            //    this.drawboard();
                            this.init_board();


                            this.isStone = false;
                            // this.stone.x = -1;
                            // this.stone.y = -1;
                            this.stone = { x: -1, y: -1 }
                            // this.play_out++;
                            this.isBlack = !this.isBlack;
                            // this.blackElement.style.zIndex = 2;
                            // this.whiteElement.style.zIndex = 3;

                            return;
                        } else {
                            this.$message('落子不合法');

                            this.stone = { x: -1, y: -1 };
                            this.isStone = false;

                            this.boardcontext.clearRect(0, 0, this.width, this.height);

                            //    this.drawboard();
                            this.init_board();


                            return;
                        }


                    } else if (this.arr[this.stone.x][this.stone.y] == -1) {
                        if (this.play_out <= 32) {
                            return;
                        } else {

                            this.$message('白棋走棋')

                            if (this.arr[arrX][arrY] == 1) { // 判断这一步是不是白棋上
                                this.$message("不能落在黑子上！！！");
                                this.stone = { x: -1, y: -1 };
                                this.isStone = false;

                                this.boardcontext.clearRect(0, 0, this.width, this.height);

                                //    this.drawboard();
                                this.init_board();

                                return;
                            }

                            if (this.arr[arrX][arrY] == -1) {
                                this.$message("走子取消");
                                this.stone = { x: -1, y: -1 };
                                this.isStone = false;
                                this.boardcontext.clearRect(0, 0, this.width, this.height);

                                //    this.drawboard();
                                this.init_board();

                                return;
                            }







                            this.modify_arr(this.stone.x, this.stone.y, 0);
                            this.modify_arr(arrX, arrY, -1);

                            // 修改ui，先执行动画

                            // this.drawRoute(this.stone.x,this.stone.y,arrX,arrY,'#fff')
                            // this.boardElement.width = 6 * this.current;
                            // this.drawRoute((this.stone.x + 1) * this.current, (this.stone.y + 1) * this.current, (arrY + 1) * this.current, (arrX + 1) * this.current, '#fff', this.stone.x, this.stone.y)

                            this.boardcontext.clearRect(0, 0, this.width, this.height);
                            // this.drawboard();
                            this.init_board();

                            this.isStone = false;
                            // this.stone.x = -1;
                            // this.stone.y = -1;
                            this.stone = { x: -1, y: -1 }
                            this.play_out++;


                            this.isBlack = !this.isBlack;

                            // 记录数据
                            this.modify_state(String(this.stone.x) + String(this.stone.y) + String(arrX) + String(arrY), String(0) + String(0), '-1', -1, 0, this.play_out);
                            // 请求
                            this.handleSelectMove(this.state);


                            // this.blackElement.style.zIndex = 3;
                            // this.whiteElement.style.zIndex = 2;
                            return;
                        }
                    }

                }
            }

            if (this.arr[arrX][arrY] == 1 && !this.isStone && this.isBlack) {
                // this.draw_chess((arrY+1)*this.current,(arrX+1)*this.current,'#FF0000');
                // 黑棋设置阴影
                // console.log('记录stone');
                this.boardcontext.clearRect(0, 0, this.width, this.height);
                this.init_shadow_board(arrX, arrY);

                // this.blackcontext.beginPath()
                // this.blackcontext.shadowColor = 'rgba(255, 255, 255, 0.5)'; // 阴影颜色  
                // this.blackcontext.shadowOffsetX = 5; // 阴影水平偏移量  
                // this.blackcontext.shadowOffsetY = 5; // 阴影垂直偏移量  
                // this.blackcontext.shadowBlur = 8; // 阴影模糊度
                // this.blackcontext.closePath()

                this.isStone = true;
                // this.stone.x = arrX;
                // this.stone.y = arrY;
                this.stone = { x: arrX, y: arrY }
                // console.log(this.stone);
            } else if (this.arr[arrX][arrY] == -1 && !this.isStone && this.play_out > 32 && !this.isBlack) {
                // this.draw_chess((arrY + 1) * this.current, (arrX + 1) * this.current, 'rgba(0, 0, 0, 0.1)') // 设置透明度?

                // this.blackcontext.shadowColor = 'rgba(0, 0, 0, 0.5)'; // 阴影颜色  
                // this.blackcontext.shadowOffsetX = 5; // 阴影水平偏移量  
                // this.blackcontext.shadowOffsetY = 5; // 阴影垂直偏移量  
                // this.blackcontext.shadowBlur = 8; // 阴影模糊度

                this.boardcontext.clearRect(0, 0, this.width, this.height);
                this.init_shadow_board(arrX, arrY);

                this.isStone = true;
                // this.stone.x = arrX;
                // this.stone.y = arrY;
                this.stone = { x: arrX, y: arrY }
            }





            // this.draw_chess((arrY+1)*this.current,(arrX+1)*this.current,'rgba(255, 255, 255, 0.5)'); // 白色，半透明 (alpha = 0.5) 

            // this.draw_chess((arrY+1)*this.current,(arrX+1)*this.current,'rgba(0, 0, 0, 0.5)') // 设置透明度
            // }else if(|| this[arrX][arrY] == -1)

            // }


            // if(this.isStone && this.stone.x != -1 && this.stone.y != -1){ // 说明点击了一次,并且stone存储了上一次的点击的值
            //     this.draw_chess(this.stone.x+1,this.stone.y+1,'rgba(0, 0, 0, 0.5)') // 设置透明度
            //     if(this.arr[arrX][arrY] == 0){
            //         if(this.arr[this.stone.x][this.stone.y] == 1){
            //             // this.draw_chess((arrX+1)*this.current,(arrX+1)*this.current,'#000');
            //             this.arr[arrX][arrY] = 1; //更新数组



            //         }
            //         if(this.arr[this.stone.x][this.stone.y] == -1){
            //             this.draw_chess((arrX+1)*this.current,(arrX+1)*this.current,'#fff');
            //         }
            //     }
            //     // 更改 this.isstone
            //     this.stone.x = -1;
            //     this.stone.y = -1;
            //     this.isStone = false;

            // }else{ // 没有点击,改变flag的值，并且将值加到stone中
            //     this.stone.x = arrX;
            //     this.stone.y = arrY;
            //     this.isStone = true;
            //     this.draw_chess((this.stone.x+1)*this.current,(this.stone.y+1)*this.current)
            // }


            // this.context.beginPath();

            // this.context.arc(x,y,10,0,2*Math.PI);

            // this.context.fillStyle = this.isBlack?'#000':'#fff';

            // this.context.fill();
            // this.context.closePath();
            // this.isBlack = !this.isBlack;

        },


        is_legal(x, y, x1, y1) {

            // console.log(x, y, x1, y1);

            const si = x;
            const sj = y;
            const ei = x1;
            const ej = y1;

            //没有对角线的不让走 i 为列，j 为行
            if ((si == 3 && sj == 0 && ei == 2 && ej == 1) || (si == 2 && sj == 1 && ei == 3 && ej == 0)
                || (si == 3 && sj == 2 && ei == 2 && ej == 1) || (si == 2 && sj == 1 && ei == 3 && ej == 2)
                || (si == 3 && sj == 2 && ei == 2 && ej == 3) || (si == 2 && sj == 3 && ei == 3 && ej == 2)
                || (si == 3 && sj == 4 && ei == 2 && ej == 3) || (si == 2 && sj == 3 && ei == 3 && ej == 4)

                || (si == 3 && sj == 0 && ei == 4 && ej == 1) || (si == 4 && sj == 1 && ei == 3 && ej == 0)
                || (si == 3 && sj == 2 && ei == 4 && ej == 1) || (si == 4 && sj == 1 && ei == 3 && ej == 2)
                || (si == 3 && sj == 2 && ei == 4 && ej == 3) || (si == 4 && sj == 3 && ei == 3 && ej == 2)
                || (si == 3 && sj == 4 && ei == 4 && ej == 3) || (si == 4 && sj == 3 && ei == 3 && ej == 4)

                || (si == 5 && sj == 0 && ei == 4 && ej == 1) || (si == 4 && sj == 1 && ei == 5 && ej == 0)
                || (si == 5 && sj == 2 && ei == 4 && ej == 1) || (si == 4 && sj == 1 && ei == 5 && ej == 2)
                || (si == 5 && sj == 2 && ei == 4 && ej == 3) || (si == 4 && sj == 3 && ei == 5 && ej == 2)
                || (si == 5 && sj == 4 && ei == 4 && ej == 3) || (si == 4 && sj == 3 && ei == 5 && ej == 4)

                || (si == 5 && sj == 0 && ei == 6 && ej == 1) || (si == 6 && sj == 1 && ei == 5 && ej == 0)
                || (si == 5 && sj == 2 && ei == 6 && ej == 1) || (si == 6 && sj == 1 && ei == 5 && ej == 2)
                || (si == 5 && sj == 2 && ei == 6 && ej == 3) || (si == 6 && sj == 3 && ei == 5 && ej == 2)
                || (si == 5 && sj == 4 && ei == 6 && ej == 3) || (si == 6 && sj == 3 && ei == 5 && ej == 4)

                || (si == 3 && sj == 0 && ei == 5 && ej == 2) || (si == 5 && sj == 2 && ei == 3 && ej == 0)
                || (si == 4 && sj == 1 && ei == 6 && ej == 3) || (si == 6 && sj == 3 && ei == 4 && ej == 1)

                || (si == 2 && sj == 1 && ei == 4 && ej == 3) || (si == 4 && sj == 3 && ei == 2 && ej == 1)
                || (si == 3 && sj == 2 && ei == 5 && ej == 4) || (si == 5 && sj == 4 && ei == 3 && ej == 2)

                || (si == 5 && sj == 0 && ei == 3 && ej == 2) || (si == 3 && sj == 2 && ei == 5 && ej == 0)
                || (si == 4 && sj == 1 && ei == 2 && ej == 3) || (si == 2 && sj == 3 && ei == 4 && ej == 1)

                || (si == 6 && sj == 1 && ei == 4 && ej == 3) || (si == 4 && sj == 3 && ei == 6 && ej == 1)
                || (si == 5 && sj == 2 && ei == 3 && ej == 4) || (si == 3 && sj == 4 && ei == 5 && ej == 2)) {
                return false;
            }

            //限制某些没有线的地方不让走
            if ((si == 0 && sj == 2 && ei == 1 && ej == 1) || (si == 1 && sj == 1 && ei == 0 && ej == 2)
                || (si == 7 && sj == 1 && ei == 8 && ej == 2) || (si == 8 && sj == 2 && ei == 7 && ej == 1)
                || (si == 0 && sj == 2 && ei == 1 && ej == 3) || (si == 1 && sj == 3 && ei == 0 && ej == 2)
                || (si == 7 && sj == 3 && ei == 8 && ej == 2) || (si == 8 && sj == 2 && ei == 7 && ej == 3)
                || (si == 2 && sj == 0 && ei == 1 && ej == 1) || (si == 1 && sj == 1 && ei == 2 && ej == 0)
                || (si == 1 && sj == 1 && ei == 3 && ej == 1) || (si == 3 && sj == 1 && ei == 1 && ej == 1)
                || (si == 2 && sj == 1 && ei == 1 && ej == 2) || (si == 1 && sj == 2 && ei == 2 && ej == 1)
                || (si == 2 && sj == 1 && ei == 1 && ej == 1) || (si == 1 && sj == 1 && ei == 2 && ej == 1)
                || (si == 2 && sj == 1 && ei == 1 && ej == 1) || (si == 1 && sj == 1 && ei == 2 && ej == 1)
                || (si == 1 && sj == 3 && ei == 2 && ej == 3) || (si == 2 && sj == 3 && ei == 1 && ej == 3)
                || (si == 2 && sj == 3 && ei == 1 && ej == 2) || (si == 1 && sj == 2 && ei == 2 && ej == 3)
                || (si == 1 && sj == 3 && ei == 2 && ej == 4) || (si == 2 && sj == 4 && ei == 1 && ej == 3)
                || (si == 1 && sj == 3 && ei == 3 && ej == 3) || (si == 3 && sj == 3 && ei == 1 && ej == 3)
                || (si == 6 && sj == 0 && ei == 7 && ej == 1) || (si == 7 && sj == 1 && ei == 6 && ej == 0)
                || (si == 6 && sj == 1 && ei == 7 && ej == 1) || (si == 7 && sj == 1 && ei == 6 && ej == 1)
                || (si == 5 && sj == 1 && ei == 7 && ej == 1) || (si == 7 && sj == 1 && ei == 5 && ej == 1)
                || (si == 6 && sj == 1 && ei == 7 && ej == 2) || (si == 7 && sj == 2 && ei == 6 && ej == 1)
                || (si == 6 && sj == 3 && ei == 7 && ej == 2) || (si == 7 && sj == 2 && ei == 6 && ej == 3)
                || (si == 7 && sj == 3 && ei == 5 && ej == 3) || (si == 5 && sj == 3 && ei == 7 && ej == 3)
                || (si == 6 && sj == 3 && ei == 7 && ej == 3) || (si == 7 && sj == 3 && ei == 6 && ej == 3)
                || (si == 6 && sj == 4 && ei == 7 && ej == 3) || (si == 7 && sj == 3 && ei == 6 && ej == 4)
                || (si == 3 && sj == 0 && ei == 1 && ej == 2) || (si == 1 && sj == 2 && ei == 3 && ej == 0)
                || (si == 3 && sj == 4 && ei == 1 && ej == 2) || (si == 1 && sj == 2 && ei == 3 && ej == 4)
                || (si == 5 && sj == 0 && ei == 7 && ej == 2) || (si == 7 && sj == 2 && ei == 5 && ej == 0)
                || (si == 5 && sj == 4 && ei == 7 && ej == 2) || (si == 7 && sj == 2 && ei == 5 && ej == 4)
                || (ei == 1 && ej == 0) || (ei == 1 && ej == 4) || (ei == 7 && ej == 0) || (ei == 7 && ej == 4)
                || (ei == 0 && ej == 1) || (ei == 0 && ej == 3) || (ei == 8 && ej == 1) || (ei == 8 && ej == 3)) {
                return false;
            }


            if(this.arr[x][y] === -1){
                const distance = Math.sqrt(Math.pow(Math.abs(x - x1), 2) + Math.pow((Math.abs(y - y1)), 2));
                if(distance === 2){
                    if((x == 0 && y == 0 && x1 == 0 && y1 == 2) || (x == 0 && y == 2 && x1 == 0 && y1 == 0) || (x == 0 && y == 4 && x1 == 0 && y1 == 2) || (x == 0 && y == 2 && x1 == 0 && y1 == 4) || (x == 8 && y == 0 && x1 == 8 && y1 == 2) || (x == 8 && y == 2 && x1 == 8 && y1 == 0) || (x == 8 && y == 4 && x1 == 8 && y1 == 2) || (x == 8 && y == 2 && x1 == 8 && y1 == 4)){
                        return true;
                    }else{
                        return false;
                    }
                }
            }

            return true;
        },


        is_jump(x, y, x1, y1) {
            const distance = Math.sqrt(Math.pow(Math.abs(x - x1), 2) + Math.pow((Math.abs(y - y1)), 2));
            const coord = x * 5 + y;
            const coord_ = x1 * 5 + y1;

            // const mid_chess =  Math.abs(coord+coord_)/2
            // // console.log(mid_chess);

            // console.log(mid_chess/5|0,mid_chess%5|0);
            // console.log(distance);

            // console.log(this.arr[(coord + coord_) / 2 / 5 | 0][(coord + coord_) / 2 % 5 | 0]);

            if ((coord == 0 && coord_ == 2) || (coord == 2 && coord_ == 0) || (coord == 2 && coord_ == 4) || (coord == 4 && coord_ == 2) || (coord == 40 && coord_ == 42) || (coord == 42 && coord_ == 40) || (coord == 42 && coord_ == 44) || (coord == 44 && coord_ == 42)) {
                return false;
            } else if (distance == 1 || distance == Math.sqrt(2)) {
                return false;
            } else if ((distance == 2 * Math.sqrt(2) && (this.arr[(coord + coord_) / 2 / 5 | 0][(coord + coord_) / 2 % 5 | 0] == -1)) || (distance == 4.0 && (this.arr[(coord + coord_) / 2 / 5 | 0][(coord + coord_) / 2 % 5 | 0] == -1)) || (distance == 2 && (this.arr[(coord + coord_) / 2 / 5 | 0][(coord + coord_) / 2 % 5 | 0] == -1))) {
                return true;
            }
            else {
                return false;
            }
        },

        draw_chess(x, y, color) {
            // console.log("huahuahu");

            if (color == '#000') {
                this.boardcontext.beginPath();
                // this.blackcontext.translate(x, y)
                this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);
                let g = this.boardcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
                g.addColorStop(0, '#ccc');
                g.addColorStop(1, '#000');
                this.boardcontext.fillStyle = g;
                // this.blackcontext.fillStyle = color;
                this.boardcontext.fill();
                this.boardcontext.closePath();
            }

            if (color == '#fff') {
                this.boardcontext.beginPath();
                // this.blackcontext.translate(x, y)
                this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);
                let g = this.boardcontext.createRadialGradient(x + 5, y + 5, 0, x + 5, y + 5, 10);
                g.addColorStop(0, '#666');
                g.addColorStop(1, '#fff');
                this.boardcontext.fillStyle = g;
                // this.whitecontext.fillStyle = color;
                this.boardcontext.fill();
                this.boardcontext.closePath();
            }

            // this.context.beginPath();
            // this.context.arc(x,y,10,0,2*Math.PI);
            // this.context.fillStyle = color;
            // this.context.fill();
            // this.context.closePath();
        },

        draw_trans_chess(x, y, color) {
            // console.log("huahuahu");

            if (color == '#000') {
                this.boardcontext.beginPath();
                // this.blackcontext.translate(x, y)
                this.boardcontext.arc(x, y, 15, 0, 2 * Math.PI);
                // let g = this.blackcontext.createRadialGradient(x - 5, y - 5, 0, x - 5, y - 5, 10);
                // g.addColorStop(0, '#ccc');
                // g.addColorStop(1, '#000');
                this.boardcontext.fillStyle = 'rgba(0, 0, 0, 0)';
                // this.blackcontext.fillStyle = color;
                this.boardcontext.fill();
                this.boardcontext.closePath();
            }

            if (color == '#fff') {
                this.boardcontext.beginPath();
                // this.blackcontext.translate(x, y)
                this.boardcontext.arc(x, y, 10, 0, 2 * Math.PI);
                // let g = this.whitecontext.createRadialGradient(x + 5, y + 5, 0, x + 5, y + 5, 10);
                // g.addColorStop(0, '#666');
                // g.addColorStop(1, '#fff');
                this.boardcontext.fillStyle = 'rgba(0, 0, 0, 0)';
                // this.whitecontext.fillStyle = color;
                this.boardcontext.fill();
                this.boardcontext.closePath();
            }

            // this.context.beginPath();
            // this.context.arc(x,y,10,0,2*Math.PI);
            // this.context.fillStyle = color;
            // this.context.fill();
            // this.context.closePath();
        },






        // anaimation(duration, x,y,x1,y1, onProgress) {
        //     const dis = Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1));
        //     const speed = dis/duration;
        //     const startTime = Date.now();
        //     let value1 = x;
        //     let value2 = y;
        //     onProgress(value1,value2);

        //     function _run(){
        //         const now = Date.now();
        //         const time = now-startTime;
        //         if(time>=duration){
        //             let value1 = x1;
        //             let value2 = y1;
        //             onProgress(value1,value2);
        //             return;
        //         }

        //         const d = time * speed;
        //         value1 = x + d;
        //         value2 = y + d;
        //         onProgress(value1,value2);
        //         requestAnimationFrame(_run);
        //     }
        //     requestAnimationFrame(_run);
        // },





        // drawRoute(x, y, x1, y1, color, origin_x, origin_y) {



        //     this.ana_id = requestAnimationFrame(() => {

        //         if (x1 > x) {
        //             x = x + 1;
        //         } else {
        //             x = x - 1;
        //         }
        //         if (y1 > y) {
        //             y += 1;
        //         } else {
        //             y -= 1;
        //         }


        //         console.log(x, y, x1, y1);

        //         if ((Math.pow((x - x1), 2) + Math.pow((y - y1), 2)) > 0) {
        //             if (color == '#000') {
        //                 // this.blackcontext.beginPath()

        //                 this.blackcontext.clearRect(x - 11, y - 11, 31, 21);
        //                 console.log(x, y);
        //                 // this.draw_trans_chess(x, y, color);
        //                 // this.blackcontext.globalCompositeOperation = "destination-out"; // 设置混合模式为擦除模式
        //                 // this.blackcontext.beginPath(); // 开始路径或重置当前路径
        //                 // this.blackcontext.arc(x, y, 10, 0, 2 * Math.PI); // 绘制一个圆形路径
        //                 // this.blackcontext.fill(); // 填充圆形路径
        //             }

        //             if (color == '#fff') {
        //                 this.whitecontext.clearRect(0, 0, this.width, this.height);
        //             }



        //             this.draw_chess(x, y, color);
        //             // 画出剩余的棋子

        //             this.init_remain_board(origin_x, origin_y, color);


        //             console.log("11111111111111");

        //         } else {
        //             if (this.ana_id != null) {
        //                 console.log('cancel');

        //                 cancelAnimationFrame(this.ana_id);
        //                 this.ana_id = null;

        //                 // if (color == '#000') {
        //                 //     // this.blackcontext.beginPath()

        //                 //     this.blackcontext.clearRect(0, 0, this.width, this.height);
        //                 //     this.init_black_board();
        //                 // }

        //                 // if (color == '#fff') {
        //                 //     this.whitecontext.clearRect(0, 0, this.width, this.height);
        //                 //     this.init_white_board();
        //                 // }


        //                 return;
        //             }
        //             // return;
        //         }
        //         this.drawRoute(x, y, x1, y1, color);

        //     });



        //     // if (x != x1 && y != y1) {
        //     //     if (color == '#000') {
        //     //         this.blackcontext.clearRect(0, 0, this.width, this.height);
        //     //     }

        //     //     if (color == '#fff') {
        //     //         this.whitecontext.clearRect(0, 0, this.width, this.height);
        //     //     }
        //     //     this.draw_chess(x, y, color);
        //     //     console.log("11111111111111");
        //     //     this.ana_id = requestAnimationFrame(this.drawRoute);
        //     // } else {
        //     //     cancelAnimationFrame(this.ana_id);
        //     //     return;
        //     // }

        // },


        drawLabel(i, j) {
            let context = this.boardcontext
            context.beginPath()
            context.arc(this.current + j * this.current, this.current + i * this.current, 15 / 3, 0, 2 * Math.PI)
            
            context.fillStyle = 'green'
            context.fill()
            context.closePath()
        },

        chess(s) {
            // console.log(s.state);
            this.arr = [...s.board];
            this.boardcontext.clearRect(0, 0, this.width, this.height);
            this.init_board()
            this.drawLabel(s.move[0], s.move[1])
            this.drawLabel(s.move[2], s.move[3])



            if (this.eat_chess >= 11) {
                gameOver(this.roomId, this.$store.getters.matchDetails, 'black', 'eat_11')
                return;
            }
            this.legal_kings()

            this.waitResponse = false;

        }

    },


    computed: {
        matchDetails() {
            return this.$store.getters.matchDetails
        },
        turn() {
            return this.steps.length % 2
        },
        chessboardDisabled() {
            // console.log(this.myColor);
            // console.log(this.turn);
            return this.myColor !== this.turn || this.waitResponse
        },
        // buttonDisabled() {
        //     return this.myColor !== this.turn || this.waitResponse || this.steps.length<3
        // },
        buttonDisabled() {
            return true
        },
        step() {
            return this.$store.getters.step
        },
        gameOverDTO() {
            return this.$store.getters.gameOverDTO
        },
        chessboard() {
            return this.$store.getters.chessboard
        },
        drawDTO() {
            return this.$store.getters.drawDTO
        },
        retractDTO() {
            return this.$store.getters.retractDTO
        },
        isPlaying() {
            // console.log(this.$store.getters.isPlaying);
            return this.$store.getters.isPlaying
        }
    },
    watch: {
        // eat_chess(newvalue){
        //     this.$store.dispatch('setEatChess', newvalue)
        // },
        // play_out(newvalue){
        //     this.$store.dispatch('setPlayOut', newvalue)
        // },
        matchDetails(details) {
            if (details.roomId === this.roomId) {
                if (details.host.ready && details.challenger.ready) {
                    this.started = true
                    this.steps = []
                    // this.context.clearRect(0, 0, side, side)

                    // this.boardcontext.clearRect(0, 0, this.width, this.height);
                    // this.whitecontext.clearRect(0, 0, this.width, this.height);
                    this.init_board()
                    this.isDisabled = false

                    this.$store.dispatch('setStep', {})

                    let id = this.$store.getters.player.id
                    if (details.host.id === id) {
                        this.myColor = details.host.color
                        return
                    }
                    else if (details.challenger.id === id) {
                        this.myColor = details.challenger.color
                        return
                    }
                }
                this.myColor = -1
            }
        },


        // step:{
        //     handler: function (step) {
        //     if (step.rid === this.roomId) {

        //         this.states.push(step.state)

        //         this.steps.push(step)

        //         this.eat_chess = step.state.eat_c
        //         this.play_out = step.state.play_out
        //         this.chess(step.state)
        //     }
        //     },
        //     deep: true
        // },



        step(step) {
            // console.log('step');
            // console.log(this.steps);
            if (step.rid === this.roomId) {

                this.states.push(step.state)

                this.steps.push(step)



                this.eat_chess = step.state.eat_c

                this.play_out = step.state.play_out
                if(this.play_out == 33){
                    this.$message.info('白棋走棋')
                }
                // console.log('chess playout');
                // console.log(this.play_out);
                this.chess(step.state)
            }
        },

        gameOverDTO(gameOverDTO) {
            // console.log(gameOverDTO);
            if (gameOverDTO.rid === this.roomId) {
                this.started = false
                if (gameOverDTO.cause === 'eat_11') {
                    this.title = this.$t('lang.chessboard.message.over.eat_11') + gameOverDTO.winner.name
                }
                else if (gameOverDTO.cause === 'escape') {
                    this.title = gameOverDTO.loser.name + this.$t('lang.chessboard.message.over.escape') + gameOverDTO.winner.name
                }
                else if (gameOverDTO.cause === 'no_move') {
                    this.title = gameOverDTO.loser.name + this.$t('lang.chessboard.message.over.no_move') + gameOverDTO.winner.name
                }

                else if (gameOverDTO.cause === 'surrender') {
                    this.title = gameOverDTO.loser.name + this.$t('lang.chessboard.message.over.surrender') + gameOverDTO.winner.name
                }
                // else if (gameOverDTO.cause === 'draw') {
                //     this.waitResponse = false
                //     this.title = this.$t('lang.chessboard.message.over.draw')
                // }
                else {
                    this.title = ''
                }
                this.isDisabled = true
                this.$alert(this.title)
                this.myColor = -1
            }
        },
        // chessboard(chessboard) {
        //     if (chessboard.roomId === this.roomId) {
        //         this.steps = chessboard.steps
        //         this.steps.forEach((step, index) => {
        //             this.drawChess(step.i, step.j, index % 2)
        //         })
        //         this.labelLastStep()
        //     }
        // },
        // drawDTO(drawDTO) {
        //     if (drawDTO.rid === this.roomId) {
        //         if (drawDTO.consent === 1) {
        //             this.$confirm(this.$t('lang.chessboard.message.askDraw.info'), this.$t('lang.chessboard.message.askDraw.title'), {
        //                 confirmButtonText: this.$t('lang.pop.yes'),
        //                 cancelButtonText: this.$t('lang.pop.no'),
        //                 type: 'info'
        //             }).then(() => {
        //                 askDraw(this.roomId, 2)
        //             }).catch(() => {
        //                 askDraw(this.roomId, 0)
        //             })
        //         }
        //         else if (drawDTO.consent === 0) {
        //             this.waitResponse = false
        //             this.$alert(this.$t('lang.chessboard.message.rejectDraw.info'), this.$t('lang.chessboard.message.rejectDraw.title'))
        //         }
        //     }
        // },
        retractDTO(retractDTO) {
            // console.log(retractDTO);
            if (retractDTO.rid === this.roomId) {
                if (retractDTO.consent === 1) {
                    if (retractDTO.id != this.$store.getters.player.id) {
                        this.$confirm(this.$t('lang.chessboard.message.askRetract.info'), this.$t('lang.chessboard.message.askRetract.title'), {
                            confirmButtonText: this.$t('lang.pop.yes'),
                            cancelButtonText: this.$t('lang.pop.no'),
                            type: 'info'
                        }).then(() => {
                            retractStep(this.roomId, this.$store.getters.retractDTO.id, 2)
                        }).catch(() => {
                            retractStep(this.roomId, this.$store.getters.retractDTO.id, 0)
                        })
                    }
                }
                else if (retractDTO.consent === 0) {
                    this.waitResponse = false
                    if (retractDTO.id == this.$store.getters.player.id) {
                        this.$alert(this.$t('lang.chessboard.message.rejectRetract.info'), this.$t('lang.chessboard.message.rejectRetract.title'))
                    }
                }
                else if (retractDTO.consent === 2) {
                    if (retractDTO.id == this.$store.getters.player.id) {
                        this.$message.info(this.$t('lang.chessboard.message.agreeRetract.info'))
                    }


                    for (let i = 0; i < 2; i++) {
                        let lastIndex = this.steps.length - 1




                        // console.log('111111111111111');

                        // this.boardcontext.clearRect(0, 0, this.width, this.height);
                        // this.init_board()
                        //this.drawLabel(step.state.move[0], step.state.move[1])
                        //this.drawLabel(step.state.move[2], step.state.move[3])

                        this.steps.splice(lastIndex, 1)
                    }

                    // console.log(this.steps);

                    let s = this.steps[this.steps.length - 1]
                    this.eat_chess = s.state.eat_c
                    this.play_out = s.state.play_out

                    // console.log(s);

                    // this.chess(s)


                    this.$store.dispatch('setStep', s)






                    //this.labelLastStep()
                    this.waitResponse = false
                }


            }

        }
    }



}

</script>

<style scoped>
/* // .can {
//     background-color: green;
//     display: block;
//     margin: auto;
// } */
.container {
    cursor: er;
    position: relative;
    /* 设置为相对定位 */
    width: 300px;
    /* 容器宽度 */
    height: 500px;
    /* 容器高度 */
    border: 1px solid black;
    /* 边框以便看到边界 */
    margin: 20px auto;
    /* 居中显示 */
}

canvas {
    position: absolute;
    /* 绝对定位 */
}

#board {
    /* 最底层 */
    background-color: rgb(185, 133, 73);
}
</style>
