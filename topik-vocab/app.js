
'use strict';
const built=[
[1,"사람","人"],[1,"학교","学校"],[1,"학생","学生"],[1,"선생님","老师"],[1,"친구","朋友"],[1,"책","书"],[1,"물","水"],[1,"밥","饭"],[1,"집","家"],[1,"가족","家人"],[1,"오늘","今天"],[1,"내일","明天"],[1,"어제","昨天"],[1,"시간","时间"],[1,"이름","名字"],[1,"한국","韩国"],[1,"한국어","韩语"],[1,"공부하다","学习"],[1,"먹다","吃"],[1,"마시다","喝"],[1,"가다","去"],[1,"오다","来"],[1,"좋다","好"],[1,"크다","大"],[1,"작다","小"],[1,"많다","多"],[1,"없다","没有"],[1,"있다","有、在"],[1,"아침","早晨"],[1,"저녁","晚上"],[2,"시험","考试"],[2,"대학","大学"],[2,"여행","旅行"],[2,"약속","约定"],[2,"운동","运动"],[2,"건강","健康"],[2,"병원","医院"],[2,"교통","交通"],[2,"문화","文化"],[2,"계절","季节"],[2,"필요하다","需要"],[2,"준비하다","准备"],[2,"이해하다","理解"],[2,"설명하다","解释"],[2,"선택하다","选择"],[2,"비슷하다","相似"],[2,"다르다","不同"],[2,"중요하다","重要"],[2,"편리하다","方便"],[2,"경험","经历"],[3,"사회","社会"],[3,"문제","问题"],[3,"원인","原因"],[3,"결과","结果"],[3,"영향","影响"],[3,"환경","环境"],[3,"경제","经济"],[3,"교육","教育"],[3,"취업","就业"],[3,"인구","人口"],[3,"증가하다","增加"],[3,"감소하다","减少"],[3,"발생하다","发生"],[3,"해결하다","解决"],[3,"참여하다","参与"],[4,"발전","发展"],[4,"기술","技术"],[4,"정책","政策"],[4,"제도","制度"],[4,"자료","资料"],[4,"분석하다","分析"],[4,"조사하다","调查"],[4,"비교하다","比较"],[4,"예상하다","预测"],[4,"유지하다","维持"],[4,"제공하다","提供"],[4,"개선하다","改善"],[4,"예방하다","预防"],[4,"현상","现象"],[4,"인식","意识"],[5,"고령화","老龄化"],[5,"저출산","低生育率"],[5,"불평등","不平等"],[5,"지속가능성","可持续性"],[5,"부작용","副作用"],[5,"실효성","实际效果"],[5,"근거","依据"],[5,"논란","争议"],[5,"도입하다","引入"],[5,"촉진하다","促进"],[5,"완화하다","缓解"],[5,"반영하다","反映"],[6,"양극화","两极分化"],[6,"상충하다","相冲突"],[6,"불가피하다","不可避免"],[6,"시사하다","暗示、启示"],[6,"함축하다","蕴含"],[6,"간과하다","忽略"],[6,"도출하다","推导出"],[6,"규명하다","查明"],[6,"모색하다","寻求"],[6,"상쇄하다","抵消"],[6,"제고하다","提高"],[6,"전망하다","展望"]];
const detail={
"학교":["학교에 가요.","去学校。",""],"학생":["저는 학생이에요.","我是学生。",""],"선생님":["선생님이 오셨어요.","老师来了。",""],"친구":["친구를 만나요.","见朋友。",""],"책":["책을 읽어요.","读书。",""],"물":["물을 마셔요.","喝水。",""],"밥":["밥을 먹어요.","吃饭。",""],"집":["집에 있어요.","在家。",""],"오늘":["오늘 공부해요.","今天学习。",""],"내일":["내일 만나요.","明天见。",""],"사람":["사람이 많아요.","人很多。",""],"한국어":["한국어를 공부해요.","学习韩语。",""],"시험":["시험을 준비해요.","准备考试。",""],"대학":["대학에 다녀요.","上大学。",""],"운동":["매일 운동해요.","每天运动。",""],"여행":["한국으로 여행을 가요.","去韩国旅行。",""],"문제":["문제를 풀어요.","解题。",""],"건강":["건강이 중요해요.","健康很重要。",""],"경험":["좋은 경험이었어요.","是很好的经历。",""],"환경":["환경을 보호해요.","保护环境。",""],"발전":["기술이 발전해요.","技术在发展。",""],"학교":["학교에 가요.","去学校。","[학꾜]"],"학생":["저는 학생이에요.","我是学生。","[학쌩]"],"한국어":["한국어를 공부해요.","学习韩语。","[한구거]"]
};
// Global local-first invariant: the public URL contains no profile data; each browser owns its own learning state.
// Never load learning state from URL/query/hash or shared remote storage. Backup import requires explicit file selection.
const STORAGE='topik_lab_v2';
const today=()=>new Date().toLocaleDateString('sv-SE');
const parse=(key,otherwise)=>{try{return JSON.parse(localStorage.getItem(key))??otherwise}catch{return otherwise}};
const state=parse(STORAGE,{});
state.progress=state.progress||{};state.lifecycle=state.lifecycle||{};state.dailyGoal=Math.max(0,Math.min(200,Number(state.dailyGoal??20)));state.smartHistory=state.smartHistory||[];state.smartAnswerHistory=state.smartAnswerHistory||[];state.relearn=state.relearn||{};state.favorites=state.favorites||[];state.daily=state.daily||{};delete state.goal;state.theme=window.TOPIK_THEME.getMode();state.level=Number(state.level)||1;state.collection=state.collection||'topik';state.inputMethod=state.inputMethod==='system'?'system':'bilingual';state.webChineseAutoFocus=state.webChineseAutoFocus===true;state.extra=Array.isArray(state.extra)?state.extra:parse('topik_extra',[]);
let legacy=parse('topik_records',{});
if(!state.legacyMigrated){Object.entries(legacy).forEach(([ko,r])=>{if(!state.progress[ko])state.progress[ko]={read:{step:Number(r.step)||0,due:Number(r.due)||0,wrong:0}}});state.legacyMigrated=true;}
let pinyinComposition='',pinyinPage=0;let hangulShift=false,pinyinShift=false,pinyinMode='letters',pinyinExpanded=false;let keyboardDeleteTimer=null,keyboardDeleteInterval=null;let pendingRating=false;let view='home',session=null,practiceReturn=null,onboarding=null,smartTask=null,listQuery='',listFilter='all',feedback='',typed='',didCheck=false,smartResult=null,toastTimer,relearnSelection=new Set();
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{notify('保存失败：浏览器存储空间不足或不可用')}}
// First visit creates an empty browser-local profile; existing profiles are never reset by opening or sharing the URL.
try{if(localStorage.getItem(STORAGE)===null)persist()}catch(_){}
function all(){let seen=new Set();return built.concat(window.TOPIK_EXTRA_WORDS||[],window.TOPIK_YONSEI_WORDS||[],window.TOPIK_VERIFIED_ADDITIONS||[],state.extra).filter(w=>{if(!w||!w[1]||seen.has(w[1]))return false;seen.add(w[1]);return true})}
const TOPIK_TOPICS={
 conversation:['안녕','안녕하세요','감사합니다','죄송합니다','네','아니요','이름','친구','만나다','말하다','질문','대답','약속','인사하다'],
 food:['밥','물','먹다','마시다','식당','김치','고기','과일','채소','주문','계산','커피','우유','맛있다'],
 shopping:['가게','시장','돈','가격','할인','사다','팔다','카드','영수증','쇼핑','상품'],
 transport:['버스','지하철','택시','역','정류장','길','가다','오다','내리다','타다','출발하다','도착하다'],
 school:['학교','학생','선생님','책','공부하다','시험','교실','수업','숙제','대학교','도서관'],
 work:['회사','직장','직업','회의','면접','월급','계약','보고서','직원','사장'],
 feelings:['좋다','싫다','행복하다','슬프다','화나다','걱정하다','기쁘다','피곤하다'],
 health:['병원','의사','약국','건강','아프다','약','감기','진료','간호사'],
 social:['사람','가족','친구','부모님','결혼','동생','관계','초대','선물'],
 verbs:['가다','오다','먹다','보다','읽다','쓰다','듣다','하다','주다','받다','있다','없다','많이','자주']
};
function lexicalRank(w){const r=Number(window.TOPIK_VOCAB_META?.[w[1]]?.rank);return r>0?r:((Number(w[0])||6)*2500+1000)}
function scope(){
 const words=all();let filtered;
 if(state.collection==='daily')filtered=words.filter(w=>Number(w[0])<=3&&lexicalRank(w)<=1800);
 else if(state.collection==='advanced')filtered=words.filter(w=>Number(w[0])>=4||lexicalRank(w)>4000&&Number(w[0])>=3);
 else if(state.collection.startsWith('topic:')){const allowed=new Set(TOPIK_TOPICS[state.collection.slice(6)]||[]);filtered=words.filter(w=>allowed.has(w[1]))}
 else filtered=words.filter(w=>Number(w[0])===state.level);
 return filtered.sort((a,b)=>lexicalRank(a)-lexicalRank(b)||a[1].localeCompare(b[1],'ko'));
}
function collectionChooser(){return '<div class="controls"><label class="small muted" for="collection-choice">学习词库</label><select class="select" id="collection-choice" aria-label="学习词库">'+[
 ['topik','TOPIK 教学分级'],['daily','日常高频韩语'],['topic:conversation','主题 · 日常对话'],['topic:food','主题 · 食物餐厅'],['topic:shopping','主题 · 购物支付'],['topic:transport','主题 · 交通出行'],['topic:school','主题 · 学校学习'],['topic:work','主题 · 工作职场'],['topic:feelings','主题 · 情绪感受'],['topic:health','主题 · 医院健康'],['topic:social','主题 · 社交关系'],['topic:verbs','主题 · 常见动词副词'],['advanced','进阶词汇']
 ].map(([id,name])=>'<option value="'+id+'" '+(state.collection===id?'selected':'')+'>'+name+'</option>').join('')+'</select></div>'}

function prog(ko,mode){return state.progress[ko]?.[mode]}
function isDue(ko,mode){let p=prog(ko,mode);return p&&Number(p.due)<=Date.now()}
function learningStage(ko){return window.TOPIK_FIRST_LEARNING.stage(state,ko)}
function isNew(ko){return learningStage(ko)==='unseen'}
function hasSeen(ko){return !isNew(ko)}
function markShown(ko){if(!window.TOPIK_FIRST_LEARNING.shown(state,ko))return;let d=dayInfo(),key=today();if(!d.learned.includes(ko))d.learned.push(ko);state.daily[key]=d;persist()}
function markRecall(ko,mode){window.TOPIK_FIRST_LEARNING.recall(state,ko,mode);persist()}
function dayInfo(){let key=today();return state.daily[key]||{learned:[],reviews:0,spell:0}}
function levelDayInfo(){const d=dayInfo(),allowed=new Set(scope().map(w=>w[1]));return {...d,learned:(d.learned||[]).filter(ko=>allowed.has(ko)),spell:(state.smartAnswerHistory||[]).filter(h=>allowed.has(h.ko)&&new Date(h.at).toLocaleDateString('sv-SE')===today()).length}}
function weak(ko){let p=state.progress[ko]||{};return ['read','meaning','spell'].reduce((n,m)=>n+(p[m]?.wrong||0)+(p[m]?.fuzzy||0),0)}
function counts(){let w=scope(),d=levelDayInfo();return{total:w.length,learned:w.filter(x=>hasSeen(x[1])).length,due:w.filter(x=>['consolidating','long-term','mastered','reviewing'].includes(learningStage(x[1]))&&['meaning','spell'].some(m=>isDue(x[1],m))).length,writeDue:w.filter(x=>isDue(x[1],'spell')).length,wrong:w.filter(x=>weak(x[1])>0).length,today:d.learned.length}}
function quote(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notify(s){let t=document.getElementById('toast');t.textContent=s;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),3000)}
function theme(){window.TOPIK_THEME.apply()}
const koreanSpeech=window.TOPIK_PRONUNCIATION.createController({
 speechSynthesis:window.speechSynthesis,
 SpeechSynthesisUtterance:window.SpeechSynthesisUtterance,
 onError:()=>notify('韩语朗读失败，请检查设备韩语语音设置')
});
function speak(s,slow=false){
 const result=koreanSpeech.play(s,slow);
 if(!result.ok){
  const messages={'unsupported':'当前浏览器不支持语音朗读',
   'no-ko-voice':'未检测到韩语语音。请在设备设置中下载或启用韩语声音',
   'playback-error':'韩语朗读失败，请检查浏览器语音设置'};
  notify(messages[result.reason]||'无法播放韩语语音');
 }
}
function enhanceSpeakButtons(){
 document.querySelectorAll('[data-speak]').forEach(b=>{
  const text=b.dataset.speak||'';
  b.setAttribute('type','button');
  b.setAttribute('aria-label','正常速度朗读韩语：'+text);
  b.onclick=()=>speak(text,false);
  const slow=document.createElement('button');
  slow.type='button';
  slow.className='slow-speak';
  slow.textContent='慢速';
  slow.setAttribute('aria-label','慢速朗读韩语：'+text);
  slow.onclick=()=>speak(text,true);
  b.insertAdjacentElement('afterend',slow);
 });
}

function grade(ko,mode,correct,certainty=''){let entry=state.progress[ko]||{};let old=entry[mode]||{step:0,wrong:0};let step=correct?Math.min((old.step||0)+1,7):0;let mins=[10,60*24,60*24*3,60*24*7,60*24*14,60*24*30,60*24*60,60*24*90][step];if(certainty==='fuzzy'){step=Math.max(0,(old.step||0)-1);mins=60*4}entry[mode]={step,wrong:(old.wrong||0)+(!correct&&certainty!=='fuzzy'?1:0),fuzzy:(old.fuzzy||0)+(certainty==='fuzzy'?1:0),due:Date.now()+mins*60000,last:Date.now()};state.progress[ko]=entry;window.TOPIK_FIRST_LEARNING.mastery(state,ko);let key=today();let d=state.daily[key]||{learned:[],reviews:0,spell:0};if(mode==='read'){if(!old.last&&!d.learned.includes(ko))d.learned.push(ko);d.reviews++}else d.spell++;state.daily[key]=d;persist()}
function navItems(){return [['home','◫','今日学习'],['words','≡','词库'],['records','◷','学习记录'],['practice','⌨','专项练习'],['settings','⚙','设置']]}
function renderNav(){let content=navItems().map(([v,ico,label])=>'<button type="button" data-view="'+v+'" class="'+(view===v?'active':'')+'" aria-current="'+(view===v?'page':'false')+'"><span class="ico" aria-hidden="true">'+ico+'</span>'+label+'</button>').join('');document.getElementById('desktop-nav').innerHTML=content;document.getElementById('mobile-nav').innerHTML=navItems().map(([v,ico,label])=>'<button data-view="'+v+'" class="'+(view===v?'active':'')+'" type="button">'+({'home':'今日学习','words':'词库','records':'记录','practice':'专项','settings':'设置'}[v]||label)+'</button>').join('')}
function change(v){hangulShift=false;view=v;session=null;practiceReturn=null;onboarding=null;smartTask=null;typed='';didCheck=false;feedback='';render();window.scrollTo({top:0,behavior:'instant'})}
function levelBar(){return '<div class="level-switch" role="group" aria-label="选择 TOPIK 难度">'+[1,2,3,4,5,6].map(n=>'<button type="button" data-level="'+n+'" class="'+(state.level===n?'active':'')+'">TOPIK '+n+'</button>').join('')+'</div>'}
function home(){
 const n=counts(),sum=TOPIK_SMART.summary(state,scope(),levelDayInfo(),state.dailyGoal);
 return '<div class="smart-home"><div class="eyebrow">今日学习 · '+today()+'</div><h1>TOPIK单词</h1>'+levelBar()+
 '<div class="smart-stats"><div><strong>'+sum.newCount+' <small>/ '+sum.goal+'</small></strong><span>今日新词</span></div><div><strong>'+sum.due+'</strong><span>今日待复习</span></div><div><strong>'+sum.consolidating+'</strong><span>学习中</span></div></div>'+
 '<button class="primary smart-start" data-smart-start="learn">开始学习 <span>→</span></button>'+ '<button class="primary smart-start" data-smart-start="review">开始复习 '+sum.due+' <span>→</span></button>'+ (sum.due===0?'<p class="tiny muted">今日复习已完成</p>':'')+
 '<p class="tiny muted smart-home-note">新词学习与到期复习分池安排 · 学习毕业后交给 FSRS。</p></div>';
}
function recordsHome(){
 const d=levelDayInfo(),w=scope(),sum=TOPIK_SMART.summary(state,w,d,state.dailyGoal);
 return '<div class="eyebrow">学习记录</div><h1>学习进度</h1><div class="smart-stats">'+
 '<div><strong>'+sum.newCount+'</strong><span>今日首次认识</span></div>'+
 '<div><strong>'+sum.firstRecall+'</strong><span>今日完成双向初次回忆（含历史复习）</span></div>'+
 '<div><strong>'+sum.consolidating+'</strong><span>学习中单词</span></div>'+
 '<div><strong>'+sum.due+'</strong><span>今日待复习</span></div>'+
 '<div><strong>'+sum.mastered+'</strong><span>熟练掌握单词</span></div></div>'+
 '<p class="muted">今日已进行 '+(d.spell||0)+' 次输入练习。熟练掌握必须双向经过跨日验证；即使掌握也会继续定期复习。</p>'+
 '<p class="small muted">历史记录不清空；旧版答题缺少可靠时间证据时，按待巩固处理。建议定期导出备份。</p>';
}
function practiceHome(){
 return '<div class="eyebrow">专项练习</div><h1>选择练习</h1><p class="muted">日常学习建议直接使用首页的「开始学习」。</p><div class="action-list">'+
 [['context','语境学词'],['meaning','韩语 → 中文'],['spell','中文 → 韩语'],['review','到期复习'],['wrong','错词强化']].map(([v,t])=>'<button class="action" data-start="'+v+'"><span><b>'+t+'</b></span><span class="arrow">→</span></button>').join('')+'</div>';
}
function choose(mode){let words=scope();if(mode==='learn')return words.filter(w=>isNew(w[1]));if(mode==='context')return words.filter(w=>!!ex(w)[0]);if(mode==='review')return words.filter(w=>['consolidating','long-term','mastered','reviewing'].includes(learningStage(w[1]))&&['meaning','spell'].some(m=>isDue(w[1],m)));if(mode==='wrong')return words.filter(w=>hasSeen(w[1])&&weak(w[1])>0).sort((a,b)=>weak(b[1])-weak(a[1]));if(mode==='meaning'){let studied=words.filter(w=>hasSeen(w[1]));let due=studied.filter(w=>!prog(w[1],'meaning')||isDue(w[1],'meaning'));return due}if(mode==='spell'){let studied=words.filter(w=>hasSeen(w[1]));let due=studied.filter(w=>!prog(w[1],'spell')||isDue(w[1],'spell'));return due}return[]}


let smartPool='learn';
function startSmart(pool='learn'){
 smartPool=pool==='review'?'review':'learn';
 TOPIK_SMART.resetSession();
 view='smart';session=null;onboarding=null;typed='';didCheck=false;smartPick();render();
}
function smartPick(){
 const history=state.smartHistory||[];
 const previousMode=state.smartInputDirection||null;
 const words=scope(),now=Date.now();
 smartTask=TOPIK_SMART.select(state,words,levelDayInfo(),state.dailyGoal,history,now,previousMode,smartPool);
 if(state.studyDebug){
  const d=TOPIK_SMART.inspect(state,words,now),ko=smartTask?.word?.[1],mode=smartTask?.mode;
  const r=ko?state.progress?.[ko]||{}:{};
  console.log('[TOPIK study scheduler]',{
   wordId:ko||null,word:ko||null,
   direction:mode==='meaning'?'ko-to-zh':mode==='spell'?'zh-to-ko':null,
   source:smartTask?.relearn?'relearn':smartTask?.type||'none',
   reason:smartTask?.reason||'no-due-task',inputMode:state.inputMethod,
   recognitionDue:d.due.meaning,productionDue:d.due.spell,
   recognitionState:r.meaning?.memory||null,productionState:r.spell?.memory||null,
   queueLength:d.queueLength,queueKoToZh:d.queue.meaning,queueZhToKo:d.queue.spell
  });
 }
 resetKeyboardInteraction();if(typeof simpleIme!=='undefined'&&simpleIme)simpleIme.reset();typed='';pinyinComposition='';pinyinPage=0;hangulShift=false;hangulMode='letters';pinyinShift=false;pinyinMode='letters';pinyinExpanded=false;didCheck=false;pendingRating=false;smartResult=null;
}
function resetKeyboardInteraction(){clearTimeout(keyboardDeleteTimer);clearInterval(keyboardDeleteInterval);keyboardDeleteTimer=null;keyboardDeleteInterval=null;}
window.addEventListener('blur',resetKeyboardInteraction);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetKeyboardInteraction()});
function smartNext(){
 if(!smartTask)return;
 if(useVirtualKeyboard())document.getElementById('spell-input')?.blur();
 if(pendingRating){notify('请先选择记忆感受');return}
 if(smartTask.type==='relearn-show'){
   TOPIK_RELEARN.afterShow(state,smartTask.word[1]);
 }else if(smartTask.type==='show'){
   markShown(smartTask.word[1]);
 }else if(!didCheck){notify('请先提交答案');return}
 if(smartTask.type==='typing'){
  state.smartInputDirection=smartTask.mode;
  state.smartDirectionHistory=(state.smartDirectionHistory||[]).concat(smartTask.mode).slice(-12);
 }
 TOPIK_SMART.recordExposure(smartTask.word[1],smartTask.mode,smartTask.type==='typing'?smartResult:'correct');
 state.smartHistory=(state.smartHistory||[]).concat([smartTask.word[1]]).slice(-30);
 persist();smartPick();render();
}
function smartRecord(result){
 if(!smartTask||smartTask.type!=='typing'||didCheck)return;
 if(useVirtualKeyboard())document.getElementById('spell-input')?.blur();
 const {word,mode}=smartTask,correct=['correct','hard','good','easy'].includes(result);
 const phase=TOPIK_SMART.wordState(state,word[1]);
 if(phase==='LEARNING')TOPIK_SMART.learningResult(state,word[1],mode,correct,Date.now(),result);
 else{
  TOPIK_SMART.review(state,word[1],mode,correct,Date.now(),result);
  if(!correct)state.lifecycle[word[1]].wordState='RELEARNING';
  else if(phase==='RELEARNING'&&['meaning','spell'].every(m=>state.progress?.[word[1]]?.[m]?.memory?.phase==='review'))state.lifecycle[word[1]].wordState='REVIEW';
  TOPIK_RELEARN.afterAnswer(state,word[1],mode,correct);
 }
 markRecall(word[1],mode);
 const d=dayInfo(),key=today();d.spell=(d.spell||0)+1;state.daily[key]=d;
 // Store the three outcomes separately, without changing legacy progress keys.
 state.smartAnswerHistory=(state.smartAnswerHistory||[]).concat([{
  ko:word[1],mode,result,at:Date.now()
 }]).slice(-3000);
 smartResult=result;pendingRating=false;didCheck=true;resetKeyboardInteraction();persist();render();
}
function markUnfamiliar(){
 if(!smartTask||smartTask.type!=='typing'||!didCheck)return;
 if(TOPIK_SMART.wordState(state,smartTask.word[1])==='LEARNING')state.lifecycle[smartTask.word[1]].learningStreak=0;
 else TOPIK_RELEARN.enqueue(state,smartTask.word[1],'refresh',[smartTask.mode]);
 state.smartAnswerHistory.push({ko:smartTask.word[1],mode:smartTask.mode,result:'unfamiliar',at:Date.now()});
 state.smartAnswerHistory=state.smartAnswerHistory.slice(-3000);
 persist();notify('已加入重新学习：先看完整单词，再练习当前方向');smartNext();
}
function queueRelearn(words,kind,modes){
 const valid=words.filter(w=>hasSeen(w[1]));
 for(const w of valid)TOPIK_RELEARN.enqueue(state,w[1],kind,modes);
 persist();notify('已安排 '+valid.length+' 个单词重新学习');render();
}
function smartSubmit(){
 if(useChineseKeyboard()&&pinyinComposition){notify('请先选择拼音候选词');return}
 if(!smartTask||smartTask.type!=='typing'||didCheck||pendingRating)return;
 const input=document.getElementById('spell-input');
 if(input?.dataset.composing==='1')return;
 typed=(input?.value??typed).trim();if(!typed){notify('请先输入答案，或点击「不知道」');return}
 const correct=answerCorrect(smartTask.word,typed,smartTask.mode)||(smartTask.mode==='spell'&&TOPIK_LEXICON.acceptedSpell(typed,smartTask.word,scope()));
 try{window.TOPIK_SOUND?.play(correct?(evaluateAnswer(smartTask.word,typed,smartTask.mode).level==='acceptable'?'acceptable':'correct'):'incorrect')}catch(_){}
 if(!correct)TOPIK_LEXICON.confusion(state,smartTask.word[1],typed,scope(),smartTask.mode);
 if(correct){
  pendingRating=true;
  if(input)input.readOnly=true;
  const actions=document.querySelector('.smart-bottom .smart-actions');
  if(actions){actions.innerHTML='<button type="button" class="secondary" data-smart-rate="hard">很吃力</button><button type="button" class="secondary" data-smart-rate="good">一般</button><button type="button" class="primary" data-smart-rate="easy">很熟悉</button>';
   actions.querySelectorAll('[data-smart-rate]').forEach(b=>b.onclick=()=>smartRate(b.dataset.smartRate));}
  resetKeyboardInteraction();render();notify('回答正确，请选择记忆感受');return;
 }
 smartRecord('wrong');
}
function smartRate(rating){
 if(!smartTask||!pendingRating||didCheck||!['hard','good','easy'].includes(rating))return;
 smartRecord(rating);
}
function smartDontKnow(){
 if(!smartTask||smartTask.type!=='typing'||didCheck||pendingRating)return;
 typed='';pendingRating=false;
 // No input required. Only this recall direction receives an Again grade.
 smartRecord('again');
}
function useVirtualKeyboard(){return state.inputMethod!=='system'&&view==='smart'&&smartTask?.type==='typing'}
function useHangulKeyboard(){return useVirtualKeyboard()&&smartTask.mode==='spell'}
function useChineseKeyboard(){return useVirtualKeyboard()&&smartTask.mode==='meaning'}
function chineseGlosses(){return scope().map(w=>w[2])}
// Chinese IME is input-only; no scheduler, FSRS or study persistence changes.
const CHINESE_IME_ENGINE=new URLSearchParams(location.search).get('chineseIme')==='legacy'?'legacy':'simple-ime';
window.CHINESE_IME_ENGINE=CHINESE_IME_ENGINE;
let simpleIme=null,imeLoadPromise=null,imeLoadStarted=0;
const IME_ASSET_VERSION='d503bee97392f3b99e1fb9d6f23cecc86ced6f26';
function loadChineseIme(){
 if(CHINESE_IME_ENGINE==='legacy')return Promise.resolve(null);
 if(simpleIme)return Promise.resolve(simpleIme);
 if(imeLoadPromise)return imeLoadPromise;
 imeLoadStarted=performance.now();
 const load=src=>new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>reject(Error('IME asset failed: '+src));document.head.appendChild(el)});
 imeLoadPromise=load('./ime-experiment/simple-ime-core.js?v='+IME_ASSET_VERSION)
  .then(()=>load('./ime-experiment/simple-ime-adapter.js?v=3.7.0'))
  .then(()=>{simpleIme=new window.TOPIK_SimpleImeAdapter(window.SimpleImeCore,10);console.info('[IME] ready',Math.round(performance.now()-imeLoadStarted),'ms');if(useChineseKeyboard())updatePinyinDisplay();return simpleIme})
  .catch(err=>{imeLoadPromise=null;console.error(err);notify('中文输入法加载失败，请检查网络后重试');throw err});
 return imeLoadPromise;
}
function chineseImeCandidates(){
 if(CHINESE_IME_ENGINE==='legacy')return TOPIK_PINYIN.candidates(pinyinComposition,chineseGlosses());
 return simpleIme?simpleIme.getCandidates():[];
}
function syncChineseAnswer(){
 const input=document.getElementById('spell-input');if(input)input.value=typed;
}
function commitChineseCandidate(index=0){
 if(CHINESE_IME_ENGINE==='legacy'){
  const choice=chineseImeCandidates()[index];if(!choice)return false;
  const result=TOPIK_PINYIN.select(typed,pinyinComposition,choice);
  typed=result.answer;pinyinComposition=result.composition;
 }else{
  if(!simpleIme)return false;
  const choice=simpleIme.selectCandidate(index);if(!choice)return false;
  typed+=choice;pinyinComposition=simpleIme.getComposition();
 }
 pinyinPage=0;pinyinExpanded=false;syncChineseAnswer();updatePinyinDisplay();return true;
}
function updatePinyinDisplay(){
 const label=document.getElementById('pinyin-composition'),list=document.getElementById('pinyin-candidates');
 if(!label||!list)return;
 if(CHINESE_IME_ENGINE==='simple-ime')pinyinComposition=simpleIme?.getComposition()||'';
 label.textContent=pinyinComposition||'';
 const choices=chineseImeCandidates();
 const isSimple=CHINESE_IME_ENGINE==='simple-ime';
 const pageSize=10;
 const page=isSimple?(simpleIme?.page||0):0;
 const shown=pinyinExpanded?choices:choices.slice(page*pageSize,(page+1)*pageSize);
 list.innerHTML=shown.map((w,i)=>'<button type="button" data-pinyin-choice="'+(pinyinExpanded?i:page*pageSize+i)+'">'+quote(w)+'</button>').join('');
 if(isSimple&&!pinyinExpanded&&choices.length>pageSize){
  if(page>0)list.insertAdjacentHTML('afterbegin','<button type="button" data-ime-prev aria-label="上一页候选">‹</button>');
  if((page+1)*pageSize<choices.length)list.insertAdjacentHTML('beforeend','<button type="button" data-ime-next aria-label="下一页候选">›</button>');
 }
 const expand=document.querySelector('[data-pinyin-expand]');
 if(expand){expand.hidden=choices.length<4;expand.setAttribute('aria-expanded',String(pinyinExpanded));}
 list.classList.toggle('expanded',pinyinExpanded);
 list.querySelectorAll('[data-pinyin-choice]').forEach(b=>b.onclick=()=>commitChineseCandidate(Number(b.dataset.pinyinChoice)));
 const next=list.querySelector('[data-ime-next]');if(next)next.onclick=()=>{simpleIme.nextPage();updatePinyinDisplay()};
 const prev=list.querySelector('[data-ime-prev]');if(prev)prev.onclick=()=>{simpleIme.previousPage();updatePinyinDisplay()};
 if(isSimple&&pinyinComposition)console.debug({engine:'simple-ime',composition:pinyinComposition,candidateCount:choices.length,candidates:choices.slice(0,50)});
}
function applyPinyinSymbol(symbol){
 if(!useChineseKeyboard()||didCheck||pendingRating)return;
 if(pinyinComposition&&!commitChineseCandidate(0)){notify('请先选择拼音候选');return}
 if(CHINESE_IME_ENGINE==='legacy'){
  const result=TOPIK_PINYIN.update(typed,pinyinComposition,'insert:'+symbol);
  typed=result.answer;pinyinComposition=result.composition;
 }else typed+=symbol;
 syncChineseAnswer();updatePinyinDisplay();
}
function applyPinyinKey(key){
 if(!useChineseKeyboard()||didCheck||pendingRating)return;
 if(CHINESE_IME_ENGINE==='legacy'){
  if(key==='space'&&pinyinComposition){if(!commitChineseCandidate(0))notify('没有匹配候选，请修改拼音')}
  else{const result=TOPIK_PINYIN.update(typed,pinyinComposition,key);typed=result.answer;pinyinComposition=result.composition}
 }else{
  if(!simpleIme){void loadChineseIme().catch(()=>{});notify('中文输入法加载中，请稍候');return}
  if(key==='backspace'){
   if(simpleIme.getComposition())simpleIme.backspace();
   else typed=Array.from(typed).slice(0,-1).join('');
  }else if(key==='space'){
   if(simpleIme.getComposition()){if(!commitChineseCandidate(0)){notify('没有匹配候选，请修改拼音');return}}
   else typed+=' ';
  }else if(/^[a-z]$/i.test(key))simpleIme.input(key);
  pinyinComposition=simpleIme.getComposition();
 }
 if(pinyinShift&&/^[a-z]$/i.test(key)){pinyinShift=false;TOPIK_PINYIN.updateShift(document.querySelector('.pinyin-keyboard'),false)}
 pinyinPage=0;syncChineseAnswer();updatePinyinDisplay();
}
function keyboardReturn(){
 if(didCheck||pendingRating)return;
 if(useChineseKeyboard()){
  if(pinyinComposition&&!commitChineseCandidate(0))notify('没有匹配候选，请修改拼音');
  // Return never submits a study answer in Chinese keyboard mode.
  return;
 }
 // Korean Return only completes keyboard input. Submit via the separate study button.
 return;
}
function bindDeleteRepeat(button,action){
 let down=false,repeated=false,suppressClick=false;
 const stop=()=>{down=false;clearTimeout(keyboardDeleteTimer);clearInterval(keyboardDeleteInterval);keyboardDeleteTimer=null;keyboardDeleteInterval=null};
 const start=e=>{
  if(e.type==='pointerdown'&&e.button!==0||didCheck||pendingRating||down)return;
  down=true;repeated=false;suppressClick=false;action();
  keyboardDeleteTimer=setTimeout(()=>{
   if(!down)return;
   repeated=true;keyboardDeleteInterval=setInterval(()=>{if(down)action()},72);
  },420);
 };
 button.addEventListener('pointerdown',start);
 button.addEventListener('touchstart',e=>{if(typeof PointerEvent==='undefined')start(e)},{passive:true});
 for(const event of ['pointerup','pointercancel','lostpointercapture','touchend','touchcancel']){
  button.addEventListener(event,()=>{if(down){suppressClick=true;stop()}});
 }
 button.addEventListener('click',e=>{if(suppressClick){suppressClick=false;e.preventDefault();return}if(!down)action()});
 // Global blur/visibility handlers reset both timers without per-render listener leaks.
}

let hangulMode='letters';
function applyHangulKey(key){
 if(!useHangulKeyboard()||didCheck||pendingRating)return;
 const input=document.getElementById('spell-input');if(!input)return;
 const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
 const change=TOPIK_HANGUL.edit(input.value,start,end,key);
 input.value=change.text;typed=change.text;
 // Keep the native keyboard closed; caret selection works without focusing.
 input.setSelectionRange(change.caret,change.caret);
 if(hangulShift&&key!=='Backspace'&&key!==' '){hangulShift=false;TOPIK_HANGUL.updateShift(document.querySelector('.hangul-keyboard'),false)}
}
function correctRating(result){return ['correct','hard','good','easy'].includes(result)}
function smartScreen(){
 if(!smartTask){
   const sum=TOPIK_SMART.summary(state,scope(),levelDayInfo(),state.dailyGoal);
   return '<div class="smart-done"><div class="eyebrow">今日学习</div><h1>当前任务已完成</h1><p class="muted">今日认识 '+sum.newCount+' 个新词，当前没有可安排的到期题目。</p><button class="primary" data-view="home">返回首页</button></div>';
 }
 const {word:w,type,mode}=smartTask,ko=quote(w[1]),zh=quote(w[2]),d=ex(w);
 const isShow=type==='show'||type==='relearn-show',isMeaning=mode==='meaning';
 const webKeyboard=!isShow&&useVirtualKeyboard()&&!pendingRating&&!didCheck;
 const koreanKeyboard=webKeyboard&&!isMeaning,chineseKeyboard=webKeyboard&&isMeaning;
 if(chineseKeyboard&&CHINESE_IME_ENGINE==='simple-ime'&&!simpleIme)void loadChineseIme().catch(()=>{});
 const example=d[0]?'<div class="smart-example" id="smart-example" '+(isShow?'':'hidden')+'><p lang="ko">'+markExample(d[0],w[1])+'</p><p class="muted">'+quote(d[1])+'</p><button class="text-btn" data-speak="'+quote(d[0])+'">▶ 听例句</button></div>':'';
 const main=isShow?
 '<div class="smart-word" lang="ko">'+ko+'</div><div class="smart-translation">'+zh+'</div><div class="smart-reading">'+quote(romanizeHangul(w[1]))+'</div><button class="smart-speak" data-speak="'+ko+'">▶ 听发音</button>':
 '<div class="smart-word '+(isMeaning?'':'smart-chinese')+'" '+(isMeaning?'lang="ko"':'')+'>'+(isMeaning?ko:zh)+'</div>'+
 (!isMeaning&&TOPIK_LEXICON.hint(w,scope())?'<p class="tiny muted">'+quote(TOPIK_LEXICON.hint(w,scope()))+'</p>':'')+
 '<div class="input-wrap"><input id="spell-input" class="field" type="text" inputmode="'+(webKeyboard?'none':'text')+'" enterkeyhint="done" aria-label="'+(isMeaning?'输入中文':'输入韩语')+'" placeholder="'+(isMeaning?'输入中文意思':'请输入韩语')+'" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="'+(isMeaning?'zh-CN':'ko')+'" value="'+quote(typed)+'" '+(webKeyboard||didCheck?'readonly':'')+'></div>'+ 

 (pendingRating?'<p class="tiny muted" role="status">'+(evaluateAnswer(w,typed,mode).level==='acceptable'?'基本正确 · 可接受表达。':'回答正确。')+'请选择刚才回忆的真实感受，再安排下次复习。</p>'+meaningFeedback(w,typed,mode):'')+
 (didCheck?'<div class="smart-feedback '+(correctRating(smartResult)?'good':'bad')+'" role="status">'+
 '<strong>'+(correctRating(smartResult)?'回答正确 · 已安排后续巩固':smartResult==='again'?'已记录：不知道 · 稍后重练':'回答错误 · 稍后重练')+'</strong>'+
 '<div class="smart-answer"><span>韩语</span><b lang="ko">'+ko+'</b><button class="text-btn" data-speak="'+ko+'">▶ 发音</button></div>'+
 '<div class="smart-answer"><span>中文</span><b>'+zh+'</b></div>'+ (correctRating(smartResult)?meaningFeedback(w,typed,mode):'')+
 (d[2]?'<div class="smart-reading">读音：'+quote(d[2])+'</div>':'')+
 '</div>':'');
 const actions=isShow?'<button class="primary smart-action" data-smart-next="1">继续 →</button>':
 pendingRating?'<div class="smart-actions"><button type="button" class="secondary" data-smart-rate="hard">很吃力</button><button type="button" class="secondary" data-smart-rate="good">一般</button><button type="button" class="primary" data-smart-rate="easy">很熟悉</button></div>':
 didCheck?'<div class="smart-actions"><button type="button" class="secondary" data-unfamiliar="1">还不熟悉</button><button class="primary smart-action" data-smart-next="1">继续 →</button></div>':
 '<div class="smart-actions"><button type="button" class="secondary smart-unknown" data-smart-unknown="1">不知道</button><button type="button" class="primary smart-submit" data-smart-submit="1">提交答案</button></div>';
 const sum=TOPIK_SMART.summary(state,scope(),levelDayInfo(),state.dailyGoal);
 const debug=state.studyDebug?TOPIK_SMART.inspect(state,scope()):null;
 const debugHtml=debug?'<details class="study-debug" open><summary>学习调试信息</summary><p>当前方向：'+(mode==='meaning'?'韩→中':mode==='spell'?'中→韩':'首次展示')+' · 输入方式：'+quote(state.inputMethod)+'</p><p>Recognition due: '+debug.due.meaning+' · Production due: '+debug.due.spell+'</p><p>Queue ko→zh: '+debug.queue.meaning+' · Queue zh→ko: '+debug.queue.spell+' · 总计：'+debug.queueLength+'</p><p>选择原因：'+quote(smartTask.reason||'—')+'（队列按需生成，无预缓存）</p></details>':'';
 return '<div class="smart-study"><header class="smart-study-head"><button class="text-btn" data-view="home">← 返回</button><span class="tiny muted">'+sum.newCount+' / '+sum.goal+' 新词 · '+sum.due+' 待复习</span></header>'+
 debugHtml+'<div class="smart-progress"><i style="width:'+Math.min(100,100*sum.newCount/Math.max(1,sum.goal))+'%"></i></div>'+
 '<section class="smart-focus"><div class="smart-kind">'+(type==='relearn-show'?'重新认识':isShow?'认识新词':isMeaning?'韩语 → 中文':'中文 → 韩语')+'</div>'+main+
 (d[0]&&isShow?example:'')+
 (didCheck&&d[0]?'<button class="text-btn smart-expand" data-smart-example="1">查看例句 ﹀</button>'+example:'')+'</section>'+
 '<footer class="smart-bottom'+(webKeyboard?' has-keyboard':'')+'">'+actions+(webKeyboard?'<div class="study-keyboard-dock">'+(koreanKeyboard?TOPIK_HANGUL.render(hangulShift):TOPIK_PINYIN.render())+'</div>':'')+'</footer></div>';
}

function startOnboarding(){
 let words=scope().filter(w=>['unseen','shown','learning'].includes(learningStage(w[1]))).slice(0,TOPIK_FIRST_LEARNING.LIMIT);
 onboarding=TOPIK_FIRST_LEARNING.newBatch(words);
 view='onboard';session=null;practiceReturn=null;typed='';didCheck=false;render();
}
function advanceReveal(){
 if(!onboarding||onboarding.phase!=='show')return;
 const w=onboarding.words[onboarding.index];if(!w)return;
 markShown(w[1]);TOPIK_FIRST_LEARNING.reveal(onboarding);render();
}
function nextOnboardQuestion(){
 if(!onboarding)return;
 TOPIK_FIRST_LEARNING.next(onboarding);typed='';didCheck=false;render();
}
function submitOnboardAnswer(){
 if(!onboarding||onboarding.phase!=='typing'||didCheck)return;
 const q=onboarding.question;
 typed=(document.getElementById('spell-input')?.value??typed).trim();
 if(!typed){notify('请先输入答案');return}
 const ok=answerCorrect(q.word,typed,q.mode);
 try{window.TOPIK_SOUND?.play(ok?'correct':'incorrect')}catch(_){}
 didCheck=true;
 grade(q.word[1],q.mode,ok);
 markRecall(q.word[1],q.mode);
 TOPIK_FIRST_LEARNING.result(onboarding,ok);
 render();
}
function onboardScreen(){
 const b=onboarding;
 if(!b||!b.words.length)return '<div class="eyebrow">首次学习</div><h1>当前等级没有未学习的新词</h1><p class="muted">可以复习已学词，也可以切换 TOPIK 等级。</p><button class="primary" data-view="home">返回首页</button>';
 if(b.phase==='done')return '<div class="eyebrow">首次学习 · 已完成</div><h1>本轮学习完成</h1><p class="muted">本轮认识了 '+b.words.length+' 个新词，完成双向 Typing 首次回忆。错误题目最多安排两次额外练习，不会无限重复。</p><div class="summary"><div><b>'+b.words.length+'</b><span>新词数量</span></div><div><b>'+b.attempts+'</b><span>Typing 作答次数</span></div><div><b>'+b.correct+'</b><span>正确次数</span></div></div><p class="muted">已进入间隔复习，两个方向的掌握程度独立计算。</p><button class="primary" data-view="home">返回今日学习</button>';
 if(b.phase==='intro')return '<div class="eyebrow">首次学习 · 第二阶段</div><h1>开始记忆</h1><p class="muted">刚才已经展示 '+b.words.length+' 个新词。接下来将打乱顺序，分别测试韩语 → 中文、中文 → 韩语。不会刚看完一个词就立即考同一个词。</p><button class="primary" data-begin-typing="1">开始双向 Typing →</button>';
 const isShow=b.phase==='show',w=isShow?b.words[b.index]:b.question.word;
 const mode=isShow?'':b.question.mode,d=ex(w),k=quote(w[1]);
 const extra=d[0]?'<section class="context-panel"><div class="context-label">韩语例句 · 学习参考</div><div class="context-ko" lang="ko">'+markExample(d[0],w[1])+'</div><div class="context-zh">'+quote(d[1])+'</div><button type="button" class="text-btn" data-speak="'+quote(d[0])+'">▶ 听例句</button></section>':'';
 const content=isShow?
   '<div class="onboard-label">首次认识 · 不计入正确率</div><div class="korean" lang="ko">'+k+'</div>'+pronunciation(w,d)+'<div class="answer-block"><div class="meaning">'+quote(w[2])+'</div>'+extra+'</div><p class="muted small">先阅读和记忆，不需要输入，也不判断对错。</p>':
   '<div class="onboard-label">首次回忆 · '+(mode==='meaning'?'韩语 → 中文':'中文 → 韩语')+'</div>'+(mode==='meaning'?'<div class="korean" lang="ko">'+k+'</div>':'<div class="meaning">'+quote(w[2])+'</div>')+
   '<div class="question">'+(mode==='meaning'?'请输入中文意思':'请输入韩语拼写')+'</div><div class="input-wrap"><input id="spell-input" class="field" aria-label="'+(mode==='meaning'?'输入中文意思':'输入韩语拼写')+'" lang="'+(mode==='meaning'?'zh-CN':'ko')+'" autocomplete="off" spellcheck="false" placeholder="'+(mode==='meaning'?'请输入中文……':'请输入韩语……')+'" value="'+quote(typed)+'" '+(didCheck?'disabled':'')+'></div>'+
   (didCheck?'<div class="feedback '+(answerCorrect(w,typed,mode)?'good':'bad')+'" role="status">'+(answerCorrect(w,typed,mode)?(evaluateAnswer(w,typed,mode).level==='acceptable'?'基本正确！':'回答正确！'):'正确答案：'+quote(mode==='meaning'?w[2]:w[1]))+meaningFeedback(w,typed,mode)+pronunciation(w,d)+extra+'</div>':'');
 const actions=isShow?'<button class="secondary" data-speak="'+k+'">听发音</button><button class="primary" data-next-reveal="1">'+(b.index===b.words.length-1?'开始记忆 →':'下一个 →')+'</button>':
   didCheck?'<button class="primary" data-next-question="1">下一题 →</button>':'<button class="primary" data-check-onboard="1">检查答案</button>';
 const count=isShow?b.index+1:b.attempts+1,total=isShow?b.words.length:b.words.length*2;
 return '<div class="study-head"><div><div class="eyebrow">TOPIK '+state.level+' · '+(isShow?'第一阶段：新词认识':'第二阶段：双向 Typing')+'</div><span class="tiny quiet">'+count+' / '+total+' · 新词按单词计数</span></div><button class="text-btn" data-view="home">退出学习 ×</button></div><div class="progress-track"><i style="width:'+Math.min(100,100*(isShow?b.index:b.attempts)/total)+'%"></i></div><section class="study-screen onboard-screen '+(isShow?'onboard-reveal':'onboard-test')+'">'+content+'</section><div class="study-actions">'+actions+'</div>';
}

function start(mode){if(mode==='learn'){startOnboarding();return}practiceReturn=null;session={mode,deck:choose(mode),index:0,flipped:false};view=mode;typed='';didCheck=false;feedback='';render()}
function startSpecific(mode){let w=session?.deck[session?.index];if(!w)return;if(isNew(w[1])){notify('新词需要先认识韩文与中文');return}practiceReturn={view,session};view=mode;session={mode,deck:[w],index:0,flipped:false};typed='';didCheck=false;render()}
function resumePractice(){if(!practiceReturn)return;view=practiceReturn.view;session=practiceReturn.session;practiceReturn=null;typed='';didCheck=false;render()}
function romanizeHangul(input){const initials=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'],vowels=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'],finals=['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];return Array.from(String(input)).map(ch=>{let n=ch.charCodeAt(0)-0xAC00;if(n<0||n>=11172)return ch;let lead=Math.floor(n/588),v=Math.floor(n%588/28),tail=n%28;return initials[lead]+vowels[v]+finals[tail]}).join('')}
function pronunciation(w,d){let rom=romanizeHangul(w[1]);return '<div class="reading">罗马字拼读参考：'+quote(rom)+'</div>'+(d[2]?'<div class="reading">实际读音：'+quote(d[2])+'</div>':'')}
function ex(w){let d=detail[w[1]]||[w[3]||'',w[4]||'',w[5]||''],c=window.TOPIK_STUDY_CONTEXT?.[w[1]];return [c?.[0]||d[0]||'',c?.[1]||d[1]||'',d[2]||'']}
function markExample(sentence,term){let i=sentence.indexOf(term);return i<0?quote(sentence):quote(sentence.slice(0,i))+'<mark class="context-mark">'+quote(term)+'</mark>'+quote(sentence.slice(i+term.length))}
function activeTypingMode(){if(view==='spell'||view==='meaning')return view;if(view==='review'||view==='wrong'){let w=session?.deck[session.index];if(!w)return 'meaning';let a=prog(w[1],'meaning'),b=prog(w[1],'spell');if(!a)return 'meaning';if(!b)return 'spell';return a.due<=b.due?'meaning':'spell'}return 'read'}
function sessionScreen(){let mode=view,kind=activeTypingMode();if(!session||session.mode!==mode){session={mode,deck:choose(mode),index:0,flipped:false}}let deck=session.deck,w=deck[session.index],title={learn:'学习单词',context:'语境学词',review:'间隔复习',spell:'韩文拼写',meaning:'中文释义输入',wrong:'错词强化'}[mode]||mode;if(!w){return '<div class="eyebrow">TOPIK '+state.level+'</div><h1>'+title+'</h1><div class="empty"><h3>本轮完成了</h3><p>'+(mode==='learn'?'当前等级尚未接触的词已经学完。你可以切换等级或自由复习。':'当前没有待练习的词。你可以随时选择其他模式。')+'</p><button class="primary" data-view="home">返回今日学习</button>'+(practiceReturn?'<button class="secondary" data-resume-practice="1">返回刚才的学习卡片</button>':'')+'</div>'}let d=ex(w),isSpell=kind==='spell',isMeaning=kind==='meaning',isTyping=isSpell||isMeaning,isBrowse=mode==='learn'||mode==='context',k=quote(w[1]);let extra=d[0]?'<section class="context-panel" aria-label="韩语例句"><div class="context-label">语境例句 · 学习用短句</div><div class="context-ko" lang="ko">'+markExample(d[0],w[1])+'</div><div class="context-zh">'+quote(d[1])+'</div><button type="button" class="text-btn" data-speak="'+quote(d[0])+'">▶ 听例句</button></section>':'';let reading=pronunciation(w,d);let content=isBrowse?'<div class="korean" lang="ko">'+k+'</div>'+reading+'<div class="answer-block"><div class="meaning">'+quote(w[2])+'</div>'+extra+'</div><div class="question">先理解词义与例句，然后自由选择是否练习</div>':isTyping?(isMeaning?'<div class="korean" lang="ko">'+k+'</div><div class="question">请自己输入中文意思</div>':'<div class="meaning">'+quote(w[2])+'</div><div class="question">输入对应的韩语拼写</div>')+'<div class="input-wrap"><input id="spell-input" class="field" aria-label="'+(isMeaning?'输入中文意思':'输入韩语拼写')+'" autocomplete="off" autocapitalize="off" spellcheck="false" lang="'+(isMeaning?'zh-CN':'ko')+'" placeholder="'+(isMeaning?'输入中文意思':'用韩语键盘输入')+'" value="'+quote(typed)+'" '+(didCheck?'disabled':'')+'></div>':('<div class="korean" lang="ko">'+k+'</div><div class="question">先想想中文是什么意思</div>');if(isTyping&&didCheck){let ok=answerCorrect(w,typed,kind);content+='<div class="feedback '+(ok?'good':'bad')+'" role="status">'+(ok?(isMeaning?(evaluateAnswer(w,typed,kind).level==='acceptable'?'基本正确！':'释义正确！'):'拼写正确！'):(isMeaning?'参考释义：'+quote(w[2]):'正确拼写：'+k))+meaningFeedback(w,typed,kind)+reading+extra+'</div>'}else if(!isSpell&&session.flipped){content+='<div class="answer-block"><div class="meaning">'+quote(w[2])+'</div>'+reading+extra+'</div>'}
let actions=isBrowse?'<button class="secondary" data-speak="'+k+'">听单词</button><button class="line-btn" data-practice-word="meaning">测中文</button><button class="line-btn" data-practice-word="spell">测拼写</button><button class="line-btn" data-mark-fuzzy="1">稍后再复习</button><button class="primary" data-next-learn="1">下一词 →</button>':isTyping?(didCheck?'<button class="primary" data-grade-spell="1">下一词 →</button>':'<button class="secondary" data-speak="'+k+'">听发音</button><button class="primary" data-check="1">'+(isMeaning?'检查释义':'检查拼写')+'</button>'): (session.flipped?'<button class="secondary" data-grade="0">还没记住</button><button class="line-btn" data-grade="fuzzy">有点模糊</button><button class="primary" data-grade="1">记住了</button>':'<button class="secondary" data-speak="'+k+'">听发音</button><button class="primary" data-flip="1">显示答案</button>');
return '<div class="study-head"><div><div class="eyebrow">TOPIK '+state.level+' · '+title+'</div><span class="tiny quiet">'+(session.index+1)+' / '+deck.length+'</span></div><button class="text-btn" data-view="home">结束练习 ×</button></div><div class="progress-track" role="progressbar" aria-valuenow="'+session.index+'" aria-valuemin="0" aria-valuemax="'+deck.length+'"><i style="width:'+(100*session.index/deck.length)+'%"></i></div><section class="study-screen">'+content+'</section><div class="study-actions">'+actions+'</div><p class="tiny muted" style="text-align:center;margin-top:20px">学习与语境模式直接显示释义；测试时才隐藏答案。学习数量由你决定</p>'}
// Chinese meanings are evaluated as individual senses; source vocabulary and progress stay unchanged.
function evaluateAnswer(w,input,mode){
 const result=window.TOPIK_ANSWER_EVALUATOR.evaluateAnswer({direction:mode,userAnswer:input,word:w});
 return {level:result.status==='incorrect'?'wrong':result.status,other:result.other,matched:result.matchedMeaning,reason:result.reason};
}
function answerCorrect(w,input,mode){return evaluateAnswer(w,input,mode).level!=='wrong'}
function meaningFeedback(w,input,mode){
 if(mode!=='meaning')return '';
 const result=evaluateAnswer(w,input,mode);
 if(result.level==='wrong')return '';
 return '<div class="meaning-detail"><div>你的答案：'+quote(input)+'</div>'+
 (result.level==='acceptable'?'<div>基本正确 · 可接受表达（'+quote(result.matched)+'）</div>':'')+
 (result.other.length?'<div>其他常见义项：'+result.other.map(quote).join('、')+'</div>':'')+'</div>';
}
function next(correct,skipGrade=false){let w=session.deck[session.index],fuzzy=correct==='fuzzy';if(view==='learn'||view==='context'){if(fuzzy){grade(w[1],'read',false,'fuzzy');session.index++;session.flipped=false;typed='';didCheck=false;render();return}let p=state.progress[w[1]]||{};if(!p.read)markShown(w[1])}else if(!skipGrade){let direction=activeTypingMode();grade(w[1],direction,fuzzy?false:correct,fuzzy?'fuzzy':'');if(direction==='spell'||direction==='meaning')markRecall(w[1],direction)}session.index++;session.flipped=false;typed='';didCheck=false;render()}
function checkSpell(){let w=session.deck[session.index],direction=activeTypingMode();typed=(document.getElementById('spell-input')?.value??typed).trim();if(!typed){notify('先输入答案再检查');return}if(didCheck)return;if(isNew(w[1])){notify('请先在新词学习中认识这个词');return}didCheck=true;grade(w[1],direction,answerCorrect(w,typed,direction));markRecall(w[1],direction);render()}
function relearnPanel(){
 const selected=relearnSelection.size;
 return '<section class="settings-group relearn-panel"><h3>重新学习</h3><p class="muted small">只选择已接触的单词，保留全部历史记录；先看完整词卡，再进行双向输入。</p><div class="relearn-tools"><select id="relearn-kind" class="select" aria-label="重新学习方式"><option value="refresh">温习一遍</option><option value="restart">从头重新学习</option></select><select id="relearn-modes" class="select" aria-label="重新学习方向"><option value="both">双向 Typing</option><option value="spell">只练韩语拼写</option><option value="meaning">只练中文释义</option></select></div><div class="relearn-tools"><button class="line-btn" data-relearn-batch="today">今天接触</button><button class="line-btn" data-relearn-batch="week">最近7天</button><button class="line-btn" data-relearn-batch="level">本 TOPIK 组已学</button></div><button class="primary" data-relearn-selected="1">重新学习已选 '+selected+' 词</button><span class="tiny muted">待重新学习 '+TOPIK_RELEARN.count(state)+' 词</span></section>';
}
function relearnModes(){let v=document.getElementById('relearn-modes')?.value||'both';return v==='both'?['meaning','spell']:[v]}
function relearnKind(){return document.getElementById('relearn-kind')?.value||'refresh'}
function relearnBatch(which){const now=Date.now(),week=now-7*86400000,words=all().filter(w=>hasSeen(w[1]));let picked=words;
 if(which==='level')picked=words.filter(w=>Number(w[0])===state.level);
 if(which==='today')picked=words.filter(w=>(state.daily[today()]?.learned||[]).includes(w[1])||(state.smartAnswerHistory||[]).some(h=>h.ko===w[1]&&new Date(h.at).toLocaleDateString('sv-SE')===today()));
 if(which==='week')picked=words.filter(w=>(state.lifecycle[w[1]]?.seenAt||0)>=week||(state.smartAnswerHistory||[]).some(h=>h.ko===w[1]&&h.at>=week)||Object.entries(state.daily||{}).some(([day,d])=>day>=new Date(week).toLocaleDateString('sv-SE')&&(d.learned||[]).includes(w[1])));
 queueRelearn(picked,relearnKind(),relearnModes());
}
function wordList(){let rows=scope().filter(w=>(w[1]+w[2]).toLowerCase().includes(listQuery.toLowerCase()));if(listFilter==='favorites')rows=rows.filter(w=>state.favorites.includes(w[1]));if(listFilter==='wrong')rows=rows.filter(w=>weak(w[1])>0);return '<div class="eyebrow">TOPIK '+state.level+'</div><h1>词汇列表</h1><p class="muted">查看、搜索或收藏单词。已收录 '+scope().length+' 个当前等级词汇。</p>'+levelBar()+collectionChooser()+relearnPanel()+'<div class="controls"><input class="search" id="word-search" placeholder="搜索韩语或中文" aria-label="搜索词汇" style="flex:1;min-width:180px" value="'+quote(listQuery)+'"><select id="word-filter" class="select" aria-label="筛选词汇"><option value="all" '+(listFilter==='all'?'selected':'')+'>全部词汇</option><option value="favorites" '+(listFilter==='favorites'?'selected':'')+'>我的收藏</option><option value="wrong" '+(listFilter==='wrong'?'selected':'')+'>答错过的词</option></select></div><div id="word-results">'+rowsHTML(rows)+'</div>'}
function rowsHTML(rows){if(!rows.length)return '<div class="empty">没有找到符合条件的词汇。</div>';return rows.map(w=>{let fav=state.favorites.includes(w[1]);let d=ex(w);return '<div class="list-row"><div class="relearn-word"><label class="relearn-check"><input type="checkbox" data-relearn-word="'+quote(w[1])+'" '+(relearnSelection.has(w[1])?'checked':'')+' '+(!hasSeen(w[1])?'disabled title="尚未首次认识"':'')+' aria-label="选择重新学习 '+quote(w[1])+'"></label><div><strong lang="ko">'+quote(w[1])+'</strong><span class="quiet">　'+quote(w[2])+'</span>'+'<div class="quiet small">'+quote(romanizeHangul(w[1]))+' · 罗马字拼读参考</div>'+'<div class="quiet small">词条 '+quote(TOPIK_LEXICON.metadata(w[1],w[2]).id)+' · 释义待人工核验</div>'+(TOPIK_LEXICON.forms[w[1]]?'<div class="quiet small">常见变形：'+quote(TOPIK_LEXICON.forms[w[1]].map(x=>x.form).join('、'))+'</div>':'')+(d[2]?'<div class="quiet small">实际读音 '+quote(d[2])+'</div>':'')+(d[0]?'<div class="phrase" lang="ko">'+quote(d[0])+'</div><div class="phrase">'+quote(d[1])+'</div>':'')+'</div></div><div class="list-actions"><button class="mini-btn" data-speak="'+quote(w[1])+'" aria-label="朗读 '+quote(w[1])+'">🔊</button><button class="mini-btn '+(fav?'on':'')+'" data-favorite="'+quote(w[1])+'" aria-pressed="'+fav+'" aria-label="收藏 '+quote(w[1])+'">'+(fav?'★':'☆')+'</button></div></div>'}).join('')}
function settings(){return '<div class="eyebrow">个性化</div><h1>设置</h1><p class="tiny muted">Version v'+window.TOPIK_APP_VERSION+' · Build '+(window.TOPIK_BUILD||'加载中')</p><section class="settings-group"><h3>学习安排</h3><div class="setting-row"><div><b>每日新词目标</b><p>目标不是固定批次；设为 0 可只复习旧词</p></div><input class="field" id="daily-goal" type="number" min="0" max="200" step="1" style="width:90px" value="'+state.dailyGoal+'"></div></section><section class="settings-group"><h3>输入方式</h3><div class="setting-row"><div><b>双语网页键盘（默认）</b><p>根据当前题目自动切换韩语两套式键盘与中文拼音候选键盘，不调用系统键盘。</p></div><select class="select" id="input-method"><option value="bilingual" '+(state.inputMethod==='bilingual'?'selected':'')+'>双语网页键盘</option><option value="system" '+(state.inputMethod==='system'?'selected':'')+'>高级：系统键盘兼容模式</option></select></div><div class="setting-row"><div><b>学习调试信息（临时）</b><p>仅启用时在智能学习页显示双向到期数量，并在开发者控制台输出每题选择原因。不会更改学习记录。</p></div><label><input type="checkbox" id="study-debug" '+(state.studyDebug?'checked':'')+'> 开启</label></div></section><section class="settings-group"><h3>音效</h3><div class="setting-row"><div><b>界面音效</b><p>键盘、按钮和答题反馈；不影响韩语发音。</p></div><select class="select" id="sound-mode"><option value="off" '+((state.soundMode||'light')==='off'?'selected':'')+'>关闭</option><option value="light" '+((state.soundMode||'light')==='light'?'selected':'')+'>轻（默认）</option><option value="standard" '+((state.soundMode||'light')==='standard'?'selected':'')+'>标准</option></select></div></section><section class="settings-group"><h3>显示偏好</h3><div class="setting-row"><div><b>外观</b><p>与系统同步或手动选择模式</p></div><select class="select" id="theme-choice"><option value="system" '+(state.theme==='system'?'selected':'')+'>跟随系统</option><option value="light" '+(state.theme==='light'?'selected':'')+'>浅色</option><option value="dark" '+(state.theme==='dark'?'selected':'')+'>深色</option></select></div></section><section class="settings-group"><h3>关于词库</h3><div class="setting-row"><div><b>词条与分组</b><p>当前收录 '+all().length.toLocaleString('zh-CN')+' 个去重韩语词形；TOPIK 1～6 为教学难度分组，并非官方 TOPIK 分级词表。</p></div></div><div class="setting-row"><div><b>数据来源与质量</b><p>词库包含未经逐条人工审校的开源内容。请参考来源说明了解扩充方式与质量限制。</p></div></div><div class="setting-row"><div><b>来源、许可与质量说明</b><p><a href="./DATA-LICENSE.md" target="_blank" rel="noopener noreferrer">查看数据来源及开源许可</a> · <a href="./VOCAB-SOURCES.md" target="_blank" rel="noopener noreferrer">扩充来源与质量说明</a></p></div></div></section><section class="settings-group"><h3>学习数据</h3><p class="small muted">学习记录保存在当前浏览器，尚不支持跨设备云端同步。建议定期导出 JSON 备份。</p></section><section class="settings-group"><h3>词库导入与备份</h3><div class="setting-row"><div><b>导入 CSV 词汇</b><p>支持 level,ko,zh,example,translation,reading 六列；可含逗号的字段需加引号</p></div><label class="line-btn" style="cursor:pointer">选择文件<input id="csv-upload" type="file" accept=".csv,text/csv" class="hidden"></label></div><div class="setting-row"><div><b>导出词库</b><p>下载包含自定义词汇的完整列表</p></div><button class="line-btn" id="export-csv">导出 CSV</button></div><div class="setting-row"><div><b>学习进度备份</b><p>JSON 包含学习记录、收藏、自定义词汇及偏好</p></div><button class="line-btn" id="export-data">导出备份</button></div><div class="setting-row"><div><b>恢复学习记录</b><p>从备份恢复会覆盖当前浏览器的学习进度</p></div><label class="line-btn" style="cursor:pointer">导入备份<input id="backup-upload" type="file" accept=".json,application/json" class="hidden"></label></div></section><section class="settings-group reset-panel"><h3>学习数据管理</h3><p class="muted small">清空后单词重新变为未学习状态。建议先导出 JSON 备份；不会删除词库、发音、例句或外观设置。</p><button class="line-btn" id="reset-backup">先导出学习记录</button><div class="reset-actions"><button class="secondary" data-reset-scope="level">清空当前 TOPIK '+state.level+' 等级</button><button class="secondary reset-danger" data-reset-scope="all">清空全部学习记录</button></div></section><div class="notice">每日新词数量是可调整的目标，不是强制学习轮次；完成新词目标后仍可继续复习。词库按教学难度分组，并非 TOPIK 官方完整分级词表。请定期导出备份；本版本尚不支持跨设备云端同步。</div>'}
function resetLearning(scope){
 const level=scope==='all'?'all':state.level;
 const label=level==='all'?'全部 TOPIK 等级':'TOPIK '+level;
 if(!window.confirm('确定清空'+label+'的学习记录吗？单词会恢复为未学习状态。请先导出备份。'))return;
 if(level==='all'){
  if(window.prompt('最后确认：请输入「清空全部」才能删除所有学习记录')!=='清空全部'){notify('已取消清空');return}
 }else if(!window.confirm('再次确认：只清空 TOPIK '+level+' 的独立记录；与其他等级共用的单词将保留。确定继续吗？'))return;
 session=null;onboarding=null;smartTask=null;didCheck=false;typed='';smartResult=null;
 const outcome=TOPIK_RESET.reset(state,all(),level);
 relearnSelection.clear();persist();change('home');notify('已清空 '+outcome.removed+' 个词的学习状态'+(outcome.shared?'，保留 '+outcome.shared+' 个跨等级共用词':'') );
}
function render(){
 theme();renderNav();document.body.classList.toggle('study-focus-mode',['smart','onboard','session'].includes(view));
 const topLevel=document.getElementById('top-level-select');if(topLevel)topLevel.value=String(state.level);
 const app=document.getElementById('app');
 const previous=app.querySelector('#spell-input');
 const taskKey=view==='smart'&&smartTask?.type==='typing'?smartTask.word[1]+'|'+smartTask.mode:'';
 const keep=previous&&previous.dataset.taskKey===taskKey&&document.activeElement===previous;
 app.innerHTML=view==='home'?home():view==='words'?wordList():view==='settings'?settings():view==='records'?recordsHome():view==='practice'?practiceHome():view==='smart'?smartScreen():view==='onboard'?onboardScreen():sessionScreen();
 const current=app.querySelector('#spell-input');
 if(keep&&current&&taskKey){
  previous.readOnly=didCheck||pendingRating;
  previous.value=typed;
  current.replaceWith(previous);
 }else if(current&&taskKey)current.dataset.taskKey=taskKey;
 bind();if(useChineseKeyboard())updatePinyinDisplay();
}
function bind(){const topLevel=document.getElementById('top-level-select');if(topLevel)topLevel.onchange=e=>{state.level=Number(e.target.value);persist();session=null;render()};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>change(b.dataset.view));document.querySelectorAll('[data-next-reveal]').forEach(b=>b.onclick=advanceReveal);document.querySelectorAll('[data-begin-typing]').forEach(b=>b.onclick=nextOnboardQuestion);document.querySelectorAll('[data-next-question]').forEach(b=>b.onclick=nextOnboardQuestion);document.querySelectorAll('[data-check-onboard]').forEach(b=>b.onclick=submitOnboardAnswer);document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.level=Number(b.dataset.level);persist();session=null;render()});document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start));document.querySelectorAll('[data-smart-start]').forEach(b=>b.onclick=()=>startSmart(b.dataset.smartStart));let collectionChoice=document.getElementById('collection-choice');if(collectionChoice)collectionChoice.onchange=e=>{state.collection=e.target.value;listQuery='';persist();render()};document.querySelectorAll('[data-reset-scope]').forEach(b=>b.onclick=()=>resetLearning(b.dataset.resetScope));document.querySelectorAll('[data-smart-next]').forEach(b=>b.onclick=smartNext);document.querySelectorAll('[data-smart-submit]').forEach(b=>b.onclick=b.closest('.ios-keyboard')?keyboardReturn:smartSubmit);
 document.querySelectorAll('[data-hangul]').forEach(b=>{const action=()=>applyHangulKey(hangulShift&&b.dataset.shift?b.dataset.shift:b.dataset.hangul);if(b.dataset.hangul==='Backspace')bindDeleteRepeat(b,action);else b.onclick=action});
 document.querySelectorAll('[data-hangul-shift]').forEach(b=>b.onclick=()=>{hangulShift=!hangulShift;TOPIK_HANGUL.updateShift(document.querySelector('.hangul-keyboard'),hangulShift)});
 document.querySelectorAll('[data-hangul-mode]').forEach(b=>b.onclick=()=>{hangulMode=b.dataset.hangulMode;TOPIK_HANGUL.setMode(document.querySelector('.hangul-keyboard'),hangulMode)});
 document.querySelectorAll('[data-hangul-more]').forEach(b=>b.onclick=()=>{hangulMode=b.dataset.hangulMore;TOPIK_HANGUL.setMode(document.querySelector('.hangul-keyboard'),hangulMode)});
 document.querySelectorAll('[data-hangul-symbol]').forEach(b=>b.onclick=()=>{if(!useHangulKeyboard()||didCheck||pendingRating)return;const input=document.getElementById('spell-input');if(!input)return;const value=decodeURIComponent(b.dataset.hangulSymbol);const caret=input.selectionStart??input.value.length;input.value=input.value.slice(0,caret)+value+input.value.slice(input.selectionEnd??caret);typed=input.value;input.setSelectionRange(caret+value.length,caret+value.length)});
 document.querySelectorAll('[data-pinyin-key]').forEach(b=>{const action=()=>applyPinyinKey(b.dataset.pinyinKey);if(b.dataset.pinyinKey==='backspace')bindDeleteRepeat(b,action);else b.onclick=action});
 document.querySelectorAll('[data-pinyin-symbol]').forEach(b=>b.onclick=()=>applyPinyinSymbol(decodeURIComponent(b.dataset.pinyinSymbol)));
 document.querySelectorAll('[data-pinyin-mode]').forEach(b=>b.onclick=()=>{pinyinMode=b.dataset.pinyinMode;TOPIK_PINYIN.setMode(document.querySelector('.pinyin-keyboard'),pinyinMode)});
 const expandCandidates=document.querySelector('[data-pinyin-expand]');if(expandCandidates)expandCandidates.onclick=()=>{pinyinExpanded=!pinyinExpanded;updatePinyinDisplay()};
 document.querySelectorAll('[data-pinyin-shift]').forEach(b=>b.onclick=()=>{pinyinShift=!pinyinShift;TOPIK_PINYIN.updateShift(document.querySelector('.pinyin-keyboard'),pinyinShift)});
 const inputMethodChoice=document.getElementById('input-method');if(inputMethodChoice)inputMethodChoice.onchange=e=>{state.inputMethod=e.target.value;persist();render()};
 const soundChoice=document.getElementById('sound-mode');if(soundChoice)soundChoice.onchange=e=>{state.soundMode=e.target.value;window.TOPIK_SOUND?.setMode(state.soundMode);persist()};
 const debugChoice=document.getElementById('study-debug');if(debugChoice)debugChoice.onchange=e=>{state.studyDebug=!!e.target.checked;persist();render()};document.querySelectorAll('[data-smart-rate]').forEach(b=>b.onclick=()=>smartRate(b.dataset.smartRate));document.querySelectorAll('[data-smart-unknown]').forEach(b=>b.onclick=smartDontKnow);document.querySelectorAll('[data-unfamiliar]').forEach(b=>b.onclick=markUnfamiliar);document.querySelectorAll('[data-relearn-batch]').forEach(b=>b.onclick=()=>relearnBatch(b.dataset.relearnBatch));document.querySelectorAll('[data-relearn-selected]').forEach(b=>b.onclick=()=>queueRelearn(all().filter(w=>relearnSelection.has(w[1])),relearnKind(),relearnModes()));document.querySelectorAll('[data-smart-example]').forEach(b=>b.onclick=()=>{let el=document.getElementById('smart-example');if(el)el.hidden=!el.hidden});enhanceSpeakButtons();document.querySelectorAll('[data-flip]').forEach(b=>b.onclick=()=>{session.flipped=true;render()});document.querySelectorAll('[data-next-learn]').forEach(b=>b.onclick=()=>next(true));document.querySelectorAll('[data-practice-word]').forEach(b=>b.onclick=()=>startSpecific(b.dataset.practiceWord));document.querySelectorAll('[data-resume-practice]').forEach(b=>b.onclick=resumePractice);document.querySelectorAll('[data-mark-fuzzy]').forEach(b=>b.onclick=()=>next('fuzzy'));document.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>next(b.dataset.grade==='fuzzy'?'fuzzy':b.dataset.grade==='1'));document.querySelectorAll('[data-grade-spell]').forEach(b=>b.onclick=()=>next(true,true));document.querySelectorAll('[data-check]').forEach(b=>b.onclick=checkSpell);let i=document.getElementById('spell-input');if(i){i.oninput=e=>typed=e.target.value;i.onkeydown=e=>{if(e.isComposing||e.keyCode===229||i.dataset.composing==='1')return;if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(view==='smart'){if(didCheck)smartNext();else if(!pendingRating)smartSubmit()}else if(view==='onboard'){if(didCheck)nextOnboardQuestion();else submitOnboardAnswer()}else if(didCheck)next(true,true);else checkSpell()}};i.addEventListener('compositionstart',()=>i.dataset.composing='1');i.addEventListener('compositionend',()=>{i.dataset.composing='0';typed=i.value});if(!useVirtualKeyboard()&&!/iPad|iPhone|iPod/.test(navigator.userAgent))i.focus({preventScroll:true})}let search=document.getElementById('word-search');if(search)search.oninput=e=>{listQuery=e.target.value;let rows=scope().filter(w=>(w[1]+w[2]).toLowerCase().includes(listQuery.toLowerCase())).filter(w=>listFilter==='all'||(listFilter==='favorites'?state.favorites.includes(w[1]):weak(w[1])>0));document.getElementById('word-results').innerHTML=rowsHTML(rows);bindRows()};let filt=document.getElementById('word-filter');if(filt)filt.onchange=e=>{listFilter=e.target.value;render()};bindRows();let goal=document.getElementById('daily-goal');if(goal)goal.onchange=e=>{state.dailyGoal=Math.max(0,Math.min(200,Number(e.target.value)||0));persist();notify('每日新词目标已保存')};let ch=document.getElementById('theme-choice');if(ch)ch.onchange=e=>{state.theme=window.TOPIK_THEME.setMode(e.target.value)};let up=document.getElementById('csv-upload');if(up)up.onchange=importCSV;let resetBackup=document.getElementById('reset-backup');if(resetBackup)resetBackup.onclick=()=>document.getElementById('export-data')?.click();let bu=document.getElementById('backup-upload');if(bu)bu.onchange=importBackup;let ec=document.getElementById('export-csv');if(ec)ec.onclick=exportCSV;let ed=document.getElementById('export-data');if(ed)ed.onclick=()=>download('topik-lab-backup.json',JSON.stringify({version:2,state},null,2),'application/json')}
function bindRows(){document.querySelectorAll('[data-relearn-word]').forEach(b=>b.onchange=()=>{if(b.checked)relearnSelection.add(b.dataset.relearnWord);else relearnSelection.delete(b.dataset.relearnWord);const c=document.querySelector('[data-relearn-selected]');if(c)c.textContent='重新学习已选 '+relearnSelection.size+' 词'});document.querySelectorAll('[data-favorite]').forEach(b=>b.onclick=()=>{let ko=b.dataset.favorite;state.favorites=state.favorites.includes(ko)?state.favorites.filter(x=>x!==ko):[...state.favorites,ko];persist();render()});/* all word-list voice controls are wired by enhanceSpeakButtons */}
function download(name,data,type){let blob=new Blob(['\ufeff'+data],{type:type||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function csvCell(s){s=String(s??'');return /[",\n\r]/.test(s)?'"'+s.replaceAll('"','""')+'"':s}
function exportCSV(){let data=[['level','ko','zh','example','translation','reading'],...all().map(w=>[w[0],w[1],w[2],...ex(w)])];download('topik-lab-vocabulary.csv',data.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8')}
function parseCSV(text){let rows=[],r=[],s='',q=false;for(let i=0;i<text.length;i++){let c=text[i];if(c==='"'){if(q&&text[i+1]==='"'){s+='"';i++}else q=!q}else if(c===','&&!q){r.push(s);s=''}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&text[i+1]==='\n')i++;r.push(s);if(r.some(x=>x.trim()))rows.push(r);r=[];s=''}else s+=c}if(q)throw Error('CSV 引号不匹配');r.push(s);if(r.some(x=>x.trim()))rows.push(r);return rows}
async function importCSV(e){let f=e.target.files[0];if(!f)return;try{let rows=parseCSV((await f.text()).replace(/^\ufeff/,''));let headers=rows.shift().map(x=>x.toLowerCase().trim());let get=k=>headers.indexOf(k);if(['level','ko','zh'].some(k=>get(k)<0))throw Error('CSV 缺少 level,ko,zh 列');let known=new Set(all().map(w=>w[1]));let count=0;for(let r of rows){let level=Number(r[get('level')]),ko=(r[get('ko')]||'').trim(),zh=(r[get('zh')]||'').trim();if(level<1||level>6||!Number.isInteger(level)||!ko||!zh||known.has(ko))continue;state.extra.push([level,ko,zh,...['example','translation','reading'].map(k=>get(k)>=0?(r[get(k)]||''):'')]);known.add(ko);count++}persist();render();notify('已导入 '+count+' 个新词')}catch(err){notify('CSV 导入失败：'+err.message)}}
async function importBackup(e){let f=e.target.files[0];if(!f)return;try{let data=JSON.parse((await f.text()).replace(/^\ufeff/,''));TOPIK_RESET.validateBackup(data);if(!confirm('恢复会覆盖当前进度，确定继续吗？'))return;for(let k of ['progress','favorites','daily','theme','level','extra','lifecycle','dailyGoal','smartHistory','smartAnswerHistory','relearn','legacyMigrated','collection'])if(data.state[k]!==undefined)state[k]=data.state[k];state.legacyMigrated=true;persist();change('home');notify('备份已恢复')}catch(err){notify('恢复失败：'+err.message)}}
document.getElementById('theme-toggle').addEventListener('click',()=>{
 const current=window.TOPIK_THEME.getMode();
 state.theme=window.TOPIK_THEME.setMode(current==='system'?'light':current==='light'?'dark':'system');
 notify('已切换：'+(state.theme==='system'?'跟随系统':state.theme==='light'?'浅色':'深色'));
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&view!=='home'){change('home');return}if(view==='smart'){if(e.key==='Enter'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();if(smartTask?.type==='show'||didCheck)smartNext()}return}if(view==='onboard'){if(e.key==='Enter'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();if(onboarding.phase==='show')advanceReveal();else if(onboarding.phase==='intro'||onboarding.phase==='typing'&&didCheck)nextOnboardQuestion()}return}if(!session||!session.deck[session.index]||!['learn','context','review','wrong','spell','meaning'].includes(view))return;let typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(view==='learn'||view==='context'){if(e.key==='Enter'){e.preventDefault();next(true)}return}if(view==='spell'||view==='meaning'||view==='review'||view==='wrong'){if(e.key==='Enter'&&didCheck){e.preventDefault();next(true,true)}return}if(typing)return;if(e.key===' '){e.preventDefault();if(!session.flipped){session.flipped=true;render()}}if(e.key==='Enter'&&!session.flipped){e.preventDefault();session.flipped=true;render()}});
// Keep the fixed keyboard aligned to Safari's visible viewport, including toolbar changes.
function updateStudyKeyboardDock(){
 const dock=document.querySelector('.smart-bottom.has-keyboard');
 if(!dock){document.documentElement.style.removeProperty('--study-dock-height');return}
 const vv=window.visualViewport;
 const bottom=vv?Math.max(0,window.innerHeight-vv.offsetTop-vv.height):0;
 document.documentElement.style.setProperty('--study-visual-bottom',bottom+'px');
 document.documentElement.style.setProperty('--study-dock-height',Math.ceil(dock.getBoundingClientRect().height+16)+'px');
}
if(window.visualViewport){
 window.visualViewport.addEventListener('resize',updateStudyKeyboardDock);
 window.visualViewport.addEventListener('scroll',updateStudyKeyboardDock);
}
window.addEventListener('resize',updateStudyKeyboardDock);

/* Additive sound events: never intercept or change keyboard / button behavior. */
try{window.TOPIK_SOUND?.setMode(state.soundMode||'light')}catch(_){}
function uiSoundFor(target){
 const el=target?.closest?.('button');if(!el)return null;
 if(el.matches('[data-pinyin-choice]'))return 'candidate';
 if(el.matches('[data-hangul],[data-pinyin-key],[data-hangul-symbol],[data-pinyin-symbol]')){
  const key=el.dataset.hangul||el.dataset.pinyinKey||'';
  return /^(Backspace|backspace|space| |enter|return)$/i.test(key)?'function':'key';
 }
 if(el.matches('[data-hangul-shift],[data-hangul-mode],[data-hangul-more],[data-pinyin-shift],[data-pinyin-mode],[data-pinyin-expand],[data-ime-next],[data-ime-prev]'))return 'function';
 if(el.matches('[data-smart-unknown]'))return 'neutral';
 if(el.matches('[data-speak]'))return null;
 return 'ui';
}
document.addEventListener('click',e=>{
 try{
  const el=e.target.closest?.('button');if(!el)return;
  if(el.matches('[data-hangul="Backspace"],[data-pinyin-key="backspace"]'))return;
  const type=uiSoundFor(e.target);if(type)window.TOPIK_SOUND?.play(type);
 }catch(_){}
},true);
document.addEventListener('pointerdown',e=>{
 try{if(e.target.closest?.('[data-hangul="Backspace"],[data-pinyin-key="backspace"]'))window.TOPIK_SOUND?.play('function')}catch(_){}
},true);

new MutationObserver(updateStudyKeyboardDock).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});

render();
