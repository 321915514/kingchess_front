<template>
    <el-container class="">
        <el-main>
          <div class="userContent">
            <!-- <div>
                <el-button @click="handelAdd" type="primary">新增<i class="el-icon-plus el-icon-right"></i></el-button>
            </div> -->
            <div style="display: flex; justify-content: flex-end;">
                <el-form :inline="true" class="demo-form-inline">
                    <el-form-item>
                        <el-input v-model="search_name" placeholder="请输入用户昵称"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">查询</el-button>
                    </el-form-item>
                </el-form>
            </div>


        </div>
          <div class="userTable" style="height: 600px;">
            <el-table stripe :data="paginatedItems" height="90%" :default-sort="{ prop: 'time', order: 'descending' }">
              <el-table-column prop="id" label="编号">
              </el-table-column>
                <el-table-column prop="host_username" label="房主">
                </el-table-column>
                <el-table-column prop="challenger_username" label="挑战者">
                </el-table-column>
                <!-- <el-table-column prop="sex" label="性别">
                    <template slot-scope="scope">
                        <span>{{ scope.row.sex === 1 ? '男' : '女' }}</span>
                    </template>
                </el-table-column> -->
                <el-table-column prop="host_color" label="房主执棋">
                </el-table-column>
                <el-table-column prop="time" sortable label="时间">
                </el-table-column>
                <el-table-column prop="length" label="棋谱长度">
                </el-table-column>
                <el-table-column prop="winner" label="赢家">
                </el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
                        <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button> -->
                    </template>
                </el-table-column>
            </el-table>

            <div class="block">
                <el-pagination layout="->, prev, pager, next" @current-change="handelPage" :total="total">
                </el-pagination>
            </div>


            <el-dialog
              :modal-append-to-body="false"
              :close-on-click-modal="false"
              title=""
              :visible.sync="centerDialogVisible"
              :sgf="sgf"
              center style="overflow: hidden;margin-top: -75px;">
              <!-- {{sgf}} -->
              <span style="display: flex; justify-content: center;color: red; font-size: 18px;" v-if="color === -1 && step>32">白棋：{{incrementDigitsInString(move.slice(0,2))}}---{{ incrementDigitsInString(move.slice(2,4) === "ee"?"":move.slice(2,4))}}</span>
              <span style="display: flex; justify-content: center;color: red; font-size: 18px;" v-if="color === -1 && step<=32">白棋：{{incrementDigitsInString(move.slice(0,2))}}</span>

              <span style="display: flex; justify-content: center;color: red; font-size: 18px;" v-if="color === 1">黑棋：{{incrementDigitsInString(move.slice(0,2))}}---{{ incrementDigitsInString(move.slice(2,4) === "ee"?"":move.slice(2,4))}}</span>

              <ChessBoardCopy :move="move" :arr_="arr_" :color="color"></ChessBoardCopy>
              <div class="block">
                <el-slider
                  v-model="step"
                  show-input :max="slider">
                </el-slider>
              </div>
              <!-- <div class="block" style="display: flex; justify-content: right;">
                <el-input-number  v-model="step" :min="0" :max="slider"></el-input-number>
              </div> -->
              <!-- <span slot="footer" class="dialog-footer"> -->
                <!-- <el-button @click="centerDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button> -->
              <!-- </span> -->
            </el-dialog>



        </div>
        </el-main>
    </el-container>
</template>

<script>
import {get_sgf_data,get_sgf_by_user} from '../api/index'
import ChessBoardCopy from "@/components/ChessBoardCopy"
export default{
    name: "PlayHistory",
    components: {ChessBoardCopy},
    data(){
        return {
            options: [
                { value: '0', label: '全部' },
                { value: '1', label: '我的' },
             ],
             tableData:[],
             search: {
                name: '',
            },
            total: 0,
            centerDialogVisible: false,
            sgf:'',
            slider: 0,
            step: 0,
            move: '',
            color:1,
            search_name:'',
            currentPage :1,
            pageSize:9,
            arr_ : [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, -1, -1, -1, 0], [0, -1, 0, -1, 0], [0, -1, -1, -1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],



        }


    
    },
    computed:{
      paginatedItems() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.tableData.slice(startIndex, startIndex + this.pageSize);
    },

    totalPages() {
        return Math.ceil(this.tableData.length / this.pageSize)

    },
    },
    
   activated(){
      get_sgf_data().then(({data})=>{
        // console.log(data);
        
        if(data.code == 2000){
          this.tableData = data.message
          this.total = this.tableData.length
        }

      })
    },
    methods:{
      modify_arr(x, y, z) {
            const row = this.arr_[x];
            if (row) {
                // 使用 this.$set 修改对象的属性  
                this.$set(row, y, z);
            }

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
            } else if ((distance == 2 * Math.sqrt(2) && (this.arr_[(coord + coord_) / 2 / 5 | 0][(coord + coord_) / 2 % 5 | 0] == -1)) || (distance == 4.0 && (this.arr_[(coord + coord_) / 2 / 5 | 0][(coord + coord_) / 2 % 5 | 0] == -1)) || (distance == 2 && (this.arr_[(coord + coord_) / 2 / 5 | 0][(coord + coord_) / 2 % 5 | 0] == -1))) {
                return true;
            }
            else {
                return false;
            }
        },
        convertStringToArray(str) {
        return str.split('').map(item => {
            if (item === 'e') {
            return -1;
            } else if (!isNaN(item)) {
            return parseInt(item);
            } else {
            return item;
            }
        });
        },
        incrementDigitsInString(str) {
          return str.split('').map(char => {
            const num = parseInt(char);
            if (!isNaN(num)) {
              return (num + 1) % 10; // 如果加 1 后超过 9，取模 10 得到个位数
            } else {
              return char;
            }
          }).join('');
        },
        handelPage(val) {
            this.currentPage = val;
        },
      handleEdit(index, row) {
            // alert(this.tableData[index])
            this.sgf = row.sgf
            this.slider = (this.sgf.length)/4
            this.centerDialogVisible = true
            // this.form.sex = row.sex==='1'?'男':'女';
        },
        onSubmit(){
          get_sgf_by_user(this.search_name).then(({data})=>{
              console.log(data);
              if(data.code == 2000){
                this.tableData = data.message
              }
          })
        },
    },
    watch:{
      step(new_step){

        this.arr_ = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, -1, -1, -1, 0], [0, -1, 0, -1, 0], [0, -1, -1, -1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      
        
        if(new_step%2==0 && new_step != 0){
          this.color = -1
        }else{
          this.color = 1
        }
        for(let i=1;i<=new_step;i++){
          const start = (i - 1) * 4
          const sgf_copy = this.sgf
          const move = sgf_copy.slice(start, start + 4)

          const convertedArray =  this.convertStringToArray(move)

          // console.log(convertedArray);
          

          
          if(convertedArray[2]===-1 && convertedArray[3]===-1){
                this.modify_arr(convertedArray[0],convertedArray[1], -1)
            }else{
                if(this.is_jump(convertedArray[0], convertedArray[1], convertedArray[2],convertedArray[3])) {
                  // console.log('is_jump');
                  
                    const coord = convertedArray[0]* 5 + convertedArray[1];
                    const coord_ = convertedArray[2] * 5 + convertedArray[3];     
                    const coord_eat = ((coord + coord_) / 2) | 0
                    this.modify_arr(coord_eat / 5 | 0, coord_eat % 5 | 0, 0);
                    // console.log(this.arr_);
                    
                }
                if(i%2==0){
                    this.modify_arr(convertedArray[0],convertedArray[1],0)
                    this.modify_arr(convertedArray[2],convertedArray[3],-1)
                }else{
                    this.modify_arr(convertedArray[0],convertedArray[1],0)
                    this.modify_arr(convertedArray[2],convertedArray[3],1)
                }
            }


        }
        // console.log(this.arr_);
        
        const start = (new_step - 1) * 4
        const sgf_copy = this.sgf
        this.move = sgf_copy.slice(start, start + 4)
        
      }
    }

}
</script>

<style scoped>
.el-container {
/* height: calc(82.9vh); */
height: calc(82.2vh);

}
.el-main {
background-color: #E9EEF3;
color: #333;
align-items: stretch;

}
/* body {
  overflow: hidden;
} */

/* .userContent {
    display: flex;
    justify-content: space-between;
    align-items: center;
} */
</style>