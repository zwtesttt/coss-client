(function(){"use strict";let o=null;self.onmessage=function(n){console.log("Worker收到",n.data);const{event:l,data:e}=n.data;switch(console.log(l),l){case"timer_start":{const t=(e==null?void 0:e.duration)||0;o=r(t)()}break;case"timer_stop":o&&o();break}};function r(n){let l=null,e=null,t=0;try{t=n/1e3}catch{t=0}return console.log("开始计时"),()=>(l=setInterval(()=>{t-=1,console.log("剩余",t),self.postMessage({event:"time_change",data:{remainder:t}})},1e3),e=setTimeout(()=>{self.postMessage({event:"timeout",data:null}),clearInterval(l),clearTimeout(e)},n),()=>{clearInterval(l),clearTimeout(e)})}})();
