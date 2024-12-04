<template>
    <el-container class="settings">
    <el-main >
        <el-table
    :data="paginatedItems"
    border
    style="width: 100%">
    <el-table-column
      prop="rank"
      label="排名"
      width="50">
      <template #default="scope">

        <i v-if="scope.row.rank === 1"  class="el-icon-medal-1"></i>
        <span v-else>{{ scope.row.rank }}</span>
        <!-- <i v-if="scope.row.rank  === 2"  class="el-icon-medal"></i>
        <i v-if="scope.row.rank  === 3"  class="el-icon-medal-3"></i> -->
        
    </template>

    </el-table-column>
    
    <el-table-column
      prop="name"
      label="昵称"
      width="180">
    </el-table-column>
    <el-table-column
      prop="black_win"
      label="黑胜">
    </el-table-column>
    <el-table-column
      prop="white_win"
      label="白胜">
    </el-table-column>
    <el-table-column
      prop="win"
      label="胜场">
    </el-table-column>
    <el-table-column
      prop="total_play"
      label="总场数">
    </el-table-column>
    <el-table-column
      prop="win_rate"
      label="胜率">
    </el-table-column>
  </el-table>
  <div class="block">
    <el-pagination layout="->, prev, pager, next" @current-change="handelPage" :total="total">
    </el-pagination>
</div>
</el-main>
</el-container>
</template>

<script>

import {get_win_data} from '../api/index'
export default{
    name: "Rank",

    data(){
        return {
            tableData:[],
            total: 0,
            currentPage :1,
            pageSize:10,
        }
    },
    mounted(){
        get_win_data().then(({data})=>{
            // console.log(data);
            if(data.code == 2000){
                this.tableData = data.message
                this.total = this.tableData.length
            }
        })
    },
    activated(){
        get_win_data().then(({data})=>{
            // console.log(data);
            if(data.code == 2000){
                this.tableData = data.message
                this.total = this.tableData.length
            }
        })
    },
    computed: {
        paginatedItems() {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            return this.tableData.slice(startIndex, startIndex + this.pageSize);
    },
        tableRowStyles() {
        return this.tableData.map((row) => {
            if (row.rank === 1) {
            return { backgroundColor: 'gold' }; // 金色
            } else if (row.rank === 2) {
            return { backgroundColor: 'silver' }; // 银色
            } else if (row.rank === 3) {
            return { backgroundColor: '#CD7F32' }; // 铜色
            } else {
            return {};
            }
        });
        },
  },
  methods:{
    handelPage(val) {
        this.currentPage = val;
    },
  }
}
</script>

<style scoped>
.el-icon-medal-1 {
  color: gold;
}
.el-icon-medal-2 {
  color: silver;
}
.el-icon-medal-3 {
  color: #CD7F32;
}

.el-container {
    height: calc(82.2vh);
}
.el-main {
background-color: #E9EEF3;
color: #333;
align-items: stretch;
}
</style>