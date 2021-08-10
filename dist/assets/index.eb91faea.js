var e=Object.defineProperty,t=Object.defineProperties,r=Object.getOwnPropertyDescriptors,n=Object.getOwnPropertySymbols,a=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,s=(t,r,n)=>r in t?e(t,r,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[r]=n,o=(e,t)=>{for(var r in t||(t={}))a.call(t,r)&&s(e,r,t[r]);if(n)for(var r of n(t))l.call(t,r)&&s(e,r,t[r]);return e},i=(e,n)=>t(e,r(n));import{r as c,R as d,c as m,s as p,f as u,b as E,C as g,a as h,n as x,h as f,e as $,t as b,S as T,L as w,d as y,g as S,i as v,j as I,k as O,l as N,m as A,o as C,p as k,u as R,H as D,q as L,v as _,w as P,x as M,y as G,T as U,B as W,z as B,A as H,D as F,E as K,F as V,G as Y,I as j,J as z,K as q,M as X,N as Z,O as J,P as Q,Q as ee,U as te,V as re,W as ne,X as ae,Y as le,Z as se,_ as oe,$ as ie,a0 as ce,a1 as de,a2 as me,a3 as pe,a4 as ue,a5 as Ee}from"./vendor.14666403.js";const ge=e=>{window.guardian&&window.guardian.ophan&&window.guardian.ophan.record&&window.guardian.ophan.record(e)},he=({component:e,atomId:t,value:r})=>ge({component:e,atomId:t,value:r});var xe,fe,$e,be,Te,we,ye,Se,ve;(fe=xe||(xe={})).BOLD="Bold",fe.MEDIUM="Medium",fe.REGULAR="Regular",fe.LIGHT="Light",(be=$e||($e={}))[be.BOLD=700]="BOLD",be[be.MEDIUM=500]="MEDIUM",be[be.REGULAR=400]="REGULAR",be[be.LIGHT=300]="LIGHT",(Te||(Te={})).ITALIC="Italic",(ye=we||(we={})).TITLEPIECE="GT Guardian Titlepiece",ye.HEADLINE="GH Guardian Headline",ye.EGYPTIAN="GuardianTextEgyptian",ye.SANS="GuardianTextSans",(ve=Se||(Se={})).TITLEPIECE="fonts/guardian-titlepiece/noalts-not-hinted/GTGuardianTitlepiece",ve.HEADLINE="fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline",ve.EGYPTIAN="fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian",ve.SANS="fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans";const Ie=["woff2","woff","ttf"],Oe=[{family:we.TITLEPIECE,path:`${Se.TITLEPIECE}-${xe.BOLD}`,weight:$e.BOLD},{family:we.HEADLINE,path:`${Se.HEADLINE}-${xe.BOLD}`,weight:$e.BOLD},{family:we.HEADLINE,path:`${Se.HEADLINE}-${xe.MEDIUM}`,weight:$e.MEDIUM},{family:we.HEADLINE,path:`${Se.HEADLINE}-${xe.MEDIUM}${Te.ITALIC}`,weight:$e.MEDIUM,style:Te.ITALIC.toLowerCase()},{family:we.HEADLINE,path:`${Se.HEADLINE}-${xe.LIGHT}`,weight:$e.LIGHT},{family:we.HEADLINE,path:`${Se.HEADLINE}-${xe.LIGHT}${Te.ITALIC}`,weight:$e.LIGHT,style:Te.ITALIC.toLowerCase()},{family:we.EGYPTIAN,path:`${Se.EGYPTIAN}-${xe.BOLD}`,weight:$e.BOLD},{family:we.EGYPTIAN,path:`${Se.EGYPTIAN}-${xe.BOLD}${Te.ITALIC}`,weight:$e.BOLD,style:Te.ITALIC.toLowerCase()},{family:we.EGYPTIAN,path:`${Se.EGYPTIAN}-${xe.REGULAR}`,weight:$e.REGULAR},{family:we.EGYPTIAN,path:`${Se.EGYPTIAN}-${xe.REGULAR}${Te.ITALIC}`,weight:$e.REGULAR,style:Te.ITALIC.toLowerCase()},{family:we.SANS,path:`${Se.SANS}-${xe.BOLD}`,weight:$e.BOLD},{family:we.SANS,path:`${Se.SANS}-${xe.REGULAR}`,weight:$e.REGULAR},{family:we.SANS,path:`${Se.SANS}-${xe.REGULAR}${Te.ITALIC}`,weight:$e.REGULAR,style:Te.ITALIC.toLowerCase()}],Ne=({family:e,path:t,weight:r,style:n})=>{const a=(e=>`https://assets.guim.co.uk/static/frontend/${e}`)(t);return{fontFamily:e,fontWeight:r,fontStyle:n,src:Ie.reduce(((e,t,r)=>`${e}${0!==r?",":""} url(${a}.${t}) format('${t}')`),""),fontDisplay:"swap"}},Ae=Oe.map((e=>({"@font-face":Ne(e)}))),Ce=c.exports.createContext({clientHosts:{idapiBaseUrl:""}}),ke=e=>d.createElement(Ce.Provider,{value:e.clientState},e.children);var Re,De,Le,_e,Pe,Me;(De=Re||(Re={})).REGISTRATION="/register",De.SIGN_IN="/signin",De.SIGN_IN_CURRENT="/signin/current",De.RESET="/reset",De.RESET_SENT="/reset/email-sent",De.RESET_RESEND="/reset/resend",De.CHANGE_PASSWORD="/reset-password",De.CHANGE_PASSWORD_TOKEN="/:token",De.CHANGE_PASSWORD_COMPLETE="/password/reset-confirmation",De.VERIFY_EMAIL="/verify-email",De.VERIFY_EMAIL_SENT="/verify-email/email-sent",De.VERIFY_EMAIL_TOKEN="/:token",De.CONSENTS="/consents",De.CONSENTS_DATA="/data",De.CONSENTS_COMMUNICATION="/communication",De.CONSENTS_NEWSLETTERS="/newsletters",De.CONSENTS_REVIEW="/review",De.CONSENTS_FOLLOW_UP_NEWSLETTERS="/follow-up",De.CONSENTS_FOLLOW_UP_CONSENTS="/follow-on",De.UNEXPECTED_ERROR="/error",De.MAGIC_LINK="/magic-link",De.MAGIC_LINK_SENT="/magic-link/email-sent",De.WELCOME="/welcome",(_e=Le||(Le={})).RESET_REQUEST_EMAIL="/pwd-reset/send-password-reset-email",_e.SIGN_IN="/signin",_e.CHANGE_PASSWORD_TOKEN_VALIDATION="/pwd-reset/user-for-token",_e.CHANGE_PASSWORD="/pwd-reset/reset-pwd-for-user",_e.VERIFY_EMAIL="/user/validate-email",_e.RESEND_VERIFY_EMAIL="/user/send-validation-email",(Me=Pe||(Pe={})).NOT_FOUND="Not Found",Me.UNEXPECTED_ERROR="Unexpected Error",Me.REGISTRATION="Register",Me.RESET="Reset Password",Me.MAGIC_LINK="Sign in",Me.RESET_SENT="Check Your Inbox",Me.RESET_RESEND="Resend Reset Password",Me.SIGN_IN="Sign in",Me.CHANGE_PASSWORD="Change Password",Me.CHANGE_PASSWORD_COMPLETE="Password Changed",Me.VERIFY_EMAIL="Verify Email",Me.NEWSLETTER_VARIANT="Get the headlines sent to your inbox",Me.CONSENT_VARIANT="Get the latest offers sent to your inbox";const Ge=m`
  > div {
    padding-left: ${p[3]}px;
    padding-right: ${p[3]}px;
    ${u.tablet} {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
`,Ue=m`
  > div {
    padding: 0;
  }
`,We=({children:e,sidePadding:t=!0,topBorder:r,sideBorders:n,borderColor:a=E.primary,backgroundColor:l})=>{return d.createElement(g,{sideBorders:n,topBorder:r,borderColor:a,backgroundColor:l,cssOverrides:[t?Ge:Ue,n?(s=a,m`
  border-left-color: ${s} !important;
  border-right-color: ${s};
`):m``]},e);var s},Be=m`
  background-color: ${h[300]};
`,He=m`
  ${u.mobileMedium} {
    padding-top: ${p[12]}px;
  }
  ${u.tablet} {
    padding-top: ${p[24]}px;
  }
  ${u.desktop} {
    padding-top: calc(${p[24]}px + ${p[6]}px);
  }
`,Fe=m`
  width: 100%;
  margin: 0;
  padding-top: ${p[1]}px;
  padding-bottom: ${p[1]}px;
  padding-right: ${p[1]}px;
  color: ${x[100]};

  ${f.xsmall({fontWeight:"bold",lineHeight:"tight"})}
  ${u.tablet} {
    margin: 0;
    ${f.large({fontWeight:"bold",lineHeight:"regular"})}
  }
`,Ke=({title:e})=>c.exports.createElement("header",{css:[Be,He]},c.exports.createElement(We,{topBorder:!0,sideBorders:!0},c.exports.createElement("h1",{css:[Fe]},e)));var Ve,Ye,je,ze,qe,Xe;(Ye=Ve||(Ve={}))[Ye.MOBILE=4]="MOBILE",Ye[Ye.TABLET=12]="TABLET",Ye[Ye.DESKTOP=12]="DESKTOP",Ye[Ye.WIDE=16]="WIDE",(ze=je||(je={})).MOBILE="minmax(0, 1fr)",ze.TABLET="40px",ze.DESKTOP="60px",ze.WIDE="60px",(Xe=qe||(qe={}))[Xe.MOBILE=p[3]]="MOBILE",Xe[Xe.TABLET=p[5]]="TABLET",Xe[Xe.DESKTOP=p[5]]="DESKTOP",Xe[Xe.WIDE=p[5]]="WIDE";const Ze={MOBILE:{start:1,span:4},TABLET:{start:1,span:12},DESKTOP:{start:1,span:12},WIDE:{start:1,span:16}},Je=e=>`${e}px`,Qe=(e,t,r,n)=>t*e+(e-1)*r+2*n;var et,tt;(tt=et||(et={}))[tt.TABLET=Qe(12,40,p[5],p[5])]="TABLET",tt[tt.DESKTOP=Qe(12,60,p[5],p[5])]="DESKTOP",tt[tt.WIDE=Qe(16,60,p[5],p[5])]="WIDE";const rt=(e,t,r,n)=>`\n    -ms-grid-columns: (${t} 20px)[${r-1}] ${t};\n    grid-template-columns: repeat(${r}, ${t});\n    padding-left: ${Je(e)};\n    padding-right: ${Je(e)};\n    max-width: ${n?Je(n):"100%"};\n`,nt=m`
  display: -ms-grid;
  display: grid;
  width: 100%;
  column-gap: ${Je(p[5])};

  -ms-grid-columns: \(${je.MOBILE}\)\[${4}\];
  grid-template-columns: repeat(${4}, ${je.MOBILE});
  padding-left: ${Je(qe.MOBILE)};
  padding-right: ${Je(qe.MOBILE)};

  ${rt(qe.MOBILE,je.MOBILE,4)}

  ${u.tablet} {
    ${rt(qe.TABLET,je.TABLET,12,et.TABLET)}
  }

  ${u.desktop} {
    ${rt(qe.DESKTOP,je.DESKTOP,12,et.DESKTOP)}
  }

  ${u.wide} {
    ${rt(qe.WIDE,je.WIDE,16,et.WIDE)}
  }
`,at=(e,t)=>`\n  -ms-grid-column: ${2*e-1};\n  -ms-grid-column-span: ${2*t-1};\n  grid-column: ${e} / span ${t};\n`,lt=e=>{const{MOBILE:t,TABLET:r,DESKTOP:n,WIDE:a}=o(o({},Ze),e);return m`
    ${at(t.start,t.span)}

    ${u.tablet} {
      ${at(r.start,r.span)}
    }

    ${u.desktop} {
      ${at(n.start,n.span)}
    }

    ${u.wide} {
      ${at(a.start,a.span)}
    }
  `},st={TABLET:{start:2,span:10},DESKTOP:{start:2,span:10},WIDE:{start:3,span:12}},ot={TABLET:{start:2,span:10},DESKTOP:{start:2,span:9},WIDE:{start:3,span:9}},it=(e=0,t)=>{let r=e;return(e=t)=>m`
    ${lt(e)}
    -ms-grid-row: ${++r};
  `},ct=(e,t)=>m`
  ${lt(t)}
  -ms-grid-row: ${e};
  grid-row: ${e};
`,dt=m`
  color: ${x[100]};
`,mt=(e=!1)=>m`
  display: flex;
  justify-content: ${e?"left":"center"};
  text-align: left;
  margin: 0;
  ${dt}
  ${b.medium()}

  svg {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    fill: currentColor;
    vertical-align: middle;
    margin-right: ${p[1]}px;
  }
`,pt=m`
  ${dt}

  :hover {
    ${dt}
  }
`,ut=({error:e,link:t,left:r})=>{const n=r?m`
        ${nt}
        margin: 0 auto;
      `:null,a=r?lt(o(o({},st),{WIDE:{start:1,span:Ve.WIDE}})):null;return d.createElement("div",{css:(l=!r,m`
  padding: ${p[2]}px ${l?p[3]:0}px;
  background-color: ${$[400]};
  width: 100%;
  text-align: center;
`),role:"complementary"},d.createElement("div",{css:n},d.createElement("p",{css:[mt(r),a]},d.createElement(T,null),d.createElement("div",null,e," ",d.createElement(w,{href:t.link,css:pt,subdued:!0},t.linkText)))));var l};var Et,gt;(gt=Et||(Et={}))[gt.WIDE=1300]="WIDE",gt[gt.DESKTOP=980]="DESKTOP",gt[gt.TABLET=740]="TABLET",gt[gt.MOBILE=660]="MOBILE",gt[gt.MOBILE_LANDSCAPE=480]="MOBILE_LANDSCAPE";var ht,xt,ft,$t,bt,Tt,wt,yt,St,vt,It,Ot,Nt,At,Ct,kt,Rt,Dt="https://www.theguardian.com/help/identity-faq",Lt="https://www.theguardian.com/help/terms-of-service",_t="https://www.theguardian.com/help/contact-us",Pt="https://www.theguardian.com/info/privacy",Mt="https://www.theguardian.com/info/tech-feedback",Gt="https://www.theguardian.com/info/cookies";(xt=ht||(ht={})).NOT_FOUND="Not found",xt.MISSING_FIELD="Required field missing",xt.INVALID_TOKEN="Invalid token",xt.TOKEN_EXPIRED="Token expired",xt.ACCESS_DENIED="Access Denied",xt.INVALID_EMAIL_PASSWORD="Invalid email or password",xt.USER_ALREADY_VALIDATED="User Already Validated",xt.BREACHED_PASSWORD="Breached password",xt.EMAIL_IN_USE="Email in use",($t=ft||(ft={})).GENERIC="There was a problem resetting your password, please try again.",$t.NO_ACCOUNT="There is no account for that email address, please check for typos or create an account.",$t.NO_EMAIL="Email field must not be blank.",(Tt=bt||(bt={})).GENERIC="There was a problem signing in, please try again.",Tt.AUTHENTICATION_FAILED="This email and password combination is not valid.",(wt||(wt={})).GENERIC="There was a problem registering, please try again.",(St=yt||(yt={})).GENERIC="There was a problem changing your password, please try again.",St.INVALID_TOKEN="The token that was supplied has expired, please try again.",St.PASSWORD_BLANK="Password field must not be blank",St.PASSWORD_NO_MATCH="The passwords do not match, please try again",St.PASSWORD_LENGTH="Password must be between 8 and 72 characters",St.AT_LEAST_8="Please make sure your password is at least 8 characters long.",St.MAXIMUM_72="Please make sure your password is not longer than 72 characters.",St.COMMON_PASSWORD="This is a common password. Please use a password that is hard to guess.",St.PASSWORDS_NOT_MATCH="Passwords don’t match",St.PASSWORDS_MATCH="Passwords match",St.AT_LEAST_8_SHORT="At least 8 characters",St.MAXIMUM_72_SHORT="Maximum of 72 characters",St.COMMON_PASSWORD_SHORT="please use a password that is hard to guess.",(It=vt||(vt={})).GENERIC="There was problem verifying your email, please try again.",It.TOKEN_EXPIRED="The activation token is no longer valid.",It.INVALID_TOKEN="The token you supplied could not be parsed.",It.USER_ALREADY_VALIDATED="This user account has already been validated",(Ot||(Ot={})).GENERIC="There was a problem displaying newsletter options, please try again.",(At=Nt||(Nt={})).GENERIC="There was a problem saving your choice, please try again.",At.USER="There was a problem retrieving your details, please try again.",At.ACCESS_DENIED="Access Denied",(Ct||(Ct={})).CSRF_ERROR="Sorry, something went wrong. If you made any changes these might have not been saved. Please try again.",(Rt=kt||(kt={})).DEFAULT="Report this error",Rt.PASSWORD="Password FAQs";const Ut={link:Mt,linkText:kt.DEFAULT},Wt=new Map([[yt.PASSWORD_NO_MATCH,{link:Dt,linkText:kt.PASSWORD}]]),Bt=e=>Wt.get(e)||Ut,Ht=m`
  padding: ${p[2]}px 0;
  background-color: ${y[400]};
  width: 100%;
  text-align: center;
`,Ft=m`
  display: flex;
  justify-content: left;
  text-align: left;
  color: ${x[100]};
  margin: 0;
  ${b.medium()}

  svg {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    fill: currentColor;
    vertical-align: middle;
    margin-right: ${p[1]}px;
  }
`,Kt=({success:e})=>{const t=m`
    ${nt}
    margin: 0 auto;
  `,r=lt(o(o({},st),{WIDE:{start:1,span:Ve.WIDE}}));return d.createElement("div",{css:Ht,role:"complementary"},d.createElement("div",{css:t},d.createElement("p",{css:[Ft,r]},d.createElement(S,null),d.createElement("div",null,e))))},Vt=m`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`,Yt=m`
  padding: ${p[6]}px ${p[3]}px;
  max-width: ${Et.TABLET}px;
  width: 100%;
  margin: 0 auto;
`,jt=({subTitle:e,successOverride:t,children:r})=>{const n=c.exports.useContext(Ce),{globalMessage:{error:a,success:l}={}}=n,[s,o]=c.exports.useState(!0);c.exports.useEffect((()=>{const e=setTimeout((()=>{o(!1)}),3e3);return()=>clearTimeout(e)}),[]);const i=l||t;return d.createElement("main",{css:Vt},e&&d.createElement(Ke,{title:e}),a&&d.createElement(ut,{error:a,link:Bt(a)}),s&&i&&d.createElement(Kt,{success:i}),d.createElement("section",{css:Yt},r))},zt=()=>d.createElement(w,{href:"https://www.theguardian.com",title:"The Guardian Homepage",subdued:!0,cssOverrides:m`
        svg {
          fill: currentColor;
        }
        color: white;
        :hover {
          color: white;
        }
      `},d.createElement(v,null)),qt=m`
  padding: ${p[1]}px ${p[3]}px;
  background-color: ${h[400]};
`,Xt=m`
  display: flex;
  justify-content: flex-end;
`,Zt=m`
  svg {
    height: 70px;
  }
  ${u.tablet} {
    svg {
      height: 92px;
    }
  }
  ${u.desktop} {
    svg {
      height: 117px;
    }
  }
`,Jt=()=>d.createElement("header",{id:"top",css:qt},d.createElement(We,null,d.createElement("div",{css:[Xt,Zt]},d.createElement(zt,null)))),Qt=m`
  background-color: ${I.primary};
`,er=m`
  display: flex;
  flex-direction: row;
  margin: 0;
`,tr=m`
  :after {
    transform: translateY(5px);
  }
`,rr=m`
  overflow: hidden;
  position: relative;
  :after {
    border-top: 4px solid ${O.primary};
    left: 0;
    right: 0;
    top: -5px;
    content: '';
    display: block;
    position: absolute;
    transition: transform 0.3s ease-in-out;
  }
`,nr=e=>e?m`
      padding-left: 12px;
      ${u.tablet} {
        padding-left: 20px;
      }
    `:m`
    padding-left: 9px;
  `,ar=m`
  :before {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: ${E.primary};
    ${u.tablet} {
      bottom: 13px;
    }
  }
`,lr=m`
  /* Spacing */
  padding-top: ${p[2]}px;
  padding-bottom: ${p[1]}px;
  padding-right: 20px;
  min-width: 80px;
  ${u.tablet} {
    min-width: 160px;
  }

  /* Text */
  color: ${N.ctaPrimary};
  ${f.xxxsmall({fontWeight:"bold",lineHeight:"tight"})}
  ${u.tablet} {
    ${f.xsmall({fontWeight:"bold",lineHeight:"regular"})}
  }

  /* a tag overrides */
  text-decoration: none;
  :hover {
    color: ${N.ctaPrimary};
    text-decoration: none;
  }

  /* When to show active bar */
  :focus:after {
    transform: translateY(5px);
  }
  :hover:after {
    transform: translateY(5px);
  }
`,sr=({displayText:e,linkTo:t,isActive:r,isFirst:n})=>c.exports.createElement(w,{href:t,css:[lr,nr(n),rr,ar,r&&tr]},e),or=({tabs:e})=>c.exports.createElement("nav",{css:Qt},c.exports.createElement(We,{sideBorders:!0,topBorder:!0,sidePadding:!1},c.exports.createElement("h1",{css:er},e.map(((e,t)=>c.exports.createElement(sr,{key:t,displayText:e.displayText,linkTo:e.linkTo,isActive:e.isActive,isFirst:0===t})))))),ir=m`
  position: relative;
  float: right;
  border-radius: 100%;
  background-color: ${A.primary};
  cursor: pointer;
  height: 42px;
  min-width: 42px;
`,cr=m`
  text-decoration: none;
  color: ${C.anchorPrimary};
  font-weight: bold;
  line-height: 42px;
  display: flex;
  flex-direction: row;
  width: 133px;

  :hover {
    color: ${k[400]};

    .back-to-top-icon {
      background-color: ${k[400]};
    }
  }
`,dr=m`
  :before {
    position: absolute;
    top: 6px;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    border: 2px solid ${C.ctaPrimary};
    border-bottom: 0;
    border-right: 0;
    content: '';
    height: 12px;
    width: 12px;
    transform: rotate(45deg);
  }
`,mr=m`
  display: flex;
  align-items: center;
  ${b.small({fontWeight:"bold"})};
  margin-right: ${p[2]}px;
`,pr=()=>d.createElement(w,{cssOverrides:cr,href:"#top"},d.createElement("span",{css:mr},"Back to top"),d.createElement("span",{className:"back-to-top-icon",css:ir},d.createElement("i",{css:dr}))),ur=m`
  background-color: ${I.primary};
  color: ${C.primary};
  padding-bottom: ${p[1]}px;
  ${b.medium()};
`,Er=m`
  display: flex;
  position: relative;
`,gr=m`
  text-decoration: none;
  padding-bottom: ${p[3]}px;
  display: block;
  line-height: 19px;
  color: ${C.primary};

  :hover {
    text-decoration: underline;
    color: ${k[400]};
  }
`,hr=m`
  list-style: none;
`,xr=m`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-top: ${p[3]}px;
  padding-right: 0;
  padding-bottom: 0;
  padding-left: 0;
  margin-top: 0;
  margin-right: ${p[3]}px;
  margin-bottom: ${p[6]}px;
  margin-left: 0;
`,fr=m`
  border-left: 1px solid ${h[600]};
  padding-left: ${p[3]}px;
  ${u.tablet} {
    padding-left: 20px;
  }
`,$r=m`
  ${b.xxsmall()};

  padding-top: ${p[3]}px !important;
  padding-bottom: ${p[3]}px !important;
  ${R.tablet} {
    padding-top: ${p[6]}px !important;
  }
`,br=m`
  background-color: ${I.primary};
  padding: 0 ${p[2]}px;
  position: absolute;
  bottom: -21px;
  right: ${p[3]}px;
`,Tr=()=>d.createElement("footer",{css:ur},d.createElement(D,{above:"tablet"},d.createElement(We,{sideBorders:!0},d.createElement("div",{css:Er},d.createElement("ul",{css:[hr,xr]},d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Pt},"Privacy policy")),d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:_t},"Contact us")),d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Gt},"Cookie policy"))),d.createElement("ul",{css:[hr,xr,fr]},d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Dt},"Help")),d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Lt},"Terms and Conditions"))),d.createElement("div",{css:br},d.createElement(pr,null))))),d.createElement(D,{below:"tablet"},d.createElement(We,{sideBorders:!0},d.createElement("div",{css:Er},d.createElement("ul",{css:[hr,xr]},d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Pt},"Privacy policy"))),d.createElement("ul",{css:[hr,xr,fr]},d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:_t},"Contact us"))),d.createElement("ul",{css:[hr,xr,fr]},d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Dt},"Help"))),d.createElement("ul",{css:[hr,xr,fr]},d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Lt},"Terms and Conditions"))),d.createElement("ul",{css:[hr,xr,fr]},d.createElement("li",null,d.createElement(w,{cssOverrides:gr,href:Gt},"Cookie policy"))),d.createElement("div",{css:br},d.createElement(pr,null))))),d.createElement(We,{topBorder:!0,sideBorders:!1},d.createElement("div",{css:[$r]},"© ",(new Date).getFullYear()," Guardian News & Media Limited or its affiliated companies. All rights reserved."))),wr=m`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
`,yr=({children:e})=>d.createElement("div",{css:wr},e),Sr=m`
  padding: ${p[3]}px 0;
  max-width: ${Et.MOBILE_LANDSCAPE}px;
  width: 100%;
`,vr=({children:e})=>d.createElement("div",{css:Sr},e),Ir=m`
  margin-bottom: ${p[4]}px;
  ${b.medium({lineHeight:"regular"})}
  color: ${$[400]};
  text-align: center;
`,Or=()=>{var e,t,r;const n=c.exports.useContext(Ce),{pageData:{fieldErrors:a}={}}=n,l=null==(e=null==a?void 0:a.find((e=>"csrf"===e.field)))?void 0:e.message;return d.createElement(d.Fragment,null,l?d.createElement("div",{css:Ir},l):null,d.createElement("input",{type:"hidden",name:"_csrf",value:null==(t=n.csrf)?void 0:t.token}),d.createElement("input",{type:"hidden",name:"_csrfPageUrl",value:null==(r=n.csrf)?void 0:r.pageUrl}))},Nr=m`
  margin-left: -10px;
  width: calc(100% + 20px);
`,Ar=m`
  margin-left: -10px;
  width: 160px;
`,Cr=(e,t)=>{switch(e){case"tight":return t?m`
            margin-top: -3px;
          `:m`
            margin-top: ${p[6]}px;
          `;case"loose":return t?m`
            margin-top: 37px;
          `:m`
            margin-top: ${p[12]}px;
          `}},kr=({size:e="partial",spaceAbove:t="loose",displayText:r})=>r?d.createElement("div",{css:[m`
            display: flex;
            flex-direction: row;
            ${b.small()};
            color: ${N.supporting};
            margin-bottom: -10px;
            width: 100%;

            :before,
            :after {
              content: '';
              flex: 1 1;
              border-bottom: 1px solid ${L.secondary};
              margin: auto;
            }
            :before {
              margin-left: ${"partial"===e?"30%":"-10px"};
              margin-right: 10px;
            }
            :after {
              margin-right: ${"partial"===e?"30%":"-10px"};
              margin-left: 10px;
            }
          `,Cr(t,r)]},r):d.createElement("hr",{css:[m`
          height: 1px;
          border: 0;
          margin-bottom: 3px;
          background-color: ${L.secondary};
        `,"partial"===e?Ar:Nr,Cr(t)]}),Rr=({children:e})=>d.createElement("p",{css:m`
      ${b.small()}
      margin-top: 0;
      margin-bottom: ${p[4]}px;
    `},e),Dr=({children:e,href:t})=>d.createElement(w,{subdued:!0,cssOverrides:m`
      ${b.small()}
    `,href:t},e),Lr=()=>d.createElement(d.Fragment,null,d.createElement(Rr,null,"By proceeding you agree to our"," ",d.createElement(Dr,{href:"https://www.theguardian.com/help/terms-of-service"},"Terms and Conditions")),d.createElement(Rr,null,"You also confirm that you are 13 years or older, or that you have the consent of your parent or a person holding parental responsibility"),d.createElement(Rr,null,"This site is protected by reCAPTCHA and"," ",d.createElement(Dr,{href:"https://policies.google.com/privacy"},"Google's Privacy Policy")," ","and"," ",d.createElement(Dr,{href:"https://policies.google.com/terms"},"Terms of Service")," ","apply.")),_r=m`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  margin: ${p[9]}px 0;
`,Pr=m`
  border-color: ${h[400]};
  justify-content: flex-end;
  min-width: 145px;
`,Mr=m`
  svg {
    margin-top: 3px;
  }
`,Gr=()=>d.createElement("span",{css:m`
      width: ${p[2]}px;
    `}),Ur=({returnUrl:e})=>d.createElement("div",{css:_r},d.createElement(_,{priority:"tertiary",cssOverrides:Pr,icon:d.createElement(P,null),href:`https://oauth.theguardian.com/facebook/signin?returnUrl=${e}`},"Facebook"),d.createElement(Gr,null),d.createElement(_,{priority:"tertiary",cssOverrides:[Pr,Mr],icon:d.createElement(M,null),href:`https://oauth.theguardian.com/google/signin?returnUrl=${e}`},"Google"),d.createElement(Gr,null),d.createElement(_,{priority:"tertiary",cssOverrides:[Pr,Mr],icon:d.createElement(G,null),href:`https://oauth.theguardian.com/apple/signin?returnUrl=${e}`},"Apple")),Wr=m`
  width: 100%;

  ${u.mobileMedium} {
    width: max-content;
  }
`,Br=m`
  width: 100%;

  ${u.mobileMedium} {
    width: max-content;
  }
`,Hr=m`
  margin-bottom: ${p[3]}px;
`,Fr=m`
  padding: ${p[2]}px 0px;
`;m`
  ${u.tablet} {
    max-width: ${et.TABLET}px;
  }

  ${u.desktop} {
    max-width: ${et.DESKTOP}px;
  }

  ${u.wide} {
    max-width: ${et.WIDE}px;
  }
`;const Kr=({returnUrl:e="",email:t=""})=>{const r=e?`?returnUrl=${encodeURIComponent(e)}`:"";return d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(or,{tabs:[{displayText:Pe.SIGN_IN,linkTo:Re.SIGN_IN,isActive:!1},{displayText:Pe.REGISTRATION,linkTo:Re.REGISTRATION,isActive:!0}]}),d.createElement(jt,null,d.createElement(yr,null,d.createElement(vr,null,d.createElement("form",{css:Fr,method:"post",action:`${Re.REGISTRATION}${r}`},d.createElement(Or,null),d.createElement(U,{css:Hr,label:"Email",name:"email",type:"email",defaultValue:t}),d.createElement(U,{css:Hr,label:"Password",name:"password",type:"password"}),d.createElement(W,{css:Br,type:"submit"},"Register")),d.createElement(kr,{size:"full",spaceAbove:"loose",displayText:"or continue with"}),d.createElement(Ur,{returnUrl:e}),d.createElement(kr,{size:"full",spaceAbove:"tight"}),d.createElement(Lr,null)))),d.createElement(Tr,null))},Vr=()=>{const e=c.exports.useContext(Ce),{pageData:t={}}=e,{returnUrl:r,email:n}=t;return d.createElement(Kr,{email:n,returnUrl:r})},Yr=m`
  border-top: 1px solid ${x[86]};
  width: 100%;
`,jr=m`
  margin: 0;
  ${f.xxsmall({fontWeight:"bold",lineHeight:"tight"})}

  ${u.tablet} {
    ${f.xsmall({fontWeight:"bold",lineHeight:"tight"})}
  }
`,zr=({children:e})=>d.createElement("div",{css:Yr},d.createElement("h2",{css:jr},e)),qr=m`
  margin-top: 0;
  margin-bottom: ${p[2]}px;
  ${b.medium({lineHeight:"regular"})}
`,Xr=({children:e})=>d.createElement("p",{css:qr},e),Zr=({email:e="",headerText:t,bodyText:r,buttonText:n,queryString:a=""})=>d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in"},d.createElement(yr,null,d.createElement(zr,null,t),d.createElement(vr,null,d.createElement(Xr,null,r),d.createElement("form",{css:Fr,method:"post",action:`${Re.RESET}${a}`},d.createElement(Or,null),d.createElement(U,{css:Hr,label:"Email address",name:"email",type:"email",defaultValue:e}),d.createElement(W,{css:Br,type:"submit",icon:d.createElement(B,null),iconSide:"right"},n))))),d.createElement(Tr,null)),Jr=()=>{const{search:e}=H(),t=c.exports.useContext(Ce),{pageData:{email:r=""}={}}=t;return d.createElement(Zr,{email:r,headerText:"Forgotten password",bodyText:"Forgotten or need to set your password? We will email you a link to change or set it.",buttonText:"Reset Password",queryString:e})},Qr=({email:e,previousPage:t})=>{const[r,n]=c.exports.useState(!1);return c.exports.useEffect((()=>{n(!0)}),[]),d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in",successOverride:"Email sent"},d.createElement(yr,null,d.createElement(zr,null,"Check your email inbox"),d.createElement(vr,null,e?d.createElement(Xr,null,"We’ve sent an email to ",e,"."):d.createElement(Xr,null,"We’ve sent you an email."),d.createElement(Xr,null,"Please follow the instructions in this email. If you can't find it, it may be in your spam folder."),d.createElement(Xr,null,"The link is only valid for 30 minutes."),e&&t&&r&&d.createElement("form",{method:"post",action:t},d.createElement(Or,null),d.createElement(U,{label:"",name:"email",type:"email",value:e,hidden:!0}),d.createElement("br",null),d.createElement("br",null),d.createElement(W,{css:Br,type:"submit","data-cy":"resend-email-button"},"Resend email"),d.createElement("br",null),d.createElement("br",null)),t&&d.createElement(Xr,null,"Wrong email address?"," ",d.createElement(w,{subdued:!0,href:t},"Change email address"))))),d.createElement(Tr,null))},en=()=>{const e=c.exports.useContext(Ce),{pageData:t={}}=e,{email:r,previousPage:n}=t;return d.createElement(Qr,{email:r,previousPage:n})},tn=m`
  display: inline-block;
`,rn=()=>d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in"},d.createElement(yr,null,d.createElement(zr,null,"Sorry – the page does not exist"),d.createElement(vr,null,d.createElement(Xr,null,"You may have followed an outdated link, or have mistyped a URL. If you believe this to be an error, please"," ",d.createElement(w,{css:tn,href:Mt,subdued:!0},"report it"),".")))),d.createElement(Tr,null)),nn=e=>m`
  border: ${e?`4px solid ${F.textInput.textError}`:`2px solid ${F.textInput.border}`};
  position: absolute;
  bottom: 0px;
  width: 100%;
  height: ${K.inputMedium}px;
  margin-bottom: ${p[3]}px;
  padding: 0 ${p[2]}px;
  pointer-events: none;
`,an=e=>m`
  padding-right: ${e?28:0}px;
`,ln=m`
  border: none;
  :active {
    border: none;
  }
`,sn=({isOpen:e})=>{const t=m`
    position: absolute;
    top: 0;
    left: 0;
    svg {
      width: 30px;
      height: 30px;
    }
  `;return e?d.createElement("div",{css:t},d.createElement(V,null)):d.createElement("div",{css:t},d.createElement(Y,null))},on=({isOpen:e,onClick:t})=>{const r=m`
    width: 30px;
    height: 30px;
    position: absolute;
    right: 5px;
    bottom: 19px;
    border: none;
    background-color: transparent;
    cursor: pointer;
  `;return d.createElement("button",{css:r,onClick:t,title:"show or hide password text","data-cy":"password-input-eye-button","aria-label":"Show password"},d.createElement(sn,{isOpen:e}))},cn=({error:e,onChange:t})=>{const[r,n]=c.exports.useState(!1),{pageData:{browserName:a}={}}=c.exports.useContext(Ce),l=(e=>{switch(e){case"Microsoft Edge":case"Internet Explorer":case"Safari":return!1;default:return!0}})(a);return d.createElement("div",{css:m`
        position: relative;
      `},d.createElement(U,{error:e,onChange:t,label:"New Password",name:"password",supporting:"Must be between 8 and 72 characters",css:Hr,type:r?"text":"password",cssOverrides:[ln,an(l)]}),l?d.createElement(on,{isOpen:!r,onClick:e=>{n((e=>!e)),e.preventDefault()}}):null,d.createElement("div",{css:nn(e)}))},dn=m`
  display: inline-block;
  position: relative;
  top: 3px;
  svg {
    height: 18px;
    width: 18px;
  }
`,mn=m`
  ${b.small()};
  margin-left: 3px;
  display: inline-block;
  color: ${x[46]};
`,pn=m`
  svg {
    background: ${x[46]};
    fill: ${x[100]};
    height: 17px;
    width: 17px;
    border-radius: 50%;
  }
`,un=m`
  margin-bottom: ${p[3]}px;
`,En=()=>d.createElement("div",{css:un},d.createElement("div",{css:[dn,pn]},d.createElement(q,null)),d.createElement("div",{css:mn},yt.MAXIMUM_72_SHORT)),gn=()=>d.createElement("div",{css:un},d.createElement("div",{css:[dn,pn]},d.createElement(q,null)),d.createElement("div",{css:mn},yt.AT_LEAST_8_SHORT)),hn=()=>{const e=m`
    svg {
      background: ${y[400]};
      fill: ${x[100]};
      height: 17px;
      width: 17px;
      border-radius: 50%;
    }
  `;return d.createElement("div",{css:un},d.createElement("div",{css:[dn,e]},d.createElement(X,null)),d.createElement("div",{css:[mn,m`
            font-weight: bold;
            color: ${y[400]};
          `]},"Valid password"))},xn=()=>d.createElement("div",{css:un},d.createElement("div",{css:mn},"Checking...")),fn=()=>{const e=m`
    svg {
      fill: ${$[400]};
      height: 24px;
      width: 24px;
      margin-bottom: -4px;
      margin-top: -4px;
      margin-left: -4px;
    }
  `,t=m`
    color: ${$[400]};
    font-weight: bold;
  `;return d.createElement("div",{css:[un,mn]},d.createElement("div",{css:[dn,e]},d.createElement(T,null)),d.createElement("span",{css:t},"Weak password:")," ",yt.COMMON_PASSWORD_SHORT)},$n=({isWeak:e,isTooShort:t,isTooLong:r,isChecking:n})=>t?d.createElement(gn,null):r?d.createElement(En,null):n?d.createElement(xn,null):e?d.createElement(fn,null):d.createElement(hn,null),bn=j((e=>{const t=z(e),r=t.substr(0,5),n=t.substr(5,t.length);return fetch(`https://api.pwnedpasswords.com/range/${r}`).then((e=>e.text().then((e=>!!e.includes(n.toUpperCase()))))).catch((()=>!1))}),300),Tn=({submitUrl:e,fieldErrors:t})=>{var r;const[n,a]=c.exports.useState(""),[l,s]=c.exports.useState(null==(r=t.find((e=>"password"===e.field)))?void 0:r.message),[o,i]=c.exports.useState(!1),[m,p]=c.exports.useState(!0),[u,E]=c.exports.useState(!1),[g,h]=c.exports.useState(!1);return c.exports.useEffect((()=>{n.length>0&&s(void 0),p(n.length<8),E(n.length>72),n.length>=8&&n.length<=72?(h(!0),bn(n).then((e=>{i(!!e)})).finally((()=>h(!1)))):i(!1)}),[n]),d.createElement("form",{css:Fr,method:"post",action:e,onSubmit:e=>{m?(s(yt.AT_LEAST_8),e.preventDefault()):u?(s(yt.MAXIMUM_72),e.preventDefault()):o&&(s(yt.COMMON_PASSWORD),e.preventDefault())}},d.createElement(Or,null),d.createElement(cn,{error:l,onChange:e=>{a(e.target.value)}}),!l&&d.createElement($n,{isWeak:o,isTooShort:m,isTooLong:u,isChecking:g}),d.createElement(W,{css:Br,type:"submit",icon:d.createElement(B,null),iconSide:"right"},"Save Password"))},wn=({submitUrl:e,email:t,fieldErrors:r})=>d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in"},d.createElement(yr,null,d.createElement(zr,null,"Set Password"),d.createElement(vr,null,d.createElement(Xr,null,"Please enter your new password for ",t),d.createElement(Tn,{submitUrl:e,fieldErrors:r})))),d.createElement(Tr,null)),yn=()=>{const{search:e}=H(),t=c.exports.useContext(Ce),{pageData:{email:r="",fieldErrors:n=[]}={}}=t,{token:a}=Z();return d.createElement(wn,{submitUrl:`${Re.CHANGE_PASSWORD}/${a}${e}`,email:r,fieldErrors:n})},Sn=({returnUrl:e="https://www.theguardian.com/uk"})=>d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in"},d.createElement(yr,null,d.createElement(zr,null,"Password Changed"),d.createElement(vr,null,d.createElement(Xr,null,"Thank you! Your password has been changed."),d.createElement(Xr,null,"You’ve completed updating your Guardian account. Please click the button below to jump back to the Guardian.")),d.createElement(_,{css:Wr,iconSide:"right",nudgeIcon:!0,icon:d.createElement(B,null),href:e},"Continue to The Guardian"))),d.createElement(Tr,null)),vn=()=>{const e=c.exports.useContext(Ce),{pageData:t={}}=e,{returnUrl:r}=t;return d.createElement(Sn,{returnUrl:r})},In=()=>{const e=c.exports.useContext(Ce),{pageData:{email:t=""}={}}=e;return d.createElement(Zr,{email:t,headerText:"Forgotten password link expired",bodyText:"Oh no! The link has expired. Enter your email address and we'll send you another link to change or set your password.",buttonText:"Send me another"})};var On,Nn,An,Cn;(Nn=On||(On={})).PROFILING="profiling_optout",Nn.MARKET_RESEARCH="market_research_optout",Nn.SUPPORTER="supporter",Nn.JOBS="jobs",Nn.HOLIDAYS="holidays",Nn.EVENTS="events",Nn.OFFERS="offers",On.PROFILING,On.MARKET_RESEARCH,On.SUPPORTER,(Cn=An||(An={})).YOUR_DATA="Your data",Cn.CONTACT="Stay in touch",Cn.NEWSLETTERS="Newsletters",Cn.REVIEW="Review";const kn=[An.CONTACT,An.NEWSLETTERS,An.YOUR_DATA],Rn=m`
  color: ${J.text.ctaSecondary};
  margin: 0 0 ${p[3]}px;
  ${f.xxsmall({fontWeight:"bold"})};
`,Dn=m`
  margin-top: ${p[6]}px;
`,Ln=m`
  ${Rn}

  ${u.tablet} {
    ${f.xxsmall({fontWeight:"bold"})}
  }
`,_n=m`
  margin: 0;
  color: ${J.neutral[20]};
  ${b.medium()}
  max-width: 640px;
`,Pn=m`
  margin: 0 auto;

  ${u.tablet} {
    border-left: 1px solid ${h[400]};
    border-right: 1px solid ${h[400]};
  }
`,Mn=m`
  ${nt}
  background-color: white;
  width: 100%;
  padding-top: ${p[6]}px;
  padding-bottom: ${p[6]}px;
  ${Pn}
`,Gn=m`
  padding: ${p[5]}px 0 ${p[24]}px 0;
  ${u.tablet} {
    padding: ${p[9]}px 0 ${p[12]}px 0;
  }
  ${u.desktop} {
    padding: ${p[9]}px 0 ${p[24]}px 0;
  }
`,Un=({children:e,cssOverrides:t})=>d.createElement("div",{css:[Mn,t]},e),Wn=m`
  background-color: ${"#eaf1fd"};
`,Bn=m`
  flex: 0 0 auto;
`,Hn=m`
  margin: 0 auto;

  ${u.tablet} {
    border-left: 1px solid ${h[400]};
    border-right: 1px solid ${h[400]};
  }
`,Fn=m`
  color: ${h[400]};
  margin: ${p[12]}px 0 ${p[5]}px 0;
  ${Q.small({fontWeight:"bold"})};
  font-size: 38px;
  line-height: 1;
  ${u.tablet} {
    ${Q.medium({fontWeight:"bold"})};
    font-size: 42px;
  }
  ${u.desktop} {
    ${Q.large({fontWeight:"bold"})};
    font-size: 50px;
  }
`,Kn="\n  content: ' ';\n  box-sizing: content-box;\n  border-radius: 50%;\n  height: 24px;\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 24px;\n",Vn=m`
  margin-top: ${p[5]}px;
  margin-bottom: 0;
  li {
    color: ${h[400]};
    &::after {
      background-color: ${h[400]};
    }
    &::before {
      border: 2px solid ${h[400]};
      background-color: white;
    }
  }
`,Yn=m`
  display: flex;
  list-style: none;
  height: 54px;
  padding: 0;
  margin: 0;
`,jn=({pages:e,current:t,cssOverrides:r})=>{const n=t?e.indexOf(t):0,a=e=>{switch(!0){case e===n:return"active";case e<n:return"complete";default:return""}};return d.createElement("ul",{css:[Yn,r]},e.map(((t,r)=>{return d.createElement("li",{className:a(r),key:r,css:(n=e.length,m`
  ${b.small()}
  position: relative;
  width: ${100/n}%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  &.active {
    ${b.small({fontWeight:"bold"})}
  }
  &::after,
  &.complete::after {
    content: ' ';
    background-color: ${x[60]};
    height: ${2}px;
    position: absolute;
    /* Border position from top is distance of a semicircle minus half the border thickness */
    top: ${13}px;
    left: ${28}px;
    right: 0;
  }
  &.complete::after {
    height: ${4}px;
    background-color: ${h[400]};
  }
  &:last-child::after {
    display: none;
  }
  &::before {
    border: ${2}px solid ${x[60]};
    border-radius: 50%;
    ${Kn}
  }
  &.active::before,
  &.complete::before {
    content: ' ';
    background-color: ${h[400]};
    border: ${2}px solid ${h[400]};
    ${Kn}
  }
  & svg {
    display: none;
  }
  &.complete svg {
    position: absolute;
    display: block;
    stroke: white;
    fill: white;
    height: ${24}px;
    width: ${24}px;
    margin: ${2}px;
    top: 0;
    left: 0;
    z-index: 1;
  }
`)},d.createElement(X,null),d.createElement("div",null,t));var n})))},zn=({autoRow:e,title:t,current:r})=>d.createElement("header",{css:[Wn,Bn]},d.createElement("div",{css:[Hn,nt]},r&&d.createElement(jn,{cssOverrides:[Vn,e(st)],pages:kn,current:r}),d.createElement("h1",{css:[Fn,e(st)]},t))),qn=m`
  background-color: ${"#eaf1fd"};
`,Xn=m`
  margin: 0 auto;

  ${u.tablet} {
    border-left: 1px solid ${h[400]};
    border-right: 1px solid ${h[400]};
  }
`,Zn=m`
  height: 100%;
`,Jn=m`
  flex: 1 1 auto;
`,Qn=({children:e,cssOverrides:t})=>d.createElement("div",{css:[qn,Jn,t]},d.createElement("div",{css:[nt,Xn,Zn]},e)),ea=({error:e,success:t})=>d.createElement(d.Fragment,null,d.createElement(Jt,null),e&&d.createElement(ut,{error:e,link:Bt(e),left:!0}),t&&d.createElement(Kt,{success:t})),ta=(e,t,r)=>{"checkbox"===e.type&&he({component:`identity-onboarding-${t}`,value:`${r} : ${e.checked}`}),"radio"===e.type&&e.checked&&he({component:`identity-onboarding-${t}`,value:`${r} : ${e.value}`})},ra=(e,t,r)=>{const n=r.querySelectorAll("input");switch(`/${e}`){case Re.CONSENTS_COMMUNICATION:case Re.CONSENTS_DATA:return((e,t)=>{const r=t.consents;r&&e.forEach((e=>{const t=r.find((({id:t})=>t===e.name));t&&ta(e,"consent",t.name)}))})(n,t);case Re.CONSENTS_NEWSLETTERS:return((e,t)=>{const r=t.newsletters;r&&e.forEach((e=>{const t=r.find((({id:t})=>t===e.name));t&&(t.subscribed&&!e.checked||!t.subscribed&&e.checked)&&ta(e,"newsletter",t.nameId)}))})(n,t);default:return}},na=m`
  position: relative;
  z-index: 0;
  &:before {
    content: ' ';
    background-color: ${h[400]};
    opacity: 0.8;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
`,aa=m`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
`,la=m`
  flex: 0 0 auto;
`,sa=m`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`,oa=m`
  margin-left: ${p[5]}px;
`,ia=m`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`,ca=({children:e,current:t,title:r,bgColor:n})=>{const a=it(1,st),l=c.exports.useContext(Ce),{pageData:s={},globalMessage:{error:o,success:i}={}}=l,{page:p="",previousPage:u,returnUrl:E}=s,g=E?`?returnUrl=${encodeURIComponent(E)}`:"",h=n&&m`
      &:before {
        background-color: ${n};
        opacity: 0.4;
      }
    `;return d.createElement(d.Fragment,null,d.createElement(ea,{error:o,success:i}),d.createElement("main",{css:sa},d.createElement(zn,{autoRow:a,title:r,current:t}),d.createElement("form",{css:aa,action:`${Re.CONSENTS}/${p}${g}`,method:"post",onSubmit:({target:e})=>{ra(p,s,e)}},d.createElement(Or,null),d.createElement("section",{css:ia},d.createElement("div",{css:[na,la,h]},e),d.createElement(Qn,null,d.createElement("div",{css:[lt(st),Gn]},!o&&d.createElement(W,{iconSide:"right",nudgeIcon:!0,icon:d.createElement(B,null),type:"submit"},"Save and continue"),u&&d.createElement(_,{css:oa,href:`${Re.CONSENTS}/${u}${g}`,priority:"subdued"},"Go back")))))),d.createElement(Tr,null))},da=m`
  border: 0;
  padding: 0;
  margin: ${p[6]}px 0 0 0;
  ${b.medium()}
`,ma=m`
  color: ${x[46]};
`,pa=({consented:e,description:t})=>{const r=it(1,st),n=d.createElement("span",{css:ma},t);return d.createElement(ca,{title:"Your data",current:An.YOUR_DATA,bgColor:"#eaf1fd"},t&&d.createElement(Un,null,d.createElement("h2",{css:[Rn,r()]},"Our commitment to you"),d.createElement("p",{css:[_n,r(ot)]},"We think carefully about our use of personal data and use it responsibly. We never share it without your permission and we have a team who are dedicated to keeping any data we collect safe and secure. You can find out more about how The Guardian aims to safeguard users data by going to the"," ",d.createElement(w,{href:Pt,subdued:!0,target:"_blank",rel:"noopener noreferrer"},"Privacy")," ","section of the website."),d.createElement("h2",{css:[Rn,Dn,r()]},"Using your data for marketing analysis"),d.createElement("p",{css:[_n,r(ot)]},"From time to time we may use your personal data for marketing analysis. That includes looking at what products or services you have bought from us and what pages you have been viewing on theguardian.com and other Guardian websites (e.g. Guardian Jobs or Guardian Holidays). We do this to understand your interests and preferences so that we can make our marketing communication more relevant to you."),d.createElement("fieldset",{css:[da,r()]},d.createElement(ee,{name:On.PROFILING},d.createElement(te,{value:"consent-option",label:n,defaultChecked:e})))))},ua=()=>{const e=c.exports.useContext(Ce),{pageData:t={}}=e,{consents:r=[]}=t,n=r.find((e=>e.id===On.PROFILING));return d.createElement(pa,{consented:null==n?void 0:n.consented,description:null==n?void 0:n.description})},Ea=m`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid white;
  margin: 0px 0px ${p[4]}px 0px;
`,ga=e=>m`
  background-color: ${J.background.ctaPrimary};

  ${e&&(e=>m`
  background-image: url('${e}');
  background-position: bottom 0px right 0px;
  background-repeat: no-repeat;
  background-size: 75%;
`)(e)}

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px ${p[3]}px 14px ${p[3]}px;
  ${u.tablet} {
    height: auto;
  }
`,ha=m`
  color: ${J.text.ctaPrimary};
  margin: 0;
  ${Q.small()};
  font-size: 20px;
  letter-spacing: 0.3px;
`,xa=m`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 auto;
  background-color: #eaeef5;
  padding: ${p[3]}px ${p[3]}px 6px ${p[3]}px;
`,fa=m`
  color: ${J.neutral[20]};
  margin: 0;
  ${b.medium()}
  max-width: 640px;
`,$a=m`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: #eaeef5;
  padding: ${p[2]}px ${p[3]}px;
`,ba=m`
  background: ${J.neutral[100]};
  z-index: 0 !important;
`,Ta=({title:e,body:t,value:r,image:n,checked:a,cssOverrides:l})=>d.createElement("div",{css:[Ea,l]},d.createElement("div",{css:ga(n)},d.createElement("h3",{css:ha},e)),d.createElement("div",{css:xa},d.createElement("p",{css:fa},t)),d.createElement("div",{css:$a},d.createElement(ee,{name:r,label:e,hideLabel:!0},d.createElement(te,{cssOverrides:ba,value:r,label:"Sign Up",defaultChecked:a})))),wa=m`
  border: 0;
  padding: 0;
  margin: 14px 0 ${p[1]}px 0;
  ${b.medium()}
`,ya=m`
  color: ${x[46]};
`,Sa=m`
  display: flex;
  flex-flow: row wrap;
  margin: ${p[6]}px 0 ${p[2]}px;
  ${u.desktop} {
    margin: ${p[5]}px 0 32px;
    grid-column: 2 / span 9;
  }
  ${u.wide} {
    grid-column: 3 / span 9;
  }
`,va=i(o({},st),{DESKTOP:{start:2,span:9},WIDE:{start:3,span:9}}),Ia=({marketResearchOptout:e,consentsWithoutOptout:t,isUserInTest:r})=>{const n=it(1,st),a=d.createElement("span",{css:ya},null==e?void 0:e.description);return d.createElement(ca,{title:"Welcome to The Guardian",current:An.CONTACT,bgColor:"#eaf1fd"},d.createElement(Un,null,d.createElement("h2",{css:[Rn,n()]},"Thank you for registering"),d.createElement("p",{css:[_n,n(ot)]},"Would you like to join our mailing list to stay informed and up to date with all that The Guardian has to offer?"),d.createElement("div",{css:[Sa,n(va)]},t.map((e=>d.createElement(Ta,{key:e.id,title:e.name,body:e.description,value:e.id,checked:!!e.consented})))),e&&!r&&d.createElement(d.Fragment,null,d.createElement("h2",{css:[Rn,n()]},"Using your data for market research"),d.createElement("p",{css:[_n,n()]},"From time to time we may contact you for market research purposes inviting you to complete a survey, or take part in a group discussion. Normally, this invitation would be sent via email, but we may also contact you by phone."),d.createElement("fieldset",{css:[wa,n()]},d.createElement(ee,{name:e.id},d.createElement(te,{value:"consent-option",label:a,defaultChecked:e.consented}))))))},Oa=()=>{const e=c.exports.useContext(Ce),{pageData:t={}}=e,{consents:r=[]}=t,n=re().isUserInVariant("SingleNewsletterTest","variant"),a=r.find((e=>e.id===On.MARKET_RESEARCH)),l=r.filter((e=>!e.id.includes("_optout")));return d.createElement(Ia,{marketResearchOptout:a,consentsWithoutOptout:l,isUserInTest:n})};var Na,Aa;(Aa=Na||(Na={})).BOOKMARKS="4137",Aa.GREENLIGHT="4147",Aa.TODAY_UK="4151",Aa.THE_LONG_READ="4165",Aa.TODAY_US="4152",Aa.TODAY_AU="4150",Aa.US_MORNING_BRIEFING="4300",Aa.MINUTE_US="4166",Object.values(Na);const Ca={[Na.BOOKMARKS.toString()]:"/assets/4137.8c5428dc.jpg",[Na.GREENLIGHT.toString()]:"/assets/4147.c5ed7e2b.jpg",[Na.THE_LONG_READ.toString()]:"/assets/4165.2b121701.jpg",[Na.TODAY_UK.toString()]:"/assets/4151.c00ae74b.jpg",[Na.TODAY_US.toString()]:"/assets/4152.747590c5.jpg",[Na.TODAY_AU.toString()]:"/assets/4150.74b39b6a.jpg",[Na.US_MORNING_BRIEFING.toString()]:"/assets/4300.11aa7f9e.jpg",[Na.MINUTE_US.toString()]:"/assets/4166.f69058aa.jpg"},ka=e=>{const t=m`
    display: block;
    height: 0;
    width: 0;
  `;if(e){const r=Ca[e];if(r)return m`
        ${t}
        padding: 55% 100% 0 0;
        background-image: url('${r}');
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      `}return m`
    ${t}
    padding: 55% calc(100% - 6px) 0 0;
    border: 3px solid black;
    background: linear-gradient(
        to top right,
        transparent 49.5%,
        black 49.5%,
        black 50.5%,
        transparent 50.5%,
        transparent 100%
      ),
      linear-gradient(
        to top left,
        transparent 49.5%,
        black 49.5%,
        black 50.5%,
        transparent 50.5%,
        transparent 100%
      );
  `},Ra=m`
  color: ${h[400]};
  ${Q.small()};
  margin: ${p[2]}px 0 ${p[1]}px 0;
  /* Override */
  font-size: 24px;
`,Da=m`
  color: ${h[600]};
  ${b.small()};
  margin: 0;
`,La=m`
  color: ${h[400]};
  margin: 0 0 ${p[3]}px;
  ${ne.small()};
  flex: 2 0 auto;
`,_a=m`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  border-left: 2px solid ${h[500]};
  padding: ${p[3]}px ${p[3]}px ${p[3]}px ${p[3]}px;
`,Pa=m`
  display: flex;
  flex-direction: column;
  background-color: ${"#eaf1fd"};
`,Ma=m`
  display: flex;
  align-items: center;
  margin: 0 0 ${p[6]}px 0;
  & > svg {
    margin: 0 ${p[1]}px 0 0;
  }
`,Ga=m`
  background: ${J.neutral[100]};
  z-index: 0 !important;
`,Ua=d.createElement("svg",{css:{fill:h[400]},width:"15px",height:"15px",viewBox:"0 0 11 11"},d.createElement("path",{d:"M5.4 0C2.4 0 0 2.4 0 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4S8.4 0 5.4 0zm3 6.8H4.7V1.7h.7L6 5.4l2.4.6v.8z"})),Wa=e=>{const{description:t,frequency:r,name:n}=e.newsletter,a=r?d.createElement("div",{css:Ma},Ua,d.createElement("h2",{css:Da},r)):null;return d.createElement("article",{css:[Pa,e.cssOverrides]},d.createElement("div",{css:ka(e.newsletter.id)}),d.createElement("div",{css:_a},d.createElement("h1",{css:Ra},n),a,d.createElement("p",{css:La},t),d.createElement(ee,{name:e.newsletter.id,label:n,hideLabel:!0},d.createElement("input",{type:"hidden",name:e.newsletter.id,value:""}),d.createElement(te,{value:e.newsletter.id,cssOverrides:Ga,label:"Sign Up",defaultChecked:e.newsletter.subscribed}))))},Ba=e=>{const t=m`
    display: block;
    height: 0;
    width: 0;

    ${u.desktop} {
      height: 100%;
      width: 100%;
      flex: 1 1 auto;
    }
  `;if(e){const r=Ca[e];if(r)return m`
        ${t}
        background-image: url('${r}');
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        padding: 55% 100% 0 0;

        ${u.desktop} {
          padding: 0;
        }
      `}return t},Ha=m`
  color: ${h[400]};
  ${Q.small()};
  margin: ${p[2]}px 0 ${p[1]}px 0;
  //Override
  font-size: 24px;
`,Fa=m`
  color: ${h[600]};
  ${b.small()};
  margin: 0;
`,Ka=m`
  color: ${h[400]};
  margin: 0 0 ${p[3]}px;
  ${ne.small()};
  flex: 2 0 auto;
`,Va=m`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  border-left: 2px solid ${h[500]};
  padding: ${p[3]}px ${p[3]}px ${p[3]}px ${p[3]}px;

  ${u.desktop} {
    flex: 1 1 auto;
    width: 100%;
    border-left: 0;
  }
`,Ya=m`
  display: flex;
  flex-direction: column;
  background-color: ${"#eaf1fd"};
  border: 0;

  ${u.desktop} {
    flex-direction: row-reverse;
    border-top: 2px solid ${h[500]};
  }
`,ja=m`
  display: flex;
  align-items: center;
  margin: 0 0 ${p[6]}px 0;
  & > svg {
    margin: 0 ${p[1]}px 0 0;
  }
`,za=m`
  background: ${J.neutral[100]};
  z-index: 0 !important;
`,qa=d.createElement("svg",{css:{fill:h[400]},width:"15px",height:"15px",viewBox:"0 0 11 11"},d.createElement("path",{d:"M5.4 0C2.4 0 0 2.4 0 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4S8.4 0 5.4 0zm3 6.8H4.7V1.7h.7L6 5.4l2.4.6v.8z"})),Xa=e=>{const{description:t,frequency:r,name:n}=e.newsletter,a=r?d.createElement("div",{css:ja},qa,d.createElement("h2",{css:Fa},r)):null;return d.createElement("article",{css:[Ya,e.cssOverrides]},d.createElement("div",{css:Ba(e.newsletter.id)}),d.createElement("div",{css:Va},d.createElement("h1",{css:Ha},n),a,d.createElement("p",{css:Ka},t),d.createElement(ee,{name:e.newsletter.id,label:n,hideLabel:!0},d.createElement("input",{type:"hidden",name:e.newsletter.id,value:""}),d.createElement(te,{value:e.newsletter.id,cssOverrides:za,label:"Sign Up",defaultChecked:e.newsletter.subscribed}))))},Za=e=>{const t=Math.trunc(e/2)+4,r=e%2;return m`
    ${lt({TABLET:{start:2+5*r,span:5},DESKTOP:{start:2+5*r,span:5},WIDE:{start:3+6*r,span:6}})}
    -ms-grid-row: ${t};

    margin-bottom: ${p[5]}px;
    ${u.tablet} {
      margin-bottom: ${p[6]}px;
    }
    ${u.desktop} {
      margin-bottom: ${p[9]}px;
    }
  `},Ja=m`
  margin-bottom: ${p[6]}px;
`,Qa=({newsletters:e,isUserInTest:t})=>{const r=it(1,st);return d.createElement(ca,{title:"Newsletters",current:An.NEWSLETTERS,bgColor:"#eaf1fd"},d.createElement(Un,null,d.createElement("h2",{css:[Rn,r()]},"Free newsletters from The Guardian"),d.createElement("p",{css:[_n,Ja,r(ot)]},"Our newsletters help you get closer to our quality, independent journalism."),t&&e[0]?d.createElement(Xa,{newsletter:e[0],key:e[0].id,cssOverrides:m`
    ${lt({TABLET:{start:2,span:10},DESKTOP:{start:2,span:10},WIDE:{start:3,span:12}})}
    -ms-grid-row: 4;

    margin-bottom: ${p[5]}px;
    ${u.tablet} {
      margin-bottom: ${p[6]}px;
    }
    ${u.desktop} {
      margin-bottom: ${p[9]}px;
    }
  `}):e.map(((e,t)=>d.createElement(Wa,{newsletter:e,key:e.id,cssOverrides:Za(t)})))))},el=()=>{var e,t;const r=c.exports.useContext(Ce),n=null!=(t=null==(e=null==r?void 0:r.pageData)?void 0:e.newsletters)?t:[],a=re().isUserInVariant("SingleNewsletterTest","variant");return d.createElement(Qa,{newsletters:n,isUserInTest:a})},tl=m`
  display: flex;
  flex-flow: column;
  margin-top: ${p[6]}px;
  border: 1px solid ${J.border.secondary};
`,rl=m`
  position: relative;
  z-index: 0;
  &:before {
    content: ' ';
    background-color: ${h[400]};
    opacity: 0.8;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
`,nl=m`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-bottom: 1px solid ${J.border.secondary};
  padding: ${p[5]}px;

  ${u.tablet} {
    flex-direction: row;
  }

  &:last-child {
    border: 0;
  }
`,al=m`
  flex: 1 1 auto;

  ${u.tablet} {
    flex: 1 1 0px;
  }
`,ll=m`
  ${_n}
  font-weight: bold;
  padding-bottom: ${p[2]}px;

  ${u.tablet} {
    padding-bottom: 0;
  }
`,sl=({title:e,children:t})=>d.createElement("div",{css:nl},d.createElement("div",{css:al},d.createElement("p",{css:ll},e,":")),d.createElement("div",{css:al},t)),ol=m`
  flex: 1 0 auto;
  align-content: flex-start;
  padding-bottom: ${p[24]}px;
`,il=m`
  flex: 0 0 auto;
`,cl={TABLET:{start:2,span:9},DESKTOP:{start:2,span:8},WIDE:{start:3,span:10}},dl=m`
  &:before {
    background-color: ${"#eaf1fd"};
    opacity: 0.4;
  }
`,ml=m`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`,pl=({error:e,success:t,returnUrl:r,isUserInTest:n,optedOutOfProfiling:a,optedOutOfMarketResearch:l,productConsents:s,subscribedNewsletters:o})=>{const i=it(1,cl);return d.createElement(d.Fragment,null,d.createElement(ea,{error:e,success:t}),d.createElement("main",null,d.createElement(zn,{autoRow:i,title:"Your registration is complete"}),d.createElement("section",{css:[rl,ml,dl]},d.createElement(Un,null,d.createElement("h2",{css:[Ln,i()]},"Your selections"),d.createElement("p",{css:[_n,i()]},"You can change these setting anytime by going to"," ",d.createElement(w,{href:"https://manage.theguardian.com/email-prefs",subdued:!0},"My Preferences"),"."),d.createElement("div",{css:[tl,i()]},d.createElement(sl,{title:"Newsletters"},o.length?o.map((e=>d.createElement("p",{key:e.id,css:_n},e.name))):d.createElement("p",{css:_n},"N/A")),d.createElement(sl,{title:"Products & services"},s.length?s.map((e=>d.createElement("p",{key:e.id,css:_n},e.name))):d.createElement("p",{css:_n},"N/A")),!n&&d.createElement(sl,{title:"Marketing research"},d.createElement("p",{css:_n},l?"No":"Yes")),d.createElement(sl,{title:"Marketing analysis"},d.createElement("p",{css:_n},a?"No":"Yes")))),d.createElement(Qn,{cssOverrides:il},d.createElement("div",{css:[lt(st),Gn]},d.createElement(_,{iconSide:"right",nudgeIcon:!0,icon:d.createElement(B,null),href:r},"Return to The Guardian"))),d.createElement(Un,{cssOverrides:ol},d.createElement("h2",{css:[Ln,i()]},"Sign up to more newsletters"),d.createElement("p",{css:[_n,i()]},"We have over 40 different emails that focus on a range of diverse topics - from politics and the latest tech to documentaries, sport and scientific breakthroughs. Sign up to more in"," ",d.createElement(w,{href:"https://manage.theguardian.com/email-prefs",subdued:!0},"Guardian newsletters"),".")))),d.createElement(Tr,null))},ul=()=>{const e=c.exports.useContext(Ce),{pageData:t={},globalMessage:{error:r,success:n}={}}=e,{consents:a=[],newsletters:l=[],returnUrl:s="https://www.theguardian.com"}=t,o=re().isUserInVariant("SingleNewsletterTest","variant"),i=!!a.find((e=>e.id===On.PROFILING&&e.consented)),m=!!a.find((e=>e.id===On.MARKET_RESEARCH&&e.consented)),p=a.filter((e=>!e.id.includes("_optout")&&e.consented)),u=l.filter((e=>e.subscribed));return d.createElement(pl,{error:r,success:n,returnUrl:s,isUserInTest:o,optedOutOfProfiling:i,optedOutOfMarketResearch:m,productConsents:p,subscribedNewsletters:u})},El=m`
  ${b.medium({lineHeight:"regular",fontWeight:"bold"})}
`,gl=({signInPageUrl:e})=>d.createElement(yr,null,d.createElement(zr,null,"Link Expired"),d.createElement(vr,null,d.createElement(Xr,null,"Your email confirmation link has expired"),d.createElement(Xr,null,"The link we sent you was valid for 30 minutes. Please sign in again and we will resend a verification email."),d.createElement("div",{css:Fr},d.createElement(_,{href:e,css:Br,icon:d.createElement(B,null),iconSide:"right"},"Sign in")))),hl=({email:e,successText:t})=>d.createElement(yr,null,d.createElement(zr,null,"Verify Email"),d.createElement(vr,null,d.createElement(Xr,null,"You need to confirm your email address to continue securely:"),d.createElement(Xr,null,d.createElement("span",{css:El},e)),d.createElement(Xr,null,"We will send you a verification link to your email to ensure that it’s you. Please note that the link will expire in 30 minutes."),d.createElement(Xr,null,"If you don't see it in your inbox, please check your spam filter."),t?d.createElement(Xr,null,t):d.createElement("form",{css:Fr,method:"post",action:Re.VERIFY_EMAIL},d.createElement(Or,null),d.createElement("input",{type:"hidden",name:"email",value:e}),d.createElement(W,{css:Br,type:"submit",icon:d.createElement(B,null),iconSide:"right"},"Send verification link")))),xl=({email:e,signInPageUrl:t,successText:r})=>d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in"},e?d.createElement(hl,{email:e,successText:r}):d.createElement(gl,{signInPageUrl:t})),d.createElement(Tr,null)),fl=()=>{const{globalMessage:{success:e}={},pageData:{email:t,signInPageUrl:r}={}}=c.exports.useContext(Ce);return d.createElement(xl,{email:t,signInPageUrl:r,successText:e})},$l=m`
  display: inline-block;
`,bl=()=>d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in"},d.createElement(yr,null,d.createElement(zr,null,"Sorry – an unexpected error occurred"),d.createElement(vr,null,d.createElement(Xr,null,"An error occurred, please try again or"," ",d.createElement(w,{css:$l,href:Mt,subdued:!0},"report it"),".")))),d.createElement(Tr,null));const Tl={card:"#C1D8FC",envelopeFrame:"white",envelopeFront:"#052962",roundelBackground:"white",roundelText:"#052962"},wl={card:"#C1D8FC",envelopeFrame:"#052962",envelopeFront:"white",roundelBackground:"white",roundelText:"#052962"},yl=e=>{const t=((e=!1)=>e?wl:Tl)(e.invertColors);return d.createElement("svg",{css:e.cssOverrides,width:e.width,viewBox:"0 0 159 149",fill:"none",xmlns:"http://www.w3.org/2000/svg"},d.createElement("path",{d:"M79.1965 2.93455L4.17373 56.581C3.12353 57.3319 2.50037 58.5436 2.50037 59.8347V127.724C2.50037 129.933 4.29123 131.724 6.50036 131.724H153.318C155.527 131.724 157.318 129.933 157.318 127.724V59.7831C157.318 58.521 156.722 57.3328 155.711 56.5778L83.916 2.98291C82.521 1.94152 80.6126 1.92197 79.1965 2.93455Z",stroke:t.envelopeFrame,strokeWidth:"3",vectorEffect:"non-scaling-stroke"}),d.createElement("rect",{x:"7.72961",y:"26.219",width:"144.358",height:"85.1515",fill:t.card,stroke:t.card,vectorEffect:"non-scaling-stroke"}),d.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M80.5002 41C61.4465 41 46 56.4459 46 75.5C46 94.5539 61.4465 110 80.5002 110C99.554 110 115 94.5539 115 75.5C115 56.4459 99.554 41 80.5002 41Z",fill:t.roundelBackground}),d.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M101.36 77.3905L97.8191 78.9736V95.3029C95.8271 97.2004 90.7365 100.158 85.8672 101.174V99.9878V97.7616V78.6176L82.1046 77.2884V76.3021H101.36V77.3905ZM83.7093 50.192C83.7093 50.192 83.6366 50.1914 83.6007 50.1914C75.6177 50.1914 71.0508 60.9551 71.2809 75.4742C71.0508 90.046 75.6177 100.81 83.6007 100.81C83.6366 100.81 83.7093 100.809 83.7093 100.809V101.928C71.7412 102.728 55.4002 93.8118 55.6303 75.5267C55.4002 57.1891 71.7412 48.2729 83.7093 49.0731V50.192ZM86.1159 49.0229C90.7961 49.7377 96.145 52.8115 98.1508 54.9937V65.0694H96.9983L86.1159 50.1348V49.0229Z",fill:t.roundelText,vectorEffect:"non-scaling-stroke"}),d.createElement("path",{d:"M2.31677 54.1455C2.31677 52.0325 4.77547 50.8724 6.40633 52.2159L76.4114 109.885C78.4425 111.558 81.3743 111.558 83.4054 109.885L153.41 52.2159C155.041 50.8724 157.5 52.0325 157.5 54.1455V131.36C157.5 132.017 157.242 132.647 156.781 133.115L143.607 146.484C143.137 146.961 142.495 147.23 141.826 147.23H18.6237C17.9729 147.23 17.3478 146.976 16.8812 146.522L3.0743 133.102C2.59001 132.632 2.31677 131.985 2.31677 131.31V54.1455Z",fill:t.envelopeFront,stroke:t.envelopeFrame,strokeWidth:"3",vectorEffect:"non-scaling-stroke"}))},Sl=h[400],vl=i(o({},st),{TABLET:{start:1,span:12},DESKTOP:{start:2,span:9},WIDE:{start:3,span:9}}),Il=i(o({},st),{TABLET:{start:1,span:12},DESKTOP:{start:2,span:6},WIDE:{start:3,span:7}}),Ol={MOBILE:{start:1,span:4},TABLET:{start:1,span:12},DESKTOP:{start:9,span:3},WIDE:{start:12,span:3}},Nl=i(o({},Ol),{DESKTOP:{start:9,span:2},WIDE:{start:12,span:2}}),Al=i(o({},st),{TABLET:{start:1,span:12},DESKTOP:{start:1,span:12},WIDE:{start:2,span:14}}),Cl=m`
  color: white;
  ${Q.small()};
  font-size: 34px;
  margin-top: 60px;
  margin-bottom: 75px;
  ${u.tablet} {
    font-size: 39px;
  }
  ${u.desktop} {
    ${Q.large()};
    margin-bottom: 132px;
  }
  padding-left: ${p[3]}px;
  ${u.desktop} {
    padding-left: 0;
  }
`,kl=m`
  width: 218px;
  height: auto;
  display: block;
  justify-self: center;
  margin-top: 48px;
  align-self: end;
  -ms-grid-column-align: center;
  ${u.desktop} {
    width: 255px;
    height: 314px;
    -ms-grid-row-align: end;
    margin-bottom: -50px;
  }
`,Rl=m`
  ${kl}
  margin-bottom: -30px;
  overflow: hidden;
  ${u.desktop} {
    width: 218px;
    margin-bottom: 0;
    align-self: center;
  }
`,Dl=m`
  flex: 1 0;
`,Ll=m`
  padding: 0 ${p[3]}px 30px ${p[3]}px;
  border-top: 1px solid ${"#DCDCDC"};
  margin: 0 1px 1px;
  background-color: white;

  & h2 {
    ${f.xsmall({fontWeight:"bold"})}
  }
  & p {
    ${ne.medium()}
    border-top: 1px solid ${"#DCDCDC"};
    margin-bottom: ${p[3]}px;
  }
  ${u.desktop} {
    border-top: 0;
    -ms-grid-row: 1;
    grid-row: 1;
    padding-left: 0;
    padding-right: 0;

    & h2 {
      ${f.medium({fontWeight:"bold"})}
      margin-top: ${p[3]}px;
      margin-bottom: ${p[9]}px;
    }

    & p {
      font-size: 20px;
    }
  }
`,_l=m`
  margin-bottom: ${p[6]}px;
`,Pl=m`
  margin-top: -40px;
  ${u.desktop} {
    margin-top: -70px;
  }
  margin-bottom: 70px;
  overflow: hidden;
`,Ml=m`
  ${u.tablet} {
    margin-left: auto;
    margin-right: auto;
    max-width: ${et.TABLET}px;
  }
  ${u.desktop} {
    max-width: ${et.DESKTOP}px;
  }
  ${u.wide} {
    max-width: ${et.WIDE}px;
  }
`,Gl=m`
  background-color: ${"white"};
  border: 1px solid ${"#DCDCDC"};
  -ms-grid-row: 1;
  grid-row: 1 / span 2;
  ${u.desktop} {
    -ms-grid-row: 1;
    grid-row: 1;
  }
`,Ul=({returnUrl:e,entity:t,entityType:r,error:n,success:a})=>{const l=it(1,vl),s=(e=>{switch(e){case"newsletter":return Pe.NEWSLETTER_VARIANT;case"consent":return Pe.CONSENT_VARIANT}})(r),o=((e,t)=>{const r=t?`?returnUrl=${encodeURIComponent(t)}`:"";switch(e){case"newsletter":return`${Re.CONSENTS}${Re.CONSENTS_FOLLOW_UP_NEWSLETTERS}${r}`;case"consent":return`${Re.CONSENTS}${Re.CONSENTS_FOLLOW_UP_CONSENTS}${r}`}})(r,e);return d.createElement(d.Fragment,null,d.createElement(Jt,null),n&&d.createElement(ut,{error:n,link:Bt(n),left:!0}),a&&d.createElement(Kt,{success:a}),d.createElement("hr",{css:[m`
            height: 1px;
            margin-top: 0;
            margin-bottom: 0;
            width: 100%;
            background-color: ${"#DDDBD1"};
          `]}),d.createElement(We,{backgroundColor:Sl,sidePadding:!1},d.createElement("div",{css:[nt,Ml]},d.createElement("h1",{css:[Cl,l()]},s))),d.createElement("form",{action:o,method:"post",css:Dl},d.createElement("div",{css:[nt,Pl,Ml]},d.createElement("div",{css:[ct(2,Al),Gl]}),"newsletter"===r?d.createElement("img",{css:[kl,ct(1,Ol)],src:"/assets/newsletter_phone.54fa656b.png",alt:"Phone with newsletter displayed"}):d.createElement(d.Fragment,null),"consent"===r?d.createElement(yl,{cssOverrides:[kl,Rl,ct(1,Nl)],invertColors:!0}):d.createElement(d.Fragment,null),d.createElement("div",{css:[Ll,ct(2,Il)]},d.createElement("h2",null,t.name),d.createElement("p",null,t.description),d.createElement(ee,{name:t.id,label:t.name,hideLabel:!0,cssOverrides:_l},d.createElement("input",{type:"hidden",name:t.id,value:""}),d.createElement(te,{value:t.id,label:"Yes, sign me up"})),d.createElement(W,{type:"submit"},"Continue to The Guardian"))),d.createElement(Or,null)),d.createElement(Tr,null))},Wl=()=>{var e,t,r,n;const a=c.exports.useContext(Ce),{globalMessage:{error:l,success:s}={},pageData:o={}}=a,{returnUrl:i}=o,m=null!=(t=null==(e=null==a?void 0:a.pageData)?void 0:e.newsletters)?t:[],p=null!=(n=null==(r=null==a?void 0:a.pageData)?void 0:r.consents)?n:[],{entity:u,entityType:E}=((e,t)=>{const r=e[0],n=t[0];return{entity:r||n,entityType:r?"newsletter":"consent"}})(m,p);return d.createElement(Ul,{returnUrl:i,entity:u,entityType:E,error:l,success:s})},Bl=({children:e})=>d.createElement("p",{css:m`
      ${b.medium()}
      margin-top: 0;
    `},e),Hl=()=>{const e=c.exports.useContext(Ce),{pageData:t={}}=e,{returnUrl:r}=t,n=r?`?returnUrl=${encodeURIComponent(r)}`:"";return d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(or,{tabs:[{displayText:Pe.SIGN_IN,linkTo:Re.SIGN_IN,isActive:!0},{displayText:Pe.REGISTRATION,linkTo:Re.REGISTRATION,isActive:!1}]}),d.createElement(jt,null,d.createElement(yr,null,d.createElement(vr,null,d.createElement("form",{css:Fr,method:"post",action:`${Re.SIGN_IN}${n}`},d.createElement(Or,null),d.createElement(U,{css:Hr,label:"Email",name:"email",type:"email"}),d.createElement(U,{css:Hr,label:"Password",name:"password",type:"password"}),d.createElement(Bl,null,d.createElement(w,{subdued:!0,href:"/reset"},"Reset password")," ","or"," ",d.createElement(w,{subdued:!0,href:"/magic-link"},"email me a link to sign in")),d.createElement(W,{css:Br,type:"submit","data-cy":"sign-in-button"},"Sign in")),d.createElement(kr,{size:"full",spaceAbove:"loose",displayText:"or continue with"}),d.createElement(Ur,{returnUrl:"todo"}),d.createElement(kr,{size:"full",spaceAbove:"tight"}),d.createElement(Lr,null)))),d.createElement(Tr,null))},Fl=()=>d.createElement(Hl,null),Kl=({email:e})=>d.createElement(d.Fragment,null,d.createElement(Jt,null),d.createElement(jt,{subTitle:"Sign in"},d.createElement(yr,null,d.createElement(zr,null,"Link to sign in"),d.createElement(vr,null,d.createElement("form",{css:Fr,method:"post",action:`${Re.MAGIC_LINK}`},d.createElement(Or,null),d.createElement("p",{css:m`
                  ${b.medium()}
                  margin-top: 0;
                `},"We can email you a one time link to sign into your account"),d.createElement(U,{css:Hr,label:"Email",name:"email",type:"email",value:e}),d.createElement(W,{css:Br,type:"submit","data-cy":"magic-link-button"},"Email me a link"),d.createElement("p",{css:m`
                  ${b.medium()}
                `},"If you no longer have access to this email account please"," ",d.createElement(w,{subdued:!0,href:"/help/contact-us"},"contact our help department")))))),d.createElement(Tr,null)),Vl=()=>d.createElement(Kl,null),Yl=()=>d.createElement(ae,null,d.createElement(le,{exact:!0,path:Re.SIGN_IN_CURRENT},d.createElement(Fl,null)),d.createElement(le,{exact:!0,path:Re.SIGN_IN},d.createElement(Fl,null)),d.createElement(le,{exact:!0,path:Re.REGISTRATION},d.createElement(Vr,null)),d.createElement(le,{exact:!0,path:Re.RESET},d.createElement(Jr,null)),d.createElement(le,{exact:!0,path:Re.RESET_SENT},d.createElement(en,null)),d.createElement(le,{exact:!0,path:`${Re.CHANGE_PASSWORD}${Re.CHANGE_PASSWORD_TOKEN}`},d.createElement(yn,null)),d.createElement(le,{path:Re.CHANGE_PASSWORD_COMPLETE},d.createElement(vn,null)),d.createElement(le,{exact:!0,path:Re.RESET_RESEND},d.createElement(In,null)),d.createElement(le,{exact:!0,path:`${Re.CONSENTS}${Re.CONSENTS_DATA}`},d.createElement(ua,null)),d.createElement(le,{exact:!0,path:`${Re.CONSENTS}${Re.CONSENTS_COMMUNICATION}`},d.createElement(Oa,null)),d.createElement(le,{exact:!0,path:`${Re.CONSENTS}${Re.CONSENTS_NEWSLETTERS}`},d.createElement(el,null)),d.createElement(le,{exact:!0,path:`${Re.CONSENTS}${Re.CONSENTS_REVIEW}`},d.createElement(ul,null)),d.createElement(le,{exact:!0,path:`${Re.CONSENTS}${Re.CONSENTS_FOLLOW_UP_NEWSLETTERS}`},d.createElement(Wl,null)),d.createElement(le,{exact:!0,path:`${Re.CONSENTS}${Re.CONSENTS_FOLLOW_UP_CONSENTS}`},d.createElement(Wl,null)),d.createElement(le,{exact:!0,path:Re.VERIFY_EMAIL},d.createElement(fl,null)),d.createElement(le,{exact:!0,path:Re.MAGIC_LINK},d.createElement(Vl,null)),d.createElement(le,{exact:!0,path:Re.MAGIC_LINK_SENT},d.createElement(en,null)),d.createElement(le,{exact:!0,path:Re.UNEXPECTED_ERROR},d.createElement(bl,null)),d.createElement(le,null,d.createElement(rn,null))),jl={abSingleNewsletterTest:!1},zl=[{id:"SingleNewsletterTest",start:"2021-04-19",expiry:"2021-05-19",author:"mahesh.makani@theguardian.com",description:"We believe that if we show a single newsletter, vs 4, it will increase opt in to at least one newsletter. . We think it will increase by at least 7.5%",audience:1,audienceOffset:0,successMeasure:"Various",audienceCriteria:"Half the audience using the consents flow to see single newsletter",idealOutcome:"More users opted in to single newsletter",showForSensitive:!0,canRun:()=>!0,variants:[{id:"control",test:()=>{}},{id:"variant",test:()=>{}}]}],ql=e=>{const t=re();return c.exports.useEffect((()=>{const e=t.allRunnableTests(zl);t.trackABTests(e),t.registerImpressionEvents(e),t.registerCompleteEvents(e)}),[t]),d.createElement(d.Fragment,null,d.createElement(se,{styles:m`
          ${Ae}
          html {
            height: 100%;
          }
          body {
            height: 100%;
          }
          #app {
            min-height: 100%;
            display: flex;
            flex-direction: column;
          }
          * {
            box-sizing: border-box;
          }
        `}),d.createElement(ke,{clientState:e},d.createElement(Yl,null)))},Xl=()=>{var e,t,r,n,a,l;e=window,t=document,r="script",n="ga",e.GoogleAnalyticsObject=n,e.ga=e.ga||function(){(e.ga.q=e.ga.q||[]).push(arguments)},e.ga.l=1*new Date,a=t.createElement(r),l=t.getElementsByTagName(r)[0],a.async=1,a.src="https://www.google-analytics.com/analytics.js",l.parentNode.insertBefore(a,l),window.ga("create",window.gaUID,"auto","GatewayPropertyTracker"),window.ga("GatewayPropertyTracker.send","pageview")};de.onlyShowFocusOnTabs();(()=>{var e,t;const r=JSON.parse(null!=(t=null==(e=document.getElementById("routingConfig"))?void 0:e.innerHTML)?t:"{}"),n=r.clientState,{abTesting:{mvtId:a=0,forcedTestVariants:l={}}={}}=n;oe.exports.hydrate(d.createElement(ie,{arrayOfTestObjects:zl,abTestSwitches:jl,pageIsSensitive:!1,mvtMaxValue:1e6,mvtId:a,ophanRecord:ge,forcedTestVariants:l},d.createElement(ce,{location:`${r.location}`,context:{}},d.createElement(ql,o({},n)))),document.getElementById("app"))})(),window.Cypress||(async()=>{const e=await me();e&&pe.init({country:e})})(),ue((e=>{Ee("google-analytics",e)&&void 0===window.ga&&Xl()}));
