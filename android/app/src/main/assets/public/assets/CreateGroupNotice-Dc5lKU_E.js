import{r,Q as q,j as s,P as G,N as I,$ as n,o as M,b as D,ae as g,at as E,f as l,ah as P}from"./index-Bku3qZqe.js";import{C as w,a as A}from"./card-DcP_RgLU.js";const T=({f7route:a,f7router:x})=>{var N,b,j;const c=r.useMemo(()=>{var e;return(e=a==null?void 0:a.params)==null?void 0:e.group_id},[(N=a==null?void 0:a.params)==null?void 0:N.group_id]),p=r.useMemo(()=>{var e;return console.log(a==null?void 0:a.query),((e=a==null?void 0:a.query)==null?void 0:e.admin)==="true"},[(b=a==null?void 0:a.query)==null?void 0:b.dmin]),d=r.useMemo(()=>{var e;return(e=a==null?void 0:a.query)==null?void 0:e.id},[(j=a==null?void 0:a.query)==null?void 0:j.id]),m=r.useMemo(()=>d===void 0,[d]),[t,o]=r.useState({group_id:c?parseInt(c):-1,title:"",content:""}),[h,y]=r.useState({group_id:c?parseInt(c):-1,title:"",content:""});q(async()=>{if(m)return;const{code:e,data:i}=await g.getGroupAnnouncementApi({group_id:c,id:d});e===200&&(y(i),o(E(t,(_,v)=>{const u=i[v];return["group_id","id"].includes(v)&&typeof u=="string"?parseInt(u):u})),await g.readGroupAnnouncementApi({group_id:parseInt(c),id:parseInt(d)}))},()=>{},[m,c,d]);const C=async()=>{try{l.dialog.preloader(n("创建中..."));const{code:e,msg:i}=await g.createGroupAnnouncementApi(t);if(e!==200){l.dialog.alert(n(i));return}e===200&&(x.back(),o({...t,title:"",content:""}))}catch(e){l.dialog.alert(n((e==null?void 0:e.message)||"群公告创建失败..."))}finally{l.dialog.close()}},k=async()=>{try{l.dialog.preloader(n("编辑中..."));const e={...h,...t};P(e,["group_id","id","title","content"]);const{code:i,msg:_}=await g.updateGroupAnnouncementApi(e);if(i!==200){l.dialog.alert(n(_));return}i===200&&(x.back(),o({...t,title:"",content:""}),y({...h,title:"",content:""}))}catch(e){l.dialog.alert(n((e==null?void 0:e.message)||"群公告编辑失败..."))}finally{l.dialog.close()}};return s.jsxs(G,{noToolbar:!0,className:"bg-bgTertiary",children:[s.jsx(I,{title:m?n("创建群公告"):n(p?"编辑群公告":"群公告详情"),backLink:!0,className:"bg-bgPrimary",children:s.jsx(M,{children:p&&s.jsx(D,{large:!0,disabled:!t.title||!t.content,onClick:m?C:k,children:n("完成")})})}),s.jsx(w,{className:"coss_card_title",children:s.jsx(A,{className:"flex justify-center flex-col items-center",children:p?s.jsx("input",{className:"bg-transparent w-full text-base",name:"title",placeholder:n("请输入标题"),value:t==null?void 0:t.title,onChange:e=>o({...t,title:e.target.value})}):s.jsx("div",{className:"w-full break-all text-base",children:t==null?void 0:t.title})})}),s.jsx(w,{className:"coss_card_content",children:s.jsx(A,{className:"flex justify-center flex-col items-center",children:p?s.jsx("textarea",{className:"bg-transparent w-full",name:"content",placeholder:n("请填写内容"),rows:5,value:t==null?void 0:t.content,onChange:e=>o({...t,content:e.target.value})}):s.jsx("div",{className:"text-gray-600 w-full break-all",children:t==null?void 0:t.content})})})]})};export{T as default};
