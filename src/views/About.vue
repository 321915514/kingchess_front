<template>
    <el-container>
        <el-main>
    <el-form>
        <el-form-item :label="$t('lang.about.author')">王旭</el-form-item>
        <el-form-item :label="$t('lang.about.email')">philxling@163.com</el-form-item>
        <el-form-item :label="$t('lang.about.github')">https://github.com/321915514</el-form-item>
    </el-form>
    </el-main>
</el-container>
</template>

<script>
    export default {
        name: "About"
    }
</script>

<style scoped>
  .el-container {
    height: calc(82.9vh);
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    align-items: stretch;
  }
</style>