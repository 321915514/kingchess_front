<template>
    <el-container>
    <el-main>
    <el-card class="box-card">
        <el-form ref="form" label-width="auto" label-position="right" :inline="true" :model="form" :rules="rules">
            <h3 class="login_title">注册</h3>
            <el-form-item prop="username" label="用户名:">
                <el-input v-model="form.username" autocomplete="off" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码:">
                <el-input type="password" v-model="form.password" autocomplete="off" placeholder="请输入密码"></el-input>
            </el-form-item>
            <!-- <el-form-item prop="password" label="邮箱:">
                <el-input type="password" v-model="form.password" autocomplete="off" placeholder="请输入密码"></el-input>
            </el-form-item> -->
            <el-form-item>
                <el-button style="margin-left: 60px;margin-top: 10px;margin-right: 20px;" type="primary" @click="submitForm">注册</el-button>
                <!-- <el-button style="margin-right: 120px;margin-top: 10px;" type="primary" @click="submitForm">注册</el-button> -->
                <el-button @click="resetForm">登录</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</el-main>
    <el-footer>
    <p>版权所有 © 2024 中央民族大学信息工程学院计算机博弈课题组</p>
  </el-footer>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
// import Cookie from 'js-cookie'
import {register} from '../api/index'

export default Vue.extend({
    data() {
        return {
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
    methods:{
        submitForm(){
            // token
            // const token = Mock.Random.guid();
            // Cookie.set('token',token);
            // 跳转
            this.$refs.form.validate((vaild)=>{
                if(vaild){

                    // this.$message({ message: '注册成功', type: 'success'});

                    //         // this.$router.push('home');
                    //         this.$router.replace({name:'login'})
                    //         this.$store.commit('modify_register', true)
                    
                    register(this.form).then((data)=>{
                        // console.log(data.data)
                        
                        if(data.data.code===2000){
                            // Cookie.set('token',data.data.id);
                    
                            this.$store.commit('modify_register', true)
                            this.$router.replace({name:'login'})
                            this.$message.success(data.data.message);           

                    //         this.$router.push('home');
                        
                        }else{
                            this.$message.error(data.data.message);
                        }

                    // })
                })
            }})
            // this.$router.push('home');
        },
        resetForm(){
            this.$router.go(-1)
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