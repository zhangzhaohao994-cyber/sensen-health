'use strict';
document.documentElement.classList.add('js');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dialog=document.querySelector('#plan-menu');
const trigger=document.querySelector('.menu-trigger');
if(dialog&&trigger){
  const close=()=>dialog.close();
  trigger.addEventListener('click',()=>{dialog.showModal();document.body.classList.add('menu-open');trigger.setAttribute('aria-expanded','true');if(!reducedMotion){dialog.querySelectorAll('.menu-list a').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:i*30,fill:'both',easing:'cubic-bezier(.16,1,.3,1)'}));}});
  dialog.querySelector('.menu-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>{document.body.classList.remove('menu-open');trigger.setAttribute('aria-expanded','false');trigger.focus();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
}
if('IntersectionObserver' in window&&!reducedMotion){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));}
const fmt=(n,d=0)=>Number(n).toLocaleString('zh-CN',{maximumFractionDigits:d});
const yuan=n=>'¥'+fmt(n,0);
const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text;};
const read=(id,fallback=0)=>{const input=document.getElementById(id);if(!input)return fallback;let n=Number(input.value);if(!Number.isFinite(n))return fallback;const min=Number(input.min||0),max=input.max?Number(input.max):Infinity;return Math.max(min,Math.min(max,n));};
const forms=document.querySelectorAll('form[data-calculator]');
forms.forEach(form=>form.addEventListener('submit',event=>event.preventDefault()));
function funnel(){
  const target=Math.round(read('f-target',96));
  const rates=['f-qualified','f-attend','f-diligence','f-pilot','f-activate'].map(id=>read(id,50)/100);
  const product=rates.reduce((a,b)=>a*b,1);
  const up=n=>Math.ceil(n-1e-6);
  const candidates=product>0?up(target/product):0;
  const qualified=up(candidates*rates[0]);
  const attendance=up(qualified*rates[1]);
  const diligence=up(attendance*rates[2]);
  const pilot=up(diligence*rates[3]);
  const events=Math.ceil(attendance/read('f-seats',25));
  set('f-candidates',fmt(candidates));set('f-qualified-out',fmt(qualified));set('f-attendance',fmt(attendance));set('f-diligence-out',fmt(diligence));set('f-pilots',fmt(pilot));set('f-events',fmt(events));
  set('f-status',`规划 ${fmt(target)} 个前线节点激活，倒算需约 ${fmt(candidates)} 个去重候选、${fmt(events)} 场有效活动。省级 4 个协同席位另行按培训与质量能力验收。`);
}
document.querySelectorAll('#funnel-form input').forEach(input=>input.addEventListener('input',funnel));funnel();
const budgetPresets={lean:{existing:36000,team:0,content:6500,event:6000,media:5000,tools:1500,buffer:3000,label:'启动验证',people:'经理 + 现有设计；借用销售、履约与专业审核。机动拍剪外包。'},standard:{existing:36000,team:26000,content:5000,event:15000,media:16000,tools:3000,buffer:5000,label:'模型复制',people:'增加内容制作 + 线索运营；城市商务由营销部门配置。'},growth:{existing:36000,team:54000,content:8000,event:30000,media:40000,tools:5000,buffer:10000,label:'有条件扩张',people:'品牌团队合计约 6 人；区域训练与活动专员按工作量解锁，履约另行扩容。'}};
function budget(){
  const existing=read('b-existing'),team=read('b-team'),content=read('b-content'),event=read('b-event'),media=read('b-media'),tools=read('b-tools'),contingency=read('b-buffer');
  const increment=team+content+event+media+tools+contingency,total=existing+increment;
  set('b-month',yuan(total));set('b-quarter',yuan(total*3));set('b-year',yuan(total*12));set('b-contingency',yuan(contingency));set('b-increment',yuan(increment));
  set('b-status','规划品牌增长单元预算：存量人员是可替换的成本输入，不是公司工资披露。其它总部职能、真实履约、税费和区域自有费用另计；预备费未花前不是实际成本。');
}
document.querySelectorAll('[data-budget-preset]').forEach(button=>button.addEventListener('click',()=>{const preset=budgetPresets[button.dataset.budgetPreset];Object.entries(preset).forEach(([key,value])=>{const input=document.getElementById('b-'+key);if(input)input.value=value;});document.querySelectorAll('[data-budget-preset]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});set('b-stage',preset.label);set('b-people',preset.people);budget();}));
document.querySelectorAll('#budget-form input').forEach(input=>input.addEventListener('input',()=>{document.querySelectorAll('[data-budget-preset]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});set('b-stage','自定义资源');budget();}));budget();
const econPresets={cautious:{nodes:2,orders:10,price:2980,refund:5,product:10,service:25,channel:20,payment:1,cac:250,fixed:53000},base:{nodes:8,orders:10,price:2980,refund:5,product:10,service:25,channel:20,payment:1,cac:200,fixed:90000},scale:{nodes:20,orders:10,price:2980,refund:5,product:10,service:25,channel:20,payment:1,cac:200,fixed:143000}};
function economics(){
  const nodes=Math.round(read('e-nodes')),orders=Math.round(read('e-orders')),price=read('e-price'),refund=read('e-refund')/100,product=read('e-product')/100,service=read('e-service')/100,channel=read('e-channel')/100,payment=read('e-payment')/100,cac=read('e-cac'),fixed=read('e-fixed');
  const orderCount=nodes*orders,gross=orderCount*price,netPrice=price*(1-refund),netRevenue=orderCount*netPrice;
  const beforeAcquisition=netPrice*(1-product-service-channel)-price*payment;
  const unitContribution=beforeAcquisition-cac;
  const monthlyContribution=unitContribution*orderCount,operating=monthlyContribution-fixed;
  const breakeven=unitContribution>0?Math.ceil(fixed/unitContribution):null;
  set('e-gross',yuan(gross));set('e-net',yuan(netRevenue));set('e-count',fmt(orderCount));set('e-unit',yuan(unitContribution));set('e-before',yuan(beforeAcquisition));set('e-contribution',yuan(monthlyContribution));set('e-operating',yuan(operating));set('e-break',breakeven===null?'无法回本':fmt(breakeven)+' 单 / 月');
  const other=document.getElementById('e-other');set('e-after-other',other&&other.value.trim()!==''?'再扣所填总部费用：'+yuan(operating-read('e-other'))+'（规划贡献；税费与账期另核算）':'未提供总部其它成本，不计算公司利润');
  const status=document.getElementById('e-status');if(status){status.classList.toggle('negative',operating<0);status.textContent=unitContribution<=0?'每单获客后没有正贡献，增加订单也不能覆盖固定费用。先调整产品成本、渠道结算或获客方式。':operating<0?'当前假设不能覆盖品牌增长固定费用。保留试点，先改善订单密度和每单贡献。':'在当前假设下可以覆盖所列品牌增长固定费用。其它总部成本、税费和现金周期仍需另核算。';}
}
document.querySelectorAll('[data-econ-preset]').forEach(button=>button.addEventListener('click',()=>{const preset=econPresets[button.dataset.econPreset];Object.entries(preset).forEach(([key,value])=>{const input=document.getElementById('e-'+key);if(input)input.value=value;});document.querySelectorAll('[data-econ-preset]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});economics();}));
document.querySelectorAll('#economics-form input').forEach(input=>input.addEventListener('input',()=>{document.querySelectorAll('[data-econ-preset]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});economics();}));economics();
let openBeforePrint=[];
window.addEventListener('beforeprint',()=>{openBeforePrint=[...document.querySelectorAll('details')].map(el=>({el,open:el.open}));openBeforePrint.forEach(({el})=>el.open=true);});
window.addEventListener('afterprint',()=>openBeforePrint.forEach(({el,open})=>el.open=open));
document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',()=>window.print()));
document.querySelectorAll('[data-expand]').forEach(button=>button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-pressed')==='true';document.querySelectorAll('main details').forEach(el=>el.open=!expanded);button.setAttribute('aria-pressed',String(!expanded));button.textContent=expanded?'展开全部细节':'收起细节';}));
