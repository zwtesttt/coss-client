import{r as h,g as v,h as G,i as V,R as S,v as O,e as U,a9 as o,w as q,u as M,O as W,j as a,P as $,N as B,K as H,b as i,$ as n,L as K,l as Q,aa as y,ab as N,ac as E,q as d,f as u,G as F,ad as w,F as z}from"./index-Co9Jrsve.js";function T(){return T=Object.assign?Object.assign.bind():function(t){for(var p=1;p<arguments.length;p++){var g=arguments[p];for(var x in g)Object.prototype.hasOwnProperty.call(g,x)&&(t[x]=g[x])}return t},T.apply(this,arguments)}const P=h.forwardRef((t,p)=>{const{className:g,id:x,style:A,children:_,raised:I,raisedIos:j,raisedMd:f,round:R,roundIos:s,roundMd:r,strong:e,strongIos:l,strongMd:c,tag:C="div"}=t,b=v(t),L=h.useRef(null);h.useImperativeHandle(p,()=>({el:L.current}));const D=G(g,{segmented:!0,"segmented-raised":I,"segmented-raised-ios":j,"segmented-raised-md":f,"segmented-round":R,"segmented-round-ios":s,"segmented-round-md":r,"segmented-strong":e,"segmented-strong-ios":l,"segmented-strong-md":c},V(t)),k=C;return S.createElement(k,T({id:x,style:A,className:D,ref:L},b),_,(e||l||c)&&S.createElement("span",{className:"segmented-highlight"}))});P.displayName="f7-segmented";const J=P,m=O(U)||"",Y=()=>{const[t,p]=h.useState(o.FRIEND),[g,x]=h.useState([]),{updateContacts:A}=q(),_=M(()=>d.findAll(d.tables.apply_list))||[],I=async()=>{const r=(await d.findAll(d.tables.apply_list)).filter(e=>t===o.FRIEND?e==null?void 0:e.sender_id:!(e!=null&&e.sender_id));return x(r),r},j=async()=>{try{const s=await I();console.log("applyList",s);const{data:r}=t===o.FRIEND?await F.friendApplyListApi({user_id:m}):await w.groupRequestListApi({user_id:m});r.map(async e=>{const l=s.find(c=>(c==null?void 0:c.id)===(e==null?void 0:e.id));l?!z(l,e)&&await d.update(d.tables.apply_list,"id",e==null?void 0:e.id,e):await d.add(d.tables.apply_list,{...e})})}catch(s){console.error("获取申请列表失败",s)}};h.useEffect(()=>{_.length&&(console.log("获取更新",_),I())},[_]),W(async()=>{await j()},()=>{},[t]);const f=async(s,r=0)=>{try{u.dialog.preloader(n("处理中..."));const e=r===E.ACCEPT;let l="";e&&(l="test");const{code:c}=t===o.FRIEND?await F.manageFriendApplyApi({request_id:s.id,action:r,e2e_public_key:l}):await w.manageGroupRequestApi({group_id:s.group_id,action:r,e2e_public_key:l});if(c!==200)return u.dialog.alert(n("处理好友请求失败"));await d.update(d.tables.apply_list,"id",s.id,{...s,status:e?N.ACCEPT:N.REFUSE}),await j(),A(!0)}catch(e){console.error("处理好友请求失败",e),u.dialog.alert(n("处理好友请求失败"))}finally{u.dialog.close()}},R=async(s,r=0)=>{try{u.dialog.preloader(n("处理中..."));const{code:e}=await w.manageGroupApplyApi({group_id:s.group_id,action:r});if(e!==200)return u.dialog.alert(n("加入群聊失败"));await d.update(d.tables.apply_list,"id",s.id,{...s,status:N.ACCEPT})}catch(e){console.error("加入群聊失败",e),u.dialog.alert(n("加入群聊失败"))}finally{u.dialog.close()}};return a.jsxs($,{noToolbar:!0,className:"bg-bgTertiary",onPageBeforeOut:()=>A(!0),children:[a.jsx(B,{backLink:!0,className:"coss_applylist_navbar bg-bgPrimary hidden-navbar-bg",children:a.jsx(H,{children:a.jsxs(J,{strong:!0,children:[a.jsx(i,{active:t===o.FRIEND,onClick:()=>p(o.FRIEND),children:n("好友申请")}),a.jsx(i,{active:t===o.GROUP,onClick:()=>p(o.GROUP),children:n("群聊申请")})]})})}),a.jsx(K,{strongIos:!0,className:"mt-0",mediaList:!0,children:g.map((s,r)=>{var e,l,c,C,b;return a.jsxs(Q,{text:(s==null?void 0:s.remark)||n("对方没有留言"),children:[a.jsx("div",{slot:"media",className:"w-12 h-12",children:a.jsx("img",{src:(e=s==null?void 0:s.receiver_info)==null?void 0:e.user_avatar,alt:"",className:"w-full h-full object-cover rounded-full"})}),a.jsx("span",{slot:"title",children:t===o.FRIEND?a.jsx("span",{children:(l=s==null?void 0:s.receiver_info)==null?void 0:l.user_name}):[y.WAIT,y.INVITE_RECEIVER].includes(s.status)?((c=s.sender_info)==null?void 0:c.user_name)+"邀请你加入"+s.group_name:s.status===y.INVITE_SENDER?"等待"+s.receiver_info.user_name+"验证":""}),a.jsx("div",{slot:"content",className:"pr-2",children:t===o.FRIEND?[N.PENDING,N.INVITE_RECEIVER].includes(s.status)?m===((s==null?void 0:s.sender_id)||((C=s==null?void 0:s.sender_info)==null?void 0:C.user_id))?a.jsx(i,{className:"text-sm text-gray-500 ",disabled:!0,children:t===o.FRIEND?n("等待对方同意"):n("申请中")}):a.jsxs("div",{className:"flex",children:[a.jsx(i,{className:"text-sm text-red-500",onClick:()=>f(s,E.REFUSE),children:"拒绝"}),a.jsx(i,{className:"text-sm text-primary",onClick:()=>f(s,E.ACCEPT),children:"同意"})]}):N.ACCEPT===s.status?a.jsx(i,{className:"text-sm text-primary",disabled:!0,children:n("已同意")}):a.jsx(i,{className:"text-sm text-primary text-red-500 ",disabled:!0,children:n("已拒绝")}):[y.WAIT,y.INVITE_RECEIVER].includes(s.status)?a.jsxs("div",{className:"flex",children:[s.status===y.WAIT&&((b=s==null?void 0:s.sender_info)==null?void 0:b.user_id)===m&&a.jsxs(a.Fragment,{children:[a.jsx(i,{className:"text-sm text-red-500",onClick:()=>f(s,E.REFUSE),children:"拒绝"}),a.jsx(i,{className:"text-sm text-primary",onClick:()=>f(s,E.ACCEPT),children:"同意"})]}),s.status===y.INVITE_RECEIVER&&a.jsxs(a.Fragment,{children:[a.jsx(i,{className:"text-sm text-red-500",onClick:()=>R(s,E.REFUSE),children:"拒绝"}),a.jsx(i,{className:"text-sm text-primary",onClick:()=>R(s,E.ACCEPT),children:"同意"})]})]}):a.jsx("span",{className:" text-xs text-gray-500 mx-1 whitespace-nowrap",children:n("等待中")})})]},r)})})]})};export{Y as default};
