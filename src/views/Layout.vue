<template>
    <div class="shadow-container">
        <el-container>            
            <el-header>
            <span class="brand-name">{{$t('lang.layout.title')}}</span>
            <el-menu background-color="transparent" router mode="horizontal" :default-active="$route.path">
                
                <template v-for="item in this.$router.options.routes[3].children">
                    <el-menu-item :index="item.path" :key="item.path">
                        <span slot="title">{{$t('lang.layout.' + item.name)}}</span>
                    </el-menu-item>

                </template>
                <template>
                    <el-dropdown style="margin-top: 10px; margin-left: 10px;" @command="handleLogout">
                    <span class="el-dropdown-link">
                        <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                            size="medium"></el-avatar>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <!-- <el-dropdown-item>个人中心</el-dropdown-item> -->
                        <el-dropdown-item command="logout" style="color: red;">退出</el-dropdown-item>
                    </el-dropdown-menu>
            </el-dropdown>
                </template>

            </el-menu>
            </el-header>
            <el-main>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </el-main>
            <el-footer>
            <p>版权所有 © 2024 中央民族大学信息工程学院计算机博弈课题组</p>
        </el-footer>
        </el-container>
    </div>

</template>

<script>
    import Vue from 'vue'
    import {logout} from "../api/index"
    import Cookie from 'js-cookie'
    export default {
        name: "Layout",
        data() {
            return {

            }
        },
        methods:{
            handleLogout(){
                const id  = Cookie.get('id');
                // alert(id)
                logout(id).then((data)=>{
                    // console.log(data.data);
                    if(data.data.code===2000){
                        // Cookie.remove('id')
                        // Cookie.remove('id_set_time');
                        // console.log("退出");
                        
                        this.$router.replace('login');
                    }
                })
            }
        },
    }
</script>

<style scoped>
    /* html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    } */
    .shadow-container {
        /* height: calc(97vh);
        min-height: 600px;
        min-width: 1200px; */
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        
    }

    .el-header{
        background-color: #B3C0D1;
        color: #333;
        display: flex; 
        justify-content: flex-end;
    }
    .brand-name {
        font-size: x-large;
        /* font-style: italic; */
        /* float: left; */
        margin-right: auto;
        margin-top: 1vh;
        }

    .el-main{
        background-color: #E9EEF3;
        color: #333;
        align-items: stretch;
        flex: 1;
        height: 100vh;
        /* text-align: center;
        line-height: 160px; */
        display: flex;
        flex-direction: column;
    }

    .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    /* line-height: 60px;

    padding: 20px; */
    border-top: 1px solid #e7e7e7; 
    flex: 1;

  }
  /* body {
  overflow: hidden;
} */




</style>