<template>
        <el-container class="settings">
            <el-main >
    <el-form>
        <el-form-item :label="$t('lang.settings.language')">
            <el-select v-model="lang" @change="onLang">
                <el-option v-for="item in langOptions"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value">
                </el-option>
            </el-select>


        </el-form-item>


        <el-form-item label="关闭音乐">
        <el-switch
                v-model="playing"
                active-color="#13ce66">
            </el-switch>
        </el-form-item>

    </el-form>
    </el-main>
    </el-container>
</template>

<script>
    export default {
        name: "Settings",
        data() {
            return {
                playing: true,
                lang: 'zh',
                langOptions: [{
                    value: 'en',
                    label: 'English'
                }, {
                    value: 'zh',
                    label: '中文'
                }]
            }
        },
        methods: {
            onLang() {
                this.$i18n.locale = this.lang
            }
        },
        watch:{
            playing(newvalue){
                console.log(newvalue);
                this.$store.dispatch('setPlaying',newvalue)
            }
        }
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