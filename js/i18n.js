/* ============================================================
   i18n — UI strings in English + 中文.
   World-famous slogans / quotes stay English (see content.js).
   zh values fall back to en when missing.
   ============================================================ */

export const STRINGS = {
  en: {
    lang_name: '中文',
    tagline_address: '231 East 47th Street · New York · Open 24 Hours',
    clockin_sub: 'A machine you operate. Pull the ink. Multiply yourself. Clock out with your edition.',
    clockin_button: '▸ CLOCK IN',
    clockin_fineprint: 'Everything you make is made in your browser. Nothing leaves your device.',
    enter_cue: 'ENTER',

    nav_press:'The Press', nav_wall:'The Wall', nav_inklab:'Ink Lab', nav_screentest:'Screen Test',
    nav_epi:'E.P.I.', nav_capsule:'Time Capsule', nav_works:'The Works', nav_gallery:'Drying Rack', nav_about:'About',

    press_title:'THE PRESS', wall_title:'THE WALL', inklab_title:'INK LAB', screentest_title:'SCREEN TEST',
    epi_title:'EXPLODING PLASTIC INEVITABLE', capsule_title:'TIME CAPSULE No. 4',
    works_title:'THE WORKS', gallery_title:'THE DRYING RACK', about_title:'ABOUT THE FACTORY',

    press_hint:"Load an ink, then drag the squeegee straight down — top to bottom. Slow & firm floods solid; fast & loose leaves it streaky. Pull again in a new colour and let it go a little off-register. That's the point.",
    wall_hint:'The same picture again and again, each cell a different colourway — the Marilyn diptych logic. The more you look, the less it means. Hover a tile to knock it off-register.',
    inklab_hint:'Drag one ink blob onto the other. They smear into a new fluorescent and the Factory names it. Add it to the rack and print Warhols in your own colours.',
    screentest_idle_hint:'Warhol filmed 472 silent portraits and dared the sitter not to move. So: do nothing. Stop moving your mouse, and the Factory rewards your stillness — in colour.',
    epi_hint:"The Velvet Underground & Nico played under Andy's lights. Peel the banana to start the drone — the room reacts to the sound. No files; it's all synthesised.",
    capsule_hint:'Warhol sealed 610 boxes of everyday junk and called it art. Tear the tape and rummage. Each thing kept for a reason only he understood.',
    gallery_hint:'Everything you pull, shoot or seal pins up here to dry — kept on this device only. Clock out to take the whole contact sheet home.',
    works_hint:'A study wall of the real works. Unofficial, educational, non-commercial — images are linked from public archives for learning. Click any plate to read about it.',

    press_subjects_label:'SUBJECT', press_upload:'⬆ UPLOAD', press_webcam:'◉ WEBCAM',
    cam_denied:'✕ PERMISSION DENIED', cam_notfound:'✕ NO CAMERA FOUND', cam_inuse:'✕ CAMERA IN USE', cam_none:'✕ NO CAMERA',
    press_machine:'▶ MACHINE PULL', press_clear:'↺ FRESH PAPER', press_download:'⬇ DOWNLOAD', press_pin:'📌 PIN TO RACK',
    wall_density:'DENSITY', wall_recolour:'⟳ RECOLOUR ALL', wall_useprint:'⮌ USE MY PRINT', wall_pullfirst:'⮌ PULL ONE FIRST',
    inklab_pick:'PICK TWO TO MIX', inklab_add:'＋ ADD TO RACK',
    screentest_webcam:'◉ ROLL CAMERA', screentest_upload:'⬆ UPLOAD A FACE', screentest_save:'★ KEEP THE STILL',
    screentest_privacy:'Camera stays on your device. No film leaves the room.',
    epi_toggle:'▶ DROP THE NEEDLE', epi_reduce_flashing:'reduce flashing',
    capsule_reseal:'⮌ RESEAL THE BOX',
    gallery_empty:'Nothing on the rack yet. Go pull a print.',
    gallery_clockout:'⬇ CLOCK OUT — EXPORT CONTACT SHEET', gallery_clear:'🗑 EMPTY THE RACK',
    works_source:'view source ↗', works_repr:'representation',
    works_disclaimer:'Unofficial educational tribute. Works © The Andy Warhol Foundation for the Visual Arts; shown here for personal study, linked from public archives. Not affiliated with the Foundation or Museum.',

    prev_room:'PREV', next_room:'NEXT', room_of:'ROOM',
    epi_stop:'◼ STOP THE MUSIC', press_snap:'◉ SNAP!', st_webcam_stop:'◼ STOP CAMERA',
    sound_on:'SOUND ON', sound_off:'SOUND OFF', flash_ok:'FLASH OK', flash_low:'FLASH LOW',
    footer:'THE SILVER FACTORY · an unofficial interactive tribute to Andy Warhol · made entirely in your browser',

    about_intro: [
      "The Silver Factory was Andy Warhol's studio on the fifth floor of 231 East 47th Street in Manhattan, which he occupied from late 1963 to 1968. Beginning in 1964, the photographer and lighting designer Billy Name covered its walls, columns, and even the toilet and the freight elevator in aluminium foil and silver paint, turning the loft into a single reflective room. It became the gathering point for the cast of artists, musicians, hustlers, debutantes, and drifters Warhol called his Superstars.",
      "Here Warhol ran art as an assembly line. Working from photographs and press images, he and his assistant Gerard Malanga produced silkscreen paintings in editions and series: the Marilyns after Marilyn Monroe's 1962 death, the Lizes, the Elvises, the Flowers, and the Campbell's Soup Cans. “I want to be a machine,” he said. The point was repetition, surface, and the look of mass production rather than the singular touch of the artist's hand.",
      "The Factory was also a film and music studio. Between 1964 and 1966 Warhol shot the Screen Tests — roughly 472 silent black-and-white 16mm filmed portraits of visitors, each the length of a 100-foot roll. In 1966 he staged the Exploding Plastic Inevitable around The Velvet Underground & Nico, and produced their first album with its peelable banana cover. Later he treated the Polaroid as his “pencil,” and across his life he filled hundreds of cardboard boxes he called Time Capsules with the daily debris of his world."
    ],
    about_facts: [
      { fact:'Address', detail:"231 East 47th Street, fifth floor, Manhattan. Warhol's studio there ran late 1963–1968, before the move to 33 Union Square West." },
      { fact:'The silvering', detail:'Billy Name began covering the walls, pipes, and fixtures in aluminium foil and silver paint in 1964, inspired by his own silvered apartment.' },
      { fact:'Soup Cans', detail:"Warhol's 1962 series comprised 32 canvases, one for each variety Campbell's sold at the time; first shown at the Ferus Gallery, Los Angeles." },
      { fact:'Marilyn', detail:'The Marilyn silkscreens, begun in August 1962 after Monroe\'s death, were based on a single 1953 publicity still from the film Niagara.' },
      { fact:'Screen Tests', detail:'Roughly 472 silent 16mm filmed portraits, shot 1964–1966; each sitter filmed on a 100-foot roll, the result projected in slow motion.' },
      { fact:'The banana', detail:'Warhol produced and is credited with the cover of the 1967 Velvet Underground & Nico debut: a screenprinted banana you could peel to reveal pink fruit.' },
      { fact:'Exploding Plastic Inevitable', detail:'A traveling 1966–67 multimedia event combining the Velvet Underground with films, lights, and dancers including Gerard Malanga and Mary Woronov.' },
      { fact:'Time Capsules', detail:'From 1974 on, Warhol filled 610 sealed cardboard boxes with letters, photos, receipts, and objects; now held at The Andy Warhol Museum, Pittsburgh.' }
    ],
    about_philosophy: [
      "Warhol took the imagery of the supermarket and the gossip column and treated it as subject matter without irony or apology. A soup can, a dollar bill, a movie star, an electric chair: he printed them flat, in series, in commercial colours, until the difference between an advertisement and a painting stopped mattering. He liked that a Coke was a Coke, and that the President, Elizabeth Taylor, and the person on the street all drank the same one.",
      "He was equally plain about fame and money. “In the future everybody will be world-famous for fifteen minutes.” “Making money is art and working is art and good business is the best art.” He presented himself as surface all the way down: “If you want to know all about Andy Warhol, just look at the surface of my paintings and films and me, and there I am. There's nothing behind it.”"
    ],
    about_colophon: 'This is an unofficial fan tribute, not affiliated with, endorsed by, or sponsored by The Andy Warhol Foundation for the Visual Arts or The Andy Warhol Museum. The interactive artwork is generated client-side in your browser; the catalogue images are linked from public archives for educational study. Built with vanilla JavaScript, the HTML Canvas API, the Web Audio API, and GSAP.',
    about_credit: 'An autonomous overnight build · 2026'
  },

  zh: {
    lang_name: 'EN',
    tagline_address: '东 47 街 231 号 · 纽约 · 24 小时营业',
    clockin_sub: '一台由你操作的机器。拉动油墨，复制你自己，下班时带走属于你的版次。',
    clockin_button: '▸ 打卡进厂',
    clockin_fineprint: '你做的一切都在你的浏览器里生成。没有任何数据离开你的设备。',
    enter_cue: '进入',

    nav_press:'印刷台', nav_wall:'重复墙', nav_inklab:'油墨室', nav_screentest:'试镜',
    nav_epi:'E.P.I.', nav_capsule:'时间胶囊', nav_works:'作品', nav_gallery:'晾画架', nav_about:'关于',

    press_title:'丝网印刷台', wall_title:'重复墙', inklab_title:'油墨室', screentest_title:'试镜',
    epi_title:'爆炸塑料必然（Exploding Plastic Inevitable）', capsule_title:'时间胶囊 第 4 号',
    works_title:'作品', gallery_title:'晾画架', about_title:'关于工厂',

    press_hint:'选一种油墨，然后把刮板笔直地从上往下拖——慢而稳会铺成实色，快而松会留下飞白。换个颜色再拉一次，让它稍微「对不齐」。错位，正是重点。',
    wall_hint:'同一张图，一遍又一遍，每格换一种配色——这就是 Marilyn 双联画的逻辑。你看得越久，意义越淡。把鼠标移到某一格，让它「错位」。',
    inklab_hint:'把一团油墨拖到另一团上，它们会晕染出一种新的荧光色，工厂会替它起名。加进油墨架，就能用你自己的颜色去印沃霍尔。',
    screentest_idle_hint:'沃霍尔拍过 472 段沉默的肖像，挑衅坐着的人——别动。所以：什么都别做。停下你的鼠标，工厂会用色彩奖励你的静止。',
    epi_hint:'The Velvet Underground & Nico 曾在安迪的灯光下演出。剥开香蕉启动 drone——房间会随声音律动。没有任何音频文件，全部实时合成。',
    capsule_hint:'沃霍尔把 610 箱日常杂物封存起来，称之为艺术。撕开胶带翻一翻。每件东西被留下，都有只有他自己懂的理由。',
    gallery_hint:'你拉的每张印、拍的每帧、封的每箱，都会钉在这里晾干——只存在这台设备上。打卡下班，把整张接触印样带回家。',
    works_hint:'一面真迹的学习墙。非官方、教学、非商业——图片来自公共档案，仅供学习。点任意一幅了解它。',

    press_subjects_label:'图样', press_upload:'⬆ 上传', press_webcam:'◉ 摄像头',
    cam_denied:'✕ 权限被拒绝', cam_notfound:'✕ 未找到摄像头', cam_inuse:'✕ 摄像头被占用', cam_none:'✕ 没有摄像头',
    press_machine:'▶ 机器代拉', press_clear:'↺ 换张纸', press_download:'⬇ 下载', press_pin:'📌 钉到晾画架',
    wall_density:'密度', wall_recolour:'⟳ 全部换色', wall_useprint:'⮌ 用我的印作', wall_pullfirst:'⮌ 先拉一张',
    inklab_pick:'选两种来混合', inklab_add:'＋ 加进油墨架',
    screentest_webcam:'◉ 开始拍摄', screentest_upload:'⬆ 上传一张脸', screentest_save:'★ 留下这帧',
    screentest_privacy:'摄像头只在你的设备上。没有任何画面离开这个房间。',
    epi_toggle:'▶ 放下唱针', epi_reduce_flashing:'减少闪烁',
    capsule_reseal:'⮌ 重新封箱',
    gallery_empty:'晾画架上还什么都没有。去拉一张印吧。',
    gallery_clockout:'⬇ 打卡下班 — 导出接触印样', gallery_clear:'🗑 清空晾画架',
    works_source:'查看来源 ↗', works_repr:'示意图',
    works_disclaimer:'非官方教学致敬。作品版权 © The Andy Warhol Foundation for the Visual Arts；此处仅供个人学习，图片链接自公共档案。与基金会及美术馆无任何关联。',

    prev_room:'上一间', next_room:'下一间', room_of:'房间',
    epi_stop:'◼ 停止音乐', press_snap:'◉ 拍下！', st_webcam_stop:'◼ 停止摄像头',
    sound_on:'声音 开', sound_off:'声音 关', flash_ok:'闪烁 正常', flash_low:'闪烁 弱',
    footer:'银色工厂 · 一个非官方的安迪·沃霍尔互动致敬 · 完全在你的浏览器里生成',

    about_intro: [
      '银色工厂是安迪·沃霍尔位于曼哈顿东 47 街 231 号五楼的工作室，他从 1963 年底使用到 1968 年。从 1964 年起，摄影师兼灯光设计师 Billy Name 用铝箔和银漆覆盖了墙壁、柱子，甚至厕所和货梯，把整个阁楼变成一个反光的房间。这里成了沃霍尔称之为「超级明星（Superstars）」的艺术家、乐手、混混、名媛与流浪者的聚集地。',
      '在这里，沃霍尔像流水线一样生产艺术。他和助手 Gerard Malanga 以照片和新闻图片为底，成批、成系列地制作丝网版画：玛丽莲（在 Marilyn Monroe 于 1962 年去世后）、丽兹、猫王、花卉，以及金宝汤罐头。「I want to be a machine.」，他说。重点是重复、是表面、是大规模生产的外观，而不是艺术家之手那独一无二的笔触。',
      '工厂也是电影与音乐的片场。1964 到 1966 年间，沃霍尔拍摄了「试镜（Screen Tests）」——约 472 段沉默的黑白 16 毫米来访者肖像，每段都是一卷 100 英尺胶片的长度。1966 年，他围绕 The Velvet Underground & Nico 策划了「爆炸塑料必然（Exploding Plastic Inevitable）」，并为他们的首张专辑做了那个可剥开的香蕉封面。后来他把宝丽来相机当作自己的「铅笔」，并终其一生用数百个他称为「时间胶囊」的纸箱，封存日常的碎屑。'
    ],
    about_facts: [
      { fact:'地址', detail:'曼哈顿东 47 街 231 号五楼。沃霍尔的工作室在此从 1963 年底运作到 1968 年，之后迁往联合广场西 33 号。' },
      { fact:'银化', detail:'Billy Name 从 1964 年开始用铝箔和银漆覆盖墙壁、管道与各种装置，灵感来自他自己那间银色的公寓。' },
      { fact:'汤罐头', detail:"沃霍尔 1962 年的系列共 32 幅，对应当时 Campbell's 售卖的每一种口味；首展于洛杉矶的 Ferus 画廊。" },
      { fact:'玛丽莲', detail:'玛丽莲丝网版画始于 1962 年 8 月梦露去世之后，取材自她 1953 年电影《尼亚加拉（Niagara）》的一张宣传剧照。' },
      { fact:'试镜', detail:'约 472 段沉默的 16 毫米肖像，拍摄于 1964–1966 年；每位坐者用一卷 100 英尺胶片拍摄，成片以慢速放映。' },
      { fact:'那根香蕉', detail:'沃霍尔为 1967 年 The Velvet Underground & Nico 的首专制作并署名了封面：一根丝网印刷的香蕉，可以剥开，露出底下粉色的果肉。' },
      { fact:'Exploding Plastic Inevitable', detail:'1966–67 年的巡回多媒体演出，把地下丝绒的音乐与影像、灯光及舞者（包括 Gerard Malanga 与 Mary Woronov）结合在一起。' },
      { fact:'时间胶囊', detail:'自 1974 年起，沃霍尔用 610 个封存的纸箱装入信件、照片、收据与各种物件；如今藏于匹兹堡的安迪·沃霍尔美术馆。' }
    ],
    about_philosophy: [
      '沃霍尔把超市与八卦专栏里的图像直接当作题材，既不反讽，也不致歉。一只汤罐、一张钞票、一位影星、一把电椅：他把它们平涂、成系列、用商业色印出来，直到广告与绘画之间的区别不再要紧。他喜欢可乐就是可乐——总统、Elizabeth Taylor 和街角的人，喝的是同一种。',
      '对名声与金钱，他同样直白。「In the future everybody will be world-famous for fifteen minutes.」「Making money is art and working is art and good business is the best art.」他把自己呈现为彻头彻尾的表面：「If you want to know all about Andy Warhol, just look at the surface of my paintings and films and me, and there I am. There’s nothing behind it.」'
    ],
    about_colophon: '这是一个非官方的粉丝致敬，与 The Andy Warhol Foundation for the Visual Arts 及安迪·沃霍尔美术馆没有关联、未获其认可或赞助。互动作品在你的浏览器中本地生成；图录中的图片出于教学学习目的、链接自公共档案。使用纯 JavaScript、HTML Canvas、Web Audio 与 GSAP 构建。',
    about_credit: '一次自主的通宵搭建 · 2026'
  }
};

