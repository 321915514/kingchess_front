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
    export default {
        name: "Layout",
        data() {
            return {

            }
        }
    }
</script>

<style scoped>
    .shadow-container {
        height: calc(97vh);
        min-height: 600px;
        min-width: 1200px;
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
        
        /* text-align: center;
        line-height: 160px; */
    }

    .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    /* line-height: 60px;

    padding: 20px; */
    border-top: 1px solid #e7e7e7; 

  }




</style>