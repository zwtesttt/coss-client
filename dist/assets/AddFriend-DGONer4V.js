import{r as d,j as a,P as m,N as b,$ as e,S as g,p,L as h,l as x,f as i,q as c,U as u}from"./index-Bku3qZqe.js";import{v as f}from"./validate-6tRYFLtu.js";const j=({f7router:l})=>{const[s,t]=d.useState(""),o=async()=>{if(!f(s))return i.dialog.alert(e("请输入正确的邮箱地址"));try{i.dialog.preloader(e("搜索中..."));const r=await c.findOneById(c.tables.friends,"email",s);if(r){l.navigate(`/profile/${r.user_id}/`);return}const{data:n}=await u.searchUserApi({email:s});if(!n){i.dialog.alert(e("搜索用户不存在"));return}l.navigate(`/personal_detail/${n.user_id}/`)}catch(r){console.error("搜索用户失败",r),i.dialog.alert(e("搜索用户失败"))}finally{i.dialog.close()}};return a.jsxs(m,{noToolbar:!0,className:"bg-bgTertiary coss_add",children:[a.jsx(b,{className:"hidden-navbar-bg bg-bgPrimary",backLink:!0,title:e("添加好友"),children:a.jsx(g,{inner:!1,className:"bg-bgPrimary coss_navbar_search",children:a.jsx(p,{placeholder:e("搜索邮箱"),disableButtonText:e("取消"),onChange:r=>t(r.target.value),onClickClear:()=>t(""),onClickDisable:()=>l.back()})})}),a.jsx(h,{className:"m-0 bg-bgPrimary py-2",children:!!s&&a.jsx(x,{link:!0,onClick:o,children:a.jsxs("div",{className:"flex items-center max-w-[70%] overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1",children:[e("查找："),a.jsx("span",{className:"text-primary",children:s})]})})})]})};export{j as default};
