import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LANGUAGE } from '../constants/languages';

const LanguageContext = createContext(undefined);

const translations = {
  en: {
    // Navigation
    home: 'Home',
    hymns: 'Hymns',
    sermons: 'Sermons',
    songs: 'Songs',
    animations: 'Animations',
    profile: 'Profile',
    music: 'Music',
    contact: 'Contact',
    about: 'About',
    admin: 'Admin',
    notices: 'Notices',
    quizresources: 'QuizResources',

    // Common
    search: 'Search',
    play: 'Play',
    pause: 'Pause',
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    message: 'Message',
    noSermons: 'No sermons available',
    noSongs: 'No songs available',
    noVideos: 'No videos available',
    noContent: 'No content available',
    unknownDuration: 'Unknown duration',
    unknownStyle: 'Unknown style',

    // Onboarding
    welcome: 'Welcome to Haven',
    welcomeDesc:
      'Your spiritual journey begins here with multilingual worship and biblical content.',
    featuresTitle: 'Rich Content',
    featuresDesc:
      'Access hymns, sermons, gospel music, and animated Bible stories in your preferred language.',
    languagesTitle: 'Multiple Languages',
    languagesDesc:
      'Experience worship in English, Yoruba, Igbo, French, and 6 other languages.',
    getStarted: 'Get Started',

    // Auth
    loginTitle: 'Welcome Back',
    signupTitle: 'Join Haven',
    confirmPassword: 'Confirm Password',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",

    // Home
    latestSermons: 'Latest Sermons',
    recentMusic: 'Recent Music',
    recentAnimations: 'Recent Animations',

    // Content
    duration: 'Duration',
    category: 'Category',
    style: 'Style',

    // Contact
    contactUs: 'Contact Us',
    contactDesc:
      "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    complaint: 'Complaint',
    suggestion: 'Suggestion',
    request: 'Request',
    selectCategory: 'Select Category',

    // About
    aboutUs: 'About Us',
    version: 'Version',
    mission: 'Our Mission',

    // Admin
    adminDashboard: 'Admin Dashboard',
    uploadContent: 'Upload Content',
    manageContent: 'Manage Content',
    viewMessages: 'View Messages',
    addHymn: 'Add Hymn',
    addSermon: 'Add Sermon',
    uploadSong: 'Upload Song',
    uploadVideo: 'Upload Video',
  },
  yo: {
    // Navigation
    home: 'Ile',
    hymns: 'Orin Iyin',
    sermons: 'Iwasu',
    songs: 'Orin',
    animations: 'Aworan Eré',
    profile: 'Profaili',
    music: 'Orin',
    contact: 'Olubasọrọ',
    about: 'Nipa Wa',
    admin: 'Olutọju',
    notices: 'Awọn Iwifun',
    quizresources: 'Idanwo',

    // Common
    search: 'Wa',
    play: 'Mu',
    pause: 'Duro',
    loading: 'O n gbe...',
    error: 'Aṣiṣe',
    save: 'Fi Pamọ',
    cancel: 'Fagilee',
    submit: 'Fi Silẹ',
    login: 'Wọle',
    signup: 'Forukọsilẹ',
    logout: 'Jade',
    email: 'Imeeli',
    password: 'Ọrọ Igbaniwọle',
    name: 'Orukọ',
    message: 'Ifiranṣẹ',
    noSermons: 'Ko si iwasu to wa',
    noSongs: 'Ko si orin to wa',
    noVideos: 'Ko si aworan eré to wa',
    noContent: 'Ko si akoonu to wa',
    unknownDuration: 'Idasile ti a ko mọ',
    unknownStyle: 'Ara ti a ko mọ',

    // Auth
    loginTitle: 'Kaabo Pada',
    signupTitle: 'Darapọ Mọ Haven',
    confirmPassword: 'Jẹrisi Ọrọ Igbaniwọle',
    alreadyHaveAccount: 'Ṣe o ni akaunto tẹlẹ?',
    dontHaveAccount: 'Ko ni akaunto?',

    // Home
    latestSermons: 'Iwasu Tuntun',
    recentMusic: 'Orin Tuntun',
    recentAnimations: 'Aworan Eré Tuntun',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    hymns: 'Cantiques',
    songs: 'Chansons',
    sermons: 'Sermons',
    animations: 'Animations',
    profile: 'Profil',
    music: 'Musique',
    contact: 'Contact',
    about: 'À Propos',
    admin: 'Admin',
    notices: 'Avis',
    quiz: 'Quiz',

    // Common
    search: 'Rechercher',
    play: 'Jouer',
    pause: 'Pause',
    loading: 'Chargement...',
    error: 'Erreur',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    submit: 'Soumettre',
    login: 'Connexion',
    signup: "S'inscrire",
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    name: 'Nom',
    message: 'Message',
    noSermons: 'Aucun sermon disponible',
    noSongs: 'Aucune chanson disponible',
    noVideos: 'Aucune animation disponible',
    noContent: 'Aucun contenu disponible',
    unknownDuration: 'Durée inconnue',
    unknownStyle: 'Style inconnu',

    // Auth
    loginTitle: 'Bon Retour',
    signupTitle: 'Rejoindre Haven',
    confirmPassword: 'Confirmer le mot de passe',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    dontHaveAccount: "Vous n'avez pas de compte?",

    // Home
    latestSermons: 'Derniers Sermons',
    recentMusic: 'Musique Récente',
    recentAnimations: 'Animations Récentes',
  },
  ak: {
    // Navigation
    home: 'Fie',
    hymns: 'Nnwom',
    sermons: 'Asubɔ',
    songs: 'Nnwom',
    animations: 'Nkyerɛkyerɛmu',
    profile: 'Wo ho nsɛm',
    music: 'Nnwom',
    contact: 'Nkɔmmɔbɔ',
    about: 'Yɛn ho asɛm',
    admin: 'Ɔhwɛfoɔ',
    notices: 'Akaakyerɛ',
    quizresources: 'Nsɛmmisa',

    // Common
    search: 'Hwehwɛ',
    play: 'Bɔ',
    pause: 'Sɔ',
    loading: 'Ɛde rekɔ so...',
    error: 'Mfomsoɔ',
    save: 'Gyina',
    cancel: 'Twa mu',
    submit: 'Ma me',
    login: 'Kɔ mu',
    signup: 'Kyerɛw wo din',
    logout: 'Fi mu',
    email: 'Email',
    password: 'Akyɛwadeɛ',
    name: 'Din',
    message: 'Asɛmpɛ',
    noSermons: 'Asubɔ biara nni hɔ',
    noSongs: 'Nnwom biara nni hɔ',
    noVideos: 'Video biara nni hɔ',
    noContent: 'Biribiara nni hɔ',
    unknownDuration: 'Ɛde bɛyɛɛ me',
    unknownStyle: 'Ɔkwan biara nni hɔ',

    // Onboarding
    welcome: 'Akwaaba ba Haven',
    welcomeDesc: 'Wo honhom mu kwan firi ha na ɛfiri nneɛma a ɛwɔ mu.',
    featuresTitle: 'Nneɛma a ɛwɔ mu',
    featuresDesc:
      'Wobɛtumi abɔ nnwom, asubɔ, asɛmpa, ne Bible ho nsɛm a ɛwɔ wo nsa so.',
    languagesTitle: 'Kasa ahorow pii',
    languagesDesc:
      'Wo bɛtumi abɔ nnwom wɔ English, Yoruba, Igbo, French, ne kasa afoforo 6.',
    getStarted: 'Firi aseɛ',

    // Auth
    loginTitle: 'Wo san ba',
    signupTitle: 'Join Haven',
    confirmPassword: 'Hyɛ wo nkyerɛwee',
    alreadyHaveAccount: 'Wɔwɔ akawnt?',
    dontHaveAccount: 'Wɔnni akawnt?',

    // Home
    latestSermons: 'Asubɔ a ɛyɛ foforo',
    recentMusic: 'Nnwom a ɛyɛ foforo',
    recentAnimations: 'Nkyerɛkyerɛmu a ɛyɛ foforo',

    // Content
    duration: 'Ɛde bɛyɛɛ me',
    category: 'Sɛnea ɛyɛ',
    style: 'Ɔkwan',

    // Contact
    contactUs: 'Kasa kyerɛ yɛn',
    contactDesc:
      'Yɛpɛ sɛ yɛte wo nka. Sɛ wode asɛmpɛ akyerɛ yɛn a, yɛbɛyɛ wo mmerɛ.',
    complaint: 'Amanneɛbɔ',
    suggestion: 'Akasɛm',
    request: 'Asɛmpɛ',
    selectCategory: 'Fa woho nnyinasoɔ',

    // About
    aboutUs: 'Yɛn ho asɛm',
    version: 'Nsɛm a ɛwɔ mu',
    mission: 'Yɛn nnyinasoɔ',

    // Admin
    adminDashboard: 'Ɔhwɛfoɔ a ɛwɔ mu',
    uploadContent: 'Fa nneɛma ma me',
    manageContent: 'Di nneɛma so',
    viewMessages: 'Hwɛ asɛmpɛ',
    addHymn: 'Fa nnwom ka ho',
    addSermon: 'Fa asubɔ ka ho',
    uploadSong: 'Fa nnwom ma me',
    uploadVideo: 'Fa video ma me',
  },
  zh: {
    // Navigation
    home: '主頁',
    hymns: '讚美詩',
    sermons: '佈道',
    songs: '歌曲',
    animations: '動畫',
    profile: '個人資料',
    music: '音樂',
    contact: '聯絡',
    about: '關於',
    admin: '管理員',
    notices: '公告',
    quizresources: '測驗資源',

    // Common
    search: '搜尋',
    play: '播放',
    pause: '暫停',
    loading: '載入中...',
    error: '錯誤',
    save: '儲存',
    cancel: '取消',
    submit: '提交',
    login: '登入',
    signup: '註冊',
    logout: '登出',
    email: '電子郵件',
    password: '密碼',
    name: '姓名',
    message: '訊息',
    noSermons: '沒有可用的佈道',
    noSongs: '沒有可用的歌曲',
    noVideos: '沒有可用的視頻',
    noContent: '沒有可用的內容',
    unknownDuration: '未知時長',
    unknownStyle: '未知風格',

    // Onboarding
    welcome: '歡迎來到天堂',
    welcomeDesc: '您的靈性之旅從這裡開始，提供多語言崇拜和聖經內容。',
    featuresTitle: '豐富的內容',
    featuresDesc: '以您喜歡的語言訪問讚美詩、佈道、福音音樂和聖經故事動畫。',
    languagesTitle: '多種語言',
    languagesDesc: '體驗英語、約魯巴語、伊博語、法語和另外6種語言的崇拜。',
    getStarted: '開始',

    // Auth
    loginTitle: '歡迎回來',
    signupTitle: '加入天堂',
    confirmPassword: '確認密碼',
    alreadyHaveAccount: '已有帳號？',
    dontHaveAccount: '沒有帳號？',

    // Home
    latestSermons: '最新佈道',
    recentMusic: '最新音樂',
    recentAnimations: '最新動畫',

    // Content
    duration: '時長',
    category: '類別',
    style: '風格',

    // Contact
    contactUs: '聯絡我們',
    contactDesc: '我們很高興收到您的來信。給我們發送訊息，我們會盡快回覆。',
    complaint: '投訴',
    suggestion: '建議',
    request: '請求',
    selectCategory: '選擇類別',

    // About
    aboutUs: '關於我們',
    version: '版本',
    mission: '我們的使命',

    // Admin
    adminDashboard: '管理員儀表板',
    uploadContent: '上傳內容',
    manageContent: '管理內容',
    viewMessages: '查看訊息',
    addHymn: '添加讚美詩',
    addSermon: '添加佈道',
    uploadSong: '上傳歌曲',
    uploadVideo: '上傳視頻',
  },
  zu: {
    // Navigation
    home: 'Ikhaya',
    hymns: 'Amahubo',
    sermons: 'Intshumayelo',
    songs: 'Izingoma',
    animations: 'Izithombe Ezinyakazayo',
    profile: 'Iphrofayili',
    music: 'Umculo',
    contact: 'Xhumana Nathi',
    about: 'Mayelana Nathi',
    admin: 'Umlawuli',
    notices: 'Izaziso',
    quizresources: 'Izinsiza Zokuhlola',

    // Common
    search: 'Sesha',
    play: 'Dlala',
    pause: 'Misa',
    loading: 'Iyalayisha...',
    error: 'Iphutha',
    save: 'Londoloza',
    cancel: 'Khansela',
    submit: 'Thumela',
    login: 'Ngena',
    signup: 'Bhalisa',
    logout: 'Phuma',
    email: 'I-imeyili',
    password: 'Iphasiwedi',
    name: 'Igama',
    message: 'Umlayezo',
    noSermons: 'Azikho intshumayelo etholakalayo',
    noSongs: 'Azikho izingoma etholakalayo',
    noVideos: 'Awekho amavidiyo etholakalayo',
    noContent: 'Ayikho okuqukethwe okutholakalayo',
    unknownDuration: 'Isikhathi esingaziwa',
    unknownStyle: 'Isitayela esingaziwa',

    // Onboarding
    welcome: 'Siyakwamukela e-Haven',
    welcomeDesc:
      'Uhambo lwakho olungokomoya luqala lapha ngokukhonza ngezilimi eziningi nangokuqukethwe kweBhayibheli.',
    featuresTitle: 'Okuqukethwe Okucebile',
    featuresDesc:
      'Finyelela amahubo, izintshumayelo, umculo wegospel, nezindaba zeBhayibheli ezinyakazayo ngolimi oluthandayo.',
    languagesTitle: 'Izilimi Eziningi',
    languagesDesc:
      'Zizwa ukukhonza ngesiNgisi, isiYoruba, isiIgbo, isiFulentshi, nezinye izilimi ezingu-6.',
    getStarted: 'Qala Manje',

    // Auth
    loginTitle: 'Wamukelekile',
    signupTitle: 'Joyina i-Haven',
    confirmPassword: 'Qinisekisa Iphasiwedi',
    alreadyHaveAccount: 'Usuvele unayo i-akhawunti?',
    dontHaveAccount: 'Awunayo i-akhawunti?',

    // Home
    latestSermons: 'Izintshumayelo Zamuva',
    recentMusic: 'Umculo Wakamuva',
    recentAnimations: 'Izithombe Zakamuva Ezinyakazayo',

    // Content
    duration: 'Isikhathi',
    category: 'Isigaba',
    style: 'Isitayela',

    // Contact
    contactUs: 'Xhumana Nathi',
    contactDesc:
      'Singathanda ukuzwa kuwe. Sithumele umlayezo futhi sizophendula ngokushesha okukhulu.',
    complaint: 'Isikhalazo',
    suggestion: 'Isiphakamiso',
    request: 'Isicelo',
    selectCategory: 'Khetha Isigaba',

    // About
    aboutUs: 'Mayelana Nathi',
    version: 'Inguqulo',
    mission: 'Inhloso Yethu',

    // Admin
    adminDashboard: 'Ideshibhodi Yomlawuli',
    uploadContent: 'Layisha Okuqukethwe',
    manageContent: 'Phatha Okuqukethwe',
    viewMessages: 'Buka Imilayezo',
    addHymn: 'Engeza Ihubo',
    addSermon: 'Engeza Intshumayelo',
    uploadSong: 'Layisha Ingoma',
    uploadVideo: 'Layisha Ividiyo',
  },
  sw: {
    // Navigation
    home: 'Nyumbani',
    hymns: 'Nyimbo za Kiroho',
    sermons: 'Mahubiri',
    songs: 'Nyimbo',
    animations: 'Michoro',
    profile: 'Wasifu',
    music: 'Muziki',
    contact: 'Mawasiliano',
    about: 'Kuhusu Sisi',
    admin: 'Msimamizi',
    notices: 'Matangazo',
    quizresources: 'Rasilimali za Maswali',

    // Common
    search: 'Tafuta',
    play: 'Cheza',
    pause: 'Simamisha',
    loading: 'Inapakia...',
    error: 'Kosa',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    submit: 'Tuma',
    login: 'Ingia',
    signup: 'Jisajili',
    logout: 'Toka',
    email: 'Barua pepe',
    password: 'Neno la siri',
    name: 'Jina',
    message: 'Ujumbe',
    noSermons: 'Hakuna mahubiri yanayopatikana',
    noSongs: 'Hakuna nyimbo zinazopatikana',
    noVideos: 'Hakuna video zinazopatikana',
    noContent: 'Hakuna maudhui yanayopatikana',
    unknownDuration: 'Muda usiojulikana',
    unknownStyle: 'Mtindo usiojulikana',

    // Onboarding
    welcome: 'Karibu Haven',
    welcomeDesc:
      'Safari yako ya kiroho inaanza hapa na ibada ya lugha nyingi na maudhui ya kibiblia.',
    featuresTitle: 'Maudhui Tajiri',
    featuresDesc:
      'Pata nyimbo za kiroho, mahubiri, muziki wa injili, na hadithi za Bibilia za michoro katika lugha unayopenda.',
    languagesTitle: 'Lugha Nyingi',
    languagesDesc:
      'Furahia ibada kwa Kiingereza, Kiyoruba, Kiigbo, Kifaransa, na lugha nyingine 6.',
    getStarted: 'Anza',

    // Auth
    loginTitle: 'Karibu Tena',
    signupTitle: 'Jiunge na Haven',
    confirmPassword: 'Thibitisha Neno la siri',
    alreadyHaveAccount: 'Tayari una akaunti?',
    dontHaveAccount: 'Huna akaunti?',

    // Home
    latestSermons: 'Mahubiri ya Hivi Karibuni',
    recentMusic: 'Muziki wa Hivi Karibuni',
    recentAnimations: 'Michoro ya Hivi Karibuni',

    // Content
    duration: 'Muda',
    category: 'Kategoria',
    style: 'Mtindo',

    // Contact
    contactUs: 'Wasiliana Nasi',
    contactDesc:
      'Tungependa kusikia kutoka kwako. Tutumie ujumbe na tutakujibu haraka iwezekanavyo.',
    complaint: 'Malalamiko',
    suggestion: 'Pendekezo',
    request: 'Ombi',
    selectCategory: 'Chagua Kategoria',

    // About
    aboutUs: 'Kuhusu Sisi',
    version: 'Toleo',
    mission: 'Dhamira Yetu',

    // Admin
    adminDashboard: 'Dashibodi ya Msimamizi',
    uploadContent: 'Pakia Maudhui',
    manageContent: 'Dhibiti Maudhui',
    viewMessages: 'Tazama Ujumbe',
    addHymn: 'Ongeza Wimbo wa Kiroho',
    addSermon: 'Ongeza Mahubiri',
    uploadSong: 'Pakia Wimbo',
    uploadVideo: 'Pakia Video',
  },
};

const AboutUsInfo = {
  en: {
    version: '1.0.0',
    content: `The God's Kingdom Society (GKS) is a Christian organization founded by Jehovah God through His servant, Saint Gideon Meriodere Urhobo. 

Established in 1934, GKS emerged from a divine calling when St. G.M. Urhobo received a vision from Jesus Christ commissioning him to proclaim the Gospel of God's Kingdom and expose false doctrines.

What makes GKS unique:
• Founded on direct biblical revelation and divine calling
• Committed to pure Bible teachings without denominational traditions
• Multilingual ministry reaching people of all backgrounds
• Focused on God's Kingdom as the solution to human suffering

From small beginnings in Lagos, GKS has grown into a vibrant Christian community across Nigeria and beyond, fulfilling the biblical prophecy: "A little one shall become a thousand" (Isaiah 60:22).`,

    mission: `
      1. To preach the good news of God's kingdom to the world as the only hope of suffering humanity. 
      2. To expose all falsehoods which Satan has been using to keep many people in spiritual bondage. 
      3. To proclaim God's written judgement against the wicked.`,

    contactInfo: {
      headquarters: 'Salem City, P.O. Box 424, Warri, Delta State, Nigeria',
      phones: ['+234-810 098 7661', '+234-802 329 5127'],
      emails: [
        'gkssecretariat@mountaingks.org',
        'publicitysecretary@mountaingks.org',
      ],
      socialMedia: {
        facebook: 'www.facebook.com/mountaingks',
        twitter: 'www.twitter.com/mountaingks',
      },
    },

    keyBeliefs: [
      'The Bible as the only authorized law book of God',
      "God's Kingdom as the only remedy for human suffering",
      'The importance of exposing false doctrines',
      'Service and reverence to Jehovah God',
      'Christian unity across all nations and backgrounds',
    ],
  },
  yo: {
    version: '1.0.0',
    content: `Ẹgbẹ Ijọba Ọlọrun (GKS) jẹ ẹgbẹ Kristian ti Ọlọrun Jehovah da sile nipasẹ ẹrẹ Rẹ, Saint Gideon Meriodere Urhobo.

Ti a da sile ni 1934, GKS jade lati inu ipe Ọlọrun nigbati St. G.M. Urhobo gba iranran lati ọdọ Jesu Kristi ti o firanṣẹ rẹ sii lati ké Ihinrere Ijọba Ọlọrun ati lati ṣe afihan awọn ẹkọ irọ.

Ohun ti o ṣe GKS yàtọ:
• Ti a da sile lori ifihan Bibeli taara ati ipe Ọlọrun
• Gbẹkẹle lati fẹ ẹkọ Bibeli laisilẹ awọn aṣa iṣẹṣi
• Iṣẹ iṣin ni ede pupọ ti n de awọn eniyan ti gbogbo ipilẹṣẹ
• O dojukọ Ijọba Ọlọrun bi ojutu fun iya eniyan

Lati awọn ibẹrẹ kekere ni Lagos, GKS ti dagba si awujọ Kristian alagbara kari Gẹẹsi ati kari, ti n ṣe aṣẹ Bibeli: "Ẹni kekere kan yoo di ẹgbẹrun" (Isaiah 60:22).`,

    mission: `
      1. Lati ké ihinrere ìjọba Ọlọrun sí ayé gẹ́gẹ́ bí ìrètí kan ṣoṣo fún aráyé tí ń joró. 
      2. Lati ṣí gbogbo irọ́ tí Sátánì ti ń lò láti pa ọ̀pọ̀lọpọ̀ ènìyàn mọ́ sínú ìdè tẹ̀mí payá. 
      3. Lati kéde ìdájọ́ tí Ọlọrun kọ sílẹ̀ sí àwọn ènìyàn búburú.`,

    contactInfo: {
      headquarters: 'Ilu Salem, P.O. Apoti 424, Warri, Ipinle Delta, Nigeria',
      phones: ['+234-810 098 7661', '+234-802 329 5127'],
      emails: [
        'gkssecretariat@mountaingks.org',
        'publicitysecretary@mountaingks.org',
      ],
      socialMedia: {
        facebook: 'www.facebook.com/mountaingks',
        twitter: 'www.twitter.com/mountaingks',
      },
    },

    keyBeliefs: [
      'Bibeli bi iwe ofin iyasọtọ nikan ti Ọlọrun',
      'Ijọba Ọlọrun bi ojutu nikan fun iya eniyan',
      'Pataki ti ṣiṣe afihan awọn ẹkọ irọ',
      'Iṣẹ ati iberu fun Ọlọrun Jehovah',
      'Iṣọkan Kristian laarin gbogbo orilẹ-ede ati ipilẹṣẹ',
    ],
  },
  fr: {
    version: '1.0.0',
    content: `La Société du Royaume de Dieu (GKS) est une organisation chrétienne fondée par Jéhovah Dieu par l'intermédiaire de son serviteur, Saint Gideon Meriodere Urhobo.

Établie en 1934, la GKS est née d'un appel divin lorsque St G.M. Urhobo a reçu une vision de Jésus-Christ le chargeant de proclamer l'Évangile du Royaume de Dieu et d'exposer les fausses doctrines.

Ce qui rend la GKS unique :
• Fondée sur une révélation biblique directe et un appel divin
• Engagée envers les enseignements bibliques purs sans traditions dénominationnelles
• Ministère multilingue atteignant des personnes de tous horizons
• Axée sur le Royaume de Dieu comme solution à la souffrance humaine

Depuis ses modestes débuts à Lagos, la GKS est devenue une communauté chrétienne dynamique à travers le Nigeria et au-delà, accomplissant la prophétie biblique : "Le plus petit deviendra un millier" (Ésaïe 60:22).`,

    mission: `
      1. Prêcher la bonne nouvelle du royaume de Dieu au monde comme seul espoir de l'humanité souffrante. 
      2. Exposer tous les mensonges que Satan utilise pour maintenir de nombreuses personnes dans la servitude spirituelle. 
      3. Proclamer le jugement écrit de Dieu contre les méchants.`,

    contactInfo: {
      headquarters: 'Salem City, B.P. 424, Warri, État du Delta, Nigeria',
      phones: ['+234-810 098 7661', '+234-802 329 5127'],
      emails: [
        'gkssecretariat@mountaingks.org',
        'publicitysecretary@mountaingks.org',
      ],
      socialMedia: {
        facebook: 'www.facebook.com/mountaingks',
        twitter: 'www.twitter.com/mountaingks',
      },
    },

    keyBeliefs: [
      'La Bible comme seul livre de loi autorisé de Dieu',
      'Le Royaume de Dieu comme seul remède à la souffrance humaine',
      "L'importance d'exposer les fausses doctrines",
      'Service et révérence envers Jéhovah Dieu',
      'Unité chrétienne à travers toutes les nations et origines',
    ],
  },
  ak: {
    version: '1.0.0',
    content: `Oman Nyankopɔn Asoɛe (GKS) yɛ Kristosom asɔredan a Onyankopɔn Jehovah sii so de N'akoa, Saint Gideon Meriodere Urhobo so.

Wɔsii so wɔ 1934 mu, GKS fii Onyankopɔn frɛ mu bae bere a St. G.M. Urhobo nyaa adiyisɛm fi Yesu Kristo hɔ a ɛhyɛɛ no sɛ ɔnkɔbɔ Onyankopɔn Ahennie Asɛmpa no na ɔnkyerɛ nkɔmmɔ atoro no adi.

Deɛ ɛma GKS yɛ soronko:
• Wɔsii so wɔ Bible adiyisɛm a ɛkɔ so na Onyankopɔn frɛ so
• Wɔde wɔn ho hyɛ ma Bible nkyerɛkyerɛ a ɛyɛ fɛfɛɛfɛ a ɛnyɛ asɔre mmara so
• Asɔre a ɛwɔ kasa pii a ɛkɔ so kɔsra nnipa a wofi beae nyinaa
• Wɔhwɛ Onyankopɔn Ahennie sɛ ɔkwan pa ma onipa yaw

Fi mfitiase a ɛyɛ ketewaa bi wɔ Lagos, GKS ayɛ Kristosom kuo a ɛwɔ tumi wɔ Nigeria nyinaa ne nea ɛboro saa, na ɛdi Bible nkɔm no so: "Obi ketewaa bɛyɛ apem" (Yesaia 60:22).`,

    mission: `
      1. Sɛ yɛbɛka Onyankopɔn ahennie ho asɛmpa akyerɛ wiase sɛ anidasoɔ koro pɛ ma nnipa a wɔrehu amane. 
      2. Sɛ yɛbɛda atorosɛm nyinaa a Ɔbonsam de aka nnipa pii agu honhom mu nkoasom mu adi. 
      3. Sɛ yɛbɛpa Onyankopɔn atemmuo a wɔakwerɛ atia abɔnefoɔ.`,

    contactInfo: {
      headquarters: 'Salem City, P.O. Box 424, Warri, Delta Mantam, Nigeria',
      phones: ['+234-810 098 7661', '+234-802 329 5127'],
      emails: [
        'gkssecretariat@mountaingks.org',
        'publicitysecretary@mountaingks.org',
      ],
      socialMedia: {
        facebook: 'www.facebook.com/mountaingks',
        twitter: 'www.twitter.com/mountaingks',
      },
    },

    keyBeliefs: [
      'Bible sɛ Onyankopɔn mmara nhoma a wɔpaw no nkɔsoɔ',
      'Onyankopɔn Ahennie sɛ ɔkwan pa ma onipa yaw',
      'Ahofadi a ɛwɔ nkɔmmɔ atoro akyerɛkyerɛ so',
      'Som ne Onyankopɔn Jehovah ho suahu',
      'Kristosom a ɛwɔ aman nyinaa ne nkyekyɛmu nyinaa mu',
    ],
  },
  zh: {
    version: '1.0.0',
    content: `上帝王國協會（GKS）是一個基督教組織，由耶和華上帝透過祂的僕人聖吉迪恩·梅里奧德爾·烏爾霍博建立。

成立於1934年，GKS源於神聖的呼召，當時聖G.M.烏爾霍博從耶穌基督那裡得到異象，委任他宣揚上帝王國的福音並揭露錯誤的教義。

GKS的獨特之處：
• 建立在直接的聖經啟示和神聖呼召之上
• 致力於純粹的聖經教導，不受宗派傳統影響
• 多語言事工，觸及各種背景的人們
• 專注於上帝王國作為人類苦難的解決方案

從拉各斯的小規模開始，GKS已成長為遍及尼日利亞及以外的充滿活力的基督教社區，應驗了聖經預言："至小的族要加增千倍"（以賽亞書60:22）。`,

    mission: `
      1. 向世界宣揚上帝王國的福音，作為受苦人類唯一的希望。 
      2. 揭露撒旦用來使許多人陷入屬靈束縛的所有謊言。 
      3. 宣佈上帝對惡人的書面審判。`,

    contactInfo: {
      headquarters: '塞勒姆市，郵政信箱424，瓦里，三角洲州，尼日利亞',
      phones: ['+234-810 098 7661', '+234-802 329 5127'],
      emails: [
        'gkssecretariat@mountaingks.org',
        'publicitysecretary@mountaingks.org',
      ],
      socialMedia: {
        facebook: 'www.facebook.com/mountaingks',
        twitter: 'www.twitter.com/mountaingks',
      },
    },

    keyBeliefs: [
      '聖經作為上帝唯一授權的法律書',
      '上帝王國作為人類苦難的唯一補救措施',
      '揭露錯誤教義的重要性',
      '事奉和敬畏耶和華上帝',
      '跨越所有國家和背景的基督教團結',
    ],
  },
  zu: {
    version: '1.0.0',
    content: `I-God\'s Kingdom Society (GKS) yinhlangano yobuKristu eyasungulwa nguJehova uNkulunkulu ngesandla sencwadi yakhe, uSaint Gideon Meriodere Urhobo.

Yasungulwa ngo-1934, i-GKS yavela ekumeni okungcwele lapho uSt. G.M. Urhobo ethola umbono ovela kuJesu Kristu emnika umsebenzi wokumemezela iVangeli loMbuso kaNkulunkulu nokudalula izimfundiso ezingamanga.

Okwenza i-GKS ihluke:
• Yasungulwa ngokudalulwa kweBhayibheli okuqondile nokumenwa nguNkulunkulu
• Izibophezele ekufundiseni iBhayibheli elimsulwa ngaphandle kwamasiko amasonto
• Ukusebenza ngezilimi eziningi kufinyelela kubantu bakuzo zonke izizinda
• Ugxile eMbusweni kaNkulunkulu njengesisombululo sokuhlupheka komuntu

Kusukela ekuqaleni okuncane eLagos, i-GKS isikhule yaba umphakathi ophilayo wobuKristu eNingizimu Afrika nakwezinye izinda, ifezisa isiprofetho seBhayibheli: "Oyincane uyokuba yinkulungwane" (Isaya 60:22).`,

    mission: `
      1. Ukushumayela izindaba ezinhle zombuso kaNkulunkulu emhlabeni njengethemba kuphela lesintu esihluphekayo. 
      2. Ukudalula wonke amanga uSathane abewasebenzisa ukugcina abantu abaningi ekuthunjweni ngokomoya. 
      3. Ukumemezela isahlulelo sikaNkulunkulu esibhaliwe ngokumelene nababi.`,

    contactInfo: {
      headquarters: 'Salem City, P.O. Box 424, Warri, Delta State, Nigeria',
      phones: ['+234-810 098 7661', '+234-802 329 5127'],
      emails: [
        'gkssecretariat@mountaingks.org',
        'publicitysecretary@mountaingks.org',
      ],
      socialMedia: {
        facebook: 'www.facebook.com/mountaingks',
        twitter: 'www.twitter.com/mountaingks',
      },
    },

    keyBeliefs: [
      'IBhayibheli njengencwadi yomthetho evunyelwe kuphela kaNkulunkulu',
      'UMbuso kaNkulunkulu njengesisombululo kuphela sokuhlupheka komuntu',
      'Ukubaluleka kokudalula izimfundiso ezingamanga',
      'Ukukhonza nokuhlonipha uJehova uNkulunkulu',
      'Ubunye bobuKristu kuzo zonke izizwe nezizinda',
    ],
  },
  sw: {
    version: '1.0.0',
    content: `Jumuiya ya Ufalme wa Mungu (GKS) ni shirika la Kikristo lilianzishwa na Mungu Yehova kupitia mtumishi wake, Mtakatifu Gideon Meriodere Urhobo.

Ilianzishwa mwaka 1934, GKS ilitokana na wito wa kimungu wakati Mtakatifu G.M. Urhobo alipopata maono kutoka kwa Yesu Kristo akiagiza aweze kutangaza Injili ya Ufalme wa Mungu na kufichua mafundisho ya uwongo.

Kinachofanya GKS iwe ya kipekee:
• Ilianzishwa kwa msingi wa ufunuo wa moja kwa moja wa Biblia na wito wa kimungu
• Imejitolea kwa mafundisho safi ya Biblia bila mila ya madhehebu
• Huduma ya lugha nyingi inayowafikia watu wa asili zote
• Inalenga Ufalme wa Mungu kama suluhisho la mateso ya binadamu

Kuanzia mwanzo mdogo huko Lagos, GKS imekua kuwa jamii hai ya Kikristo nchini Nigeria na nje, ikitimiza unabii wa kibiblia: "Mdogo atakuwa elfu" (Isaya 60:22).`,

    mission: `
      1. Kuhubiri habari njema ya ufalme wa Mungu kwa ulimwengu kama tumaini pekee kwa wanadamu wanaoteseka. 
      2. Kufichua uwongo wote ambao Shetani amekuwa akiutumia kuwaweka watu wengi katika utumwa wa kiroho. 
      3. Kutangaza hukumu ya Mungu iliyoandikwa dhidi ya waovu.`,

    contactInfo: {
      headquarters: 'Jiji la Salem, S.L. 424, Warri, Jimbo la Delta, Nigeria',
      phones: ['+234-810 098 7661', '+234-802 329 5127'],
      emails: [
        'gkssecretariat@mountaingks.org',
        'publicitysecretary@mountaingks.org',
      ],
      socialMedia: {
        facebook: 'www.facebook.com/mountaingks',
        twitter: 'www.twitter.com/mountaingks',
      },
    },

    keyBeliefs: [
      'Biblia kama kitabu pekee cha sheria kilichoidhinishwa na Mungu',
      'Ufalme wa Mungu kama tiba pekee ya mateso ya binadamu',
      'Umuhimu wa kufichua mafundisho ya uwongo',
      'Huduma na heshima kwa Mungu Yehova',
      'Umoja wa Kikristo katika mataifa yote na asili',
    ],
  },
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('preferredLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const setLanguage = async (language) => {
    try {
      await AsyncStorage.setItem('preferredLanguage', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value = {
    currentLanguage,
    setLanguage,
    translations: translations[currentLanguage] || translations.en,
    aboutUsInfo: AboutUsInfo[currentLanguage] || AboutUsInfo.en,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
