import{r as l,g as L,a3 as A,V as I,X as h,h as P,i as _,R as u,a0 as m,_ as $,f as D}from"./index-Bku3qZqe.js";function g(){return g=Object.assign?Object.assign.bind():function(t){for(var r=1;r<arguments.length;r++){var e=arguments[r];for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&(t[a]=e[a])}return t},g.apply(this,arguments)}const y=l.forwardRef((t,r)=>{const e=l.useRef(null),{className:a,id:E,style:v,init:b=!0,checked:f,defaultChecked:C,disabled:i,readonly:p,name:R,value:T}=t,x=L(t),c=l.useRef(null),s=l.useRef(null),d=n=>{m(t,"change",n)};l.useImperativeHandle(r,()=>({el:c.current,f7Toggle:()=>e.current})),A(c,t),I(f,n=>{e.current&&(e.current.checked=n)});const k=n=>{m(t,"toggleChange",n.checked)},o=n=>{e.current&&e.current[n]("toggleChange",k)},N=()=>{$(()=>{!b||!c.current||(e.current=D.toggle.create({el:c.current}),o("on"))})},O=()=>{e.current&&e.current.destroy&&e.current.$el&&e.current.destroy(),e.current=null};h(()=>(o("on"),s.current&&s.current.addEventListener("change",d),()=>{o("off"),s.current&&s.current.removeEventListener("change",d)})),h(()=>(N(),O),[]);const j=P("toggle",a,{disabled:i},_(t)),w=u.createElement("input",{ref:s,type:"checkbox",name:R,disabled:i,readOnly:p,checked:f,defaultChecked:C,value:T,onChange:()=>{}});return u.createElement("label",g({id:E,style:v,className:j,ref:c},x),w,u.createElement("span",{className:"toggle-icon"}))});y.displayName="f7-toggle";const M=y;export{M as T};
