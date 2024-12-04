import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import router from './router/index.js'
import './assets/theme/scrollbar.css'
import './assets/theme/container.css'
import './assets/theme/chess.css'
import store from './store'
import VueI18n from 'vue-i18n'
import Cookie from 'js-cookie'
import {userLogin} from './api/index'
Vue.config.productionTip = false
Vue.config.productionTip = false
Vue.use(ElementUI, { locale })
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    'en': require('./constants/lang/en'),
    'zh': require('./constants/lang/zh')
  }
})

// const token = Cookie.get('id');
// userLogin(token)


// 添加全局守卫
router.beforeEach((to, from, next) => {



  const token = store.getters.player.id;
  // console.log(token);
  
  // userLogin(token)

//   if(from.name == 'null'){
//     next({ name: 'login' });
// }

  // if(token == undefined || token == null){
  //   console.log(from.name);
  //   console.log(to.name);
  //   next({ name: 'login' });
  // }
  if(token != undefined && token != null){
    // 登陆了
    // 获取设置Cookie时的时间戳
    // userLogin(token).then((data)=>{
    //   if(data.data.code == 2000){
    //     if(data.data.message<=0){
    //       store.getters.player.id = ''
    //       next({ name: 'login' });
    //       // next();
    //     }else{
    //       // console.log(data.data.message);
    //       next();
    //     }
    //   }
    // })
    // const setTimeStamp = parseInt(Cookie.get('id_set_time'));
    // // 计算当前时间戳
    // const currentTimeStamp = Date.now();
    // // 根据设置Cookie时的过期时长（这里是3 * 60 * 60 秒）计算过期时间戳
    // const expirationTimeStamp = setTimeStamp + (3 * 60 * 60 * 1000);

    // if (currentTimeStamp >= expirationTimeStamp) {
    //     // Cookie已过期，清除相关Cookie信息
    //     Cookie.remove('id');
    //     Cookie.remove('id_set_time');
    //     // 重定向到登录页面，并传递一个参数表示是因为Cookie过期而跳转的
    //     next({ name: 'login'});
    // }else{
      next();
    // }
  }else{
    // 没有登录
    // console.log("没有登录");
    
    if (to.name!== 'login' && to.name!== 'register') {
      next({ name: 'login' });
    } 
    // else if (token && to.name === 'login') {
    //   next({ name: 'game' });
    // } 
    else if (to.name === 'register') {
      // 如果没有登录且要去注册页面，直接允许导航
      next();
    } 
    // else if (token && to.name === 'register') {
    //   // 如果已登录且要去注册页面，可以根据需求进行处理，比如重定向到其他页面或阻止导航
    //   next({ name: 'game' }); // 这里只是示例，你可以根据实际情况调整
    else {
      next();
    }
  }

});

new Vue({
  render: h => h(App),
  router,
  store,
  i18n
}).$mount('#app')
