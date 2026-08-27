(() => {
  'use strict';

  const SAVE_KEY = 'mountain_city_life_v1';
  const SLOTS = [
    ['清晨', '06:30'], ['早市', '08:30'], ['上午', '10:30'], ['午后', '13:30'],
    ['下午', '16:00'], ['傍晚', '18:30'], ['深夜', '21:30']
  ];
  const WEATHER = ['小雨 · 22℃', '雾 · 20℃', '阴 · 24℃', '阵雨 · 23℃', '晴热 · 31℃'];
  const fmt = n => `¥${Math.round(n).toLocaleString('zh-CN')}`;
  const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, n));
  const roll = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const $ = id => document.getElementById(id);

  const NPCS = {
    wang: { name: '王强', role: '朝天门码头工头', portrait: 'assets/portraits/wang-qiang.png' },
    lin: { name: '林月', role: '老街面馆老板', portrait: 'assets/portraits/lin-yue.png' },
    zhao: { name: '赵坤', role: '借款方联系人', portrait: 'assets/portraits/zhao-kun.png' },
    chen: { name: '陈晓雨', role: '住院部护士', portrait: 'assets/portraits/chen-xiaoyu.png' }
  };

  const LOCATIONS = {
    home: {
      name: '石板坡出租屋', area: '渝中 · 石板坡', icon: '⌂', subtitle: '落脚与休息', scene: 'assets/scenes/rental-room.png',
      title: '雨从窗缝里吹进来', desc: '床板很硬，山城的灯却亮得很远。搪瓷杯下压着你最后的现金，墙上的日历正一格一格逼近月底。'
    },
    wharf: {
      name: '朝天门码头', area: '渝中 · 朝天门', icon: '⚓', subtitle: '力气活与货运', scene: 'assets/scenes/chaotianmen.png', npc: 'wang',
      title: '江雾里，货车已经到了', desc: '湿滑石阶一直伸到江边。这里不问履历，只看你能不能在下一班船靠岸前，把货送上坡。'
    },
    market: {
      name: '沙坪坝老街', area: '沙坪坝 · 社区早市', icon: '市', subtitle: '小生意起点', scene: 'assets/scenes/market.png', npc: 'lin',
      title: '一锅红汤，半条街的人情', desc: '菜贩的吆喝和面汤的热气混在一起。空出来的街角不大，却可能是你第一笔真正的生意。'
    },
    downtown: {
      name: '解放碑商圈', area: '渝中 · 解放碑', icon: '楼', subtitle: '兼职与客流', scene: 'assets/scenes/jiefangbei.png',
      title: '霓虹很亮，生活很贵', desc: '写字楼的人流从身边掠过。送餐、促销、跑腿，每一趟都能换来钱，也换走一点体力。'
    },
    hospital: {
      name: '市人民医院', area: '江北 · 住院部', icon: '十', subtitle: '父亲与健康', scene: 'assets/scenes/hospital.png', npc: 'chen',
      title: '床头的保温杯还是温的', desc: '父亲睡着了。病房外永远有人排队，你不敢久留，也不敢真的不来。'
    },
    ciqikou: {
      name: '磁器口后街', area: '沙坪坝 · 磁器口', icon: '巷', subtitle: '游客与摊位', scene: 'assets/scenes/market.png', scenePos: 'center 62%', filter: 'saturate(.78) contrast(1.06)',
      title: '青石板路上，游客来来往往', desc: '主街的租金高得吓人，后街却总有缝隙。会讲故事的人，能把一件普通小物卖出好价钱。'
    },
    liziba: {
      name: '李子坝坡道', area: '渝中 · 李子坝', icon: '轨', subtitle: '配送与拍摄', scene: 'assets/scenes/chaotianmen.png', scenePos: 'center 38%', filter: 'saturate(.82) brightness(.86)',
      title: '轻轨从楼影间轰鸣而过', desc: '坡道把每一公里都拉得更长。游客举起相机，骑手低头看表，时间在这里尤其值钱。'
    },
    nanbin: {
      name: '南滨路夜岸', area: '南岸 · 南滨路', icon: '江', subtitle: '夜工与机会', scene: 'assets/scenes/jiefangbei.png', scenePos: 'center 72%', filter: 'hue-rotate(-8deg) saturate(.72) brightness(.72)',
      title: '江风吹过最后一班灯火', desc: '夜里有夜里的生意。摊位、代驾、展会撤场，城睡了，仍有人靠这一班活挣钱。'
    },
    labor: {
      name: '渝州劳务市场', area: '九龙坡 · 劳务集散地', icon: '工', subtitle: '零工与招工', scene: 'assets/scenes/construction.png', scenePos: 'center 62%', filter: 'saturate(.82) brightness(.82)',
      title: '天没亮，招工牌已经立起来', desc: '日结、周结、包吃不包住。几十双眼睛盯着同一块白板，谁先上车，谁今天就有收入。'
    },
    construction: {
      name: '石桥铺工地', area: '九龙坡 · 石桥铺', icon: '建', subtitle: '高薪体力活', scene: 'assets/scenes/construction.png',
      title: '钢筋和塔吊切开雾气', desc: '这里的钱比普通零工多，危险也更近。连续逞强，扭伤、砸伤都可能把几天收入送进医院。'
    },
    backstreet: {
      name: '大坪旧影像市场', area: '渝中 · 大坪后巷', icon: '暗', subtitle: '灰色门路', scene: 'assets/scenes/grey-market.png',
      title: '卷帘门只开了半扇', desc: '有人兜售来路不明的旧碟和渠道货，也有人替夜场介绍成年客人。钱来得快，巡查的脚步也随时会响。'
    },
    property: {
      name: '江北嘴售楼中心', area: '江北 · 江北嘴', icon: '房', subtitle: '看房与置业', scene: 'assets/scenes/property-showroom.png',
      title: '沙盘上的每盏灯都有价格', desc: '置业顾问说的是未来，你掂量的是手里的现金。买下来的家，能让每一夜休息更踏实。'
    },
    autocity: {
      name: '九龙坡汽车4S店', area: '九龙坡 · 汽车城', icon: '车', subtitle: '买车与换车', scene: 'assets/scenes/car-dealership.png',
      title: '玻璃幕墙里停着另一种生活', desc: '有车以后通勤更自由，也能跑网约车挣钱；但油费、保养和折旧，一样会写进账本。'
    },
    detention: {
      name: '辖区派出所', area: '行政拘留办理区', icon: '警', subtitle: '事件地点', scene: 'assets/scenes/police-station.png', hidden: true,
      title: '铁门合上，时间忽然变得很慢', desc: '问询、登记、处罚。赚快钱时被忽略的风险，现在按天从期限里扣走。'
    }
  };

  // vol=每日波动幅度 mishap=出事概率 care=最多几天不补货还能满产 upkeep=每天固定开销
  const ASSETS = {
    cart: { name: '酸辣粉推车', icon: '碗', cost: 1800, income: 330, exp: 5, req: 8, vol: .10, mishap: .04, care: 6, upkeep: 20, tend: 1,
      desc: '日均约 ¥295 · 几乎不出事', risk: '一个人一辆车，赚得少但踏实。城管来了推着就走。' },
    noodle: { name: '社区小面档', icon: '面', cost: 4800, income: 900, exp: 12, req: 22, vol: .24, mishap: .09, care: 5, upkeep: 70, tend: 2,
      desc: '日均约 ¥730 · 偶尔亏本', risk: '有铺面就有房租，刮风下雨没人来，那天就是白开。' },
    tea: { name: '商圈茶饮窗口', icon: '茶', cost: 8800, income: 1900, exp: 20, req: 42, vol: .36, mishap: .14, care: 4, upkeep: 180, tend: 3,
      desc: '日均约 ¥1,420 · 起落明显', risk: '商圈人流忽高忽低，设备一坏就是一整天营业额。' },
    store: { name: '社区便利店', icon: '店', cost: 15000, income: 3600, exp: 28, req: 68, vol: .50, mishap: .19, care: 3, upkeep: 380, tend: 4,
      desc: '日均约 ¥2,470 · 大赚大亏', risk: '压货、临期、盘亏、水电，摊子越大，出问题的地方越多。' }
  };

  // 店越大越操心：每天固定消耗你的体力和心气
  const MISHAPS = [
    { key: 'inspect', text: '城管突击清理占道，收摊躲了大半天' },
    { key: 'broken', text: '设备半路罢工，等师傅上门等到打烊' },
    { key: 'rain', text: '连着两场暴雨，坡上一个客人都没有' },
    { key: 'spoil', text: '一批货临期没走完，只能自己吃亏处理' },
    { key: 'short', text: '盘账时对不上号，差的那部分找不回来' }
  ];

  const HOUSING = {
    rental: { name: '石板坡出租屋', icon: '租', price: 0, upkeep: 35, energy: 25, health: 2, stress: 3, scene: 'assets/scenes/rental-room.png', area: '渝中 · 石板坡', title: '雨从窗缝里吹进来', desc: '床板很硬，山城的灯却亮得很远。这里是落脚处，还算不上真正的家。' },
    starter: { name: '杨家坪安居一室', icon: '家', price: 28000, upkeep: 55, energy: 36, health: 4, stress: -5, scene: 'assets/scenes/owned-apartment.png', area: '九龙坡 · 杨家坪', title: '钥匙第一次插进自己的门', desc: '房子不大，却终于不用再看房东脸色。窗外是层叠的楼和江光，回家这件事有了新的分量。' },
    river: { name: '南岸江景两居室', icon: '江', price: 68000, upkeep: 95, energy: 46, health: 6, stress: -8, scene: 'assets/scenes/owned-apartment.png', area: '南岸 · 弹子石', title: '江面灯火成了家里的夜景', desc: '更宽敞的房间、更安静的睡眠，也意味着更高的持有开支。你终于在重庆真正安了家。' }
  };

  const VEHICLES = {
    hatchback: { name: '二手两厢车', icon: '轿', price: 26000, fuel: 7, rideIncome: [430, 560], desc: '通勤更自由，可跑网约车' },
    suv: { name: '国产城市SUV', icon: '越', price: 72000, fuel: 11, rideIncome: [560, 720], desc: '空间更大，网约车收入更高' }
  };

  const PRINCIPAL = 30000;

  // 慢性伤病：一旦落下就无法治愈，只会压低你的身体上限
  const CHRONIC = {
    waist: { name: '腰肌劳损', icon: '腰', hp: 10, ep: 8, desc: '体力上限 -8 · 体力活额外耗力' },
    stomach: { name: '慢性胃病', icon: '胃', hp: 8, ep: 4, desc: '健康上限 -8 · 进食恢复减少三成' },
    insomnia: { name: '重度失眠', icon: '眠', hp: 6, ep: 10, desc: '体力上限 -10 · 休息恢复只剩六成' },
    leg: { name: '腿伤后遗症', icon: '腿', hp: 14, ep: 12, desc: '上限双降 · 通勤更慢更痛' },
    heart: { name: '心悸', icon: '悸', hp: 12, ep: 6, desc: '健康上限 -12 · 高压时可能猝倒' },
    nerve: { name: '焦虑症', icon: '神', hp: 5, ep: 5, desc: '每天自动累积心压 +4' },
    std: { name: '性传播感染', icon: '症', hp: 14, ep: 8, desc: '健康上限 -14 · 每天额外掉健康 · 医院可治' }
  };

  // 高利贷催收：五个阶段，越拖越狠
  const COLLECTION = [
    { key: 'c1', day: 7, ratio: .05, title: '第一次上门' },
    { key: 'c2', day: 11, ratio: .13, title: '堵门搜身' },
    { key: 'c3', day: 15, ratio: .24, title: '巷口那顿打' },
    { key: 'c4', day: 19, ratio: .38, title: '清点抵押物' },
    { key: 'c5', day: 23, ratio: .55, title: '断腿的代价' },
    { key: 'c6', day: 27, ratio: .75, title: '最后通牒' }
  ];

  // ===== 跑货：低买高卖，行情每天都在动 =====
  // bulk = 每单位占多少「容量」；depth = 这门生意一天大概能吃下多少货
  const GOODS = {
    glove: { name: '劳保手套', icon: '套', base: 22, unit: '打', bulk: 1, depth: 60, desc: '一打十二双，压得扁、装得多，工地天天要' },
    craft: { name: '文创冰箱贴', icon: '贴', base: 34, unit: '盒', bulk: 1, depth: 45, desc: '小盒装，占地方少；景区溢价高，游客不来就砸手里' },
    parts: { name: '二手手机配件', icon: '芯', base: 155, unit: '包', bulk: 2, depth: 30, desc: '一包一斤多，利最厚，假货也最多' },
    pepper: { name: '干花椒', icon: '椒', base: 46, unit: '斤', bulk: 3, desc: '蓬松占地，一麻袋没几斤；馆子和游客都收', depth: 40 },
    cured: { name: '山货腊味', icon: '腊', base: 88, unit: '块', bulk: 6, desc: '一块两三斤，又重又占地；单价高，行情起落也最大', depth: 22 }
  };

  // 每个地点的市场胃口：大商圈吃得多，后巷吃得少
  const MARKET_SIZE = { market: 1.3, downtown: 1.35, ciqikou: 1.2, nanbin: 1.0, liziba: .85, construction: 1.1, labor: 1.15, wharf: 1.0, backstreet: .7 };

  // 每个地点对每种货的基准偏向：<1 是产地/批发价，>1 是销地。null 表示这里不做这门生意
  const MARKET_BIAS = {
    market: { glove: .94, pepper: .70, craft: 1.02, cured: .76, parts: 1.06 },
    labor: { glove: .68, pepper: null, craft: null, cured: .94, parts: 1.10 },
    backstreet: { glove: .80, pepper: null, craft: .80, cured: null, parts: .60 },
    wharf: { glove: .86, pepper: .84, craft: null, cured: .88, parts: .96 },
    construction: { glove: 1.34, pepper: null, craft: null, cured: 1.02, parts: 1.04 },
    downtown: { glove: 1.02, pepper: 1.12, craft: .72, cured: 1.16, parts: 1.26 },
    ciqikou: { glove: null, pepper: 1.30, craft: 1.36, cured: 1.24, parts: null },
    liziba: { glove: null, pepper: 1.04, craft: 1.26, cured: 1.05, parts: null },
    nanbin: { glove: null, pepper: 1.06, craft: 1.20, cured: 1.28, parts: null }
  };

  // 容量单位：一个塞满的双肩包约 70
  const CARRY = { none: 70, bike: 240, hatchback: 800, suv: 1300 };
  const CARRY_NAME = { none: '一个双肩包', bike: '后座加踏板', hatchback: '后备箱放倒后排', suv: '整个后厢' };

  const freshState = name => ({
    version: 4, name: name || '周川', day: 1, slot: 0, location: 'home', tab: 'survive', weather: WEATHER[0],
    seed: Math.floor(Math.random() * 1e9), stock: {}, priceSeen: {}, tradeProfit: 0, tradeLoss: 0,
    money: 50, debt: 30000, paid: 0, interestPaid: 0, hunger: 72, energy: 78, health: 84, stress: 36,
    business: 0, reputation: 0, fatherVisits: 0, fatherState: '稳定',
    fatherHealth: 55, lastVisit: null, feesPaid: 0, feesMissed: 0,
    relations: { wang: 0, lin: 0, chen: 0 }, seen: {}, flags: {}, assets: {}, inventory: {},
    homeId: 'rental', vehicleId: null, physicalLoad: 0, injuryCount: 0, greyHeat: 0, detentionDays: 0,
    chronic: [], healthCap: 100, energyCap: 100, collectStage: 0, lowHealthStreak: 0, highStressStreak: 0,
    overworkCount: 0, hospitalCount: 0, seizedValue: 0, extortedTotal: 0,
    totalIncome: 0, totalExpense: 0, workIncome: 0, passiveIncome: 0, history: [], daily: { income: 0, expense: 0 }, ended: false
  });

  let state = freshState();
  let eventQueue = [];
  let inAction = false;
  let toastTimer = null;
  let soundOn = true;
  let audio = null;
  let resultCloseHandler = null;
  let actionOutcome = null;

  function addLog(label, amount, kind = 'neutral') {
    state.history.unshift({ day: state.day, label, amount: Math.round(amount), kind });
    state.history = state.history.slice(0, 80);
  }

  function money(delta, label, category = 'work') {
    state.money += delta;
    if (delta > 0) {
      state.totalIncome += delta;
      state.daily.income += delta;
      if (category === 'passive') state.passiveIncome += delta;
      else state.workIncome += delta;
      addLog(label, delta, 'good');
    } else if (delta < 0) {
      state.totalExpense += -delta;
      state.daily.expense += -delta;
      addLog(label, delta, 'bad');
    }
  }

  function modify(changes) {
    Object.entries(changes).forEach(([key, value]) => {
      if (key === 'health') state.health = clamp(state.health + value, 0, state.healthCap);
      else if (key === 'energy') state.energy = clamp(state.energy + value, 0, state.energyCap);
      else if (['hunger', 'stress'].includes(key)) state[key] = clamp(state[key] + value);
      else state[key] = (state[key] || 0) + value;
    });
  }

  function hasChronic(key) { return (state.chronic || []).includes(key); }

  function recalcCaps() {
    state.chronic = state.chronic || [];
    let hp = 100, ep = 100;
    state.chronic.forEach(k => { const c = CHRONIC[k]; if (c) { hp -= c.hp; ep -= c.ep; } });
    state.healthCap = Math.max(30, hp);
    state.energyCap = Math.max(30, ep);
    state.health = Math.min(state.health, state.healthCap);
    state.energy = Math.min(state.energy, state.energyCap);
  }

  // 落下一个新伤病；一天最多落一个，全部落下后返回 null
  function addChronic(preferred) {
    state.chronic = state.chronic || [];
    if (state.flags.chronicDay === state.day) return null;
    state.flags.chronicDay = state.day;
    let key = preferred && !hasChronic(preferred) ? preferred : null;
    if (!key) {
      const pool = Object.keys(CHRONIC).filter(k => !hasChronic(k));
      if (!pool.length) return null;
      key = pool[roll(0, pool.length - 1)];
    }
    state.chronic.push(key);
    recalcCaps();
    addLog(`落下${CHRONIC[key].name}`, 0, 'bad');
    return CHRONIC[key];
  }

  // 强制支付：现金不够的部分按 1.3 倍利滚利转成新的欠款
  function forcePay(amount, label) {
    amount = Math.round(amount);
    const cash = Math.min(Math.max(0, state.money), amount);
    if (cash > 0) money(-cash, label);
    const rest = amount - cash;
    if (rest > 0) {
      const rolled = Math.round(rest * 1.3);
      state.debt += rolled;
      addLog(`${label}（挂账计息）`, -rolled, 'bad');
      return { cash, rolled };
    }
    return { cash, rolled: 0 };
  }

  function paidRatio() { return state.paid / PRINCIPAL; }

  function playTone(kind = 'tap') {
    if (!soundOn) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const now = audio.currentTime;
      osc.type = kind === 'bad' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(kind === 'good' ? 620 : kind === 'bad' ? 150 : 360, now);
      if (kind === 'good') osc.frequency.exponentialRampToValueAtTime(840, now + .09);
      gain.gain.setValueAtTime(.035, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .13);
      osc.connect(gain).connect(audio.destination); osc.start(now); osc.stop(now + .14);
    } catch (_) { /* sound is optional */ }
  }

  function toast(text, kind = '') {
    const el = $('sceneToast');
    el.textContent = text; el.className = `scene-toast show ${kind}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'scene-toast'; }, 2400);
  }

  function snapshot() {
    return {
      day: state.day, slot: state.slot, location: state.location, money: state.money, debt: state.debt,
      hunger: state.hunger, energy: state.energy, health: state.health, stress: state.stress,
      business: state.business, reputation: state.reputation
    };
  }

  function showResult({ type = 'action', title, narrative, before, after, route = null }, onClose = null) {
    const defs = [
      ['money', '现金', value => `${value > 0 ? '+' : '-'}${fmt(Math.abs(value))}`, value => value > 0],
      ['hunger', '饱腹', value => `${value > 0 ? '+' : ''}${Math.round(value)}`, value => value > 0],
      ['energy', '体力', value => `${value > 0 ? '+' : ''}${Math.round(value)}`, value => value > 0],
      ['health', '健康', value => `${value > 0 ? '+' : ''}${Math.round(value)}`, value => value > 0],
      ['stress', '心压', value => `${value > 0 ? '+' : ''}${Math.round(value)}`, value => value < 0],
      ['business', '生意经验', value => `${value > 0 ? '+' : ''}${Math.round(value)}`, value => value > 0],
      ['reputation', '山城口碑', value => `${value > 0 ? '+' : ''}${Math.round(value)}`, value => value > 0],
      ['debt', '待还债务', value => `${value > 0 ? '+' : '-'}${fmt(Math.abs(value))}`, value => value < 0]
    ];
    const rows = defs.map(([key, label, format, good]) => {
      const value = after[key] - before[key];
      return value ? { label, value: format(value), cls: good(value) ? 'good' : 'bad' } : null;
    }).filter(Boolean);
    const crossedDay = after.day !== before.day;
    const timeValue = crossedDay ? `进入第${after.day}天` : before.slot === after.slot ? '即时' : `${SLOTS[Math.min(before.slot, SLOTS.length - 1)][0]} → ${SLOTS[Math.min(after.slot, SLOTS.length - 1)][0]}`;
    rows.unshift({ label: '时间', value: timeValue, cls: 'time' });

    const ICONS = { travel: '行', finance: '账', collect: '催', injury: '伤', action: '工' };
    const EYEBROWS = { travel: 'TRAVEL SETTLEMENT', finance: 'FINANCIAL SETTLEMENT', collect: 'DEBT COLLECTION', injury: 'BODY BREAKDOWN', action: 'ACTION SETTLEMENT' };
    $('resultIcon').textContent = ICONS[type] || '工';
    $('resultEyebrow').textContent = EYEBROWS[type] || 'ACTION SETTLEMENT';
    $('resultModal').querySelector('.result-card')?.classList.toggle('grim', type === 'collect' || type === 'injury');
    $('resultTitle').textContent = title;
    $('resultNarrative').textContent = narrative;
    const routeEl = $('resultRoute');
    if (route) {
      routeEl.hidden = false;
      routeEl.innerHTML = `<b>${route.from}</b><span class="route-arrow">→</span><span>${route.mode}</span><span class="route-arrow">→</span><b>${route.to}</b>`;
    } else {
      routeEl.hidden = true; routeEl.innerHTML = '';
    }
    $('resultDeltas').innerHTML = rows.slice(0, 6).map(row => `<div class="delta-item ${row.cls}"><span>${row.label}</span><b>${row.value}</b></div>`).join('');
    resultCloseHandler = onClose;
    $('resultModal').classList.add('open');
    playTone(type === 'travel' ? 'tap' : type === 'collect' || type === 'injury' ? 'bad' : 'good');
  }

  function closeResult() {
    $('resultModal').classList.remove('open');
    const callback = resultCloseHandler; resultCloseHandler = null;
    callback?.();
    if (!state.ended) flushEvents();
  }

  // 惩罚事件队列：结算弹窗关闭后逐条播放，避免被行动结算覆盖
  function queueEvent(ev) { eventQueue.push(ev); }

  function flushEvents() {
    if (!eventQueue.length || ['resultModal','dialogModal','genericModal','endingModal'].some(m => $(m).classList.contains('open'))) return false;
    const ev = eventQueue.shift();
    render();
    showResult(ev, () => { render(); saveGame(); ev.onClose?.(); });
    return true;
  }

  function actionNarrative(a, before, after) {
    const cash = after.money - before.money;
    if (a.id === 'sleep') return `${state.name}关掉台灯，把今天的账在心里过了一遍。窗外的山城还亮着，明天又是新的一天。`;
    if (cash > 0) return `在${LOCATIONS[before.location].name}忙完“${a.name}”，${state.name}把刚到手的钱仔细收好。这一趟没有白跑。`;
    if (cash < 0) return `${state.name}办完了“${a.name}”。钱花了出去，眼前最要紧的事也算有了着落。`;
    return `${a.desc} 时间往前走了一格，身体和心情也留下了真实的变化。`;
  }

  function saveGame(show = false) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    if (show) toast('生活已记入存档', 'good');
    updateContinue();
  }

  function updateContinue() {
    const exists = !!localStorage.getItem(SAVE_KEY);
    $('continueBtn').disabled = !exists;
  }

  function getUnlockedLocations() {
    const keys = ['home', 'wharf', 'market', 'downtown', 'hospital', 'labor'];
    if (state.day >= 3 || state.reputation >= 4) keys.push('construction');
    if (state.day >= 4 || state.reputation >= 5) keys.push('liziba');
    if (state.reputation >= 10 || state.day >= 7) keys.push('ciqikou');
    if (state.day >= 5) keys.push('nanbin');
    if (state.day >= 6 || state.business >= 14) keys.push('backstreet');
    if (state.day >= 8 || state.money >= 10000) keys.push('autocity');
    if (state.day >= 10 || state.money >= 18000) keys.push('property');
    return keys;
  }

  function currentHome() { return HOUSING[state.homeId] || HOUSING.rental; }
  function currentVehicle() { return VEHICLES[state.vehicleId] || null; }

  function syncHomeLocation() {
    const home = currentHome();
    Object.assign(LOCATIONS.home, {
      name: home.name, area: home.area, icon: home.icon, scene: home.scene,
      title: home.title, desc: home.desc,
      subtitle: state.homeId === 'rental' ? '落脚与休息' : '自住房 · 高质量休息'
    });
  }

  // 父亲的病是一条每天都在走的线：你来看他、按时交后续治疗费，它就走得慢一点
  const FATHER_STAGES = [
    { min: 78, key: 'good', name: '好转', hint: '医生说恢复得比预期快' },
    { min: 52, key: 'stable', name: '稳定', hint: '各项指标平稳' },
    { min: 30, key: 'poor', name: '欠佳', hint: '恢复得慢，人也没什么精神' },
    { min: 12, key: 'bad', name: '反复', hint: '反复发烧，夜里睡不安稳' },
    { min: -99, key: 'critical', name: '病危', hint: '已经下过一次病危通知' }
  ];
  function fatherStage() { return FATHER_STAGES.find(x => (state.fatherHealth ?? 55) >= x.min); }
  function getFatherState() { return fatherStage().name; }
  function adjustFather(v) { state.fatherHealth = clamp((state.fatherHealth ?? 55) + v, 0, 100); }
  function daysSinceVisit() { return state.lastVisit == null ? state.day : state.day - state.lastVisit; }

  // 每天的自然消耗：有人守着和没人守着，恢复速度不一样
  function fatherDailyDrift() {
    const gap = daysSinceVisit();
    let d = gap >= 6 ? -2.6 : gap >= 3 ? -1.6 : -0.8;
    if (state.feesMissed >= 2) d -= 1.2;
    else if (state.feesMissed >= 1) d -= 0.6;
    adjustFather(d);
    // 第一次跌进病危，医院会打电话
    if (state.fatherHealth < 12 && !state.flags.criticalNotice) {
      state.flags.criticalNotice = state.day;
      queueEvent({
        type: 'injury', title: '病危通知书',
        narrative: `下午三点，医院打来电话。陈晓雨的声音很稳，稳得让你更害怕——她说这种电话她一天要打好几个，但每一个对接电话的人来说都是第一次。\n\n"叔叔今天下了病危通知。不是说没救了，是说从现在起，每一天都很关键。"\n\n你捏着手机站在马路边，来往的车一辆接一辆。你想起自己借这三万块的时候，想的是"把手术做了就好了"。\n\n没有人告诉过你，手术只是开始。`,
        before: snapshot(), after: snapshot()
      });
      modify({ stress: 26 });
    }
  }

  // 补货新鲜度：最挑剔的那家店决定你多久得跑一趟解放碑
  function careWindow() {
    const keys = Object.keys(state.assets);
    return keys.length ? Math.min(...keys.map(k => ASSETS[k].care)) + (state.relations.lin >= 35 ? 2 : 0) : 99;
  }

  function supplyAge() { return state.day - (state.lastSupply ?? 0); }

  function freshness() {
    const keys = Object.keys(state.assets);
    if (!keys.length) return 1;
    if (state.lastSupply == null) return .85;   // 从来没补过货
    const age = supplyAge(), care = careWindow();
    if (age <= 1) return 1.15;
    if (age <= care) return 1;
    return Math.max(.35, 1 - (age - care) * .18);
  }

  // 名义日收益（不含波动和事故），UI 用
  function passivePerDay() {
    const raw = Object.keys(state.assets).reduce((sum, key) => sum + ASSETS[key].income - ASSETS[key].upkeep, 0);
    return Math.round(raw * freshness() * (state.flags.shopSkim ? .5 : 1));
  }

  // 每天真正结算一次：逐店摇波动、判事故
  function settleAssets() {
    const keys = Object.keys(state.assets);
    if (!keys.length) return { total: 0, lines: [], mishaps: [] };
    const fresh = freshness(), skim = state.flags.shopSkim ? .5 : 1;
    let total = 0; const lines = [], mishaps = [];
    keys.forEach(k => {
      const A = ASSETS[k];
      let net;
      const guard = state.relations.lin >= 35 ? .55 : 1;   // 林月帮你盯着
      if (Math.random() < A.mishap * guard) {
        const m = MISHAPS[roll(0, MISHAPS.length - 1)];
        net = -Math.round(A.upkeep + A.cost * (.01 + Math.random() * .035));
        mishaps.push(`${A.name}：${m.text}，这天倒亏 ${fmt(-net)}`);
      } else {
        const swing = 1 + (Math.random() * 2 - 1) * A.vol;
        net = Math.round((A.income * swing - A.upkeep) * fresh * skim);
      }
      total += net;
      lines.push({ name: A.name, net });
    });
    return { total: Math.round(total), lines, mishaps };
  }

  function stateHint() {
    const low = Math.min(state.hunger, state.energy, state.health, 100 - state.stress);
    if (low < 20) return '已经到极限';
    if (low < 40) return '需要马上调整';
    if (low < 62) return '咬牙撑着';
    return '状态还不错';
  }

  function render() {
    syncHomeLocation();
    state.fatherState = getFatherState();
    $('dayLabel').textContent = `第 ${state.day} 天`;
    $('timeLabel').textContent = `${SLOTS[Math.min(state.slot, SLOTS.length - 1)][0]} · ${SLOTS[Math.min(state.slot, SLOTS.length - 1)][1]}`;
    $('moneyValue').textContent = fmt(state.money);
    $('debtValue').textContent = fmt(state.debt);
    $('deadlineValue').textContent = state.day <= 30 ? `${30 - state.day}天` : '已到期';
    $('weatherLabel').textContent = state.weather;
    $('stateHint').textContent = stateHint();
    $('businessValue').textContent = state.business;
    $('repValue').textContent = `${state.reputation}${repLabel() ? ` (${repLabel()})` : ''}`;
    const fs = fatherStage(), gap = daysSinceVisit();
    const fEl = $('fatherValue');
    fEl.textContent = state.fatherState;
    fEl.className = fs.key === 'critical' || fs.key === 'bad' ? 'bad' : fs.key === 'good' ? 'good' : '';
    fEl.title = `${fs.hint}｜${state.lastVisit == null ? '你还一次没去过' : `${gap} 天没去了`}`;
    $('questDebt').textContent = fmt(state.debt);
    $('debtProgress').style.width = `${clamp(state.paid / Math.max(1, state.paid + state.debt) * 100)}%`;
    const rate = state.flags.ultimatum ? 10 : state.collectStage >= 3 ? 7 : 5;
    $('debtNote').textContent = state.debt === 0 ? '债已经还清。这个月剩下的每一天，都属于你自己。' : `已还 ${fmt(state.paid)}。第4天起每3天按余额 ${rate}% 利滚利（最少 ¥400）。`;
    $('repayBtn').disabled = state.debt <= 0 || state.money <= 0;
    renderThreat(); renderTime(); renderLocations(); renderScene(); renderVitals(); renderChronic(); renderAssets(); renderActions();
  }

  // 催收威胁条：明确告诉玩家下一次上门要什么、什么时候来
  function renderThreat() {
    const el = $('threatRow');
    if (!el) return;
    if (state.debt <= 0) { el.hidden = true; return; }
    const hint = nextCollectionHint();
    el.hidden = false;
    if (!hint) {
      el.className = 'threat-row danger';
      el.innerHTML = `<span class="threat-tag">最后通牒</span><p>赵坤已经不打算再谈了。到期还不上，后果不由你决定。</p>`;
      return;
    }
    const urgent = hint.days <= 1 && hint.need > 0;
    el.className = `threat-row ${state.flags.ultimatum ? 'danger' : urgent ? 'warn' : ''}`;
    el.innerHTML = hint.need <= 0
      ? `<span class="threat-tag ok">暂时安全</span><p>还款进度已经跑在赵坤前面。只要保持这个节奏，催收不会找上门。</p>`
      : `<span class="threat-tag">催收倒计时</span><p>第 <b>${hint.stage.day}</b> 天前还需再还 <b>${fmt(hint.need)}</b>，否则将面临「${hint.stage.title}」。（还剩 ${hint.days} 天）</p>`;
  }

  function renderChronic() {
    const el = $('chronicList'); const rule = $('chronicRule');
    if (!el) return;
    const list = state.chronic || [];
    const injured = isInjured();
    if (!list.length && !injured) { el.innerHTML = ''; if (rule) rule.hidden = true; return; }
    if (rule) rule.hidden = false;
    el.innerHTML = (injured ? `<div class="chronic-item hot"><span class="chronic-icon">养</span><div><b>带伤停工</b><small>今天无法从事任何工作</small></div></div>` : '')
      + list.map(k => `<div class="chronic-item"><span class="chronic-icon">${CHRONIC[k].icon}</span><div><b>${CHRONIC[k].name}</b><small>${CHRONIC[k].desc}</small></div></div>`).join('');
  }

  function renderTime() {
    $('timeDots').innerHTML = SLOTS.map((_, i) => `<i class="${i < state.slot ? 'past' : i === state.slot ? 'now' : ''}"></i>`).join('');
  }

  function renderLocations() {
    const unlocked = getUnlockedLocations();
    $('locationList').innerHTML = Object.entries(LOCATIONS).filter(([, loc]) => !loc.hidden).map(([key, loc]) => {
      const lock = !unlocked.includes(key);
      return `<button class="location-btn ${key === state.location ? 'active' : ''}" data-location="${key}" ${lock ? 'disabled' : ''}>
        <span class="loc-icon">${loc.icon}</span><span class="loc-copy"><b>${loc.name}</b><small>${loc.subtitle}</small></span><span class="loc-lock">${lock ? '未解锁' : ''}</span>
      </button>`;
    }).join('');
    document.querySelectorAll('[data-location]').forEach(btn => btn.addEventListener('click', () => travel(btn.dataset.location)));
  }

  function renderScene() {
    const loc = LOCATIONS[state.location];
    const bg = $('sceneBg');
    bg.style.backgroundImage = `url('${loc.scene}')`;
    bg.style.backgroundPosition = loc.scenePos || 'center';
    bg.style.filter = loc.filter || 'none';
    $('locationIcon').textContent = loc.icon;
    $('locationName').textContent = loc.name;
    $('sceneKicker').textContent = loc.area;
    $('sceneTitle').textContent = loc.title;
    $('sceneDesc').textContent = loc.desc;
    const stage = $('npcStage');
    if (loc.npc) {
      const npc = NPCS[loc.npc]; stage.hidden = false;
      $('npcPortrait').src = npc.portrait; $('npcPortrait').alt = `${npc.name}立绘`;
      $('npcRole').textContent = npc.role; $('npcName').textContent = npc.name;
    } else stage.hidden = true;
  }

  function renderVitals() {
    const data = [
      ['饱腹', state.hunger, 100, '饥饿会降低收入，空腹硬撑会当场晕倒'],
      ['体力', state.energy, state.energyCap, '太累无法工作，耗尽后强制送医'],
      ['健康', state.health, state.healthCap, '归零将住院；第二次归零就是终局'],
      ['心压', 100 - state.stress, 100, '连续三天心压过高会落下精神类伤病']
    ];
    $('vitals').innerHTML = data.map(([name, value, cap, hint]) => {
      const pct = clamp(value / cap * 100);
      const capped = cap < 100;
      return `<div class="vital ${pct < 22 ? 'danger' : pct < 45 ? 'warn' : ''}" title="${hint}">
      <div class="vital-top"><span>${name}${capped ? '<i class="cap-mark">上限受损</i>' : ''}</span><b>${Math.round(value)}/${cap}</b></div>
      <div class="progress-track"><i style="width:${pct}%"></i></div>
    </div>`;
    }).join('');
  }

  function renderAssets() {
    const owned = Object.keys(state.assets);
    const lifeAssets = [];
    if (state.homeId !== 'rental') lifeAssets.push(`<div class="asset-item"><span class="asset-icon">${currentHome().icon}</span><div><b>${currentHome().name}</b><small>自有住房 · 每晚恢复更好</small></div></div>`);
    if (currentVehicle()) lifeAssets.push(`<div class="asset-item"><span class="asset-icon">${currentVehicle().icon}</span><div><b>${currentVehicle().name}</b><small>${currentVehicle().desc}</small></div></div>`);
    if (state.inventory.bike) lifeAssets.push(`<div class="asset-item"><span class="asset-icon">驴</span><div><b>二手电驴</b><small>${state.flags.lockBought ? '通勤免车费 · 已换抗剪锁' : '通勤免车费 · 停在外面有被偷风险'}</small></div></div>`);
    Object.entries(state.stock || {}).forEach(([g, x]) => {
      const here = priceAt(state.location, g);
      const avg = Math.round(x.cost / x.qty);
      const mark = here ? Math.round(here.bid * slip(x.qty, depthAt(state.location, g), 'sell') - avg) * x.qty : null;
      lifeAssets.push(`<div class="asset-item"><span class="asset-icon">${GOODS[g].icon}</span><div><b>${GOODS[g].name} ${x.qty}${GOODS[g].unit}</b><small>均价 ${fmt(avg)} · 占位 ${x.qty * GOODS[g].bulk}${mark === null ? ' · 此地不收' : ` · 此地出货${mark >= 0 ? '赚' : '亏'} ${fmt(Math.abs(mark))}`}</small></div></div>`);
    });
    if (!owned.length && !lifeAssets.length) {
      $('assetList').innerHTML = `<div class="asset-item"><span class="asset-icon">空</span><div><b>还没有经营资产</b><small>去老街认识林月，学习摆摊</small></div></div>`;
      return;
    }
    const age = supplyAge(), care = careWindow(), fresh = Math.round(freshness() * 100);
    $('assetList').innerHTML = lifeAssets.join('') + owned.map(key => {
      const A = ASSETS[key];
      const warn = age > care ? `<span class="cap-mark">缺货 ${fresh}%</span>` : '';
      return `<div class="asset-item"><span class="asset-icon">${A.icon}</span><div><b>${A.name}${warn}</b><small>${A.desc}${state.flags.shopSkim ? ' · 流水被抽走一半' : ''}</small></div></div>`;
    }).join('') + (owned.length ? `<div class="asset-item"><span class="asset-icon">补</span><div><b>${state.lastSupply == null ? '还没补过货' : age === 0 ? '今天刚补过货' : `${age} 天没补货`}</b><small>${age > care ? '收益正在下滑，去解放碑补货' : `最多能顶 ${care} 天 · 当前产能 ${fresh}%`}</small></div></div>` : '');
  }

  // ===== 运力 =====
  // 有车/有电驴，跑量的活就能多接几单、少走几趟坡。
  // road=常规配送，alley=坡坎老街（汽车进不去，电驴最强），bulk=拉货补货（汽车装得多）
  const HAUL_GAIN = {
    road:  { bike: 1.35, car: 1.60 },
    alley: { bike: 1.42, car: 1.12 },
    bulk:  { bike: 1.20, car: 1.75 }
  };

  function haul(kind = 'road') {
    const table = HAUL_GAIN[kind] || HAUL_GAIN.road;
    const v = currentVehicle();
    if (v && state.money >= v.fuel) {
      const legPenalty = hasChronic('leg') ? 1 : 1;
      return { key: 'car', name: v.name, income: table.car * legPenalty, energy: .62, fuel: v.fuel, tag: `${v.name}拉货` };
    }
    if (state.inventory.bike) {
      // 腿伤会让骑车也变吃力，但仍然比走路强
      return { key: 'bike', name: '二手电驴', income: table.bike, energy: hasChronic('leg') ? .92 : .78, fuel: 0, tag: '电驴跑单' };
    }
    return { key: 'none', name: '步行', income: 1, energy: 1, fuel: 0, tag: '全靠走和扛' };
  }

  // 按运力换算收入区间与体力消耗，并给出可直接显示的收益文案
  function hauled(kind, min, max, energy) {
    const h = haul(kind);
    const lo = Math.round(min * h.income), hi = Math.round(max * h.income);
    const en = Math.round(energy * h.energy);
    const bonus = h.key === 'none' ? '' : ` · ${h.tag} +${Math.round((h.income - 1) * 100)}%`;
    return { h, lo, hi, en, roll: () => roll(lo, hi), gain: `收入 ¥${lo.toLocaleString()}–${hi.toLocaleString()}${bonus}` };
  }

  // ===== 行情 =====
  // 同一天同一地同一种货，价格是定死的；换一天就重新洗牌。存档之间也不一样。
  function priceNoise(day, loc, good) {
    let h = 2166136261;
    const str = `${state.seed || 0}|${day}|${loc}|${good}`;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return .78 + ((h >>> 0) % 1000) / 1000 * .48;
  }

  function priceAt(loc, good, day = state.day) {
    const bias = MARKET_BIAS[loc]?.[good];
    if (!bias) return null;
    const n = priceNoise(day, loc, good);
    const ask = Math.max(1, Math.round(GOODS[good].base * bias * n));   // 你进货要付
    const rep = 1 + clamp(state.reputation, -25, 60) * .002;             // 人熟好说话
    return { ask, bid: Math.max(1, Math.round(ask * .92 * rep)), heat: n }; // bid 是别人收你的价
  }

  function priceTag(p) {
    if (!p) return null;
    if (p.heat >= 1.14) return { text: '抢手', cls: 'hot' };
    if (p.heat <= .88) return { text: '低迷', cls: 'cold' };
    return null;
  }

  // 一天之内，这个地方大概能吃下多少货。超过这个量，价格就会被你自己压下去
  function depthAt(loc, good, day = state.day) {
    const size = MARKET_SIZE[loc] || 1;
    const n = .75 + priceNoise(day + 777, loc, good + '_d') * .5;
    return Math.max(6, Math.round(GOODS[good].depth * size * n));
  }

  // 超出当地胃口的部分，买要加价、卖要压价
  function slip(qty, depth, dir) {
    const excess = Math.max(0, qty - depth) / depth;
    if (dir === 'buy') return 1 + Math.min(.55, excess * .32);
    return 1 - Math.min(.48, excess * .3);
  }

  function tradesHere(loc = state.location) { return Object.keys(GOODS).filter(g => MARKET_BIAS[loc]?.[g]); }
  function carryKey() { return state.vehicleId || (state.inventory.bike ? 'bike' : 'none'); }
  function carryCap() { return CARRY[carryKey()]; }
  function carryUsed() { return Object.entries(state.stock || {}).reduce((sum, [g, x]) => sum + x.qty * (GOODS[g]?.bulk || 1), 0); }
  function stockValue() { return Object.values(state.stock || {}).reduce((s, x) => s + x.cost, 0); }
  // 生意经验够高才看得出残次品
  function canInspect() { return state.business >= 30; }

  function canWork() { return state.energy >= 13 && state.hunger >= 10 && state.health >= 18 && !isInjured(); }
  function isInjured() { return (state.flags.injuredUntil || 0) >= state.day; }
  function hasMet(id) { return !!state.seen[`meet_${id}`]; }

  function action(id, icon, name, desc, gain, opts = {}) {
    // once: 每天只能做一次的人情 / 调节类行动，避免无限刷
    const used = !!opts.once && state.flags[`once_${id}`] === state.day;
    return {
      id, icon, name, desc, gain, time: opts.time ?? 1, cost: opts.cost || 0,
      physical: !!opts.physical, grey: !!opts.grey, random: opts.random !== false,
      once: !!opts.once, disabled: opts.disabled || used,
      reason: used ? '今天已经做过一次了，明天再来' : (opts.reason || ''),
      settle: opts.settle !== false, run: opts.run
    };
  }

  function availableActions() {
    const workDisabled = !canWork();
    const mealGain = hasChronic('stomach') ? 22 : 32;
    const commonMeal = action('meal', '食', '吃一碗小面', hasChronic('stomach') ? '胃病之后，热汤下去也顶不了太久。' : '让热汤把人重新拉回来。', `饱腹 +${mealGain} · 体力 +5`, { time: 0, cost: 12, run: () => modify({ hunger: mealGain, energy: 5, stress: -3 }) });
    const actions = { survive: [], hustle: [], social: [] };
    // 跑货：只要这个地点有行情，生意页就多一个入口
    const tradeAction = (() => {
      const list = tradesHere();
      if (!list.length) return null;
      const best = list.map(g => ({ g, p: priceAt(state.location, g) })).sort((x, y) => y.p.heat - x.p.heat)[0];
      const held = carryUsed();
      return action('trade', '货', '看行情 · 跑货', held ? `手上压着 ${Object.entries(state.stock).map(([g, x]) => `${GOODS[g].name}${x.qty}${GOODS[g].unit}`).join('、')}。找地方出手，别放过夜。` : '低价进货，拉到肯出价的地方卖掉。行情每天都在动，当地一天也吃不下太多货。', `${LOCATIONS[state.location].name}今日${priceTag(best.p)?.text === '抢手' ? '抢手' : '主打'}：${GOODS[best.g].name} ${fmt(best.p.ask)}`, { time: 0, settle: false, random: false, run: showTrade });
    })();

    if (state.location === 'home') {
      const home = currentHome();
      actions.survive = [
        (() => {
          const base = state.homeId === 'rental' ? 38 : state.homeId === 'starter' ? 48 : 58;
          const gain = Math.round(base * (hasChronic('insomnia') ? .6 : 1));
          return action('rest', '眠', state.homeId === 'rental' ? '合眼休息' : '在自己家休息', hasChronic('insomnia') ? '躺下了，但脑子里全是数字。天亮时比睡前更累。' : state.homeId === 'rental' ? '在硬板床上睡一阵，恢复体力。' : '安静、踏实的一觉，比出租屋恢复得更好。', `体力 +${gain} · 健康 +${state.homeId === 'rental' ? 4 : 7}`, { run: () => modify({ energy: gain, health: state.homeId === 'rental' ? 4 : 7, hunger: -8, stress: home.stress - 5 }) });
        })(),
        action('cook', '食', '煮一碗挂面', '比街边便宜，但也只能填肚子。', '饱腹 +27', { time: 0, cost: 6, run: () => modify({ hunger: hasChronic('stomach') ? 19 : 27, stress: -2 }) }),
        action('smoke', '烟', '在楼道口坐一会', '不打算什么，也不算什么。只是让胸口那股劲先松开。', '心压 -10 · 健康 -1 · 每天限一次', { time: 0, settle: false, random: false, disabled: state.flags.smokeDay === state.day, reason: '今天已经缓过一次了', run: () => { state.flags.smokeDay = state.day; modify({ stress: -10, health: -1 }); toast('楼道里的风从坡下吹上来。什么都没解决，但能再走一段。'); } }),
        action('sleep', '夜', '提前收工', '结束今天，给身体完整休息。', '直接进入下一天', { time: 0, run: () => endDay(true) })
      ];
      actions.hustle = [
        action('online', '单', '接线上零活', '替小店录表、修图、写商品介绍。', '收入 ¥110–180 · 生意经验 +2', { disabled: workDisabled, run: () => earn(roll(110, 180), '线上零活', { energy: -13, hunger: -8, stress: 4, business: 2 }) }),
        action('resell', '转', '倒腾二手小电器', '跑旧货市场，挑货后在同城转卖。', '净收益 ¥190–330 · 有小概率踩坑', { cost: 120, disabled: state.business < 5, reason: '生意经验达到5后解锁', run: () => {
          if (Math.random() < .16) { modify({ stress: 8, business: 2 }); toast('收到一件坏货，只勉强收回 ¥40', 'bad'); return money(40, '二手坏货回款'); }
          const revenue = roll(310, 450); money(revenue, '二手转卖回款'); modify({ energy: -10, hunger: -7, business: 4, reputation: 1 });
        }}),
        action('study', '账', '研究生意账本', '复盘成本、客流和利润，不花钱买教训。', '生意经验 +6 · 心压 -3', { once: true, run: () => modify({ energy: -6, hunger: -5, business: 6, stress: -3 }) })
      ];
      actions.social = [
        action('callfather', '话', '给父亲打电话', '报喜不报忧，听听他的声音。', '心压 -12 · 父亲更安心', { once: true, run: () => { modify({ stress: -12 }); state.flags.calledFather = state.day; toast('“我挺好的。你别操心我。”', 'good'); } }),
        action('helpHand', '援', '受街坊照应', '这一个月你帮过的人，开始回头帮你。有人给你留活路，有人给你留饭。', '收入 ¥120–260 · 心压 -8 · 口碑越高给得越多', { once: true, disabled: state.reputation < 20, reason: '口碑达到 20，街坊才会主动找上门', run: () => {
          const gift = roll(120, 200) + state.reputation * 3;
          money(gift, '街坊照应'); modify({ stress: -8, hunger: 12, energy: 3 });
          actionOutcome = { type:'finance', title:'街坊照应', narrative:`早上开门，台阶上放着一个塑料袋：两个馒头、一小袋腌菜，还有一张对折的纸条，上面是个电话号码和三个字"缺人手"。\n\n中午楼下面馆的老板娘拦住你，说有个亲戚要搬家，工钱当场结，问你干不干。\n\n${fmt(gift)}。这一个月你帮过的每一个人，都记着。（口碑 ${state.reputation}）` };
        } }),
        action('neighbor', '邻', state.homeId === 'rental' ? '帮房东搬东西' : '帮邻居搬东西', '楼上楼下，都是日后能照应的人。', '口碑 +3 · 收入 ¥45', { once: true, disabled: workDisabled, physical: true, run: () => earn(45, '邻里帮工', { energy: -9, hunger: -6, reputation: 3 }) })
      ];
    }

    if (state.location === 'wharf') {
      actions.survive = [
        action('porter', '箱', '扛货上坡', '一趟一趟，把江边货物送上装卸区。', `收入 ¥${hasMet('wang') ? '190–230' : '150–180'} · 连干有受伤风险`, { disabled: workDisabled, physical: true, run: () => earn(roll(hasMet('wang') ? 190 : 150, hasMet('wang') ? 230 : 180), '码头扛货', { energy: -24, hunger: -17, health: -2 }) }),
        action('freight', '车', '跟车卸整批货', '王强信得过的人，才会叫上这一班。', '收入 ¥300–360 · 连干易受伤', { disabled: workDisabled || state.relations.wang < 12, reason: '王强关系达到12后解锁', physical: true, run: () => earn(roll(300, 360), '整批货运', { energy: -34, hunger: -22, health: -4, stress: 4 }) }), commonMeal
      ];
      actions.hustle = [
        (() => { const H = hauled('bulk', 55, 95, 12); return action('boxes', '纸', '回收纸箱', H.h.key==='none'?'把散落的硬纸板扎好，抱到回收站去。一次抱不了多少。':`把散落的硬纸板扎好，用${H.h.name}一趟拉到回收站，比抱着走能多收好几捆。`, `${H.gain} · 口碑 +1`, { disabled: workDisabled, run: () => { if (H.h.fuel) money(-H.h.fuel, `${H.h.name}油费`); earn(H.roll(), '纸箱回收', { energy: -H.en, hunger: -8, reputation: 1 }); } }); })(),
        action('loadingTeam', '队', '组织临时装卸队', '替工头凑人、排班、结算，从中拿管理费。', '收入 ¥420–560 · 生意经验 +5', { disabled: state.relations.wang < 24 || state.business < 18, reason: '需要王强关系24、生意经验18', run: () => earn(roll(420,560), '临时装卸队', { energy:-18,hunger:-13,business:5,reputation:2,stress:5 }) })
      ];
      actions.social = [action('talkWang', '王', hasMet('wang') ? '和王强聊几句' : '认识码头工头', '他知道哪里缺人，也看得出谁肯下力。', hasMet('wang') ? '关系提升 · 每天限一次' : '关系提升 · 解锁高薪货运', { time: hasMet('wang') ? 1 : 0, once: hasMet('wang'), settle: false, run: () => talkWang() })];
    }

    if (state.location === 'market') {
      actions.survive = [
        action('dishwash', '碗', '面馆帮工', '洗碗、切葱、端面，忙过早市这一阵。', '收入 ¥130–170 · 林月关系 +1', { disabled: workDisabled, physical: true, run: () => { earn(roll(130,170),'面馆帮工',{energy:-18,hunger:-13}); state.relations.lin += 1; } }), commonMeal,
        (() => { const H = hauled('alley', 110, 150, 17); return action('veg', '菜', '替摊主送菜', H.h.key==='none'?'推着菜筐爬过两条坡街，一趟只能送一家。':H.h.key==='bike'?'菜筐往后座一绑，两条坡街来回，一上午能多跑好几家。':`${H.h.name}后备箱一次装得下三家的量，但小巷子开不进去，只能停在路口再搬。`, `${H.gain} · 口碑 +2`, { disabled: workDisabled, physical: H.h.key!=='car', run: () => { if (H.h.fuel) money(-H.h.fuel, `${H.h.name}油费`); earn(H.roll(),'市场送菜',{energy:-H.en,hunger:-11,reputation:2}); } }); })()
      ];
      actions.hustle = [
        (() => { const H = hauled('bulk', 360, 540, 19); const stallCost = state.relations.lin >= 15 ? 55 : 100; return action('streetStall', '摊', '摆一次流动小摊', H.h.key==='none'?'按林月教的办法，卖冰粉和凉虾。摊具和货只能拎多少算多少。':`按林月教的办法卖冰粉凉虾。用${H.h.name}拉货，一次能多带不少备货，也不用来回跑。`, `净收益约 ¥${(H.lo-stallCost).toLocaleString()}–${(H.hi-stallCost).toLocaleString()} · 生意经验 +5${state.relations.lin>=15?' · 林月借摊具':''}${H.h.key==='none'?'':` · ${H.h.tag}`}`, { cost: stallCost, disabled: !hasMet('lin') || workDisabled, reason: '先认识林月', run: () => { if (H.h.fuel) money(-H.h.fuel, `${H.h.name}油费`); money(H.roll(),'流动小摊回款'); modify({energy:-H.en,hunger:-14,business:5,reputation:2,stress:3}); } }); })(),
        action('invest', '店', '投资经营项目', '把积蓄变成每天能产生现金流的资产。', `当前日收益 ${fmt(passivePerDay())}`, { time: 0, settle: false, disabled: !hasMet('lin'), reason: '先认识林月', run: () => showInvestments() })
      ];
      actions.social = [action('talkLin', '林', hasMet('lin') ? '向林月请教' : '认识面馆老板', '她算账很快，也愿意给肯做事的人指路。', hasMet('lin') ? '关系提升 · 每天限一次' : '关系提升 · 生意经验', { time: hasMet('lin') ? 1 : 0, once: hasMet('lin'), settle: false, run: () => talkLin() })];
    }

    if (state.location === 'downtown') {
      actions.survive = [
        action('flyer', '宣', '商场促销', '穿玩偶服、举牌、发传单，按班结钱。', '收入 ¥150–190', { disabled: workDisabled, run: () => earn(roll(150,190),'商场促销',{energy:-17,hunger:-12,stress:5}) }),
        (() => { const H = hauled('road', 210, 270, 26); const rent = H.h.key==='none' ? 35 : 0; return action('delivery', '骑', H.h.key==='none'?'租车跑配送':`跑同城配送（${H.h.name}）`, H.h.key==='none'?'每天先交三十五块租车费，剩下的才是自己的。':`穿过坡路和雨巷，准时比什么都重要。有自己的${H.h.name}，不用交租车费，一小时也能多压两单。`, `${H.gain}${rent?` · 扣租车费 ¥${rent}`:''}`, { disabled: workDisabled, cost: rent, run: () => { if (H.h.fuel) money(-H.h.fuel, `${H.h.name}油费`); earn(H.roll(),'同城配送',{energy:-H.en,hunger:-18,health:-2,reputation:1}); } }); })(), commonMeal
      ];
      actions.hustle = [
        action('buyBike','车',state.inventory.bike?'自己的二手电驴':'买二手电驴','跑配送不用再租车，通勤也不用再买票、不用赶末班。但停在外面就有被偷的风险。',state.inventory.bike?'已拥有 · 通勤免车费':'花费 ¥680 · 通勤免车费',{time:0,cost:state.inventory.bike?0:680,disabled:!!state.inventory.bike,reason:'已经购买',run:()=>{state.inventory.bike=true;actionOutcome={type:'finance',title:'二手电驴 · 过户',narrative:`车主是个跑完两年外卖准备回老家的小伙子，六百八，连头盔一起给你。电池衰减得厉害，但坡道还爬得动。\n\n从今天起你不用再等公交、不用再赶末班、也不用每趟掏那两三块钱。代价是：这东西停在街边，随时可能不见。`};}}),
        action('buyLock','锁',state.flags.lockBought?'已经换了好锁':'配一把抗剪链条锁','菜市场那种十几块的锁，剪断只要三秒。','明显降低电驴被偷概率',{time:0,cost:state.flags.lockBought?0:120,disabled:!state.inventory.bike||!!state.flags.lockBought,reason:state.flags.lockBought?'已经换过了':'先有一辆电驴',run:()=>{state.flags.lockBought=true;actionOutcome={type:'finance',title:'一把好锁',narrative:`一百二，比车价的零头还少，但摊主说这把锁剪起来至少要两分钟——两分钟在街上足够引来人。\n\n你把旧锁扔进了垃圾桶。（电驴被偷概率明显下降）`};}}),
        (() => {
          const H = haul('bulk'); const has = Object.keys(state.assets).length;
          const age = supplyAge(), care = careWindow(), fee = 120 + Object.keys(state.assets).reduce((s,k)=>s+Math.round(ASSETS[k].upkeep*.6),0);
          return action('supply','货', has ? '给自己的店铺补货' : '给自己的摊位补货',
            !has ? '先有自己的经营资产，才谈得上补货。' : age > care ? `已经 ${age} 天没补货，货架空了，收益只剩 ${Math.round(freshness()*100)}%。今天必须跑一趟。` : `比较商圈批发价，把货拉回各家店。${H.key==='none'?'没有车，一次只能拎回一点。':`用${H.name}一次拉够，压价空间也更大。`}`,
            has ? `恢复满产并额外 +15% · 最多顶 ${care} 天` : '需要先投资经营项目',
            { disabled: !has || state.lastSupply === state.day, reason: state.lastSupply === state.day ? '今天已经补过货了' : '需要经营资产', cost: fee,
              run: () => { if (H.fuel) money(-H.fuel, `${H.name}油费`); state.lastSupply = state.day; state.flags.staleWarned = false; modify({ business: 3, energy: -Math.round(9 * H.energy), hunger: -6 }); } });
        })(),
        action('rideshare','网',currentVehicle()?'开网约车接单':'开网约车接单','利用自己的汽车跑高峰订单。',currentVehicle()?`收入 ${fmt(currentVehicle().rideIncome[0])}–${fmt(currentVehicle().rideIncome[1])} · 扣油费`:'需要先去4S店买车',{disabled:!currentVehicle()||workDisabled,reason:'需要拥有汽车且状态足够',cost:currentVehicle()?currentVehicle().fuel*3:0,run:()=>earn(roll(...currentVehicle().rideIncome),'网约车订单',{energy:-18,hunger:-13,stress:6,reputation:1})})
      ];
      actions.social = [action('observe','看','观察商圈客流','记下雨天、饭点和写字楼下的真实人流。','生意经验 +5 · 口碑 +1',{ once: true,run:()=>modify({business:5,reputation:1,energy:-7,hunger:-5})})];
    }

    if (state.location === 'hospital') {
      actions.survive = [
        (() => {
          const gap = daysSinceVisit(), st = fatherStage();
          const gain = gap >= 6 ? 11 : gap >= 3 ? 9 : 6;
          return action('visit', '陪', '陪父亲坐一会', state.lastVisit == null ? '你还一次没来过。他嘴上不会说，护士都看在眼里。' : gap >= 6 ? `已经 ${gap} 天没来了。床头的水果换过两轮，都不是你带的。` : '带点水果，听医生交代恢复情况。', `父亲病情 +${gain} · 心压 -14 · 每天限一次`, { once: true, cost: 35, run: () => {
            state.fatherVisits += 1; state.lastVisit = state.day; adjustFather(gain);
            modify({ energy:-8, hunger:-6, stress:-14, reputation:1 }); state.relations.chen += 1;
            const st2 = fatherStage();
            actionOutcome = { type:'action', title:`探视 · 第 ${state.fatherVisits} 次`, narrative: st2.key === 'critical'
              ? `他大部分时间在睡。你握着他的手坐了四十分钟，他中途醒过一次，看清是你之后说了两个字："回去。"\n\n然后又闭上眼。你在走廊上站了很久才走。`
              : state.fatherVisits === 1
              ? `他见到你的第一句话是"你怎么来了，不用上班？"，第二句是"钱够不够用"。\n\n你说够。他没再问，但整个下午都比平时精神。护士说家属来过的病人，配合度都不一样。（${st2.hint}）`
              : `削了个苹果，听医生交代了几句注意事项。他问了两遍你住的地方漏不漏雨。\n\n临走时他从枕头底下摸出两百块要塞给你，你没要。他生气了一会儿，又睡着了。（${st2.hint}）` };
          } });
        })(),
        action('checkup', '诊', '给自己做检查', '小病拖成大病，才是真的花不起。', '健康 +28 · 心压 -6', { cost: 160, run: () => modify({health:28,stress:-6,energy:-3}) }),
        action('treatStd', '静', '去皮肤科挂个号', '有些病拖不得，也不必羞于治。挂号的时候你把口罩往上拉了拉。', '治好性传播感染 · 心压 +8', { cost: 1400, time: 1, disabled: !hasChronic('std'), reason: '目前用不上', run: () => {
          state.chronic = state.chronic.filter(k => k !== 'std'); recalcCaps();
          modify({ health: 12, stress: 8 });
          actionOutcome = { type:'injury', title:'皮肤科 · 一个疗程', narrative:`医生看了化验单，语气很平常："常见病，按疗程吃药就行，别喝酒别熬夜。"没有多问一句你是怎么得的。\n\n${fmt(1400)}，抓药、复查、一周的量。走出门诊楼的时候你反而松了口气——最难的那一步是挂号，不是治病。` };
        } }),
        action('rehab', '复', '做一个复健疗程', '慢性伤病不会自己好。想拿回被压掉的上限，只有一条路，而且很贵。', '移除一项慢性伤病 · 恢复身体上限', { cost: 2600, time: 2, disabled: !(state.chronic||[]).length, reason: '目前还没有落下慢性伤病', run: () => {
          const key = state.chronic.shift(); recalcCaps();
          modify({ health: 10, stress: -10, energy: -10, hunger: -8 });
          actionOutcome = { type:'injury', title:`复健完成 · ${CHRONIC[key].name}`, narrative:`两个疗程，${fmt(2600)}，比你干十天活还多。理疗师说恢复得不错，${CHRONIC[key].name}的影响基本消掉了。\n\n你躺在治疗床上算了一笔账：这笔钱本可以还债。但身体是唯一还在替你挣钱的东西——修它，不算浪费。` };
        } }), commonMeal
      ];
      actions.hustle = [action('caregiver','护','做临时护工','在护工站帮一班翻身、送检和跑腿。','收入 ¥230–290 · 很耗精神',{disabled:workDisabled||state.relations.chen<8,reason:'陈晓雨关系达到8后解锁',run:()=>earn(roll(230,290),'临时护工',{energy:-22,hunger:-14,stress:8,reputation:2})})];
      actions.social = [action('talkChen','陈',hasMet('chen')?'询问恢复情况':'认识值班护士','她不会说空话，但会把每一项注意事项讲清楚。',hasMet('chen')?'关系提升 · 每天限一次':'关系提升 · 获得健康建议',{time:hasMet('chen')?1:0,once:hasMet('chen'),settle:false,run:()=>talkChen()})];
    }

    if (state.location === 'ciqikou') {
      actions.survive = [
        action('guide','路','带游客走后街','避开拥挤主街，讲几段真正的山城故事。','收入 ¥200–270 · 口碑 +3',{disabled:workDisabled||state.reputation<10,reason:'口碑达到10后解锁',run:()=>earn(roll(200,270),'后街向导',{energy:-15,hunger:-10,reputation:3})}), commonMeal
      ];
      actions.hustle = [(() => { const H = hauled('bulk', 500, 700, 18); return action('souvenir','物','卖手作山城冰箱贴', H.h.key==='none'?'小批进货，在后街摆一轮游客生意。进多了背不动。':`小批进货，在后街摆一轮游客生意。有${H.h.name}就能一次进够一天的量。`, `净收益 ¥${(H.lo-140).toLocaleString()}–${(H.hi-140).toLocaleString()} · 生意经验 +6${H.h.key==='none'?'':` · ${H.h.tag}`}`,{cost:140,disabled:workDisabled||state.reputation<14,reason:'口碑达到14后解锁',run:()=>{ if (H.h.fuel) money(-H.h.fuel, `${H.h.name}油费`); money(H.roll(),'游客小摊回款');modify({energy:-H.en,hunger:-13,business:6,reputation:2});}}); })()];
      actions.social = [action('listen','茶','在老茶馆听故事','听棒棒、店主和老住户谈这座城。','心压 -10 · 口碑 +2',{ once: true,cost:18,run:()=>modify({stress:-10,reputation:2,hunger:5})})];
    }

    if (state.location === 'liziba') {
      actions.survive = [
        (() => { const H = hauled('alley', 260, 330, 28); return action('slopeDelivery','坡','跑坡道急送', H.h.key==='none'?'最难走的单，平台补贴也最高。全程靠腿。':H.h.key==='bike'?'最难走的单，补贴也最高。电驴在这种坡坎巷子里，比汽车快得多。':`最难走的单。${H.h.name}上不去这些梯坎，大半路程还是得停车走上去，优势有限。`, H.gain, {disabled:workDisabled,run:()=>{ if (H.h.fuel) money(-H.h.fuel, `${H.h.name}油费`); earn(H.roll(),'坡道急送',{energy:-H.en,hunger:-18,health:-2,reputation:1}); }}); })(),
        action('photoHelp','影','给旅拍摊打下手','打反光板、整理服装、替客人排队。','收入 ¥160–210 · 生意经验 +2',{disabled:workDisabled,run:()=>earn(roll(160,210),'旅拍帮工',{energy:-14,hunger:-9,business:2})}), commonMeal
      ];
      actions.hustle = [action('shootRoute','图','制作山城路线图','拍下坡坎、机位和小店，卖给民宿做手册。','收入 ¥300–460 · 生意经验 +7',{disabled:state.business<16,reason:'生意经验达到16后解锁',run:()=>earn(roll(300,460),'路线手册',{energy:-18,hunger:-12,business:7,reputation:3})})];
      actions.social = [action('helpTourist','问','替迷路游客指路','在八楼走到一楼，是山城的日常。','口碑 +4',{ once: true,run:()=>modify({reputation:4,energy:-5,hunger:-3})})];
    }

    if (state.location === 'nanbin') {
      actions.survive = [
        action('nightGuard','夜','展会夜班撤场','拆展架、清点物料，赶在清晨前交场。','收入 ¥300–380 · 连干有受伤风险',{disabled:workDisabled||state.slot<3,reason:'午后以后才能开工',physical:true,run:()=>earn(roll(300,380),'展会撤场',{energy:-30,hunger:-18,health:-3,stress:5})}), commonMeal
      ];
      actions.hustle = [(() => { const H = hauled('bulk', 570, 800, 23); return action('nightStall','灯','经营江边夜摊', H.h.key==='none'?'卖冰粉和饮料，靠夜景人流走量。收摊后还得赶末班车。':`卖冰粉和饮料，靠夜景人流走量。有${H.h.name}就能多备货，收摊再晚也不怕没车回。`, `净收益 ¥${(H.lo-150).toLocaleString()}–${(H.hi-150).toLocaleString()} · 生意经验 +7${H.h.key==='none'?'':` · ${H.h.tag}`}`,{cost:150,disabled:!hasMet('lin')||workDisabled,reason:'先认识林月',run:()=>{ if (H.h.fuel) money(-H.h.fuel, `${H.h.name}油费`); money(H.roll(),'江边夜摊回款');modify({energy:-H.en,hunger:-15,business:7,reputation:2,stress:3});}}); })()];
      actions.social = [action('river','风','沿江走一段','暂时不想账单，只看对岸一盏盏灯。','心压 -18 · 健康 +3',{ once: true,run:()=>modify({stress:-18,health:3,energy:-4,hunger:-4})})];
    }

    if (state.location === 'labor') {
      actions.survive = [
        action('dayLabor','帽','抢一班日结零工','跟劳务车去仓库分拣建材，当天结账。','收入 ¥210–270 · 体力活',{disabled:workDisabled,physical:true,run:()=>earn(roll(210,270),'劳务市场日结',{energy:-25,hunger:-17,health:-2,stress:3})}),
        action('cleaning','扫','商场闭店保洁','做完一层公共区和货梯间，按班结钱。','收入 ¥170–220',{disabled:workDisabled,physical:true,run:()=>earn(roll(170,220),'闭店保洁',{energy:-20,hunger:-13,reputation:1})}), commonMeal
      ];
      actions.hustle = [action('recruit','簿','替工头登记临工','核名单、排车辆、确认工种，从中拿协调费。','收入 ¥280–360 · 生意经验 +4',{disabled:state.business<12,reason:'生意经验达到12后解锁',run:()=>earn(roll(280,360),'临工协调费',{energy:-11,hunger:-8,business:4,stress:5})})];
      actions.social = [action('askSafety','安','听安全员讲注意事项','记住吊装区、临边和疲劳作业的风险。','健康 +4 · 降低本日受伤风险',{ once: true,run:()=>{modify({health:4,stress:-3});state.flags.safetyBrief=state.day;}})];
    }

    if (state.location === 'construction') {
      actions.survive = [
        action('brick','砖','搬运砌块','钱按量算，越赶越容易在湿滑跳板上失手。','收入 ¥340–430 · 高受伤风险',{disabled:workDisabled,physical:true,run:()=>earn(roll(340,430),'工地搬运',{energy:-34,hunger:-22,health:-4,stress:5})}),
        action('rebar','筋','钢筋场下料帮工','抬料、归堆、清点，干满一班现金结算。','收入 ¥390–480 · 高受伤风险',{disabled:workDisabled||state.energy<35,reason:'体力至少35',physical:true,run:()=>earn(roll(390,480),'钢筋场帮工',{energy:-38,hunger:-23,health:-5,stress:7})}), commonMeal
      ];
      actions.hustle = [action('crewLead','队','承包一组清场活','你负责找人、分工和验收，赚组织差价。','收入 ¥620–820 · 生意经验 +6',{disabled:state.business<25||state.reputation<12,reason:'需要经验25、口碑12',physical:true,run:()=>earn(roll(620,820),'清场承包',{energy:-25,hunger:-17,business:6,reputation:2,stress:8})})];
      actions.social = [action('refuseRisk','停','拒绝违章赶工','少挣一班钱，但把安全和口碑守住。','健康 +5 · 口碑 +3',{ once: true,run:()=>{modify({health:5,reputation:3,stress:-6});state.physicalLoad=Math.max(0,state.physicalLoad-2);}})];
    }

    if (state.location === 'backstreet') {
      actions.survive = [commonMeal, action('leaveGrey','退','转身离开后巷','快钱不拿，也就不用赌巡查什么时候来。','心压 -6 · 口碑 +1',{ once: true,run:()=>modify({stress:-6,reputation:1})})];
      actions.hustle = [
        action('adultDiscs','碟','倒卖成人影碟','从旧影像摊接一批货，卖给成年买家。违法收益高，可能被查处。','净回款 ¥650–1,050 · 查处风险',{cost:300,disabled:state.business<12,reason:'生意经验达到12后解锁',grey:true,random:false,run:()=>runGreyBusiness('成人影碟倒卖',roll(650,1050),.22)}),
        action('nightIntro','夜','替夜场介绍成年客人','只拿介绍费，不接触具体交易；仍可能因扰乱秩序被查处。','收入 ¥450–850 · 查处风险',{disabled:state.slot<5||state.business<18,reason:'傍晚以后且经验18',grey:true,random:false,run:()=>runGreyBusiness('夜场揽客介绍费',roll(450,850),.28)}),
        action('channelGoods','货','倒卖来路不明的渠道货','利润可观，但假货和联合检查都会让成本失控。','净回款 ¥800–1,300 · 高风险',{cost:420,disabled:state.business<28,reason:'生意经验达到28后解锁',grey:true,random:false,run:()=>runGreyBusiness('渠道货倒卖',roll(800,1300),.34)})
      ];
      actions.social = [
        action('company','夜','找个人过夜','花钱买半小时不用想债的时间。这条街上做这个生意犯法，也有别的代价。','心压 -30 · 有被查处和染病的风险 · 每天限一次',{ once: true, cost: 280, disabled: state.slot < 4, reason: '傍晚以后才有人', random: false, run: () => runNightCompany() }),
        action('observePatrol','灯','观察巡查动向','不做交易，只记下这条街的风险。','生意经验 +2 · 灰色风险 -2',{ once: true,run:()=>{modify({business:2,stress:2});state.greyHeat=Math.max(0,state.greyHeat-2);}})];
    }

    if (state.location === 'property') {
      actions.survive = [action('viewHouse','房','查看可购住房','比较总价、持有开支和每晚恢复效果。','可购买或置换住房',{time:0,settle:false,random:false,run:showHousing}), commonMeal];
      actions.hustle = [action('propertyFlyer','单','替楼盘派单','在商圈登记意向客户，按有效电话结算。','收入 ¥190–260',{disabled:workDisabled,run:()=>earn(roll(190,260),'楼盘派单',{energy:-16,hunger:-11,stress:5,business:1})})];
      actions.social = [action('mortgageLesson','算','请置业顾问算持有成本','只看总价不够，还要算水电、物业和机会成本。','生意经验 +5',{ once: true,run:()=>modify({business:5,stress:2})})];
    }

    if (state.location === 'autocity') {
      actions.survive = [action('viewCars','车','查看可购车辆','比较购车价、油费和跑单能力。','可购买或置换汽车',{time:0,settle:false,random:false,run:showVehicles}), commonMeal];
      actions.hustle = [action('washCars','洗','4S店洗车临工','冲洗展车、清理轮胎和内饰，按班结钱。','收入 ¥190–250',{disabled:workDisabled,physical:true,run:()=>earn(roll(190,250),'4S店洗车',{energy:-21,hunger:-14,reputation:1})})];
      actions.social = [action('testDrive','试','试驾一圈','体验车辆，也算清今后的油费和保养。','心压 -5 · 生意经验 +2',{ once: true,cost:20,run:()=>modify({stress:-5,business:2})})];
    }

    if (tradeAction) actions.hustle.unshift(tradeAction);

    if (state.location === 'detention') {
      actions.survive = [action('wait','等','等待处理','能做的只有配合登记，等处罚期限过去。','拘留期间不可自由行动',{disabled:true,reason:'结算后自动返回住所'})];
    }
    return actions[state.tab] || [];
  }

  function renderActions() {
    $('actionTitle').textContent = `${LOCATIONS[state.location].name} · 可做的事`;
    document.querySelectorAll('#actionTabs button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === state.tab));
    const list = availableActions();
    $('actionGrid').innerHTML = list.length ? list.map(a => `<button class="action-card" data-action="${a.id}" ${a.disabled ? 'disabled' : ''} title="${a.disabled ? a.reason : ''}">
      <span class="action-card-top"><i>${a.icon}</i><span class="action-cost">${a.cost ? `-${fmt(a.cost)}` : a.time ? '耗时 1段' : '即时'}</span></span>
      <h4>${a.name}</h4><p>${a.disabled && a.reason ? a.reason : a.desc}</p><div class="action-gain">${a.gain}</div>
    </button>`).join('') : '<div class="empty-actions">这个地点暂时没有这一类行动。</div>';
    document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => perform(btn.dataset.action)));
  }

  function perform(id) {
    const a = availableActions().find(x => x.id === id);
    if (!a || a.disabled) return;
    if (a.cost > 0 && a.cost > state.money) return toast(`现金不够，还差 ${fmt(a.cost - state.money)}`, 'bad');
    const before = snapshot();
    actionOutcome = null;
    inAction = true;
    playTone('tap');
    if (checkOverwork(a)) { inAction = false; render(); saveGame(); return flushEvents(); }
    if (a.once) state.flags[`once_${a.id}`] = state.day;
    if (a.cost) money(-a.cost, a.name);
    a.run?.();
    // 慢性伤病的日常代价
    if (a.physical && hasChronic('waist')) modify({ energy: -6, health: -1 });
    if (a.physical && hasChronic('leg')) modify({ energy: -8, stress: 3 });
    if (!actionOutcome && a.physical) resolvePhysicalRisk(a);
    if (!actionOutcome && a.random && a.time) resolveRandomEvent(a);
    if (a.time && !state.ended && !actionOutcome?.skipAdvance) advance(a.time);
    inAction = false;
    if (!state.ended) { survivalCheck(); render(); saveGame(); }
    const after = snapshot();
    if (a.settle && !state.ended) {
      const outcome = actionOutcome;
      showResult({ type: outcome?.type || 'action', title: outcome?.title || `${a.name} · 结算`, narrative: outcome?.narrative || actionNarrative(a, before, after), before, after }, outcome?.onClose || null);
    } else if (!state.ended) flushEvents();
  }

  function resolvePhysicalRisk(a) {
    state.physicalLoad += 1;
    if (state.physicalLoad < 3) return;
    let risk = .12 + Math.max(0, state.physicalLoad - 3) * .09;
    if (state.physicalLoad >= 5) risk = 1;
    if (state.flags.safetyBrief === state.day) risk *= .5;
    if (state.flags.forceEvent === 'injury') { risk = 1; delete state.flags.forceEvent; }
    if (Math.random() >= risk) return;
    const treatment = roll(260, 780);
    forcePay(treatment, '意外受伤治疗费');
    modify({ health: -roll(16, 26), energy: -20, stress: 16 });
    state.physicalLoad = 0; state.injuryCount += 1;
    // 带伤硬撑或反复受伤，就不再是"养几天"能过去的了
    let got = null;
    if (state.health < 35 || state.injuryCount >= 3) { if (Math.random() < .45) got = addChronic(); }
    if (state.injuryCount >= 2 && Math.random() < .35) state.flags.injuredUntil = state.day + 1;
    actionOutcome = {
      type: 'injury',
      title: got ? `意外受伤 · 落下${got.name}` : '意外受伤 · 医疗结算',
      narrative: `${state.name}连续做了太多体力活，在“${a.name}”时不慎受伤。急诊检查和处理花了${fmt(treatment)}，刚挣到的钱反而送进了医院。${got ? `\n\n这一次没能全好——医生说这是${got.name}，往后都得带着它干活。${got.desc}。` : '休息和安全培训能降低再次受伤的风险，硬撑只会把小伤拖成旧伤。'}${isInjured() ? '\n\n明天你干不了体力活。' : ''}`
    };
  }

  function resolveRandomEvent(a) {
    if (state.flags.forceEvent && state.flags.forceEvent !== 'random') return;
    if (state.flags.forceEvent === 'random') delete state.flags.forceEvent;
    else if (Math.random() >= .12) return;
    const events = [
      () => { const tip=roll(45,90); money(tip,'雨天顾客加价'); modify({reputation:1}); return {title:'随机事件 · 雨天加价',narrative:`暴雨让订单变难，也让这次帮忙更值钱。顾客额外补了${fmt(tip)}，你把湿透的零钱仔细收好。`}; },
      () => { const loss=roll(70,150); forcePay(loss,'意外损坏赔偿'); modify({stress:8}); return {title:'随机事件 · 货物受损',narrative:`坡道湿滑，一件货在途中磕坏。协商后你赔了${fmt(loss)}。有些班看似赚钱，结算时才知道真正利润。`}; },
      () => { const bonus=roll(80,160); money(bonus,'老顾客介绍费'); modify({reputation:2,business:1}); return {title:'随机事件 · 熟客照应',narrative:`以前帮过的人又给你介绍了一单，除了${fmt(bonus)}酬劳，还替你在街坊里说了句好话。`}; },
      () => { const cost=roll(120,240); forcePay(cost,'发热门诊与药费'); modify({health:12,energy:-5,stress:5}); return {title:'随机事件 · 突然发热',narrative:`连日奔波后突然发热，你没有硬扛，去门诊检查拿药花了${fmt(cost)}。健康稳住了，账面却又薄了一层。`}; }
    ];
    actionOutcome = events[roll(0, events.length - 1)]();
  }

  // 后巷 · 找个人过夜：短暂的松弛，代价可能几天后才出现
  const COMPANY_TEXT = [
    // 第一次
    () => `楼道里有股霉味，混着谁家昨晚的油烟。灯泡坏了，你摸着扶手一级一级往上走，手心蹭到一层黏的东西，没敢看是什么。

门是虚掩的。屋里比你想的干净：一张床、一个热水瓶、一台开着的电视，静音，正放本地台的天气预报。塑料拖鞋摆得整整齐齐，两双，都朝外。

她先数钱。指甲上有半掉的红色甲油，数到第三张停了一下，抬头看你："就这些？"你说就这些。她把钱塞进枕头底下，没再问。

后来你盯着天花板那块水渍看了很久。形状有点像重庆，也像别的什么。楼下有人炒菜，油锅炸响，一个女人在喊小孩回家吃饭。那些声音离你只隔一层楼板，却像隔着一整座城。

半个多小时里，没有人提钱，没有人提利息，没有人问你什么时候还得上。

下楼时腿是软的。外面在下雨，风一吹，后背的汗全凉了。${fmt(280)}。胸口那根弦确实松了——松开之后，是更空的东西。`,
    // 第二、三次
    () => `你已经知道哪一级台阶是松的。

还是那间。热水瓶换了新的，电视从天气预报换成了带货直播，音量还是关着。她数钱时没抬头。

这次你没看天花板，闭着眼听楼下的动静。有人在打麻将，塑料牌撞塑料桌面，一声一声，很规律。你想起小时候的夏天，父亲和邻居在院坝里也是这么打到半夜，你睡在竹凉椅上，听着听着就着了。

那时候他还能一口气把你从院子扛回屋里。

出门时她说了句"慢点"，语气跟便利店收银员没什么两样。${fmt(280)}。松弛来得很快，散得也快。`,
    // 之后
    () => `上楼、进门、给钱、躺下、下楼。整套动作已经不用想了。她也懒得再问你哪儿来的。

有那么一瞬间你走神了，脑子里算的是：这几次的钱如果都还进账上，那个数字会少多少。算出来之后，你没敢再往下想。

窗外是坡下密密麻麻的灯。这座城里有几百万人，今晚大概只有你一个人在这个房间里算这笔账。

${fmt(280)}。今天是松了。明天呢。`
  ];

  function runNightCompany() {
    state.greyHeat += roll(1, 3);
    state.flags.companyCount = (state.flags.companyCount || 0) + 1;
    const nth = state.flags.companyCount;
    const risk = Math.min(.3, .12 + state.greyHeat * .006);
    if (Math.random() < risk) {
      applyDetention(roll(5, 9), roll(2200, 5000), '在后巷嫖娼');
      actionOutcome.title = '敲门的不是她 · 行政拘留';
      actionOutcome.narrative = `敲门声不对——太重，太齐。三个人，最前面那个举着执法记录仪，红灯一直亮着。

穿衣服的时候你的手不听使唤，扣子系错了两颗。她坐在床沿上没动，像是早就演练过很多遍。

笔录要写清时间、地点、金额，一样都不能含糊。签字那一下你的手在抖——不是怕，是你突然想起父亲还躺在三楼东侧第二张床，而你在这里，在这张纸上写自己的名字。

拘留期间挣不到一分钱，房租、利息、赵坤的耐心，一样都不会停。表格上有一栏"紧急联系人"，你盯着看了很久，最后填了自己的手机号。`;
      return;
    }
    modify({ stress: -30, energy: -6, health: -2, hunger: -3 });
    // 病要过几天才发作
    if (!hasChronic('std') && !state.flags.stdIncubate && Math.random() < .13) state.flags.stdIncubate = state.day + roll(2, 4);
    const pick = nth === 1 ? 0 : nth <= 3 ? 1 : 2;
    actionOutcome = {
      title: nth === 1 ? '后巷 · 四楼那间' : nth <= 3 ? '后巷 · 又是那间' : `后巷 · 第 ${nth} 次`,
      narrative: COMPANY_TEXT[pick]()
    };
  }

  function runGreyBusiness(label, revenue, baseRisk) {
    state.greyHeat += roll(2, 4);
    const risk = Math.min(.68, baseRisk + state.greyHeat * .018);
    const forced = state.flags.forceGreyArrest;
    if (forced) delete state.flags.forceGreyArrest;
    if (!forced && Math.random() >= risk) {
      money(revenue, label); modify({ energy:-13, hunger:-10, business:4, stress:8, reputation:-1 });
      actionOutcome = { title:`${label} · 灰色结算`, narrative:`这笔灰色生意暂时躲过了巡查，回款${fmt(revenue)}。但风险热度已经升到${state.greyHeat}，继续做下去，被查处的概率会越来越高。` };
      return;
    }
    const days = roll(3, 7); const fine = roll(700, 1600);
    applyDetention(days, fine, label);
  }

  function applyDetention(days, fine, label) {
    forcePay(fine, '行政处罚罚款');
    modify({ health:-8, energy:-18, stress:22, reputation:-10 });
    state.detentionDays += days; state.flags.detained = (state.flags.detained || 0) + 1; state.greyHeat = 0;
    let lost = 0;
    while (lost < days && state.day < 30) { advanceOneDayPassively(); lost += 1; }
    state.slot = 0; state.location = 'detention'; state.physicalLoad = 0; state.daily = { income:0, expense:0 };
    actionOutcome = {
      title: '警方查处 · 行政拘留', type:'action', skipAdvance:true,
      narrative: `${label}被巡查发现。${state.name}被行政拘留${lost}天，并处罚款${fmt(fine)}。这些天不能打工，房租、利滚利和赵坤的耐心，都不会为你暂停。出来时，账上的数字比进去时更大。`,
      onClose: () => { state.location='home'; render(); saveGame(); runCollection(); flushEvents(); if (state.day >= 30) settleDeadline(); }
    };
  }

  // ===== 高利贷催收 =====
  function pendingCollection() {
    if (state.debt <= 0) return null;
    return COLLECTION.find((s, i) => i === state.collectStage && state.day >= s.day && paidRatio() < s.ratio) || null;
  }

  // 已经按期达标的阶段直接跳过，不会秋后算账
  function syncCollectionStage() {
    while (state.collectStage < COLLECTION.length) {
      const s = COLLECTION[state.collectStage];
      if (state.day >= s.day && paidRatio() >= s.ratio) state.collectStage += 1; else break;
    }
  }

  // 找出下一个「还款进度还不够」的阶段，作为玩家的明确目标
  function nextCollectionHint() {
    if (state.debt <= 0) return null;
    for (let i = state.collectStage; i < COLLECTION.length; i++) {
      const need = Math.ceil(PRINCIPAL * COLLECTION[i].ratio - state.paid);
      if (need > 0) return { stage: COLLECTION[i], need, days: Math.max(0, COLLECTION[i].day - state.day) };
    }
    const s = COLLECTION[state.collectStage];
    return s ? { stage: s, need: 0, days: Math.max(0, s.day - state.day) } : null;
  }

  function seizeAsset() {
    if (carryUsed() > 0) {
      const val = stockValue();
      const lines = Object.entries(state.stock).map(([g, x]) => `${GOODS[g].name}${x.qty}${GOODS[g].unit}`).join('、');
      state.stock = {};
      const offset = Math.round(val * .3);
      state.debt = Math.max(0, state.debt - offset); state.seizedValue += val;
      addLog('压在手里的货被搬走', -offset, 'bad');
      return `屋角那堆还没出手的货——${lines}——被一件件搬上车。你进货花了 ${fmt(val)}，他们只按 ${fmt(offset)} 抵账。“压着不卖，就是等着被拿走。”`;
    }
    const owned = Object.keys(state.assets);
    if (owned.length) {
      const key = owned.sort((a, b) => ASSETS[b].cost - ASSETS[a].cost)[0];
      const a = ASSETS[key];
      delete state.assets[key];
      const offset = Math.round(a.cost * .4);
      state.debt = Math.max(0, state.debt - offset); state.seizedValue += a.cost;
      addLog(`${a.name}被抵账`, -offset, 'bad');
      return `他们撬了锁，把${a.name}整个拖走，只按 ${fmt(offset)} 抵账——不到你投进去的四成。`;
    }
    if (state.vehicleId) {
      const v = VEHICLES[state.vehicleId]; state.vehicleId = null;
      const offset = Math.round(v.price * .35);
      state.debt = Math.max(0, state.debt - offset); state.seizedValue += v.price;
      addLog(`${v.name}被开走抵账`, -offset, 'bad');
      return `钥匙被从你手里抠了出去。${v.name}当场被开走，只算 ${fmt(offset)}。`;
    }
    if (state.homeId !== 'rental') {
      const h = currentHome(); state.homeId = 'rental';
      const offset = Math.round(h.price * .45);
      state.debt = Math.max(0, state.debt - offset); state.seizedValue += h.price;
      addLog(`${h.name}被强制过户`, -offset, 'bad');
      return `他们带来一份早就拟好的过户合同。${h.name}按 ${fmt(offset)} 折价抵债，你当晚就搬回了石板坡出租屋。`;
    }
    if (state.inventory.bike) {
      state.inventory.bike = false; state.debt = Math.max(0, state.debt - 300);
      return '连那辆二手电驴都被推走了，抵了 ¥300。';
    }
    const cash = Math.max(0, state.money);
    if (cash > 0) { money(-cash, '被搜走的全部现金'); state.extortedTotal += cash; }
    modify({ stress: 12 });
    return `屋里被翻了个底朝天。除了搜走的 ${fmt(cash)}，你连一件值钱的东西都拿不出来——这让他们更不高兴。`;
  }

  function runCollection() {
    syncCollectionStage();
    const stage = pendingCollection();
    if (!stage || state.ended) return;
    const before = snapshot();
    state.collectStage += 1;
    state.flags[stage.key] = state.day;
    let narrative = '', title = `催收 · ${stage.title}`, extra = null;

    const shielded = state.reputation >= 25 && state.collectStage <= 2;
    if (stage.key === 'c1') {
      const clean = roll(90, 180);
      forcePay(clean, '门口泼漆清理费');
      modify({ stress: shielded ? 9 : 18, health: -3, reputation: -4 });
      narrative = (shielded ? `天亮时，门上的红漆已经被人擦掉了大半。三楼那个总在楼道择菜的阿姨说，她一早看见就拿钢丝球蹭了。"你平时帮我提过多少回米，我还能看着你被这么糟践？"\n\n街坊挡了一下，但只挡得住这一次。\n\n` : '') + `半夜三点，手机响了十七次。天亮时，出租屋门上用红漆写着“还钱”两个大字，楼道里的邻居没人跟你打招呼。房东站在门口，说清理费你自己出——${fmt(clean)}。赵坤没露面，但他让整栋楼都知道了你欠钱。`;
    } else if (stage.key === 'c2') {
      const grab = Math.round(Math.max(0, state.money) * .55);
      if (grab > 0) { money(-grab, '被搜走的现金'); state.extortedTotal += grab; }
      modify({ stress: shielded ? 12 : 22, health: shielded ? -3 : -7, energy: -22 });
      state.physicalLoad = 0;
      narrative = `两个人在楼梯拐角等了你一晚上。没有动手，只是把你按在墙上，一个口袋一个口袋地翻。${grab > 0 ? `${fmt(grab)}被抽走，剩下的零钱扔回你脚边。` : '一分钱都没搜到，其中一个笑了一声：“下次就不是搜口袋了。”'}“利息是每天在走的，”他说，“你的时间也是。”`;
    } else if (stage.key === 'c3') {
      const hurt = roll(24, 34);
      const med = roll(500, 1100);
      modify({ health: -hurt, energy: -roll(28, 38), stress: 26, reputation: -6 });
      const pay = forcePay(med, '被打后的医药费');
      state.injuryCount += 1; state.flags.injuredUntil = state.day + 1; state.physicalLoad = 0;
      const got = addChronic(hasChronic('waist') ? 'stomach' : 'waist');
      narrative = `巷口没有灯。他们不打脸，专挑背和肋下——这样别人看不出来，你自己每动一下都知道。躺在地上的那两分钟，你听见其中一个平静地报出余额：${fmt(state.debt)}。\n\n急诊花了${fmt(med)}${pay.rolled ? `，现金不够的部分被赵坤“垫上”，变成新的 ${fmt(pay.rolled)} 挂在账上` : ''}。${got ? `医生说肋骨没断，但你从此落下了${got.name}。` : '医生说没伤到骨头，可疼痛不会因此就走。'}明天你下不了力气活。`;
      extra = { type: 'injury' };
    } else if (stage.key === 'c4') {
      const seized = seizeAsset();
      modify({ stress: 25, health: -5, reputation: -10 });
      narrative = `这次他们带了两个人和一辆面包车，白天来的。“不是抢，是抵押清点。”\n\n${seized}\n\n街坊隔着卷帘门看，没有人出来。你这个月攒下的东西，被人用一张纸的价格拿走了。`;
    } else if (stage.key === 'c5') {
      const hurt = roll(38, 52);
      const bill = roll(1800, 3400);
      modify({ health: -hurt, energy: -45, stress: 30, reputation: -8 });
      const pay = forcePay(bill, '住院手术费');
      addChronic('leg');
      state.injuryCount += 1; state.hospitalCount += 1;
      const days = roll(2, 3);
      let lost = 0;
      while (lost < days && state.day < 30) { advanceOneDayPassively(); lost += 1; }
      state.slot = 0; state.location = 'hospital'; state.physicalLoad = 0; state.daily = { income: 0, expense: 0 };
      narrative = `这一次没有警告。一根钢管，一下，你听见了自己腿里的声音。\n\n醒来是在父亲那栋楼的三层。住院${lost}天，账单${fmt(bill)}${pay.rolled ? `，其中 ${fmt(pay.rolled)} 又滚回了赵坤的本子上` : ''}。这几天你一分钱没挣，房租和利息一天没停。\n\n腿会好，但走路的样子不会再一样了。`;
      const crippled = state.health <= 0;
      extra = { type: 'injury', onClose: () => { state.location = 'hospital'; render(); saveGame(); if (crippled) return showEnding('crippled'); if (state.day >= 30) settleDeadline(); } };
    } else if (stage.key === 'c6') {
      state.flags.ultimatum = true;
      modify({ stress: 34, health: -6 });
      const hasShop = Object.keys(state.assets).length;
      if (hasShop) state.flags.shopSkim = true;
      narrative = (hasShop ? `第二天一早，你店里多了一个人。三十来岁，话不多，就搬张凳子坐在收银台旁边，每收一笔他记一笔。\n\n"不影响你做生意，"赵坤说，"每天的流水，我拿一半。拿到你还清为止。"\n\n你没法赶他走。这个月拼死拼活攒出来的现金流，从今天起有一半不是你的。\n\n` : '') + `赵坤第一次亲自坐进你的屋子。他把一份东西推过来：一张身份证复印件，一份空白的授权书，还有一张写着老家地址和医院床位号的纸条。\n\n“还剩四天，${fmt(state.debt)}。”他说，“我不再打你了——打你没有意义。到期还不上，这几张纸就会替我去办事。你父亲的床位是三楼东侧第二张，对吧。”\n\n他走后你在原地坐了很久。这已经不只是你一个人的事了。`;
    }

    queueEvent({ type: extra?.type || 'collect', title, narrative, before, after: snapshot(), onClose: extra?.onClose });
  }

  // 被动流逝一天（住院、拘留等强制跳过的日子）
  function advanceOneDayPassively() {
    const passive = passivePerDay();
    if (passive) money(Math.round(passive * .6), '停工期间资产代管收益', 'passive');
    forcePay(currentHome().upkeep, `${currentHome().name}持有开支`);
    accrueInterest();
    (state.chronic || []).forEach(() => modify({ health: -1, stress: 2 }));
    state.day += 1;
  }

  // 利滚利：第4天起每3天按余额 7% 计息，最少 ¥500；被通牒后翻倍
  function accrueInterest() {
    if (state.debt <= 0 || state.day < 4 || (state.day - 1) % 3 !== 0) return;
    let rate = .05;
    if (state.collectStage >= 3) rate = .07;
    if (state.flags.ultimatum) rate = .1;
    const add = Math.max(Math.min(400, state.debt), Math.round(state.debt * rate));
    state.debt += add; state.interestPaid += add;
    addLog(`高利贷利滚利（${Math.round(rate * 100)}%）`, -add, 'bad');
  }

  // 口碑不再只是数字：街坊认得你，工价就不一样
  function repBonus() { return 1 + clamp(state.reputation, -25, 60) * .004; }
  function repLabel() {
    const b = Math.round((repBonus() - 1) * 100);
    return b === 0 ? '' : `${b > 0 ? '+' : ''}${b}%`;
  }

  function earn(amount, label, changes) {
    amount = Math.round(amount * repBonus());
    money(amount, label);
    modify(changes);
    toast(`${label}，拿到 ${fmt(amount)}`, 'good');
    playTone('good');
  }

  function advance(count = 1) {
    state.slot += count;
    modify({ hunger: -3 * count, energy: -2 * count, stress: 1 * count });
    if (state.slot >= SLOTS.length) endDay();
  }

  // 每次行动后的即时消耗保持克制，真正的账在每天结束时一起算
  function survivalCheck() {
    if (state.hunger <= 0) modify({ health: -4, energy: -4, stress: 4 });
    if (state.energy <= 0) modify({ health: -3, stress: 3 });
    if (state.stress >= 97) modify({ health: -1, energy: -1 });
    if (state.health <= 0) collapse();
  }

  // 每日清算：空腹一整天、心压爆表都会在这里一次性扣账
  function dailyToll() {
    if (state.hunger <= 5) { modify({ health: -9, energy: -8, stress: 10 }); addLog('整天没吃上一顿正经饭', 0, 'bad'); }
    else if (state.hunger <= 18) modify({ health: -3, stress: 4 });
    if (state.stress >= 90) { modify({ health: -4, energy: -6 }); addLog('心压爆表，整夜没合眼', 0, 'bad'); }
    if (state.energy <= 5) modify({ health: -4 });
  }

  // ===== 健康崩溃线 =====
  // 健康归零：第一次强制住院并落下伤病；心压过高则直接猝死；再倒一次就是终局
  function collapse() {
    if (state.ended) return;
    const before = snapshot();
    // 前两次倒下都还有救，第三次就是终局
    if (state.hospitalCount >= 2) return showEnding(state.stress >= 88 || hasChronic('heart') ? 'sudden' : 'hospitalized');
    state.hospitalCount += 1;
    const bill = roll(2200, 4200);
    const pay = forcePay(bill, 'ICU与住院费');
    const got = addChronic();
    const days = roll(2, 3);
    let lost = 0;
    while (lost < days && state.day < 30) { advanceOneDayPassively(); lost += 1; }
    state.health = Math.min(state.healthCap, 42); state.energy = Math.min(state.energyCap, 30);
    state.stress = clamp(state.stress + 18); state.hunger = clamp(state.hunger + 20);
    state.slot = 0; state.location = 'hospital'; state.physicalLoad = 0; state.daily = { income: 0, expense: 0 };
    state.lowHealthStreak = 0;
    queueEvent({
      type: 'injury', title: '身体先垮了 · 强制住院',
      narrative: `你是在人行道上倒下的，倒之前甚至没觉得特别难受。醒来时输液管已经插好，护士说送来时血压低得吓人。\n\n住院${lost}天，账单${fmt(bill)}${pay.rolled ? `，付不起的 ${fmt(pay.rolled)} 只能继续挂在赵坤那边` : ''}。这几天你没有收入，房租、利息、催收，一样都没有为你停下。${got ? `\n\n出院时医生在病历上写下：${got.name}。这四个字会跟着你很久。` : ''}`,
      before, after: snapshot(),
      onClose: () => { render(); saveGame(); if (state.day >= 30) settleDeadline(); }
    });
    render(); saveGame(); flushEvents();
  }

  // 潜伏几天之后，账才送上门
  function checkIncubation() {
    if (!state.flags.stdIncubate || state.day < state.flags.stdIncubate || hasChronic('std')) return;
    delete state.flags.stdIncubate;
    const before = snapshot();
    const forced = state.flags.chronicDay;
    delete state.flags.chronicDay;
    const got = addChronic('std');
    if (forced !== undefined && !got) return;
    modify({ stress: 20, health: -6 });
    queueEvent({
      type: 'injury', title: '身体先说了实话',
      narrative: `这两天一直不太对劲，你以为是累的。今天早上再也骗不了自己。\n\n没有人可以商量。你在手机上翻了半小时，看的全是那种一眼就知道不可信的小广告，最后什么也没敢点。\n\n${CHRONIC.std.desc}。市人民医院皮肤科能治，一个疗程 ${fmt(1400)}——比你在后巷花的多五倍。`,
      before, after: snapshot()
    });
  }

  // 每天结束时检查身体损耗，攒够了就落病
  function checkBodyBreakdown() {
    if (state.ended) return;
    const before = snapshot();
    let title = null, narrative = '', got = null;

    if (state.health < 26) state.lowHealthStreak += 1; else state.lowHealthStreak = 0;
    if (state.stress >= 90) state.highStressStreak += 1; else state.highStressStreak = 0;
    // 日常磨损最多留下 3 个伤病；再往下只能靠挨打和倒下来"赚"
    const wearCapped = (state.chronic || []).length >= 3;

    if (state.lowHealthStreak >= 4 && !wearCapped) {
      state.lowHealthStreak = 0;
      got = addChronic();
      if (got) {
        title = `身体损耗 · ${got.name}`;
        narrative = `连着三天，你都是靠一口气撑到收工的。今天早上刷牙时手抖得握不住杯子。\n\n没有哪一次具体的透支能被指出来，但身体已经替你记下了全部。从今天起，${got.name}成了你的一部分——${got.desc}。这不是能靠休息几天补回来的东西。`;
      } else {
        modify({ health: -8, stress: 10 });
        title = '身体损耗 · 无处可退';
        narrative = '该落下的病你都落下了，身体上限已经压到最低。再撑下去，倒下就是终点。';
      }
    } else if (state.highStressStreak >= 4 && !wearCapped) {
      state.highStressStreak = 0;
      got = addChronic('nerve');
      const med = roll(200, 480);
      forcePay(med, '心理门诊与安定类药物');
      modify({ health: -6 });
      title = got ? `精神损耗 · ${got.name}` : '精神损耗 · 撑不住了';
      narrative = `你已经三天没有真正睡着了。躺下就是数字：利息、房租、剩下的天数。今天在车站，你毫无预兆地开始发抖，蹲了十几分钟才站起来。\n\n门诊开了药，${fmt(med)}。${got ? `诊断写着${got.name}。` : ''}医生说你需要休息——你没说话，因为你知道自己没有那个选项。`;
    }

    if (title) queueEvent({ type: 'injury', title, narrative, before, after: snapshot() });
  }

  // 空着肚子、耗尽体力还硬撑 → 当场猝倒，剩下的时段全部作废
  function checkOverwork(a) {
    if (!a.time || state.ended || state.flags.faintDay === state.day) return false;
    const exhausted = state.energy <= 5 || (state.hunger <= 6 && state.energy <= 18) || state.health <= 10;
    if (!exhausted) return false;
    state.flags.faintDay = state.day;
    const chance = hasChronic('heart') ? .7 : .4;
    if (Math.random() >= chance) return false;
    const before = snapshot();
    const med = roll(300, 700);
    forcePay(med, '街头晕倒送医');
    modify({ health: -roll(12, 20), stress: 16 });
    state.overworkCount += 1;
    state.slot = SLOTS.length - 1;
    const got = state.overworkCount >= 2 ? addChronic('heart') : null;
    queueEvent({
      type: 'injury', title: '当场晕倒 · 今天到此为止',
      narrative: `做到一半，眼前突然全白。等你听见声音时，已经有人蹲在旁边喊你，手机屏幕上是一串没拨出去的120。\n\n送医检查${fmt(med)}，医生的话很短：低血糖、极度疲劳、再来一次就不是躺一会儿的事。${got ? `\n\n这次心电图查出了问题——${got.name}。` : ''}今天剩下的时间，你哪儿也去不了。`,
      before, after: snapshot()
    });
    return true;
  }

  function endDay(early = false) {
    if (state.ended) return;
    const home = currentHome();
    const restScale = hasChronic('insomnia') ? .6 : 1;
    if (early) modify({ energy: Math.round((state.homeId === 'rental' ? 15 : 22) * restScale), health: state.homeId === 'rental' ? 3 : 5, stress: state.homeId === 'rental' ? -4 : -8 });
    const settle = settleAssets();
    const passive = settle.total;
    if (settle.lines.length) {
      if (passive >= 0) money(passive, '经营资产日结', 'passive');
      else forcePay(-passive, '店铺当日亏损');
      // 店越大越操心
      Object.keys(state.assets).forEach(k => modify({ energy: -ASSETS[k].tend, stress: ASSETS[k].tend }));
      if (settle.mishaps.length) {
        queueEvent({ type: 'finance', title: '店里出了点事', narrative: `${settle.mishaps.join('\n\n')}\n\n开店不是把钱放进去就会长出来。摊子铺得越大，能出岔子的地方越多。`, before: snapshot(), after: snapshot() });
      }
      const age = supplyAge(), care = careWindow();
      if (age > care && !state.flags.staleWarned) {
        state.flags.staleWarned = true;
        queueEvent({ type: 'finance', title: '货架空了一半', narrative: `你已经 ${age} 天没去补货了。客人来了看一眼就走——货架上剩的都是卖不动的。\n\n收益已经掉到 ${Math.round(freshness() * 100)}%，而且还在往下掉。去解放碑补一次货就能拉回来。`, before: snapshot(), after: snapshot() });
      }
      if (age <= care) state.flags.staleWarned = false;
    }
    const rentLabel = state.homeId === 'rental' ? '房租与水电' : `${home.name}物业水电`;
    const rentPay = forcePay(home.upkeep, rentLabel);
    if (rentPay.rolled) {
      state.flags.rentArrears = (state.flags.rentArrears || 0) + 1;
      modify({ stress: 8, reputation: -1 });
      if (state.flags.rentArrears === 3 && state.homeId === 'rental' && state.reputation < 30) {
        modify({ stress: 14, energy: -10, health: -4 });
        addLog('房东断电断水', 0, 'bad');
        queueEvent({ type: 'collect', title: '房东断了电', narrative: `连着三天交不出房租，房东在门口贴了条，把电闸拉了。没有热水，没有风扇，手机只能去便利店门口蹭充。\n\n“我不是逼你，”她说，“但我也要吃饭。”今晚你会睡得很差。`, before: snapshot(), after: snapshot() });
      }
    }
    modify({ energy: Math.round(home.energy * restScale * (state.flags.rentArrears >= 3 ? .6 : 1)), hunger: -10, health: state.energy < 18 ? Math.min(-2, home.health - 6) : home.health, stress: state.debt > 0 ? home.stress : Math.min(-3, home.stress) });
    // 慢性伤病每天都在抽走一点
    (state.chronic || []).forEach(k => { modify({ health: k === 'std' ? -3 : -1, stress: k === 'nerve' ? 3 : 2 }); });
    checkIncubation();
    if (hasChronic('stomach')) modify({ hunger: -5 });
    dailyToll();
    fatherDailyDrift();
    accrueInterest();
    checkBodyBreakdown();
    runCollection();
    if (state.ended) return;
    const completedDay = state.day;
    if (completedDay >= 30) {
      render();
      return settleDeadline();
    }
    state.day += 1; state.slot = 0; state.location = 'home'; state.weather = WEATHER[roll(0, WEATHER.length - 1)]; state.physicalLoad = 0;
    state.daily = { income: 0, expense: 0 };
    saveGame();
    dailyEvent(state.day);
    if (state.health <= 0) return collapse();
    if (!inAction) flushEvents();
    if (!eventQueue.length) toast(passive ? `新的一天。店铺昨夜结算 ${fmt(passive)}` : '新的一天。月底又近了一格。', passive ? 'good' : '');
  }

  // 30天到期结算：还不上时，按你被逼到哪一步决定结局
  function settleDeadline() {
    if (state.debt <= 0) return showEnding('success');
    // 拼到最后仍差得远，才会走到最坏的那一步；真的努力过的人，至少还留在这座城里
    if ((state.flags.ultimatum || state.collectStage >= 6) && state.debt > PRINCIPAL * .6) return showEnding('vanish');
    if (state.collectStage >= 4) return showEnding('stripped');
    return showEnding('debt');
  }

  function travel(key) {
    if (state.location === key || state.ended) return;
    if (!getUnlockedLocations().includes(key)) return toast('这个地点还没有解锁', 'bad');
    syncHomeLocation();
    const before = snapshot();
    const from = LOCATIONS[state.location];
    const to = LOCATIONS[key];
    const transit = (() => {
      if (['downtown', 'liziba'].includes(key)) return { mode: '轨道交通2号线', fare: 2 };
      if (['market', 'ciqikou'].includes(key)) return { mode: '轨道交通1号线', fare: 2 };
      if (key === 'hospital') return { mode: '轨道交通3号线', fare: 3 };
      if (key === 'nanbin') return { mode: '轨道交通环线转公交', fare: 3 };
      if (key === 'wharf') return { mode: '476路公交车', fare: 2 };
      if (['labor','construction','autocity'].includes(key)) return { mode: '轨道交通1号线转公交', fare: 3 };
      if (key === 'property') return { mode: '轨道交通6号线', fare: 3 };
      if (key === 'backstreet') return { mode: '轨道交通1号线', fare: 2 };
      return { mode: '320路公交车', fare: 2 };
    })();
    const vehicle = currentVehicle();
    const useCar = vehicle && state.money >= vehicle.fuel;
    // 有电驴就不用挤公交：免车费、不受末班限制，但停在外面就有被偷的风险
    const useBike = !useCar && !!state.inventory.bike;
    const canPay = useCar || useBike || state.money >= transit.fare;
    const travelTime = canPay ? 1 : 2;

    if (state.slot + travelTime >= SLOTS.length) {
      const home = LOCATIONS.home;
      let mode, title, narrative;
      if (useCar) {
        forcePay(vehicle.fuel, `${vehicle.name}夜间油费`);
        mode = `${vehicle.name}自驾`;
        title = '夜深 · 自驾回家';
        narrative = `已经是末班时段，${state.name}没有再赶去${to.name}，而是开着${vehicle.name}回到${home.name}，这趟花了${fmt(vehicle.fuel)}油费。今天还没有自动结束，可以在家休息或点击“提前收工”。`;
        modify({ energy:-4, hunger:-3, stress:1 });
      } else if (useBike) {
        mode = '二手电驴'; title = '夜深 · 骑车回家';
        narrative = `公交和轻轨都收班了，但你有电驴。夜里的坡道没什么车，凉风灌进袖子，二十分钟就到了${home.name}，一分钱没花。\n\n买这辆车的那六百八，今晚算是找回来一点。`;
        modify({ energy:-6, hunger:-4, stress:-2 });
      } else {
        const taxiFare = 22 + roll(6, 24);
        if (state.money >= taxiFare) {
          forcePay(taxiFare, '公交收班后打车回家');
          mode = '出租车'; title = '公交收班 · 打车回家';
          narrative = `${state.name}赶到站口时，公交车和轻轨都已经收班。只好打车回到${home.name}，车费一共${fmt(taxiFare)}。今天不会自动跳过，仍可在家做最后安排。`;
          modify({ energy:-3, hunger:-3, stress:3 });
        } else {
          mode = '徒步回家'; title = '公交收班 · 徒步回家';
          narrative = `${state.name}赶到站口时，公交车和轻轨都已经收班，口袋里的钱又不够支付约${fmt(taxiFare)}的车费，只能沿坡道走回${home.name}。今天不会自动跳过，但这一趟耗掉了更多体力。`;
          modify({ energy:-15, hunger:-8, health:-2, stress:8 });
        }
      }
      state.location='home'; state.slot=SLOTS.length-1; state.tab='survive';
      survivalCheck(); render(); saveGame();
      return showResult({ type:'travel', title, narrative, before, after:snapshot(), route:{from:from.name,to:home.name,mode} });
    }

    let mode;
    if (useCar) { money(-vehicle.fuel, `${vehicle.name}通勤油费`); mode=`${vehicle.name}自驾`; }
    else if (useBike) { modify({ energy: -4, hunger: -3 }); mode='二手电驴'; }
    else if (canPay) { money(-transit.fare, `${transit.mode}通勤`); mode=transit.mode; }
    else { modify({ energy: -10, hunger: -5, health: -1, stress: 3 }); mode='步行（车费不足）'; }
    state.location = key; state.tab = 'survive';
    playTone('tap');
    advance(travelTime);
    const stolen = useBike && !state.ended && rollBikeTheft(key);
    if (!state.ended) { survivalCheck(); render(); saveGame(); }
    const after = snapshot();
    let narrative = useCar
      ? `${state.name}开着${vehicle.name}从${from.name}前往${to.name}，这一程油费${fmt(vehicle.fuel)}，山城的坡路也不再受公交班次限制。`
      : useBike
      ? `${state.name}骑着电驴从${from.name}穿过坡街到${to.name}。不用等班次，不用买票，山城的上坡下坎全靠这一把电门。${stolen ? '' : '停车时你特意锁了龙头，又往人多的地方挪了半米。'}`
      : canPay
      ? `${state.name}在${from.name}附近坐上${transit.mode}，花了${fmt(transit.fare)}。车窗外的坡坎和楼群一层层退去，抵达了${to.name}。`
      : `${state.name}摸了摸口袋，连${transit.fare}元车费也掏不出来，只能沿着坡坎一路走到${to.name}。省下了车费，却多花了一段时间和不少体力。`;
    const npc = LOCATIONS[key].npc;
    const meetNpc = () => { if (npc && !hasMet(npc)) ({wang:talkWang,lin:talkLin,chen:talkChen}[npc]?.()); };
    if (!state.ended) showResult({
      type: 'travel', title: `抵达 · ${to.name}`, narrative, before, after,
      route: { from: from.name, to: to.name, mode }
    }, () => { meetNpc(); flushEvents(); });
  }

  // 电驴停在外面被偷：夜里、后巷、口碑差的时候更容易出事
  function rollBikeTheft(key) {
    if (state.flags.theftDay === state.day) return false;
    let risk = .02;
    if (state.slot >= 5) risk += .02;
    if (key === 'backstreet') risk += .05;
    if (key === 'construction' || key === 'labor') risk += .015;
    if (state.reputation >= 15) risk -= .01;
    if (state.flags.lockBought) risk *= .3;
    risk = Math.min(.1, Math.max(.004, risk));
    if (Math.random() >= risk) return false;
    state.flags.theftDay = state.day;
    const before = snapshot();
    state.inventory.bike = false;
    modify({ stress: 16, energy: -5 });
    addLog('电驴被偷', 0, 'bad');
    queueEvent({
      type: 'collect', title: '电驴不见了',
      narrative: `办完事出来，原来停车的地方只剩一小截被剪断的锁，和地上一圈没被雨淋到的干印子。\n\n你围着这条街转了两圈，问了报刊亭和看门大爷，谁都说没看见。监控要走流程，流程要等几天，而你连今晚的房租都是数着给的。\n\n六百八，就这么没了。${state.flags.lockBought ? '' : '\n\n（在解放碑可以花 ¥120 配一把好锁，能明显降低下次被偷的概率）'}`,
      before, after: snapshot()
    });
    return true;
  }

  function showDialog(npcId, text, options, speaker) {
    const npc = speaker ? { ...NPCS[npcId], ...speaker } : NPCS[npcId];
    $('dialogPortrait').src = npc.portrait; $('dialogRole').textContent = npc.role;
    $('dialogName').textContent = npc.name; $('dialogText').textContent = text;
    $('dialogOptions').innerHTML = options.map((o, i) => `<button data-dialog-option="${i}">${o.text}</button>`).join('');
    $('dialogModal').classList.add('open');
    const before = snapshot();
    document.querySelectorAll('[data-dialog-option]').forEach(btn => btn.addEventListener('click', () => {
      const option = options[Number(btn.dataset.dialogOption)];
      $('dialogModal').classList.remove('open');
      // run 返回 false 表示这次选择没有真正发生（例如钱不够），就不弹结算
      const done = option.run?.();
      render(); saveGame();
      if (done === false || option.silent) return;
      // 如果这个选项打开了别的界面（还款、投资清单），就不要再盖一层结算
      if ($('genericModal').classList.contains('open') || $('resultModal').classList.contains('open') || $('dialogModal').classList.contains('open')) return;
      if (state.ended) return;
      showResult({
        type: 'action', title: `${npc.name} · ${option.title || '这次交谈'}`,
        narrative: option.result || `${state.name}和${npc.name}把话说完。有些事没法立刻变成钱，但记在心里的，迟早会用上。`,
        before, after: snapshot()
      });
    }));
  }

  function talkWang() {
    if (!hasMet('wang')) {
      showDialog('wang', `“新来的？这儿不看你从哪来。鞋底站得稳，手上不偷懒，今天就有钱拿。”王强扫了一眼你磨白的帆布鞋。`, [
        { text: '“王哥，最累的活也行，我缺钱。”', title: '认下这张脸', result: `王强没多问，只是把你的名字写进了随身的临工名单。“最累的活确实有，”他说，“但别把命也一起搭进去。”从今天起，码头的班次会先想到你。（王强关系 +6）`, run: () => { state.seen.meet_wang = true; state.relations.wang += 6; modify({reputation:2}); } },
        { text: '“我先从普通班做起，规矩您教我。”', title: '先学规矩', result: `王强愣了一下，随后点点头：“急着挣钱的人多，愿意先学规矩的少。”他把码头的验货、点数和结账流程讲了一遍。这些东西今天换不成钱，但以后能少被人坑几次。（王强关系 +8 · 生意经验 +2）`, run: () => { state.seen.meet_wang = true; state.relations.wang += 8; modify({business:2}); } }
      ]);
    } else {
      showDialog('wang', state.relations.wang >= 24 ? '“现在你不只是能干活，也能把一队人带明白。以后有整批货，我先给你电话。”' : '“力气是会用完的，信誉不会。该歇就歇，别在我这儿把身体干垮。”', [
        { text: '递一瓶水，听他讲排班经验', title: '一瓶水的交情', result: `五块钱的矿泉水，王强拧开喝了半瓶，靠在集装箱上讲了十几分钟：哪班货压秤、哪个工头爱拖钱、什么时候不要接活。\n\n“这些话我不跟每个人说。”他把瓶子放下，“你听得进去。”（王强关系 +4 · 生意经验 +2 · 心压 -3）`, run: () => { if (state.money >= 5) money(-5,'请王强喝水'); state.relations.wang += 4; modify({business:2,stress:-3}); } },
        { text: '记下，回去继续做事', title: '话不多说', result: `你点点头就回去干活了。王强在背后看了一眼——在码头，能把话听进去又不耽误干活的人不多。（王强关系 +2）`, run: () => { state.relations.wang += 2; } }
      ]);
    }
  }

  function talkLin() {
    if (!hasMet('lin')) {
      showDialog('lin', '“五十块在重庆也能做生意——前提是别想着一口吃成胖子。先算一碗冰粉的糖、冰、碗，再算一天能卖几碗。”林月把账本推到你面前。', [
        { text: '认真记下成本，请她教你摆一次摊', title: '第一课：算清楚', result: `林月把一碗冰粉拆成了七八项成本，连一次性勺子都算进去。你在手机备忘录里记满了两屏。\n\n“记住，卖出去的不叫赚，剩下的才叫。”\n\n【已解锁】市场的流动小摊、江边夜摊，以及经营项目投资。（生意经验 +8 · 林月关系 +7）`, run: () => { state.seen.meet_lin = true; state.relations.lin += 7; modify({business:8,reputation:1}); } },
        { text: '先替她收拾桌椅，用做事换指点', title: '先干活，再谈钱', result: `你没等她开口就开始收桌子、摞板凳、擦地。忙完一轮，林月才把账本翻给你看。\n\n“愿意先动手的人，我教起来放心。”她指了指墙角，“摊具你要用就拿去。”\n\n【已解锁】市场的流动小摊、江边夜摊，以及经营项目投资。（生意经验 +6 · 口碑 +3 · 林月关系 +9）`, run: () => { state.seen.meet_lin = true; state.relations.lin += 9; modify({business:6,reputation:3,energy:-4}); } }
      ]);
    } else {
      const r = state.relations.lin;
      const advice = r >= 35 ? '“你那几个摊子我路过都会去看一眼。上次茶饮那个小妹算错账，我替你说了她两句。”'
        : r >= 25 ? '“进货的价我熟。下次你要盘什么铺子，别自己去谈——你一开口人家就知道你急。”'
        : r >= 15 ? '“摊具你随时来拿，别再自己去租了，那个价是坑外地人的。”'
        : state.business < 22 ? '“先别看流水，看每一单剩下多少。卖得越多亏得越多，那不叫生意。”'
        : '“你该让钱替你干活了。自己守一辆车是活计，几处稳定现金流才是生意。”';
      const nextTier = r < 15 ? `再熟一点（关系 15），她的摊具就能白借，摆摊成本从 ¥100 降到 ¥55。`
        : r < 25 ? `关系到 25，她会带你去谈铺子，投资价打八五折。`
        : r < 35 ? `关系到 35，她会帮你盯着店，出事概率降四成五，补货窗口 +2 天。`
        : `她现在已经在替你看店了。`;
      showDialog('lin', advice, [
        { text: '帮她盘一次账', title: '替她盘账', result: `两个人对着一沓小票核了一个多小时。你发现她的糖水成本比上月高了一成——她自己都没注意。\n\n“行啊，”林月笑了，“你现在看得见数字后面的东西了。”\n\n（生意经验 +5 · 林月关系 +3 · 心压 -2）\n${nextTier}`, run: () => { state.relations.lin += 3; modify({business:5,stress:-2}); } },
        { text: '问问她自己是怎么熬过来的', title: '她的那三年', result: `林月擦桌子的手停了一下。\n\n“我来的时候二十三，比你还小。前头三年推一辆车，冬天手上全是口子，握不住勺。最难那年我爸也是在医院，我没回去。”\n\n她把抹布拧干，搭在盆沿上。\n\n“后来他好了，我才敢回。要是那时候没好——我这辈子的账，就永远差着那一笔。”\n\n她看了你一眼：“所以你别学我。钱要挣，人也要看。”\n\n（林月关系 +8 · 心压 -10）\n${nextTier}`, run: () => { state.relations.lin += 8; modify({ stress: -10, business: 2 }); } },
        { text: '请她吃顿便饭再聊（¥28 · 每天一次）', title: '两荤一素', result: `隔壁馆子，两荤一素，二十八块。林月说这顿该她请，你坚持付了钱。\n\n吃到一半她讲起自己刚来重庆那年，也是从一辆推车开始的。“熬得过去的人不多，”她夹了一筷子菜，“但你这个样子，我看着像。”（林月关系 +6 · 生意经验 +3 · 口碑 +2 · 饱腹 +18 · 心压 -5）`, run: () => { if (state.money < 28) { toast('连请客的钱都不够','bad'); return false; } money(-28,'请林月吃饭'); state.relations.lin += 6; modify({business:3,reputation:2,hunger:18,stress:-5}); } }
      ]);
    }
  }

  function talkChen() {
    if (!hasMet('chen')) {
      showDialog('chen', '“叔叔今天情况平稳，但恢复不是一两天的事。你也别总空着肚子来——家属先倒下，病人会更担心。”陈晓雨把注意事项一条条指给你看。', [
        { text: '把每一条都记进手机', title: '一条条记下来', result: `用药时间、翻身间隔、哪些指标要盯——你一条条打进备忘录，还设了闹钟。\n\n陈晓雨看了一眼你的屏幕：“你比大多数家属靠谱。顺便说一句，你自己的脸色也该看看医生了。”（健康 +5 · 心压 -5 · 陈晓雨关系 +6）`, run: () => { state.seen.meet_chen = true; state.relations.chen += 6; modify({health:5,stress:-5}); } },
        { text: '问清哪些护理可以自己做', title: '能省的那部分', result: `你问的不是“要花多少钱”，而是“哪些我可以自己来”。陈晓雨愣了两秒，然后一样样教你：擦身、翻身、记录尿量。\n\n“护工一天两百多，你自己做，这钱就是省下的。”（陈晓雨关系 +8 · 口碑 +2）`, run: () => { state.seen.meet_chen = true; state.relations.chen += 8; modify({business:1,reputation:2}); } }
      ]);
    } else {
      showDialog('chen', state.fatherState === '好转' ? '“最近几项指标都在往好的方向走。叔叔说你每次来都只讲好消息，但他其实什么都看得出来。”' : '“恢复有反复很正常。按时吃药、有人陪护，比你一次带多少东西更重要。”', [
        { text: '道谢，并确认下一次复查时间', title: '把日子记住', result: `你把复查的日子记在手机上，又道了谢。走出病区时，心里那根一直绷着的弦松了半格——至少这件事是清楚的、有安排的。（心压 -6 · 陈晓雨关系 +3）`, run: () => { state.relations.chen += 3; modify({stress:-6}); } },
        { text: '问问护工站是否还缺临时人手', title: '顺便问一句活', result: (state.relations.chen + 5 >= 8 ? `陈晓雨想了想：“确实缺人，夜班尤其。你在这儿本来就要守着，顺手挣一份也不算亏。”\n\n【已解锁】医院的临时护工。（陈晓雨关系 +5 · 口碑 +1）` : `“缺是缺，”她说得很实在，“但护工站要交给靠得住的人。你再来几趟，我替你问。”（陈晓雨关系 +5 · 口碑 +1）`), run: () => { state.relations.chen += 5; modify({reputation:1}); } }
      ]);
    }
  }

  function dailyEvent(day) {
    if (day === 5 && !state.flags.zhao5) {
      state.flags.zhao5 = true;
      showDialog('zhao', `“第五天。现在本息还剩 ${fmt(state.debt)}。我不催你马上全拿出来，但别让我找不到人。”`, [
        { text: '给他看账本：我每天都在挣', title: '把账本推过去', result: `你把这些天的收支一笔笔指给他看。赵坤看得很慢，最后只说了一句：“记账是好习惯。”\n\n他没有减一分钱，也没有多给一天。走的时候你才发现自己后背全湿了。（心压 +5 · 生意经验 +2）`, run: () => modify({stress:5,business:2}) },
        { text: '先还一笔，让数字说话', silent: true, run: () => { closeDialogs(); openRepay(); } }
      ]);
    } else if (day === 9 && !state.flags.chen9) {
      state.flags.chen9 = true;
      showDialog('chen', state.fatherVisits ? '“叔叔今天问你是不是又熬夜了。你来过，他心里有底，恢复也配合多了。”' : '“叔叔这两天总往门口看。忙我理解，但最好抽空来一趟。”', [
        { text: '今天安排去医院', title: '改了今天的第一站', result: `你把原本要去码头的路线改成了医院。今天大概率挣得比平时少——但有些账，不是钱算的。\n\n（你现在人已经在医院）`, run: () => { state.location='hospital'; } },
        { text: '先把这班活干完', title: '再等等', result: `你回了句“忙完这阵就去”。挂掉电话之后，那句话在心里反复响了很久。\n\n有些债不写在赵坤的本子上，但也是要还的。（心压 +5）`, run: () => modify({stress:5}) }
      ]);
    } else if (day === 15 && !state.flags.lin15 && hasMet('lin')) {
      state.flags.lin15 = true;
      showDialog('lin', '“半个月了。你现在应该问自己：是在用时间换钱，还是已经有一部分钱能替你干活？”', [
        { text: '打开投资清单，重新算一遍', silent: true, run: showInvestments },
        { text: '我先守住现金，月底以后再说', title: '先守住手里的', result: `“现在每一分钱都是我的还款进度。”你说得很干脆。\n\n林月没有反驳：“也对。手里有钱的人，心才不慌。”这句话让你今晚能睡得稍微踏实一点。（心压 -5 · 生意经验 +2）`, run: () => modify({stress:-5,business:2}) }
      ]);
    } else if ([6, 13, 20].includes(day) && !state.flags[`fee${day}`]) {
      state.flags[`fee${day}`] = true;
      const fee = 700;
      showDialog('chen', `“叔叔这一期的后续治疗费该交了，${fmt(fee)}。不是手术费，是康复期的药和护理——这部分停了，前面那一刀就白挨了。”`, [
        { text: `交上（${fmt(fee)}）`, title: '这一期交上了', result: `${fmt(fee)} 转过去，收据上写着"康复期用药及护理"。\n\n你算了一下，这笔钱够你在后巷买两次半小时的松弛，也够还债进度往前挪一小格。但你还是交了——你借这三万，本来就是为了这个。（父亲病情 +6）`,
          run: () => { if (state.money < fee) { toast('钱不够，只能先欠着', 'bad'); state.feesMissed += 1; adjustFather(-10); modify({ stress: 16 }); return false; } money(-fee, '父亲后续治疗费'); state.feesPaid += 1; adjustFather(6); modify({ stress: -4 }); } },
        { text: '这期先欠着', title: '先欠着', result: `你说下周一定补上。陈晓雨"嗯"了一声，没多说什么——她见过太多这样的下周。\n\n药停了，护理降级。省下的 ${fmt(fee)} 会留在你账上，代价记在另一本账上。（父亲病情 -10 · 心压 +16）`,
          run: () => { state.feesMissed += 1; adjustFather(-10); modify({ stress: 16 }); } }
      ]);
    } else if (day === 24 && !state.flags.wang24 && hasMet('wang')) {
      state.flags.wang24 = true;
      showDialog('wang', state.reputation >= 20 ? '“码头这一片都晓得你了。上次那个欠你工钱的老板，我帮你堵在门口了。”' : '“还剩六天吧。我不问你欠多少，只问一句——够不够？不够的话，我这儿能凑一点。”', [
        { text: '“够，王哥。我自己扛得住。”', title: '自己扛', result: `王强看了你两秒，没再劝。他从兜里摸出一包烟，抽出一根递给你，自己点了一根。\n\n"我年轻时候也欠过钱。那时候没人问我够不够。" 江面的雾漫上来，货轮鸣了一声。\n\n"扛不住了记得开口。开口不丢人，扛死了才丢人。"（心压 -12 · 关系 +6）`,
          run: () => { state.relations.wang += 6; modify({ stress: -12 }); } },
        { text: '“王哥，能借多少算多少。”', title: '开了口', result: (() => { const lend = Math.min(3000, 800 + state.relations.wang * 90 + state.reputation * 40); return `王强没问用途，也没提利息，从内袋里数出 ${fmt(lend)} 递过来："码头上的规矩，借了就还，还不上就来干活抵。"\n\n这笔钱不上赵坤的账，也不生利息。但它是从一个每天扛货的人身上出来的。（现金 +${fmt(lend)} · 心压 -8）`; })(),
          run: () => { const lend = Math.min(3000, 800 + state.relations.wang * 90 + state.reputation * 40); money(lend, '王强借的钱'); state.relations.wang += 3; modify({ stress: -8 }); state.flags.wangLoan = lend; } }
      ]);
    } else if (day === 26 && !state.flags.chen26) {
      state.flags.chen26 = true;
      const st = fatherStage();
      const line = st.key === 'good' ? '“叔叔今天自己下床走到窗边了。他说想看看重庆的江，我扶他站了五分钟。”'
        : st.key === 'critical' ? '“你要有个心理准备。不是让你放弃，是让你——把想说的话，趁早说。”'
        : st.key === 'bad' ? '“这两天夜里烧得厉害。药还在用，但恢复期拖太久，人是会垮的。”'
        : '“再有四天你那笔钱就到期了吧。我不懂那些，只知道叔叔这两天总在问你。”';
      showDialog('chen', line, [
        { text: '“我这几天一定抽空过来。”', title: '一句承诺', result: `陈晓雨点点头，没有追问是哪一天。\n\n"我在这儿上了六年班，"她说，"最后能陪在床边的，从来不是钱最多的那个，是肯来的那个。"（心压 -8）`, run: () => { state.relations.chen += 4; modify({ stress: -8 }); } },
        { text: '“这几天走不开。等我把账结了。”', title: '等我把账结了', result: `你说完就后悔了。陈晓雨没有反驳，只是把手里的病历合上。\n\n"好。" 她说，"那你快点。"\n\n走廊尽头的灯管在闪，一下一下。（心压 +12）`, run: () => modify({ stress: 12 }) }
      ]);
    } else if (day === 28 && !state.flags.father28) {
      state.flags.father28 = true;
      const st = fatherStage();
      const line = (st.key === 'critical'
        ? '（陈晓雨替他拨的号，又把手机贴到他耳边。听筒里先是很长一段呼吸声。）\n\n“……娃儿。别为我把自己搞垮。”'
        : st.key === 'good'
        ? '（陈晓雨把手机递到他手里，走出了病房。）\n\n“我听护士说你这个月瘦了十几斤。钱的事我知道一点——你妈走得早，我没本事，让你一个人扛这些。”'
        : '（是父亲自己拨的，号码还是你三年前那个。）\n\n“你别忙了，回来一趟。我这把年纪，什么都想得开。就是想看看你。”');
      const asFather = { name: `${state.name.slice(0,1)}父`, role: '住院部三楼东侧' };
      showDialog('chen', line, [
        { text: '“爸，还差最后两天。”', title: '还差最后两天', result: `你把还剩多少、还差多少，第一次原原本本告诉了他。说到一半你自己都听出声音在抖。\n\n电话那头安静了很久，久到你以为断线了。\n\n"我娃儿长大了。" 他说。然后就挂了——他从来不会在电话里哭给你听。（心压 -18 · 父亲病情 +5）`,
          run: () => { modify({ stress: -18 }); adjustFather(5); } },
        { text: '“挺好的，你别操心。”', title: '报喜不报忧', result: `你说一切都好，工作顺利，钱够用，下个月就能接他来重庆住。\n\n他"嗯"了几声，说那就好。挂断之后你才发现，这一个月你跟他说的每一句话，几乎没有一句是真的。\n\n（心压 -6）`,
          run: () => modify({ stress: -6 }) }
      ], asFather);
    } else if (day === 22 && !state.flags.zhao22 && state.debt > 0) {
      state.flags.zhao22 = true;
      showDialog('zhao', `“还剩八天，账上是 ${fmt(state.debt)}。你已经不是刚来时那个兜里五十块的人了——所以更该知道承诺值多少钱。”`, [
        { text: '现在就安排一次还款', silent: true, run: openRepay },
        { text: '月底前我会一次结清', title: '一句承诺', result: `“月底前，一次结清。”\n\n话出口的瞬间你就后悔了——你并不知道自己拿什么结清。赵坤只是笑了笑，把烟摁灭：“好啊。我记住了。”\n\n从今天起，这句话会压在你每一天上。（心压 +10）`, run: () => modify({stress:10}) }
      ]);
    }
  }

  function closeDialogs() { $('dialogModal').classList.remove('open'); }

  // ===== 跑货界面 =====
  function showTrade() {
    const loc = state.location;
    const list = tradesHere(loc);
    const cap = carryCap(), used = carryUsed();
    state.priceSeen = state.priceSeen || {};
    state.priceSeen[loc] = state.day;

    const rows = list.map(g => {
      const G = GOODS[g], p = priceAt(loc, g), tag = priceTag(p), d = depthAt(loc, g);
      const held = state.stock[g];
      const avg = held ? Math.round(held.cost / held.qty) : 0;
      const room = Math.floor((cap - used) / G.bulk);
      const maxBuy = Math.max(0, Math.min(room, Math.floor(state.money / p.ask)));
      const suspect = held && canInspect() && held.fake ? `<em class="bad-note">疑似残次 ${held.fake}${G.unit}</em>` : '';
      const def = maxBuy ? Math.min(maxBuy, d) : (held ? Math.min(held.qty, d) : 1);
      return `<div class="trade-row">
        <div class="trade-head"><span class="asset-icon">${G.icon}</span>
          <div><b>${G.name}${tag ? `<i class="price-tag ${tag.cls}">${tag.text}</i>` : ''}</b><small>${G.desc}</small></div>
          <div class="trade-price"><b>${fmt(p.ask)}</b><small>收 ${fmt(p.bid)}</small></div>
        </div>
        <p class="trade-meta">占位 ${G.bulk}/${G.unit} · 今日这里吃得下约 <b>${d}${G.unit}</b>，超出部分会被压价${maxBuy ? ` · 你最多进 ${maxBuy}${G.unit}` : ''}</p>
        ${held ? `<p class="trade-hold">手上 ${held.qty}${G.unit} · 均价 ${fmt(avg)}${suspect}</p>` : ''}
        <div class="trade-ops">
          <input type="number" min="1" value="${def}" data-qty="${g}" data-good="${g}">
          <button class="wide-btn" data-buy-good="${g}" ${maxBuy < 1 ? 'disabled' : ''}>进货</button>
          <button class="wide-btn danger-btn" data-sell-good="${g}" ${held ? '' : 'disabled'}>出货</button>
        </div>
        <p class="trade-quote" data-quote="${g}"></p>
      </div>`;
    }).join('');

    // 别处的行情：只记得你去过的那天看到的价，越旧越不可靠
    const others = Object.keys(MARKET_BIAS).filter(k => k !== loc && state.priceSeen[k]).map(k => {
      const seenDay = state.priceSeen[k], stale = state.day - seenDay;
      const cells = tradesHere(k).map(g => `<span><i>${GOODS[g].icon}</i>${fmt(priceAt(k, g, seenDay).bid)}</span>`).join('');
      return `<div class="memo-row"><b>${LOCATIONS[k].name}</b><div class="memo-cells">${cells}</div><small>${stale === 0 ? '今天的价' : `${stale}天前的价`}</small></div>`;
    }).join('');

    $('genericEyebrow').textContent = 'BUY LOW, SELL HIGH';
    $('genericTitle').textContent = `跑货 · ${LOCATIONS[loc].name}`;
    $('genericContent').innerHTML = list.length ? `
      <p class="trade-cap">容量 <b>${used}/${cap}</b>（${CARRY_NAME[carryKey()]}）· 手上货值 ${fmt(stockValue())}${canInspect() ? ' · 你已经会验货了' : ' · 生意经验 30 可学会验货'}</p>
      <div class="trade-list">${rows}</div>
      ${others ? `<div class="section-rule" style="margin:14px 0 8px"><span>你记下的别处行情（收购价）</span></div><div class="memo-list">${others}</div>` : ''}
      <p class="trade-foot">买进按标价，卖出低 8%。一口气吃进或倾销太多，价格会被你自己带偏——分几个地方出货，比一次清仓划算。行情每天重洗，压货过夜就是在赌明天。</p>`
      : `<p class="modal-lede">${LOCATIONS[loc].name}没有可以跑的货。<br><br>批发便宜的地方：沙坪坝老街、渝州劳务市场、大坪旧影像市场、朝天门码头。<br>卖得起价的地方：石桥铺工地、解放碑、磁器口、李子坝、南滨路。</p>`;
    $('genericModal').classList.add('open');
    document.querySelectorAll('[data-buy-good]').forEach(b => b.addEventListener('click', () => buyGood(b.dataset.buyGood)));
    document.querySelectorAll('[data-sell-good]').forEach(b => b.addEventListener('click', () => sellGood(b.dataset.sellGood)));
    document.querySelectorAll('[data-good]').forEach(el => { el.addEventListener('input', () => quote(el.dataset.good)); quote(el.dataset.good); });
  }

  // 输入数量时实时估价，让玩家看得见压价
  function quote(g) {
    const el = document.querySelector(`[data-quote="${g}"]`);
    if (!el) return;
    const qty = qtyOf(g), p = priceAt(state.location, g), d = depthAt(state.location, g), G = GOODS[g];
    if (!qty || !p) { el.textContent = ''; return; }
    const buyAvg = Math.round(p.ask * slip(qty, d, 'buy'));
    const held = state.stock[g];
    let text = `进 ${qty}${G.unit}：均价 ${fmt(buyAvg)}，共 ${fmt(buyAvg * qty)}${buyAvg > p.ask ? `（吃得太狠，加价 ${Math.round((buyAvg / p.ask - 1) * 100)}%）` : ''}`;
    if (held) {
      const q = Math.min(qty, held.qty);
      const sellAvg = Math.round(p.bid * slip(q, d, 'sell'));
      const delta = sellAvg * q - Math.round(held.cost / held.qty * q);
      text += ` ｜ 出 ${q}${G.unit}：均价 ${fmt(sellAvg)}，${delta >= 0 ? '赚' : '亏'} ${fmt(Math.abs(delta))}${sellAvg < p.bid ? `（倾销压价 ${Math.round((1 - sellAvg / p.bid) * 100)}%）` : ''}`;
    }
    el.innerHTML = text;
    el.className = `trade-quote ${buyAvg > p.ask ? 'warn' : ''}`;
  }

  function qtyOf(g) {
    const el = document.querySelector(`[data-qty="${g}"]`);
    const v = Math.floor(Number(el?.value));
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  function buyGood(g) {
    const p = priceAt(state.location, g), G = GOODS[g], d = depthAt(state.location, g);
    const qty = qtyOf(g);
    if (!p || !qty) return;
    const room = Math.floor((carryCap() - carryUsed()) / G.bulk);
    if (qty > room) return toast(`装不下了，最多还能带 ${room}${G.unit}`, 'bad');
    const unit = Math.round(p.ask * slip(qty, d, 'buy'));
    const total = unit * qty;
    if (total > state.money) return toast(`钱不够，还差 ${fmt(total - state.money)}`, 'bad');
    // 残次品：经验越高、渠道越正规，踩坑越少；后巷的货最不干净
    let rate = Math.max(.02, .13 - state.business * .0018);
    if (state.location === 'backstreet') rate += .12;
    if (state.location === 'market' || state.location === 'labor') rate -= .04;
    rate -= Math.max(0, state.reputation) * .0012;   // 有口碑的人，别人不太好意思拿次品糊弄
    const fake = Math.round(qty * Math.max(0, rate) * (.4 + Math.random() * 1.2));
    const before = snapshot();
    money(-total, `进货 · ${G.name}`);
    const st = state.stock[g] || (state.stock[g] = { qty: 0, cost: 0, fake: 0, day: state.day });
    st.qty += qty; st.cost += total; st.fake += fake; st.day = state.day;
    modify({ energy: -2, business: 1 });
    $('genericModal').classList.remove('open'); render(); saveGame();
    const over = unit > p.ask;
    showResult({
      type: 'finance', title: `进货 · ${G.name} ${qty}${G.unit}`,
      narrative: `${over ? `这里一天也就走得动 ${d}${G.unit}，你要 ${qty}${G.unit}，摊主转身就去别家调货，价也顺势往上抬了 ${Math.round((unit / p.ask - 1) * 100)}%。均价 ${fmt(unit)}` : `${fmt(unit)} 一${G.unit}`}，一共 ${fmt(total)}，占了 ${qty * G.bulk} 的容量。\n\n${canInspect() && fake ? `你一件件翻过去，挑出 ${fake}${G.unit} 品相不对的——对方嘴上说是"运输磕的"，价却一分不让。` : canInspect() ? '你一件件验过，这批货干净。' : '摊主捆好递给你，你没细看——真要有问题，也是到了卖的时候才知道。'}\n\n剩下的事只有一件：找到肯出更高价的地方，在行情变脸之前。`,
      before, after: snapshot()
    });
  }

  function sellGood(g) {
    const p = priceAt(state.location, g), G = GOODS[g], d = depthAt(state.location, g);
    const st = state.stock[g];
    const qty = Math.min(qtyOf(g), st?.qty || 0);
    if (!p || !st || !qty) return;
    const avg = st.cost / st.qty;
    const unit = Math.round(p.bid * slip(qty, d, 'sell'));
    const badly = Math.min(qty, Math.round(st.fake * (qty / st.qty)));
    const good = qty - badly;
    const revenue = Math.round(good * unit + badly * unit * .35);
    const cost = Math.round(avg * qty);
    const delta = revenue - cost;
    const before = snapshot();
    money(revenue, `出货 · ${G.name}`);
    st.qty -= qty; st.cost -= cost; st.fake = Math.max(0, st.fake - badly);
    if (st.qty <= 0) delete state.stock[g];
    if (delta >= 0) state.tradeProfit += delta; else state.tradeLoss += -delta;
    modify({ energy: -3, business: delta >= 0 ? 3 : 1, reputation: badly ? -1 : 1, stress: delta < 0 ? 5 : -2 });
    $('genericModal').classList.remove('open'); render(); saveGame();
    const dumped = unit < p.bid;
    const dumpLine = dumped ? `这里一天顶多消化 ${d}${G.unit}，你一次搬来 ${qty}${G.unit}。收货的把价往下压了 ${Math.round((1 - unit / p.bid) * 100)}%——“这么多货，我也得慢慢出。”\n\n` : '';
    let narrative;
    if (badly && delta < 0) narrative = `${dumpLine}收货的人翻了两下就把 ${badly}${G.unit} 挑了出来："这些不能按好货算。"\n\n好货按 ${fmt(unit)} 收，残次的只给三成半，一共 ${fmt(revenue)}。进货花了 ${fmt(cost)}——这一趟白跑，还倒贴 ${fmt(-delta)}。\n\n有些学费，不交是学不会的。`;
    else if (delta < 0) narrative = `${dumpLine}${dumped ? '' : `你到的时候，这里的价已经不是出发时那个价了。`}${fmt(unit)} 一${G.unit}，卖完 ${fmt(revenue)}，成本 ${fmt(cost)}，亏 ${fmt(-delta)}。\n\n行情不等人，胃口也不等人。`;
    else if (badly) narrative = `${dumpLine}${badly}${G.unit} 被挑出来压了价，好在整批还是赚的：卖了 ${fmt(revenue)}，成本 ${fmt(cost)}，净赚 ${fmt(delta)}。\n\n下次进货前，多翻两下。`;
    else narrative = `${dumpLine}${fmt(unit)} 一${G.unit}，${qty}${G.unit}一次出清，到手 ${fmt(revenue)}。成本 ${fmt(cost)}，净赚 ${fmt(delta)}。\n\n钱不是从力气里来的，是从两地之间那点差价里来的。`;
    showResult({ type: 'finance', title: `出货 · ${G.name} ${qty}${G.unit}`, narrative, before, after: snapshot() });
  }

  function showInvestments() {
    $('genericEyebrow').textContent = 'BUILD YOUR CASH FLOW';
    $('genericTitle').textContent = '经营项目';
    $('genericContent').innerHTML = `<div class="investment-list">${Object.entries(ASSETS).map(([key,a]) => {
      const owned = !!state.assets[key]; const price = assetCost(a); const can = state.money >= price && state.business >= a.req;
      const lo = Math.round((a.income*(1-a.vol)-a.upkeep)), hi = Math.round((a.income*(1+a.vol)-a.upkeep));
      return `<div class="asset-item"><span class="asset-icon">${a.icon}</span><div><b>${a.name}</b><small>好的一天 ${fmt(hi)} / 差的一天 ${fmt(lo)} · 每天固定开销 ${fmt(a.upkeep)}</small><small>出事概率 ${Math.round(a.mishap*100)}% · 最多 ${a.care} 天不补货 · 每天多耗 ${a.tend} 体力 ${a.tend} 心压</small><small class="muted-note">${a.risk}</small><small>需要生意经验 ${a.req}</small></div><button class="wide-btn buy-btn ${owned?'':'danger-btn'}" data-buy="${key}" ${owned||!can?'disabled':''}>${owned?'已投资':fmt(price)}</button></div>`;
    }).join('')}</div><p class="modal-note">摊子越大，赚得越多，塌得也越响。每天逐店摇一次：可能大赚，也可能因为城管、暴雨、设备故障或盘亏当天倒贴。<br>补货能让所有店恢复满产并额外 +15%，超过窗口期不补，收益会一路往下掉。</p>`;
    $('genericModal').classList.add('open');
    document.querySelectorAll('[data-buy]').forEach(btn => btn.addEventListener('click', () => buyAsset(btn.dataset.buy)));
  }

  // 林月关系够深，她会替你压价
  function assetDiscount() { return state.relations.lin >= 25 ? .85 : 1; }
  function assetCost(a) { return Math.round(a.cost * assetDiscount()); }

  function buyAsset(key) {
    const a = ASSETS[key];
    const price = a ? assetCost(a) : 0;
    if (!a || state.assets[key] || state.money < price || state.business < a.req) return;
    const before = snapshot();
    money(-price, `投资${a.name}`); state.assets[key] = { day: state.day }; modify({business:a.exp,reputation:3});
    $('genericModal').classList.remove('open'); render(); saveGame();
    showResult({ type:'finance', title:`${a.name} · 开张`, narrative:`招牌挂起来了。${state.name}把这笔积蓄变成了一处真正会产生现金流的生意。${assetDiscount()<1?`\n\n这个价是林月带你去谈的——原价 ${fmt(a.cost)}，她跟对方磨了一下午，压到 ${fmt(price)}。"你替我收过桌子，"她说，"这个不算人情。"`:''}\n\n从今晚起开始结算，好的日子和差的日子都会有。`, before, after:snapshot() });
  }

  function showHousing() {
    const current = currentHome();
    const trade = state.homeId === 'rental' ? 0 : Math.round(current.price * .65);
    $('genericEyebrow').textContent = 'A HOME OF YOUR OWN'; $('genericTitle').textContent = '购买或置换住房';
    $('genericContent').innerHTML = `<p class="modal-lede">当前住所：${current.name}。自住房每天仍有物业水电支出，但恢复效果明显更好。已有住房置换按原价65%抵扣。</p><div class="investment-list">${Object.entries(HOUSING).filter(([key])=>key!=='rental').map(([key,h])=>{
      const net=Math.max(0,h.price-trade); const owned=state.homeId===key; const upgrade=h.price>current.price;
      return `<div class="asset-item"><span class="asset-icon">${h.icon}</span><div><b>${h.name}</b><small>总价${fmt(h.price)} · 每晚体力+${h.energy} · 日持有${fmt(h.upkeep)}${trade?` · 置换抵${fmt(trade)}`:''}</small></div><button class="wide-btn danger-btn buy-btn" data-buy-house="${key}" ${owned||!upgrade||state.money<net?'disabled':''}>${owned?'现住所':fmt(net)}</button></div>`;
    }).join('')}</div>`;
    $('genericModal').classList.add('open');
    document.querySelectorAll('[data-buy-house]').forEach(btn=>btn.addEventListener('click',()=>buyHome(btn.dataset.buyHouse)));
  }

  function buyHome(key) {
    const target=HOUSING[key], current=currentHome();
    if (!target || target.price<=current.price) return;
    const trade=state.homeId==='rental'?0:Math.round(current.price*.65); const cost=target.price-trade;
    if (state.money<cost) return toast('现金不足，暂时买不起这套房','bad');
    const before=snapshot(); money(-cost,trade?`置换${target.name}`:`购买${target.name}`); state.homeId=key; modify({stress:-12,reputation:5});
    $('genericModal').classList.remove('open'); syncHomeLocation(); render(); saveGame();
    showResult({type:'finance',title:`${target.name} · 交房`,narrative:`${state.name}付出${fmt(cost)}${trade?`（旧房抵扣${fmt(trade)}）`:''}，拿到了真正属于自己的钥匙。从今晚起，住所不再叫出租屋，睡眠和健康恢复都会更好。`,before,after:snapshot()});
  }

  function showVehicles() {
    const current=currentVehicle(); const trade=current?Math.round(current.price*.6):0;
    $('genericEyebrow').textContent='MOBILITY & INCOME'; $('genericTitle').textContent='购买或置换汽车';
    $('genericContent').innerHTML=`<p class="modal-lede">${current?`当前车辆：${current.name}。旧车置换按原价60%抵扣。`:'目前没有汽车。买车后地图通勤改为自驾，并可在解放碑跑网约车。'}</p><div class="investment-list">${Object.entries(VEHICLES).map(([key,v])=>{
      const net=Math.max(0,v.price-trade); const owned=state.vehicleId===key; const upgrade=!current||v.price>current.price;
      return `<div class="asset-item"><span class="asset-icon">${v.icon}</span><div><b>${v.name}</b><small>${v.desc} · 单程油费${fmt(v.fuel)}${trade?` · 置换抵${fmt(trade)}`:''}</small></div><button class="wide-btn danger-btn buy-btn" data-buy-car="${key}" ${owned||!upgrade||state.money<net?'disabled':''}>${owned?'当前车辆':fmt(net)}</button></div>`;
    }).join('')}</div>`;
    $('genericModal').classList.add('open');
    document.querySelectorAll('[data-buy-car]').forEach(btn=>btn.addEventListener('click',()=>buyVehicle(btn.dataset.buyCar)));
  }

  function buyVehicle(key) {
    const target=VEHICLES[key], current=currentVehicle(); if (!target||current&&target.price<=current.price) return;
    const trade=current?Math.round(current.price*.6):0, cost=target.price-trade;
    if(state.money<cost)return toast('现金不足，暂时买不起这辆车','bad');
    const before=snapshot(); money(-cost,current?`置换${target.name}`:`购买${target.name}`); state.vehicleId=key; modify({stress:-5,reputation:3});
    $('genericModal').classList.remove('open'); render(); saveGame();
    showResult({type:'finance',title:`${target.name} · 提车`,narrative:`${state.name}支付${fmt(cost)}${trade?`（旧车抵扣${fmt(trade)}）`:''}开走了${target.name}。今后通勤按油费结算，也能在解放碑接网约车订单。`,before,after:snapshot()});
  }

  function openRepay() {
    $('genericEyebrow').textContent = 'KEEP YOUR WORD'; $('genericTitle').textContent = '偿还借款';
    $('genericContent').innerHTML = `<p class="modal-lede">当前现金 ${fmt(state.money)}，待还 ${fmt(state.debt)}。支持分期偿还，已还部分不会再计入债务。</p>
      <div class="repay-form"><input id="repayInput" type="number" min="1" max="${Math.min(state.money,state.debt)}" value="${Math.min(1000,state.money,state.debt)}"><button class="primary-btn" id="confirmRepay">确认还款</button></div>
      <div class="repay-presets"><button data-preset="500">¥500</button><button data-preset="2000">¥2,000</button><button data-preset="half">一半现金</button><button data-preset="all">全部结清</button></div>`;
    $('genericModal').classList.add('open');
    document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      const max = Math.min(state.money,state.debt); const v = btn.dataset.preset;
      $('repayInput').value = v==='all'?max:v==='half'?Math.floor(max/2):Math.min(Number(v),max);
    }));
    $('confirmRepay').addEventListener('click', repay);
  }

  function repay() {
    const value = Math.floor(Number($('repayInput').value));
    if (!Number.isFinite(value) || value <= 0 || value > state.money || value > state.debt) return;
    const before = snapshot();
    state.money -= value; state.debt -= value; state.paid += value;
    if (state.debt <= 0) delete state.flags.shopSkim; state.totalExpense += value; state.daily.expense += value;
    addLog('偿还借款', -value, 'bad'); modify({stress: -Math.min(18, value/500), reputation: value>=2000?2:0});
    $('genericModal').classList.remove('open'); render(); saveGame();
    showResult({ type:'finance', title:'还款到账', narrative:state.debt===0?`${state.name}看着“待还金额”终于归零。压在胸口许久的石头，第一次真正松动了。`:`${state.name}转出${fmt(value)}，把还款记录又往前推了一截。距离彻底摆脱这笔债，还剩${fmt(state.debt)}。`, before, after:snapshot() });
  }

  function showLedger() {
    const net = state.totalIncome - state.totalExpense;
    $('genericEyebrow').textContent = 'MONTHLY LEDGER'; $('genericTitle').textContent = '本月账本';
    $('genericContent').innerHTML = `<div class="ledger-grid">
      <div class="ledger-cell"><span>累计收入</span><b class="good">${fmt(state.totalIncome)}</b></div>
      <div class="ledger-cell"><span>累计支出</span><b class="bad">${fmt(state.totalExpense)}</b></div>
      <div class="ledger-cell"><span>现金净流入</span><b class="${net>=0?'good':'bad'}">${fmt(net)}</b></div>
      <div class="ledger-cell"><span>劳动收入</span><b>${fmt(state.workIncome)}</b></div>
      <div class="ledger-cell"><span>资产收入</span><b>${fmt(state.passiveIncome)}</b></div>
      <div class="ledger-cell"><span>每日被动收益</span><b>${fmt(passivePerDay())}</b></div>
      <div class="ledger-cell"><span>跑货赚到</span><b class="good">${fmt(state.tradeProfit||0)}</b></div>
      <div class="ledger-cell"><span>跑货亏掉</span><b class="bad">${fmt(state.tradeLoss||0)}</b></div>
      <div class="ledger-cell"><span>手上压货</span><b>${fmt(stockValue())}</b></div>
      <div class="ledger-cell"><span>利息累计</span><b class="bad">${fmt(state.interestPaid||0)}</b></div>
      <div class="ledger-cell"><span>被抢走</span><b class="bad">${fmt(state.extortedTotal||0)}</b></div>
      <div class="ledger-cell"><span>被拘留</span><b class="bad">${state.detentionDays||0} 天</b></div>
      <div class="ledger-cell"><span>父亲病情</span><b>${getFatherState()}（${state.fatherVisits} 次探视）</b></div>
    </div><div class="history-list">${state.history.length?state.history.map(h=>`<div class="history-row"><span>第${h.day}天</span><em>${h.label}</em><b class="${h.kind}">${h.amount>0?'+':''}${fmt(h.amount)}</b></div>`).join(''):'<div class="empty-actions">还没有收支记录</div>'}</div>`;
    $('genericModal').classList.add('open');
  }

  function showMenu() {
    $('genericEyebrow').textContent = 'GAME MENU'; $('genericTitle').textContent = '山城浮生';
    $('genericContent').innerHTML = `<div class="menu-list"><button class="wide-btn" id="menuSave">保存当前生活</button><button class="wide-btn" id="menuLedger">查看本月账本</button><button class="wide-btn danger-btn" id="menuRestart">放弃并重新开始</button></div><p class="modal-note">存档保存在当前浏览器中。关闭页面后仍可继续。</p>`;
    $('genericModal').classList.add('open');
    $('menuSave').onclick=()=>{saveGame(true);$('genericModal').classList.remove('open');};
    $('menuLedger').onclick=showLedger;
    $('menuRestart').onclick=()=>{ if(confirm('确定放弃当前进度并重新开始吗？')) { localStorage.removeItem(SAVE_KEY); location.reload(); } };
  }

  function showEnding(type) {
    state.ended = true; state.endingType = type;
    const f = fatherStage();
    const wealth = state.money + Object.keys(state.assets).reduce((sum,k)=>sum+ASSETS[k].cost,0) + (currentHome().price || 0) + (currentVehicle()?.price || 0) + stockValue();
    let title, text, seal;

    if (type === 'success') {
      // 债还清了，但父亲那条线单独结算
      if (f.key === 'critical') {
        title='账清了，他没等到'; seal='迟';
        text=`最后一笔转出去的时候，你正站在住院部楼下。抬头能看见三楼东侧那扇窗。

三十天，三万块，一分不欠。可这一个月你${state.fatherVisits ? `只上去过 ${state.fatherVisits} 次` : '一次也没有上去过'}，${state.feesMissed ? `后续治疗费还断了 ${state.feesMissed} 期` : '钱是按时交的'}。

你把手机揣回兜里，忽然想不起来自己到底是为什么在还这笔钱。`;
      } else if (state.fatherVisits === 0) {
        title='他不知道你还上了'; seal='空';
        text=`赵坤把借条撕了，说了句"痛快"。你走出那条巷子的时候，天刚亮。

三十天里你没有去过一次医院。你有一万个理由，每一个都成立：要挣钱，要跑货，要还款，要活下去。

可他这三十天，只是躺在那儿，等一个没来的人。`;
      } else if (f.key === 'good' && wealth >= 30000) {
        title='山城有了你的灯'; seal='盛';
        text=`借款已经还清，你没有停下。店里的灯在坡街亮到深夜。

父亲出院那天，你开车去接他。他坐在副驾上一路没说话，快到江边时忽然问："这车是你的？"你说是。他"嗯"了一声，又看了很久窗外。

他没夸你。但那天晚上他把你这一个月发的每一条消息，翻来覆去看了三遍。`;
      } else if (f.key === 'good') {
        title='他能自己走下楼了'; seal='安';
        text=`钱还清那天，你几乎身无分文。但父亲已经能扶着栏杆自己下楼，在住院部门口晒了半个钟头太阳。

他说重庆的太阳比老家的毒。你说是。然后两个人就那么坐着，谁也没提这三十天。

有些事说出来就轻了，不如让它压着。`;
      } else if (Object.keys(state.assets).length) {
        title='从一辆推车开始'; seal='成';
        text=`你按期还清了借款，还留下了一门会持续赚钱的小生意。父亲的恢复不算快，但至少稳住了。

山城没有让你一夜暴富，却给了你站稳脚跟的地方。`;
      } else {
        title='清清白白，重新出发'; seal='信';
        text=`最后一笔钱转出去时，你几乎身无分文。但承诺还上了，父亲还在恢复中。

明天不用再为倒计时醒来。`;
      }
    }
    else if (type === 'hospitalized') { title='第二次倒下，没能再起来'; seal='憾'; text=`你已经在这张床上躺过一次，出院那天就该停下的。这一次医生把陈晓雨叫到走廊说话，声音压得很低。

三楼东侧那张床上的人还在等你。你们父子俩，现在住在同一栋楼里。`; }
    else if (type === 'sudden') { title='心跳停在了坡道上'; seal='终'; text=`没有预兆，也没有告别。你倒在爬了三十天的那段坡上，手机屏幕还亮着未接来电。

父亲第二天才知道消息。那笔为他借的钱，最终连本带利落到了别人手里；而他这辈子最后悔的事，是当初签了那张手术同意书。`; }
    else if (type === 'crippled') { title='走不动了'; seal='残'; text=`腿保住了，但医生说你以后不能再做重活。三十天里你拼命想赚回来的东西，一次就赔了个干净。

病房只隔两层楼。护工推你去做检查时，会经过他那间。`; }
    else if (type === 'stripped') { title='被搬空的房间'; seal='空'; text=`到期这天，赵坤没有敲门就进来了。能变现的都被清点带走，折价 ${fmt(state.seizedValue)}，账上还剩 ${fmt(state.debt)}。

你重新回到只有一张床板的房间，比第一天还少了一样东西——退路。`; }
    else if (type === 'vanish') { title='第三十一天，没有人再见过你'; seal='失'; text=`最后通牒到期，欠款仍是 ${fmt(state.debt)}。那天夜里，出租屋的灯亮了一整宿，门开着，饭还温着。

陈晓雨往你手机打了十几个电话。三楼东侧第二张床前，从此没再等来那个人。`; }
    else { title='三十天到了'; seal='债'; text=`你没能在期限内结清，仍欠 ${fmt(state.debt)}。赵坤收走了可变现的资产，生活被迫转向另一条更艰难的路。

父亲的病还在那儿，账也还在那儿。`; }

    $('endingSeal').textContent=seal; $('endingTitle').textContent=title; $('endingText').textContent=text;
    const scars = (state.chronic||[]).map(k=>CHRONIC[k].name).join('、') || '无';
    const trade = (state.tradeProfit||0) - (state.tradeLoss||0);
    const cells = [
      ['最终现金', fmt(state.money)],
      ['身家估值', fmt(wealth)],
      ['父亲病情', `${f.name}（探视 ${state.fatherVisits} 次）`],
      ['治疗费', `交 ${state.feesPaid||0} 期 / 欠 ${state.feesMissed||0} 期`],
      ['住房 / 车辆', `${state.homeId==='rental'?'租房':currentHome().name} · ${currentVehicle()?.name||'无车'}`],
      ['山城口碑', `${state.reputation}（工价 ${repLabel()||'±0%'}）`],
      ['跑货净利', `${trade>=0?'+':'-'}${fmt(Math.abs(trade))}`],
      ['落下的病', scars],
      ['受伤 / 住院', `${state.injuryCount||0} 次 / ${state.hospitalCount||0} 次`],
      ['被拘留', `${state.detentionDays||0} 天`],
      ['被催收', `${state.collectStage} 次，抢走 ${fmt(state.extortedTotal||0)}`],
      ['利息累计', fmt(state.interestPaid||0)]
    ];
    $('endingStats').innerHTML = cells.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');
    $('endingModal').classList.add('open'); saveGame();
  }

  function startNew() {
    const name = $('playerNameInput').value.trim() || '周川'; state = freshState(name);
    eventQueue = []; recalcCaps();
    localStorage.removeItem(SAVE_KEY); $('startModal').classList.remove('open'); render(); saveGame();
    setTimeout(() => toast(`${name}，你在山城的第一个清晨开始了。`), 400);
  }

  function continueGame() {
    try { state = { ...freshState(), ...JSON.parse(localStorage.getItem(SAVE_KEY)), daily:{income:0,expense:0,...JSON.parse(localStorage.getItem(SAVE_KEY)).daily} }; }
    catch (_) { return toast('存档损坏，请重新开始', 'bad'); }
    eventQueue = []; state.chronic = state.chronic || []; state.stock = state.stock || {}; if (state.fatherHealth == null) state.fatherHealth = 55; state.priceSeen = state.priceSeen || {}; state.seed = state.seed || Math.floor(Math.random()*1e9); recalcCaps();
    $('startModal').classList.remove('open'); render();
    if (state.ended) setTimeout(() => showEnding(state.endingType || (state.debt <= 0 ? 'success' : 'debt')), 120);
  }

  function bind() {
    $('newGameBtn').addEventListener('click', startNew); $('continueBtn').addEventListener('click', continueGame);
    $('saveBtn').addEventListener('click', () => saveGame(true)); $('brandBtn').addEventListener('click', showMenu);
    $('soundBtn').addEventListener('click', () => { soundOn=!soundOn; $('soundBtn').textContent=soundOn?'♪':'×'; toast(soundOn?'声音已开启':'声音已关闭'); });
    $('repayBtn').addEventListener('click', openRepay); $('ledgerBtn').addEventListener('click', showLedger);
    $('genericClose').addEventListener('click', () => { $('genericModal').classList.remove('open'); if (!state.ended) flushEvents(); });
    $('resultContinue').addEventListener('click', closeResult);
    $('restartBtn').addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); location.reload(); });
    document.querySelectorAll('#actionTabs button').forEach(btn => btn.addEventListener('click', () => { state.tab=btn.dataset.tab; renderActions(); }));
    // 移动端分页：全部走 data-mview（而不是内联 display），旋转屏幕或回到桌面宽度时不会残留样式
    document.querySelectorAll('[data-mobile]').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mobile]').forEach(b=>b.classList.toggle('active',b===btn));
      const mode = btn.dataset.mobile;
      document.body.dataset.mview = mode;
      $('locationList').closest('.location-panel').classList.toggle('mobile-open', mode==='map');
      $('vitals').closest('.status-panel').classList.toggle('mobile-open', mode==='status');
      window.scrollTo(0, 0);
    }));
    document.body.dataset.mview = 'actions';

    // 弹窗打开时锁住背景滚动，关闭后自动恢复
    const layers = document.querySelectorAll('.modal-layer');
    const syncScrollLock = () => document.body.classList.toggle('modal-open', [...layers].some(l => l.classList.contains('open')));
    const mo = new MutationObserver(syncScrollLock);
    layers.forEach(l => mo.observe(l, { attributes:true, attributeFilter:['class'] }));
    syncScrollLock();

    // iOS 10 起会忽略 user-scalable=no，这里拦掉捏合缩放；
    // 双击缩放由 CSS 的 touch-action:manipulation 负责，避免误伤连续点击。
    ['gesturestart','gesturechange','gestureend'].forEach(ev =>
      document.addEventListener(ev, e => e.preventDefault(), { passive:false }));
    document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive:false });

    window.addEventListener('beforeunload', () => { if (!$('startModal').classList.contains('open')) saveGame(); });
  }

  bind(); updateContinue(); recalcCaps(); render();
  window.GameAPI = {
    getState: () => JSON.parse(JSON.stringify(state)),
    setState: patch => { state={...state,...patch}; render(); },
    endDay: () => endDay(true),
    locations: Object.keys(LOCATIONS), assets: ASSETS, housing: HOUSING, vehicles: VEHICLES, saveKey: SAVE_KEY
  };
})();
