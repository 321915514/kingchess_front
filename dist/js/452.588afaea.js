"use strict";(self["webpackChunkchess"]=self["webpackChunkchess"]||[]).push([[452],{4452:function(l,e,n){n.r(e),n.d(e,{default:function(){return r}});var a=function(){var l=this,e=l._self._c;return e("el-container",{staticClass:"settings"},[e("el-main",[e("el-form",[e("el-form-item",{attrs:{label:l.$t("lang.settings.language")}},[e("el-select",{on:{change:l.onLang},model:{value:l.lang,callback:function(e){l.lang=e},expression:"lang"}},l._l(l.langOptions,(function(l){return e("el-option",{key:l.value,attrs:{label:l.label,value:l.value}})})),1)],1),e("el-form-item",{attrs:{label:"关闭音乐"}},[e("el-switch",{attrs:{"active-color":"#13ce66"},model:{value:l.playing,callback:function(e){l.playing=e},expression:"playing"}})],1)],1)],1)],1)},t=[],s={name:"Settings",data(){return{playing:!0,lang:"zh",langOptions:[{value:"en",label:"English"},{value:"zh",label:"中文"}]}},methods:{onLang(){this.$i18n.locale=this.lang}},watch:{playing(l){console.log(l),this.$store.dispatch("setPlaying",l)}}},i=s,o=n(1656),c=(0,o.A)(i,a,t,!1,null,"d13b3d0c",null),r=c.exports}}]);
//# sourceMappingURL=452.588afaea.js.map