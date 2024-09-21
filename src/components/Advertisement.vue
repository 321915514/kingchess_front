<template>
    <div class="container">
        <!-- <el-image :src="src" fit="fill"/> -->
         <div class="content">
         <h5 style="text-align: center;">国王与大臣棋规则</h5>
         <span>1. 2颗黑棋代表国王(或老虎)，24 颗白棋代表大臣(或羊)</span>

         <span>2. 首先将2颗黑棋和8颗白棋摆好，其余 16颗黑棋放在旁边。</span>

         <span>3. 黑棋先行可以向上下左右方向跳吃白子，也可自由移动一步；</span>

         <span>4. 黑棋跳吃 1颗白子后，被跳过的白子将被吃放到旁边，白棋则从旁边的 16颗子中拿 1颗放在需要的交叉点上，可以选择任何一个点。</span>

         <span>6. 当开始预备的 16颗白子都放到棋盘上后，白棋就只能靠每次移动一步来行棋，预备的 16颗白子没有用完的时候，白棋不能移动棋盘上的棋子；</span>

         <span>7. 当白棋把黑棋困住，使黑棋既不能跳吃白棋，也不能移动的时候，白胜。</span>

         <span>8. 当黑棋吃掉11颗白子或白棋无法困住黑棋时，黑胜。</span>

         </div>
    </div>
</template>

<script>
    export default {
        name: "Advertisement",
        data() {
            return {
                src: require('../assets/images/ad2.jpg')
            }
        }
    }
</script>

<style scoped>
   html {
      font-size: 16px;
    }
    .container {
        margin-top: 3%;
        height: calc(50vh);
        min-height: 180px;
        display: flex;
    }
    .content{
        border: 1px solid black ;
        border-radius: 10px;
        margin-top: 3px;
        margin-left: 2px;
        margin-right: 2px;
        padding-left: 3vh;
        padding-right: 3vh;
        padding-bottom: 2vh;
        flex: 1;
        display: flex;
        flex-direction: column;

        overflow-x: auto; /* 水平滚动条 */

    }
    div span{
        flex: 1;
        
    }

    /* div span {
      font-size: 1em;

    }

    @media (max-height: 400px) {
      div span {
        font-size: 0.8em;
       
      }
    }

    @media (min-height: 600px) {
      div span {
        font-size: 1.2em;

      }
    } */

</style>