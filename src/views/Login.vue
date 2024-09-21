<template>
    <el-container>
    <el-main >
    <el-card class="box-card">
        <el-form ref="form" label-width="auto" label-position="right" :inline="true" :model="form" :rules="rules">
            <h3 class="login_title">登录</h3>
            <el-form-item prop="username" label="用户名:">
                <el-input v-model="form.username" autocomplete="off" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码:">
                <el-input type="password" v-model="form.password" autocomplete="off" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button style="margin-left: 60px;margin-top: 10px;margin-right: 20px;" type="primary" :loading="false" @click="submitForm">登录</el-button>
                <!-- <el-button style="margin-right: 120px;margin-top: 10px;" type="primary" @click="submitForm">注册</el-button> -->
                <el-button  @click="resetForm">注册</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</el-main>
<el-footer>
    <p>版权所有 © 2024 中央民族大学信息工程学院计算机博弈课题组</p>
  </el-footer>
<!-- <el-footer>
    <FooterComponent/>
</el-footer> -->
</el-container>

</template>
<script>
import Vue from 'vue'
import { mapState } from 'vuex';
// import {initWebSocket} from "@/websocket/websocket";
// import FooterComponent from "@/views/Footer";
// import {ref} from 'vue'
import Cookie from 'js-cookie'
import {login} from '../api/index'
export default Vue.extend({
    data() {
        return {
            // dis: false,
            loading: false,
            form:{
                username:'',
                password:'',
            },
            rules:{
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10个字符', trigger: 'blur' }  
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ]
            }
        }
    },

    // components:{
    //     FooterComponent
    // },

    computed:{
        ...mapState(['register'])
    },

    // watch:{
    //     "register":{
    //         handler(newvalue){
    //             console.log(newvalue);
    //         },
    //         deep : true,
    //     },
        
        
    // },
    
    methods:{
        submitForm(){
            // token
            // const token = Mock.Random.guid();
            // Cookie.set('token',token);
            // 跳转
            this.$refs.form.validate((vaild)=>{
                if(vaild){
                    this.loading = true;
                    login(this.form).then((data)=>{
                        console.log(data.data);
                        if(data.data.code===2000){
                            // initWebSocket()
                            // Cookie.set('id',data.data.id);
                            // Cookie.set('name',this.form.username)
                            // 存入store
                            // console.log(data.data.data.menu);
                            // 存menu
                            this.$store.commit('setPlayer', {id: data.data.id, name: this.form.username, status:'leisure'})
                            // //存路由
                            // this.$store.commit('addMenu', this.$router);
                            this.$router.push('/game')
                            // this.loading = false;
                        }else{
                            this.$message.error(data.data.message);
                            this.loading = false;
                        }

                    })
                }
            })
            // this.$router.push('home');
        },
        resetForm(){
            // console.log(this.$router);
            
            this.$router.push({name:'register'})
        }
    }
})
</script>
<style scoped>
.box-card{
    width: 350px;
    margin: 180px auto;
    border: 1px solid #eaeaea;
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 0 25px #cac6c6;
    .login_title{  
        text-align: center;
        margin-bottom: 40px;
        color:#505458
    }
}

.el-main {
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

  
  .el-container {
    height: 100vh;
  }

</style>