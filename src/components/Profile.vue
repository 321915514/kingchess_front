<template>
    <div class="container">
        <div class="header">
            <span class="title">{{$t('lang.profile.profile')}}</span>
        </div>
        <div class="scrollbar">
            <el-avatar :size="50" :src="circleUrl"></el-avatar>
            <el-form :model="player">
<!--                <el-form-item :label="$t('lang.profile.id')">{{player.id}}</el-form-item>-->
                <el-form-item :label="$t('lang.profile.name')">{{player.name}}</el-form-item>
                <el-form-item :label="$t('lang.profile.status')">{{$t('lang.status.' + player.status)}}</el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Profile",
        data() {
            return {
                circleUrl: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
            }
        },
        computed: {
            player() {
                return this.$store.getters.player
            }
        }
    }
</script>

<style scoped>
    .scrollbar {
        height: calc(20vh);
        min-height: 180px;
        margin-left: 10%;
        margin-top: 5%;
    }
    .header {
        border-bottom: 1px solid lightgrey;
        padding: 2% 0 2% 5%;
    }
    .title {
        padding-top: 100px;
    }
    .el-form-item {
        margin: 0 0 0 0;
    }
</style>