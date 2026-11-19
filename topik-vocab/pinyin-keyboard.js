/* Original compact pinyin IME for TOPIK Chinese glosses; no third-party library. */
(function(root){
'use strict';
const raw={
zuo:'做 坐 作 左 昨 桌',ni:'你 尼 泥',hao:'好 号 浩',xue:'学 雪 穴',sheng:'生 声 省 升',chi:'吃 迟 池 尺',fan:'饭 反 范 烦',gong:'工 公 功 宫',xi:'习 喜 西 希 洗',xiao:'校 小 笑 晓',peng:'朋 蓬',you:'友 有 又 右 游',lao:'老 劳',shi:'师 是 时 事 市 十 试 使',zai:'在 再 载',you:'有 友 又 右 游',he:'喝 和 河 合',zhi:'知 只 之 纸',dao:'道 到 倒',wo:'我 握',men:'们 门',ta:'他 她 它',de:'的 得 地',bu:'不 步 部',mei:'没 美 每',qu:'去 取 区',lai:'来 赖',da:'大 达 打',duo:'多 朵',shao:'少 烧',ren:'人 认 任',jia:'家 加 价',jin:'今 进 近',tian:'天 田 添',ming:'明 名 命',wan:'晚 万 完',shang:'上 商 伤',xia:'下 夏',zhong:'中 种 重',guo:'国 过 果',han:'韩 汉 寒',yu:'语 雨 鱼',shu:'书 树 数',shui:'水 谁',ai:'爱 哎',kan:'看 刊',ting:'听 厅',shuo:'说 硕',hua:'话 花 化',xin:'新 心 信',wen:'文 问 闻',zi:'字 自 子',jian:'见 件 建 间',ke:'课 可 科 客',yi:'一 以 意 已 医',er:'二 儿 耳',san:'三 散',si:'四 思 死',wu:'五 无 物',liu:'六 流',qi:'七 起 气',ba:'八 把 吧',jiu:'九 久 酒',ling:'零 领',neng:'能',hui:'会 回',xiang:'想 向 相',yao:'要 药',xu:'需 许',ya:'呀 牙',qian:'前 钱 千',hou:'后 候',zu:'组 族',jie:'解 节 街',wen:'问 文',ti:'题 提',mu:'目 木',li:'理 里 力 利',lun:'论 轮',shang:'上 商',ban:'班 半 办',si:'司 四',chang:'常 长 场 厂',gu:'古 故',jie:'界 节 解',mei:'美 每 没',liang:'两 量',ge:'个 各 歌',dian:'点 店 电',na:'那 拿 哪',zhe:'这 者 着',huan:'欢 还 换',ying:'迎 应 影',ga:'尬',gao:'高 告',xing:'行 星 性',fu:'服 福 父',tong:'同 通 童',an:'安 按',quan:'全 权',qiang:'强 墙',ru:'如 入',guo:'国 过',yue:'月 越',nian:'年 念',zhen:'真 镇',zheng:'正 整 政',hao:'好 号',xiang:'相 想 向',ma:'吗 妈 马',ji:'几 机 记 级',bei:'北 被 杯',nan:'南 难 男',dong:'东 动 冬',xi:'西 习 喜',chun:'春',qiu:'秋',xia:'夏 下',dong:'冬 东',yin:'音 因 银',le:'了 乐',kuai:'快 块',man:'慢 满',xin:'心 新 信',qing:'情 请 清',gan:'感 干 敢',jue:'觉 决',wei:'为 位 未',shen:'什 深 身 神',me:'么',yang:'样 阳 养',jian:'见 件 建',kang:'康',bing:'病 冰',yuan:'院 原 元 员',lv:'旅 绿',xing:'行 星 兴',zou:'走',pao:'跑',tiao:'跳',wu:'舞 物 无',dong:'动 东',che:'车',lu:'路 录',fei:'飞 费',ji:'机 几 记',piao:'票 飘',mai:'买 卖',mai:'买 卖',qian:'钱 前',gui:'贵 鬼',pian:'便 片',yi:'宜 一 意',bian:'便 变 边',shi:'是 时 师 事',jie:'节 界 解',ri:'日',zhou:'周 州',yue:'月 越',nian:'年 念',zao:'早 造',chen:'晨 陈',ye:'夜 也 业',qi:'起 气 七',chuang:'床 窗',deng:'等 灯',zuo:'做 坐 作 左 昨',mei:'没 美 每',you:'有 友 又 右 游'
};
const phrases={
zhongjian:'中间',fangjian:'房间',
xuesheng:'学生',xuexiao:'学校',laoshi:'老师',xuexi:'学习',gongzuo:'工作',pengyou:'朋友',gongsi:'公司',zhidao:'知道',xihuan:'喜欢',chifan:'吃饭',meiyou:'没有',youzai:'有在',zaijian:'再见',nihao:'你好',zaoshang:'早上',wanshang:'晚上',jintian:'今天',mingtian:'明天',zuotian:'昨天',shijian:'时间',mingzi:'名字',hanguo:'韩国',hanyu:'韩语',zhongwen:'中文',zhongguo:'中国',jiaren:'家人',kaoshi:'考试',daxue:'大学',lvxing:'旅行',yueding:'约定',yundong:'运动',jiankang:'健康',yiyuan:'医院',jiaotong:'交通',wenhua:'文化',jijie:'季节',xuyao:'需要',zhunbei:'准备',lijie:'理解',jieshi:'解释',xuanze:'选择',xiangsi:'相似',butong:'不同',zhongyao:'重要',fangbian:'方便',jingli:'经历',shehui:'社会',wenti:'问题',yuanyin:'原因',jieguo:'结果',yingxiang:'影响',huanjing:'环境',jingji:'经济',jiaoyu:'教育',jiuye:'就业',renkou:'人口',zengjia:'增加',jianshao:'减少',fasheng:'发生',jiejue:'解决',canyu:'参与',fazhan:'发展',jishu:'技术',zhengce:'政策',zhidu:'制度',ziliao:'资料',fenxi:'分析',diaocha:'调查',bijiao:'比较',yuce:'预测',weichi:'维持',tigong:'提供',gaishan:'改善',yufang:'预防',xianxiang:'现象',yishi:'意识',shenghuo:'生活',shouji:'手机',diannao:'电脑',dianhua:'电话',dianying:'电影',yinyue:'音乐',shuiguo:'水果',mifan:'米饭',chaofan:'炒饭',kafei:'咖啡',niunai:'牛奶',shangdian:'商店',shangban:'上班',xiaban:'下班',xingqi:'星期',shijie:'世界',yuyan:'语言',chengshi:'城市',difang:'地方',gaoxing:'高兴',kuaile:'快乐',nanren:'男人',nvren:'女人',haizi:'孩子',fumu:'父母',baba:'爸爸',mama:'妈妈',gege:'哥哥',jiejie:'姐姐',didi:'弟弟',meimei:'妹妹',tongxue:'同学',tongshi:'同事',shengri:'生日',liwu:'礼物',huanying:'欢迎',zaoshanghao:'早上好',wanan:'晚安',xiexie:'谢谢',duibuqi:'对不起',meiguanxi:'没关系',qingwen:'请问',qingzuo:'请坐'
};
// Keep one canonical base entry for jian; repeated object keys silently overwrite earlier entries.
const commonJian='见 件 建 间 简 检 剑 健 兼 渐 坚 监 减 尖 肩 舰 箭 鉴 键 贱 艰 捡 剪 碱 奸 煎 茧 溅 谏 缄';
const dictionary={};for(const [py,chars] of Object.entries(raw))dictionary[py]=(py==='jian'?commonJian:chars).split(' ');
Object.assign(dictionary,{
 fang:['方','房','放','防','访','芳','仿','坊','妨','纺'],
 zhong:['中','种','重','众','终','钟','忠','肿'],
 jian:commonJian.split(' ')
});
for(const [py,word] of Object.entries(phrases)){(dictionary[py]||(dictionary[py]=[])).unshift(word)}
const supplementalPhrases={shijian:['时间','事件','实践','世间'],zhongjian:['中间','中建'],fangjian:['房间'],xuesheng:['学生'],xuexi:['学习'],gongzuo:['工作'],pengyou:['朋友']};
for(const [py,words] of Object.entries(supplementalPhrases)){dictionary[py]=[...new Set([...(dictionary[py]||[]),...words])]}
const selectionHistory=Object.create(null);
function rememberChoice(py,word){const key=String(py||'').toLowerCase().replace(/[^a-z]/g,'');if(!key||!word)return;const map=selectionHistory[key]||(selectionHistory[key]=Object.create(null));map[word]=Math.min(100,(map[word]||0)+1)}
function candidates(py,glosses=[]){
 py=String(py||'').toLowerCase().replace(/[^a-z]/g,'');if(!py)return [];
 const base=dictionary[py]||[];
 // Rank candidates found in the site's Chinese glosses, without changing the scheduler.
 const freq=new Map();
 for(const gloss of glosses){for(const item of base){if(String(gloss).includes(item))freq.set(item,(freq.get(item)||0)+1)}}
 const unique=[...new Set(base)];const history=selectionHistory[py]||{};
 return unique.map((word,index)=>({word,index,score:(freq.get(word)||0)*3+(history[word]||0)*2+(word.length>1?1:0)}))
  .sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.word);
}
function update(answer,composition,key){
 if(key==='clear')return {answer:'',composition:''};
 if(key==='backspace')return composition?{answer,composition:composition.slice(0,-1)}:{answer:answer.slice(0,-1),composition};
 if(key==='space')return {answer:answer+' ',composition};
 if(key==='symbol'||key==='punctuation')return {answer:answer+key,composition};
 if(key&&key.startsWith('insert:'))return {answer:answer+key.slice(7),composition};
 if(/^[a-z]$/i.test(key))return {answer,composition:composition+key.toLowerCase()};
 return {answer,composition};
}
function select(answer,composition,candidate){rememberChoice(composition,candidate);return {answer:answer+candidate,composition:''}}
const symbolPages={
 numbers:[['1','2','3','4','5','6','7','8','9','0'],['-','/','：','；','（','）','¥','&','@','“'],['。','，','、','？','！','‘','’','”','《','》']],
 extra:[['[',']','{','}','#','%','^','*','+','='],['_','\\\\','|','~','<','>','€','£','$','…'],['—','【','】','：','；','。','，','？','！','、']]
};
function render(){
 const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
 const key=k=>'<button type="button" class="pinyin-key" data-pinyin-key="'+k+'">'+k+'</button>';
 return '<div class="pinyin-keyboard ios-keyboard" role="group" aria-label="中文拼音网页键盘">'+
 '<div class="ios-candidate-strip"><div class="pinyin-composition" id="pinyin-composition" aria-live="polite"></div><div class="pinyin-candidates" id="pinyin-candidates" aria-label="汉字候选"></div><button type="button" class="pinyin-expand" data-pinyin-expand="1" aria-label="展开全部候选" aria-expanded="false" hidden>⌄</button></div>'+
 '<div class="pinyin-letters" data-pinyin-panel="letters">'+
 '<div class="pinyin-row ios-row-first">'+[...rows[0]].map(key).join('')+'</div>'+
 '<div class="pinyin-row ios-row-second">'+[...rows[1]].map(key).join('')+'</div>'+
 '<div class="pinyin-row ios-row-third"><button type="button" class="pinyin-key pinyin-action ios-special ios-shift" data-pinyin-shift="1" aria-label="Shift" aria-pressed="false"><span aria-hidden="true">⇧</span></button>'+[...rows[2]].map(key).join('')+'<button type="button" class="pinyin-key pinyin-action ios-special ios-delete" data-pinyin-key="backspace" aria-label="删除">⌫</button></div></div>'+
 '<div class="pinyin-symbols" data-pinyin-panel="numbers" hidden>'+symbolPages.numbers.map((row,i)=>'<div class="pinyin-row ios-row-'+(i===0?'first':i===1?'second':'third')+'">'+row.map(ch=>'<button type="button" class="pinyin-key pinyin-symbol" data-pinyin-symbol="'+encodeURIComponent(ch)+'">'+ch+'</button>').join('')+'</div>').join('')+'</div>'+
 '<div class="pinyin-symbols" data-pinyin-panel="extra" hidden>'+symbolPages.extra.map((row,i)=>'<div class="pinyin-row ios-row-'+(i===0?'first':i===1?'second':'third')+'">'+row.map(ch=>'<button type="button" class="pinyin-key pinyin-symbol" data-pinyin-symbol="'+encodeURIComponent(ch)+'">'+ch.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</button>').join('')+'</div>').join('')+'</div>'+
 '<div class="pinyin-row ios-row-bottom"><button type="button" class="pinyin-key pinyin-action ios-special ios-mode" data-pinyin-mode="numbers">123</button><button type="button" class="pinyin-key pinyin-action ios-special ios-more" data-pinyin-mode="extra" hidden>#+=</button><button type="button" class="pinyin-key pinyin-space ios-space" data-pinyin-key="space" aria-label="空格">中文</button><button type="button" class="pinyin-key pinyin-action ios-return" data-smart-submit="1" aria-label="完成或提交答案">↵</button></div></div>';
}
function setMode(container,mode){
 if(!container)return;
 for(const panel of container.querySelectorAll('[data-pinyin-panel]'))panel.hidden=panel.dataset.pinyinPanel!==mode;
 const numbers=container.querySelector('.ios-mode'),extra=container.querySelector('.ios-more');
 if(numbers){numbers.textContent=mode==='letters'?'123':'ABC';numbers.dataset.pinyinMode=mode==='letters'?'numbers':'letters'}
 if(extra)extra.hidden=mode!=='numbers'&&mode!=='extra';
 if(extra)extra.textContent=mode==='extra'?'123':'#+=';
 if(extra)extra.dataset.pinyinMode=mode==='extra'?'numbers':'extra';
}
function updateShift(container,shift){if(!container)return;container.querySelectorAll('[data-pinyin-key]').forEach(b=>{if(/^[a-z]$/.test(b.dataset.pinyinKey||''))b.textContent=shift?b.dataset.pinyinKey.toUpperCase():b.dataset.pinyinKey});const b=container.querySelector('[data-pinyin-shift]');if(b){b.setAttribute('aria-pressed',String(shift));const icon=b.querySelector('span');if(icon)icon.textContent=shift?'⬆':'⇧';}}
root.TOPIK_PINYIN={candidates,update,select,render,updateShift,setMode,rememberChoice,dictionary};
})(typeof window!=='undefined'?window:globalThis);
