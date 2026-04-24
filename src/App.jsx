import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BookOpen, MessageCircle, Star, ChevronRight,
  X, Send, Crown, Swords, Palette, FlaskConical, Scale,
  Music, Feather, Compass, Heart, ArrowLeft, Search,
  ScrollText, Landmark, Users, Flame
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// ==========================================
// 0. Firebase 云端存储初始化
// ==========================================
let app, auth, db, appId;
try {
  const firebaseConfig = {
    apiKey: "AIzaSyB9Z3YNitY4Fd3MsIIT1z9HWIx-B1RkF60",
    authDomain: "huaxia-stars.firebaseapp.com",
    projectId: "huaxia-stars",
    storageBucket: "huaxia-stars.firebasestorage.app",
    messagingSenderId: "933027071147",
    appId: "1:933027071147:web:61af3bcb86adba0c8f23ee"
  };
  const hasConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== "";
  if (hasConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = 'huaxia-stars-v1';
  } else {
    console.log("Firebase config not set, running in demo mode");
  }
} catch (e) {
  console.error("Firebase init failed:", e);
}

// ==========================================
// 1. 核心数据：华夏历史星河人物图谱
// ==========================================
const DYNASTIES = [
  { id: 'preqin', name: '先秦', color: '#8B4513', period: '远古-前221', icon: Flame },
  { id: 'qinhan', name: '秦汉', color: '#DC143C', period: '前221-220', icon: Swords },
  { id: 'weijin', name: '魏晋南北朝', color: '#9370DB', period: '220-589', icon: Feather },
  { id: 'tang', name: '隋唐', color: '#FFD700', period: '581-907', icon: Crown },
  { id: 'song', name: '宋元', color: '#4169E1', period: '960-1368', icon: ScrollText },
  { id: 'mingqing', name: '明清', color: '#2E8B57', period: '1368-1912', icon: Landmark },
  { id: 'modern', name: '近现代', color: '#FF6347', period: '1840-至今', icon: Compass },
];

const CATEGORIES = [
  { id: 'emperor', name: '帝王将相', icon: Crown, color: '#FFD700' },
  { id: 'military', name: '军事谋略', icon: Swords, color: '#DC143C' },
  { id: 'literature', name: '文学巨匠', icon: Feather, color: '#9370DB' },
  { id: 'philosophy', name: '思想哲人', icon: Scale, color: '#4169E1' },
  { id: 'science', name: '科技发明', icon: FlaskConical, color: '#2E8B57' },
  { id: 'art', name: '艺术大家', icon: Palette, color: '#FF6347' },
  { id: 'music', name: '音乐戏曲', icon: Music, color: '#DDA0DD' },
];

const FIGURES = [
  // 先秦
  { id: 'confucius', name: '孔子', dynasty: 'preqin', category: 'philosophy', born: -551, died: -479,
    title: '万世师表', subtitle: '儒学创始人',
    desc: '名丘，字仲尼，春秋鲁国人。开创私人讲学之风，倡导仁义礼智信，其思想影响华夏文明两千余年，被后世尊为"至圣先师"。',
    quotes: ['学而时习之，不亦说乎', '己所不欲，勿施于人', '三人行，必有我师焉'],
    x: 25, y: 30, size: 1.4 },
  { id: 'laozi', name: '老子', dynasty: 'preqin', category: 'philosophy', born: -571, died: -471,
    title: '道法自然', subtitle: '道家创始人',
    desc: '姓李名耳，字聃，春秋楚国人。著《道德经》五千言，以"道"为核心，主张无为而治，为道家学派开山祖师。',
    quotes: ['道可道，非常道', '上善若水', '治大国若烹小鲜'],
    x: 15, y: 25, size: 1.3 },
  { id: 'sunzi', name: '孙武', dynasty: 'preqin', category: 'military', born: -545, died: -470,
    title: '兵圣', subtitle: '兵家至圣',
    desc: '字长卿，春秋齐国人。著《孙子兵法》十三篇，被誉为"兵学圣典"，其谋略思想至今广泛应用于军事与商界。',
    quotes: ['知彼知己，百战不殆', '兵者，诡道也', '不战而屈人之兵'],
    x: 40, y: 20, size: 1.2 },
  { id: 'quyuan', name: '屈原', dynasty: 'preqin', category: 'literature', born: -340, died: -278,
    title: '楚辞之祖', subtitle: '爱国诗人',
    desc: '名平，字原，战国楚国人。开创楚辞新诗体，代表作《离骚》为千古绝唱。以身殉国的忠贞气节，成为端午节的文化源头。',
    quotes: ['路漫漫其修远兮，吾将上下而求索', '亦余心之所善兮，虽九死其犹未悔'],
    x: 55, y: 35, size: 1.1 },
  { id: 'zhuangzi', name: '庄子', dynasty: 'preqin', category: 'philosophy', born: -369, died: -286,
    title: '逍遥游', subtitle: '道家集大成者',
    desc: '名周，战国宋国人。著《庄子》一书，以寓言说理，追求精神自由与逍遥，其文风汪洋恣肆，为千古奇书。',
    quotes: ['北冥有鱼，其名为鲲', '天地与我并生，万物与我为一'],
    x: 20, y: 45, size: 1.0 },
  { id: 'mencius', name: '孟子', dynasty: 'preqin', category: 'philosophy', born: -372, died: -289,
    title: '亚圣', subtitle: '儒学继承者',
    desc: '名轲，字子舆，战国邹国人。继承发扬孔子思想，提出"性善论""仁政"学说，被尊为"亚圣"。',
    quotes: ['天将降大任于斯人也', '民为贵，社稷次之', '生于忧患，死于安乐'],
    x: 35, y: 50, size: 1.1 },

  // 秦汉
  { id: 'qinshihuang', name: '秦始皇', dynasty: 'qinhan', category: 'emperor', born: -259, died: -210,
    title: '千古一帝', subtitle: '统一六国',
    desc: '嬴政，战国秦国人。灭六国，统一天下，建立中国历史上第一个大一统帝国。书同文、车同轨、统一度量衡，奠定中华一统之根基。',
    quotes: ['朕为始皇帝', '焚书坑儒'],
    x: 60, y: 15, size: 1.5 },
  { id: 'liubang', name: '刘邦', dynasty: 'qinhan', category: 'emperor', born: -256, died: -195,
    title: '布衣天子', subtitle: '汉朝开国皇帝',
    desc: '字季，沛县人。出身布衣而终成帝业，建立大汉王朝，开创四百年基业。善用人才，知人善任，为后世创业之典范。',
    quotes: ['大风起兮云飞扬', '安得猛士兮守四方'],
    x: 70, y: 25, size: 1.2 },
  { id: 'hanwudi', name: '汉武帝', dynasty: 'qinhan', category: 'emperor', born: -156, died: -87,
    title: '雄才大略', subtitle: '开疆拓土',
    desc: '刘彻，汉朝第七位皇帝。北击匈奴、通西域、尊儒术，使汉朝达到极盛，奠定中华文明的基本版图与文化格局。',
    quotes: ['寇可为，我复亦为', '犯我中华者，虽远必诛'],
    x: 80, y: 20, size: 1.4 },
  { id: 'simaqian', name: '司马迁', dynasty: 'qinhan', category: 'literature', born: -145, died: -86,
    title: '史家绝唱', subtitle: '中国史学之父',
    desc: '字子长，西汉夏阳人。忍辱著《史记》，开创纪传体通史之先河，被鲁迅誉为"史家之绝唱，无韵之离骚"。',
    quotes: ['人固有一死，或重于泰山，或轻于鸿毛', '究天人之际，通古今之变'],
    x: 75, y: 40, size: 1.3 },
  { id: 'zhangqian', name: '张骞', dynasty: 'qinhan', category: 'military', born: -164, died: -114,
    title: '凿空西域', subtitle: '丝绸之路开拓者',
    desc: '字子文，西汉汉中人。两次出使西域，历经艰险，开辟丝绸之路，促进了东西方文明交流。',
    quotes: ['凿空之功'],
    x: 85, y: 35, size: 1.0 },
  { id: 'caoxue', name: '蔡伦', dynasty: 'qinhan', category: 'science', born: 61, died: 121,
    title: '造纸术', subtitle: '改进造纸工艺',
    desc: '字敬仲，东汉桂阳人。改进造纸术，以树皮、麻头等为原料造出廉价优质纸张，为中国四大发明之一。',
    quotes: ['造纸改良，惠泽千秋'],
    x: 65, y: 50, size: 1.1 },
  { id: 'zhangheng', name: '张衡', dynasty: 'qinhan', category: 'science', born: 78, died: 139,
    title: '通天达人', subtitle: '天文历法大家',
    desc: '字平子，东汉南阳人。发明浑天仪、地动仪，著《灵宪》《二京赋》，集科学家与文学家于一身。',
    quotes: ['不患位之不尊，而患德之不崇'],
    x: 50, y: 55, size: 1.0 },

  // 魏晋南北朝
  { id: 'caocao', name: '曹操', dynasty: 'weijin', category: 'emperor', born: 155, died: 220,
    title: '魏武帝', subtitle: '一代枭雄',
    desc: '字孟德，沛国谯县人。统一北方，文武全才，其诗风慷慨悲凉，开建安文学之风气。',
    quotes: ['对酒当歌，人生几何', '老骥伏枥，志在千里', '宁我负人，毋人负我'],
    x: 15, y: 60, size: 1.3 },
  { id: 'zhugeliang', name: '诸葛亮', dynasty: 'weijin', category: 'military', born: 181, died: 234,
    title: '卧龙', subtitle: '千古名相',
    desc: '字孔明，号卧龙，琅琊阳都人。辅佐刘备建立蜀汉，鞠躬尽瘁死而后已，为忠臣与智慧的化身。',
    quotes: ['鞠躬尽瘁，死而后已', '非淡泊无以明志，非宁静无以致远'],
    x: 30, y: 65, size: 1.4 },
  { id: 'wangxizhi', name: '王羲之', dynasty: 'weijin', category: 'art', born: 303, died: 361,
    title: '书圣', subtitle: '千古书法第一人',
    desc: '字逸少，琅琊临沂人。其书法兼善隶、草、楷、行各体，《兰亭集序》被誉为"天下第一行书"。',
    quotes: ['固知一死生为虚诞', '群贤毕至，少长咸集'],
    x: 45, y: 70, size: 1.2 },
  { id: 'taoyuanming', name: '陶渊明', dynasty: 'weijin', category: 'literature', born: 365, died: 427,
    title: '田园诗祖', subtitle: '隐逸诗人之宗',
    desc: '名潜，字元亮，浔阳柴桑人。不为五斗米折腰，归隐田园，开创田园诗派，《桃花源记》描绘的理想世界影响深远。',
    quotes: ['采菊东篱下，悠然见南山', '不为五斗米折腰'],
    x: 55, y: 65, size: 1.0 },

  // 隋唐
  { id: 'libai', name: '李白', dynasty: 'tang', category: 'literature', born: 701, died: 762,
    title: '诗仙', subtitle: '浪漫主义巅峰',
    desc: '字太白，号青莲居士。诗风豪放飘逸，想象力奇绝，被誉为"诗仙"。其诗代表了中国古典诗歌浪漫主义的最高成就。',
    quotes: ['天生我材必有用', '举杯邀明月，对影成三人', '长风破浪会有时'],
    x: 20, y: 75, size: 1.5 },
  { id: 'dufu', name: '杜甫', dynasty: 'tang', category: 'literature', born: 712, died: 770,
    title: '诗圣', subtitle: '现实主义巨匠',
    desc: '字子美，号少陵野老。诗风沉郁顿挫，心系苍生，被誉为"诗圣"。其诗被称为"诗史"，记录了唐代由盛转衰的历史。',
    quotes: ['安得广厦千万间', '会当凌绝顶，一览众山小', '国破山河在'],
    x: 35, y: 80, size: 1.4 },
  { id: 'tangtaizong', name: '唐太宗', dynasty: 'tang', category: 'emperor', born: 598, died: 649,
    title: '贞观之治', subtitle: '千古明君',
    desc: '李世民，唐朝第二位皇帝。开创"贞观之治"，虚心纳谏，知人善任，使大唐成为当时世界最强盛的帝国。',
    quotes: ['以铜为镜，可以正衣冠；以史为镜，可以知兴替', '水能载舟，亦能覆舟'],
    x: 50, y: 75, size: 1.4 },
  { id: 'wangwei', name: '王维', dynasty: 'tang', category: 'art', born: 701, died: 761,
    title: '诗佛', subtitle: '诗画合一',
    desc: '字摩诘，号摩诘居士。诗画双绝，苏轼赞其"诗中有画，画中有诗"。开创水墨山水画南宗之先河。',
    quotes: ['行到水穷处，坐看云起时', '明月松间照，清泉石上流'],
    x: 65, y: 78, size: 1.0 },
  { id: 'baijuyi', name: '白居易', dynasty: 'tang', category: 'literature', born: 772, died: 846,
    title: '诗魔', subtitle: '人民诗人',
    desc: '字乐天，号香山居士。主张"文章合为时而著，歌诗合为事而作"，其诗通俗易懂，传诵极广。',
    quotes: ['同是天涯沦落人，相逢何必曾相识', '在天愿作比翼鸟'],
    x: 80, y: 70, size: 1.1 },
  { id: 'xuanzang', name: '玄奘', dynasty: 'tang', category: 'philosophy', born: 602, died: 664,
    title: '大乘天', subtitle: '西行求法',
    desc: '俗姓陈，名祎，洛州缑氏人。历时十七年西行求法，译经千余卷，为中印文化交流做出巨大贡献。',
    quotes: ['宁向西天一步死，不向东土半步生'],
    x: 70, y: 85, size: 1.0 },

  // 宋元
  { id: 'sushi', name: '苏轼', dynasty: 'song', category: 'literature', born: 1037, died: 1101,
    title: '东坡居士', subtitle: '千古全才',
    desc: '字子瞻，号东坡居士。诗词文书画皆精，为宋代文学最高成就之代表。豁达乐观的人生态度，至今为人所景仰。',
    quotes: ['大江东去，浪淘尽', '但愿人长久，千里共婵娟', '竹杖芒鞋轻胜马，谁怕'],
    x: 15, y: 85, size: 1.5 },
  { id: 'liqingzhao', name: '李清照', dynasty: 'song', category: 'literature', born: 1084, died: 1155,
    title: '千古第一才女', subtitle: '婉约词宗',
    desc: '号易安居士，齐州章丘人。词作婉约细腻，为婉约派代表人物。其词以南渡为界，前期清新明快，后期凄凉悲苦。',
    quotes: ['寻寻觅觅，冷冷清清', '知否知否，应是绿肥红瘦', '生当作人杰，死亦为鬼雄'],
    x: 30, y: 90, size: 1.2 },
  { id: 'xin qiji', name: '辛弃疾', dynasty: 'song', category: 'literature', born: 1140, died: 1207,
    title: '词中之龙', subtitle: '豪放词派',
    desc: '字幼安，号稼轩，历城人。文能提笔安天下，武能上马定乾坤。其词慷慨悲壮，为豪放派之集大成者。',
    quotes: ['醉里挑灯看剑', '了却君王天下事', '青山遮不住，毕竟东流去'],
    x: 45, y: 88, size: 1.1 },
  { id: 'shenkua', name: '沈括', dynasty: 'song', category: 'science', born: 1031, died: 1095,
    title: '科学全才', subtitle: '中国科学史上的坐标',
    desc: '字存中，号梦溪丈人。著《梦溪笔谈》，涵盖天文、数学、物理、化学、生物等，被英国学者李约瑟称为"中国科学史上的坐标"。',
    quotes: ['此皆不可不知也'],
    x: 60, y: 82, size: 1.0 },
  { id: 'yuefei', name: '岳飞', dynasty: 'song', category: 'military', born: 1103, died: 1142,
    title: '精忠报国', subtitle: '民族英雄',
    desc: '字鹏举，相州汤阴人。抗金名将，其"精忠报国"精神为后世敬仰。《满江红》一词慷慨激昂，传诵千古。',
    quotes: ['莫等闲，白了少年头，空悲切', '三十功名尘与土，八千里路云和月'],
    x: 75, y: 90, size: 1.3 },
  { id: 'genghis', name: '成吉思汗', dynasty: 'song', category: 'emperor', born: 1162, died: 1227,
    title: '一代天骄', subtitle: '蒙古帝国创建者',
    desc: '名铁木真，统一蒙古各部，建立大蒙古国。其后裔建立的元朝为中国历史上首个少数民族大一统王朝。',
    quotes: ['要让青草覆盖的地方都成为我的牧马之地'],
    x: 88, y: 80, size: 1.2 },

  // 明清
  { id: 'wangyangming', name: '王阳明', dynasty: 'mingqing', category: 'philosophy', born: 1472, died: 1529,
    title: '心学宗师', subtitle: '知行合一',
    desc: '名守仁，字伯安，号阳明。创立"心学"，主张"知行合一""致良知"，其思想影响深远，远播东亚。',
    quotes: ['知行合一', '致良知', '心即理也'],
    x: 20, y: 95, size: 1.3 },
  { id: 'caoxueqin', name: '曹雪芹', dynasty: 'mingqing', category: 'literature', born: 1715, died: 1763,
    title: '红楼一梦', subtitle: '中国小说巅峰',
    desc: '名霑，字梦阮，号雪芹。倾毕生心血著《红楼梦》，为中国古典小说最高成就，百科全书式地展现了封建社会的兴衰。',
    quotes: ['满纸荒唐言，一把辛酸泪', '世事洞明皆学问，人情练达即文章'],
    x: 40, y: 92, size: 1.4 },
  { id: 'zhenghe', name: '郑和', dynasty: 'mingqing', category: 'military', born: 1371, died: 1433,
    title: '七下西洋', subtitle: '航海先驱',
    desc: '原名马和，云南昆阳人。七次率船队下西洋，最远到达非洲东海岸，比哥伦布发现新大陆早近百年。',
    quotes: ['航海先驱，万国来朝'],
    x: 55, y: 95, size: 1.1 },
  { id: 'lixia', name: '李时珍', dynasty: 'mingqing', category: 'science', born: 1518, died: 1593,
    title: '医圣', subtitle: '本草纲目',
    desc: '字东璧，号濒湖，蕲州人。历时二十七载著成《本草纲目》，收载药物一千八百九十二种，为世界药学巨著。',
    quotes: ['医者仁心，悬壶济世'],
    x: 70, y: 92, size: 1.0 },
  { id: 'kangxi', name: '康熙帝', dynasty: 'mingqing', category: 'emperor', born: 1654, died: 1722,
    title: '千古一帝', subtitle: '康乾盛世',
    desc: '爱新觉罗·玄烨，清朝第四位皇帝。在位六十一年，平三藩、收台湾、御沙俄，开创"康乾盛世"。',
    quotes: ['天下大权，惟一人操之'],
    x: 85, y: 88, size: 1.2 },

  // 近现代
  { id: 'luxun', name: '鲁迅', dynasty: 'modern', category: 'literature', born: 1881, died: 1936,
    title: '民族魂', subtitle: '现代文学奠基人',
    desc: '原名周树人，浙江绍兴人。以笔为剑，唤醒民众，为中国现代文学之奠基者。其文深刻犀利，如匕首投枪。',
    quotes: ['横眉冷对千夫指，俯首甘为孺子牛', '不在沉默中爆发，就在沉默中灭亡'],
    x: 30, y: 50, size: 1.4 },
  { id: 'sunzhongshan', name: '孙中山', dynasty: 'modern', category: 'emperor', born: 1866, died: 1925,
    title: '国父', subtitle: '民主革命先行者',
    desc: '名文，字载之，号日新。推翻两千余年封建帝制，创立中华民国，提出三民主义，为民主革命先行者。',
    quotes: ['革命尚未成功，同志仍须努力', '天下为公'],
    x: 50, y: 45, size: 1.3 },
  { id: 'caiyuanpei', name: '蔡元培', dynasty: 'modern', category: 'philosophy', born: 1868, died: 1940,
    title: '学界泰斗', subtitle: '教育改革先驱',
    desc: '字鹤卿，浙江绍兴人。任北京大学校长，倡导"思想自由，兼容并包"，开创中国现代教育新纪元。',
    quotes: ['思想自由，兼容并包', '教育者，非为已往，非为现在，而专为将来'],
    x: 70, y: 55, size: 1.0 },
];

// ==========================================
// 2. 辅助函数
// ==========================================
const getDynastyColor = (dynastyId) => {
  return DYNASTIES.find(d => d.id === dynastyId)?.color || '#888';
};

const getDynastyName = (dynastyId) => {
  return DYNASTIES.find(d => d.id === dynastyId)?.name || '';
};

const getCategoryInfo = (catId) => {
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
};

const formatYear = (year) => {
  if (year < 0) return `公元前${Math.abs(year)}年`;
  return `公元${year}年`;
};

// ==========================================
// 3. AI 对话 API 调用
// ==========================================
const callGeminiAPI = async (prompt) => {
  const apiKey = "AIzaSyCxxgvFcToi4O8bHwW-azv2yimw1uG4t8c";
  if (!apiKey) {
    return "⚠️ AI 对话功能需要配置 Gemini API Key。请在 App.jsx 中填入你的密钥后重试。";
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI 暂时无法回应，请稍后再试。";
  } catch (err) {
    console.error("Gemini API error:", err);
    return "AI 服务调用失败，请检查网络连接或 API 配置。";
  }
};

// ==========================================
// 4. 星图粒子背景
// ==========================================
function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const stars = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed * 10 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${s.a * twinkle})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ==========================================
// 5. 人物星点组件
// ==========================================
function FigureStar({ figure, onClick, isSelected }) {
  const color = getDynastyColor(figure.dynasty);
  const catInfo = getCategoryInfo(figure.category);
  const CatIcon = catInfo.icon;

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(figure)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: Math.random() * 0.5, duration: 0.5 }}
      whileHover={{ scale: 1.3 }}
    >
      {/* 光晕 */}
      <circle
        cx={`${figure.x}%`}
        cy={`${figure.y}%`}
        r={figure.size * 18}
        fill={color}
        opacity={0.08}
      />
      {/* 星点外圈 */}
      <circle
        cx={`${figure.x}%`}
        cy={`${figure.y}%`}
        r={figure.size * 8}
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity={0.4}
      />
      {/* 核心星点 */}
      <circle
        cx={`${figure.x}%`}
        cy={`${figure.y}%`}
        r={figure.size * 4}
        fill={color}
        opacity={0.9}
        style={{ filter: `drop-shadow(0 0 ${figure.size * 6}px ${color})` }}
      />
      {/* 人物名 */}
      <text
        x={`${figure.x}%`}
        y={`${figure.y + figure.size * 5}%`}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize={figure.size * 9}
        fontFamily="'Noto Serif SC', serif"
        opacity={0.9}
      >
        {figure.name}
      </text>
      {/* 分类小图标标签 */}
      <text
        x={`${figure.x}%`}
        y={`${figure.y - figure.size * 7}%`}
        textAnchor="middle"
        fill={catInfo.color}
        fontSize={figure.size * 7}
        opacity={0.7}
      >
        {figure.title}
      </text>
    </motion.g>
  );
}

// ==========================================
// 6. 人物详情面板
// ==========================================
function FigureDetail({ figure, onClose, onChat }) {
  const color = getDynastyColor(figure.dynasty);
  const catInfo = getCategoryInfo(figure.category);
  const CatIcon = catInfo.icon;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 遮罩 */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* 内容面板 */}
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8"
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)`,
          border: `1px solid ${color}33`,
          boxShadow: `0 0 60px ${color}15, inset 0 1px 0 ${color}20`
        }}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* 朝代标签 */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {getDynastyName(figure.dynasty)}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs"
            style={{ background: `${catInfo.color}20`, color: catInfo.color, border: `1px solid ${catInfo.color}40` }}
          >
            <CatIcon size={12} className="inline mr-1" />
            {catInfo.name}
          </span>
        </div>

        {/* 名字与称号 */}
        <h1 className="text-4xl font-bold mb-1" style={{ color }}>
          {figure.name}
        </h1>
        <p className="text-xl text-gray-300 mb-1">{figure.title}</p>
        <p className="text-sm text-gray-500 mb-6">
          {formatYear(figure.born)} — {formatYear(figure.died)}
        </p>

        {/* 简介 */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{ background: `${color}08`, borderLeft: `3px solid ${color}` }}
        >
          <p className="text-gray-300 leading-relaxed text-base">{figure.desc}</p>
        </div>

        {/* 名言 */}
        {figure.quotes && figure.quotes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={14} /> 千古名句
            </h3>
            <div className="space-y-2">
              {figure.quotes.map((q, i) => (
                <motion.div
                  key={i}
                  className="pl-4 py-2 text-gray-300 italic border-l-2"
                  style={{ borderColor: `${color}60` }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  "{q}"
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* AI 对话按钮 */}
        <motion.button
          onClick={() => onChat(figure)}
          className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}15)`,
            border: `1px solid ${color}40`,
            color
          }}
          whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${color}20` }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageCircle size={20} />
          与{figure.name}对话
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// 7. AI 对话面板
// ==========================================
function ChatPanel({ figure, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const color = getDynastyColor(figure.dynasty);

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `吾乃${figure.name}，${figure.title}。汝有何事相问？`
    }]);
  }, [figure]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const prompt = `你是${figure.name}（${figure.title}，${getDynastyName(figure.dynasty)}时期人物）。请以该人物的身份和口吻回答问题，使用半文言文风格，体现其思想性格。以下是该人物的简介：${figure.desc}。该人物的名言：${figure.quotes?.join('；')}。用户的问题：${userMsg}`;
      const response = await callGeminiAPI(prompt);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，暂时无法回应。' }]);
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1a1040 100%)',
          border: `1px solid ${color}33`
        }}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        {/* 头部 */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <button onClick={onClose} className="text-gray-400 hover:text-white mr-2">
            <ArrowLeft size={20} />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ background: `${color}25`, color, border: `2px solid ${color}50` }}
          >
            {figure.name[0]}
          </div>
          <div>
            <p className="font-bold" style={{ color }}>{figure.name}</p>
            <p className="text-xs text-gray-500">{figure.title} · {getDynastyName(figure.dynasty)}</p>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/30 text-gray-200 rounded-tr-sm'
                    : 'bg-gray-800/50 text-gray-300 rounded-tl-sm'
                }`}
                style={msg.role === 'assistant' ? { borderLeft: `2px solid ${color}60` } : {}}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 rounded-2xl px-4 py-3 rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`向${figure.name}提问...`}
              className="flex-1 bg-gray-800/50 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none border border-gray-700 focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 rounded-xl transition-all disabled:opacity-30"
              style={{ background: `${color}30`, color, border: `1px solid ${color}40` }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// 8. 筛选栏
// ==========================================
function FilterBar({ activeDynasty, setActiveDynasty, activeCategory, setActiveCategory, searchQuery, setSearchQuery }) {
  return (
    <div className="relative z-10 px-4 md:px-8 pt-4">
      {/* 朝代筛选 */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setActiveDynasty(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            !activeDynasty ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          全部朝代
        </button>
        {DYNASTIES.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDynasty(activeDynasty === d.id ? null : d.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeDynasty === d.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            style={activeDynasty === d.id ? {
              background: `${d.color}30`,
              border: `1px solid ${d.color}60`,
              color: d.color
            } : {
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* 分类 + 搜索 */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs transition-all ${
            !activeCategory ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          全部分类
        </button>
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 ${
                activeCategory === c.id ? '' : 'text-gray-400 hover:text-gray-200'
              }`}
              style={activeCategory === c.id ? {
                background: `${c.color}20`,
                border: `1px solid ${c.color}50`,
                color: c.color
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Icon size={12} /> {c.name}
            </button>
          );
        })}

        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索人物..."
            className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors w-40"
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. 时间线侧栏
// ==========================================
function TimelineSidebar({ figures, onSelect }) {
  const sorted = [...figures].sort((a, b) => a.born - b.born);
  return (
    <div className="hidden lg:block w-64 h-full overflow-y-auto p-4 border-r border-gray-800/50">
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <BookOpen size={14} /> 人物年表
      </h3>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent" />
        {sorted.map((f, i) => (
          <motion.div
            key={f.id}
            className="relative pl-8 pb-4 cursor-pointer group"
            onClick={() => onSelect(f)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <div
              className="absolute left-1.5 top-1 w-3 h-3 rounded-full border-2"
              style={{ borderColor: getDynastyColor(f.dynasty), background: `${getDynastyColor(f.dynasty)}30` }}
            />
            <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
              {formatYear(f.born)}
            </p>
            <p
              className="text-sm font-bold group-hover:underline transition-colors"
              style={{ color: getDynastyColor(f.dynasty) }}
            >
              {f.name}
            </p>
            <p className="text-xs text-gray-600">{f.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. 统计面板
// ==========================================
function StatsPanel({ figures }) {
  const dynastyCounts = DYNASTIES.map(d => ({
    ...d,
    count: figures.filter(f => f.dynasty === d.id).length
  })).filter(d => d.count > 0);

  const maxCount = Math.max(...dynastyCounts.map(d => d.count));

  return (
    <div className="p-4">
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Users size={14} /> 星河概览
      </h3>
      <div className="space-y-3">
        {dynastyCounts.map(d => (
          <div key={d.id}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: d.color }}>{d.name}</span>
              <span className="text-gray-500">{d.count}人</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-3xl font-bold text-indigo-400">{figures.length}</p>
        <p className="text-xs text-gray-500 mt-1">华夏星河人物</p>
      </div>
    </div>
  );
}

// ==========================================
// 11. 主应用
// ==========================================
export default function App() {
  const [selectedFigure, setSelectedFigure] = useState(null);
  const [chatFigure, setChatFigure] = useState(null);
  const [activeDynasty, setActiveDynasty] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Firebase 匿名登录
  useEffect(() => {
    if (auth) {
      signInAnonymously(auth).then(() => setAuthReady(true)).catch(console.error);
      onAuthStateChanged(auth, (user) => {
        if (user) setAuthReady(true);
      });
    }
  }, []);

  // 筛选人物
  const filteredFigures = FIGURES.filter(f => {
    if (activeDynasty && f.dynasty !== activeDynasty) return false;
    if (activeCategory && f.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) ||
             f.title.toLowerCase().includes(q) ||
             f.desc.toLowerCase().includes(q);
    }
    return true;
  });

  const handleFigureClick = (figure) => {
    setSelectedFigure(figure);
  };

  const handleChat = (figure) => {
    setSelectedFigure(null);
    setChatFigure(figure);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative">
      <StarField />

      {/* 标题栏 */}
      <header className="relative z-10 px-4 md:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              ✦ 华夏星河录
            </h1>
            <p className="text-xs text-gray-500 mt-1">华夏五千年 · 人物数字星图</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className={`lg:hidden px-3 py-1.5 rounded-lg text-xs transition-all ${
                showTimeline ? 'bg-indigo-600/30 text-indigo-300' : 'bg-white/5 text-gray-400'
              }`}
            >
              <ScrollText size={14} className="inline mr-1" />
              年表
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500">收录人物</p>
              <p className="text-lg font-bold text-indigo-400">{FIGURES.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 筛选栏 */}
      <FilterBar
        activeDynasty={activeDynasty}
        setActiveDynasty={setActiveDynasty}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 主内容区 */}
      <div className="relative z-10 flex" style={{ height: 'calc(100vh - 160px)' }}>
        {/* 时间线侧栏 (桌面) */}
        <div className="hidden lg:block">
          <TimelineSidebar figures={filteredFigures} onSelect={handleFigureClick} />
        </div>

        {/* 移动端时间线 */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowTimeline(false)} />
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-72 bg-[#0f172a] overflow-y-auto"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
              >
                <TimelineSidebar figures={filteredFigures} onSelect={(f) => { handleFigureClick(f); setShowTimeline(false); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 星图主区域 */}
        <div className="flex-1 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* 朝代分区背景 */}
            {DYNASTIES.map((d, i) => (
              <rect
                key={d.id}
                x="0" y={i * (100 / DYNASTIES.length)}
                width="100" height={100 / DYNASTIES.length}
                fill={d.color}
                opacity={activeDynasty === d.id ? 0.06 : 0.01}
                rx="2"
              />
            ))}

            {/* 连线（同一朝代的人物之间） */}
            {DYNASTIES.map(d => {
              const dynastyFigures = filteredFigures.filter(f => f.dynasty === d.id);
              if (dynastyFigures.length < 2) return null;
              const lines = [];
              for (let i = 0; i < dynastyFigures.length - 1; i++) {
                lines.push(
                  <line
                    key={`${d.id}-${i}`}
                    x1={`${dynastyFigures[i].x}%`}
                    y1={`${dynastyFigures[i].y}%`}
                    x2={`${dynastyFigures[i + 1].x}%`}
                    y2={`${dynastyFigures[i + 1].y}%`}
                    stroke={d.color}
                    strokeWidth="0.15"
                    opacity="0.15"
                  />
                );
              }
              return <g key={d.id}>{lines}</g>;
            })}

            {/* 人物星点 */}
            {filteredFigures.map(f => (
              <FigureStar
                key={f.id}
                figure={f}
                onClick={handleFigureClick}
                isSelected={selectedFigure?.id === f.id}
              />
            ))}
          </svg>

          {/* 空状态 */}
          {filteredFigures.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Star size={40} className="mx-auto mb-3 opacity-30" />
                <p>星空中暂无匹配的人物</p>
                <p className="text-sm mt-1">试试调整筛选条件</p>
              </div>
            </div>
          )}
        </div>

        {/* 统计面板 (桌面) */}
        <div className="hidden lg:block w-56 h-full overflow-y-auto border-l border-gray-800/50">
          <StatsPanel figures={filteredFigures} />
        </div>
      </div>

      {/* 人物详情 */}
      <AnimatePresence>
        {selectedFigure && (
          <FigureDetail
            figure={selectedFigure}
            onClose={() => setSelectedFigure(null)}
            onChat={handleChat}
          />
        )}
      </AnimatePresence>

      {/* AI 对话 */}
      <AnimatePresence>
        {chatFigure && (
          <ChatPanel
            figure={chatFigure}
            onClose={() => setChatFigure(null)}
          />
        )}
      </AnimatePresence>

      {/* 底部信息 */}
      <footer className="relative z-10 text-center py-3">
        <p className="text-xs text-gray-700">
          华夏星河录 · 数字人文项目 · 收录 {FIGURES.length} 位历史人物
        </p>
      </footer>
    </div>
  );
}
