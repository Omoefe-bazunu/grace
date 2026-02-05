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
    live: 'Live',
    archive: 'Archive',

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

    //onboarding
    skip: 'Skip',
    startBtn: 'START',
    onboardingSubtitle1: 'Welcome to the',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      "A Christian Organization where the truth of God's word is preached and practiced in pursuance of the salvation of God.",
    onboardingSubtitle2: "Grow in God's word with",
    onboardingTitle2: 'Edifying Sermons',
    onboardingDesc2:
      'Get easy access to sermons of the GKS in text, audio and video formats and learn the word of God as it is in the Bible.',
    onboardingSubtitle3: 'Worship God with',
    onboardingTitle3: 'Graceful Songs',
    onboardingDesc3:
      'Join fellow believers around the world to give honour to God and Christ through melodious songs of praise.',
    onboardingSubtitle4: 'EXPLORE MORE',
    onboardingTitle4: 'MORE FEATURES',
    onboardingDesc4:
      "Learn God's word through animations, and gain access to pictures and videos in the church's archive.",

    // Home Screen
    homeNavTitle: 'Grace',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: "Towards God's Perfect Government",
    heroDesc:
      'Read, listen, and grow in faith with the Church of the Living God.',
    exploreResources: 'Explore Resources',
    homeCardTitleSongs: 'Songs of Praises',
    homeCardSubtitleSongs: 'Sacred melodies for worship and reflection.',
    homeCardTitleSermons: 'Edifying Sermons',
    homeCardSubtitleSermons:
      'Deepen your understanding with sound biblical teaching.',
    homeCardTitleStories: 'Bible-based Stories',
    homeCardSubtitleStories:
      'Spiritual values brought to life through narrative.',
    homeCardTitleArchive: 'Archive',
    homeCardSubtitleArchive:
      'Explore historical records and past events of the society.',
    homeCardTitleGallery: 'Gallery',
    homeCardSubtitleGallery:
      'A visual journey through our community and ministers.',
    homeCardTitleQuiz: 'Quiz Resources',
    homeCardSubtitleQuiz:
      'Study materials and resources to sharpen your knowledge.',
    homeCardTitleGiving: 'Tithes & Offering',
    homeCardSubtitleGiving: 'Contribute to the global mission of the GKS.',
    homeCardTitleLive: 'Live Events',
    homeCardSubtitleLive: 'Stream services and special events in real-time.',

    // Sermons Main Screen
    sermonsBannerTitle: 'EDIFYING SERMONS',
    sermonsBannerSubtitle:
      'Access inspiring sermons in different languages, sharing God’s Word in every tongue.',
    searchSermons: 'Search sermons, topics, and categories...',
    textSermons: 'Text Sermons',
    readSermons: 'Organized by volume and subject',
    audioClips: 'Audio Clips',
    listenSermons: 'Listen to edifying sermon audio',
    videoSermons: 'Video Sermons',
    watchSermons: 'Watch live sessions and recordings',
    dailyGuide: 'Daily Guide',
    dailyGuideSubtitle: "Study God's word daily",

    // Text Sermons Screen
    textSermonsBannerTitle: 'TEXT SERMONS',
    textSermonsBannerSubtitle:
      "Read and study God's word with full text sermons.",
    searchPlaceholder: 'Search sermons...',
    subjectsCountLabel: 'subjects',

    // Sermon Categories (Keys match the array values)
    'Weekly Sermon Volume 1': 'Weekly Sermon Volume 1',
    'Weekly Sermon Volume 2': 'Weekly Sermon Volume 2',
    "God's Kingdom Advocate Volume 1": "God's Kingdom Advocate Volume 1",
    "God's Kingdom Advocate Volume 2": "God's Kingdom Advocate Volume 2",
    "God's Kingdom Advocate Volume 3": "God's Kingdom Advocate Volume 3",
    'Abridged Bible Subjects': 'Abridged Bible Subjects',
    'The Ten Fundamental Truths': 'The Ten Fundamental Truths',
    "GKS President's Feast Message": "GKS President's Feast Message",
    "GKS President's Freedom Day Message":
      "GKS President's Freedom Day Message",
    "GKS President's Youth Assembly Message":
      "GKS President's Youth Assembly Message",
    'Sermon Summaries': 'Sermon Summaries',
    'Questions and Answers': 'Questions and Answers',

    // Sermon Detail Screen
    sermonDetail: 'Sermon',
    sermonNotFound: 'Sermon not found',
    untitled: 'Untitled',
    gksSermon: 'GKS Sermon',
    audioAssistant: 'Audio Assistant',
    success: 'Success',
    copiedToClipboard: 'Copied to clipboard',
    audioError: 'Audio Error',
    audioPlayError: 'Unable to play audio. Please try again.',
    playbackControlError: 'Failed to control audio playback',
    part: 'Part',
    of: 'of',

    // Audio Sermons Screen
    audioSermonsTitle: 'Audio Sermons',
    audioSermonsBannerTitle: 'AUDIO SERMONS',
    audioSermonsBannerSubtitle:
      'Learn the word of God with audio sermons, organized by year.',
    noAudioSermons: 'No audio sermons available',
    unknownYear: 'Unknown',
    sermonsCountPlural: 'sermons',
    sermonCountSingular: 'sermon',
    sermonsLabel: 'Sermons',
    untitledSermon: 'Untitled Sermon',
    noDate: 'No date',

    // Audio Player/Details Screen
    audioPlayer: 'Audio Player',
    audioLoadError: 'Failed to load audio source.',
    errorSermonNotFound: 'Sermon not found or no audio source available.',
    permissionRequired: 'Permission required',
    saveSermonPermission: 'Please allow access to save sermons to your device.',
    sermonSaved: 'Sermon saved to your device!',
    fileSaveError: 'Could not save the file.',
    noTitle: 'No Title',
    unknownDate: 'Unknown Date',

    // Sermon Videos Screen
    videoSermonsTitle: 'Video Sermons',
    videoPlural: 'videos',
    videoSingular: 'video',
    loadingVideos: 'Loading videos...',
    noVideosInCategory: 'No videos found in this category',
    sermonVideosBannerTitle: 'SERMON VIDEOS',
    sermonVideosBannerSubtitle:
      'Watch the video versions of sermons organized by categories.',
    searchSermonVideosPlaceholder: 'Search sermon videos...',
    clearSearch: 'Clear',
    sermonVideoCategoriesTitle: 'Sermon Video Categories',
    browseSermonsByCategory: 'Browse sermons by category',
    searchResults: 'Search Results',
    noSermonVideosFound: 'No sermon videos found',
    noSermonVideosAvailable: 'No sermon videos available',
    adjustSearchTerms: 'Try adjusting your search terms',
    checkBackLaterSermons: 'Check back later for new sermon videos',
    loadingMoreVideos: 'Loading more videos...',
    watchNow: 'Watch Now',
    watch: 'Watch',

    // Video/Animation Detail
    linkCopied: 'Link copied to clipboard!',
    shareSermonVideoLabel: 'Sermon Video',
    noCategory: 'No category',
    shareSermonVideoTitle: 'Share Sermon Video',
    shareVideoTitle: 'Share Video',
    noTitle: 'No Title',
    unknownDate: 'Unknown date',
    errorVideoNotFound: 'Video not found',
    languageLabel: 'Language',
    share: 'Share',

    // Daily Guide Screen
    dailyGuideTitle: 'Daily Guide',
    dailyDevotionalBanner: 'Daily Devotional',
    dailyDevotionalBannerSubtitle: 'Nourish your spirit with daily guidance.',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    loadingDevotional: 'Loading devotional...',
    noDevotionalAvailable: 'No Devotional Available',
    checkBackFuture: 'Check back on this date for a new devotional',
    noDevotionalPast: 'No devotional was published for this date',
    recentDevotionals: 'Recent Devotionals',
    dailyDevotionalFallback: 'Daily Devotional',

    // Songs Screen
    songsNavTitle: 'Songs',
    songsBannerTitle: 'SONGS OF PRAISE',
    songsBannerSubtitle:
      'Worship through a collection of uplifting spiritual songs and hymns that strengthen your faith.',
    featuredSongsTitle: 'Theocratic Songs of Praise',
    featuredSongsSubtitle: '(Hymns & Psalms)',
    songsCountLabel: 'songs',
    seePlaylist: 'See Playlist',

    // Music Screen
    searchSongsPlaceholder: 'Search songs...',
    categoryLabel: 'Category',
    songLoadError: 'Unable to load songs.',

    // Music Player Screen
    musicPlayerTitle: 'Music Player',
    unknownCategory: 'Unknown Category',
    permissionRequired: 'Permission required',
    saveSongsPermission: 'Please allow access to save songs to your device.',
    songSavedSuccess: 'Song saved to your device!',
    saveFileError: 'Could not save file.',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Hymns',
    hymnsBannerTitle: 'Theocratic Songs of Praise',
    hymnSearchPlaceholder: 'Search by number or title',
    noHymnsFound: 'No Hymns or Psalms found matching your search.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Psalm',

    // Animations Screen
    watchNow: 'Watch Now',
    loadingMoreVideos: 'Loading more videos...',
    noVideosFound: 'No videos found',
    noAnimationsAvailable: 'No animations available',
    adjustSearchTerms: 'Try adjusting your search terms',
    checkBackLater: 'Check back later for new content',
    animationsBannerTitle: 'BIBLE-BASED STORIES',
    animationsBannerSubtitle:
      'Learn the word of God through visual illustrations that brings the stories and characters to life.',
    searchAnimationsPlaceholder: 'Search animations...',
    clear: 'Clear',

    // Animation Detail
    linkCopied: 'Link copied to clipboard!',
    shareVideo: 'Share Video',
    errorVideoNotFound: 'Video not found',

    // Live Stream Screen
    liveStreamLoading: 'Loading streams...',
    liveStreamError: 'Failed to load streams. Please try again.',
    refreshFailed: 'Refresh Failed',
    refreshFailedMsg: 'Could not refresh streams',
    openLinkError: 'Could not open link',
    loadingStream: 'Loading stream...',
    streamUnavailable: 'Stream unavailable',
    openInYouTube: 'Open in YouTube',
    loadingHLSStream: 'Loading HLS stream...',
    hlsStreamUnavailable: 'HLS Stream unavailable',
    couldNotLoadStream: 'Could not load this stream',
    external: 'EXTERNAL',
    streamLabel: 'Stream',
    tapToWatchYouTube: 'Tap below to watch in YouTube app',
    externalStreamExternalOnly: 'This stream type must be opened externally',
    watchInBrowser: 'Watch in Browser',
    checkConnectionRetry: 'Please check your connection and try again.',
    retry: 'Retry',
    refreshing: 'Refreshing...',
    refreshStreams: 'Refresh Streams',
    liveLabel: 'LIVE',
    offlineLabel: 'OFFLINE',
    streamOffline: 'Stream Offline',
    streamNotActive: 'This stream is currently not active',
    streamTypeLabel: 'Type: ',
    noActiveStreams: 'No Active Streams',
    checkBackLaterLive: 'Check back later for live streams',
    refresh: 'Refresh',
    unknown: 'Unknown',

    // Archive Screen
    archiveBannerTitle: 'ARCHIVE',
    archiveBannerSubtitle:
      'Here you will find pictures and videos from old events of the church, kept for reference and memories.',
    pictures: 'Pictures',
    videos: 'Videos',

    // Archive Videos Screen
    videoArchiveTitle: 'VIDEO ARCHIVE',
    videoArchiveSubtitle:
      'This screen contains videos of old events of the church, kept for reference and memories.',
    untitledEvent: 'Untitled Event',
    video: 'Video',
    videos: 'Videos',
    noEventsFound: 'No events found matching your search',
    noVideosYet: 'No videos yet',

    // Archive Pictures Screen
    pictureArchiveTitle: 'PICTURE ARCHIVE',
    pictureArchiveSubtitle:
      'Sacred memories and old events of the church, kept for reference.',
    untitledEvent: 'Untitled Event',
    photo: 'Photo',
    photos: 'Photos',
    noEventsFound: 'No events found',
    noPicturesYet: 'No pictures yet',

    // Gallery Screen
    galleryNavTitle: 'Gallery',
    galleryBannerTitle: 'GALLERY',
    galleryBannerSubtitle:
      'Here you find the profile of ministers of the GKS, pictures and videos of events across the branches of the church.',
    ministers: 'Ministers',

    // Video Gallery Screen
    videoGalleryTitle: 'VIDEO GALLERY',
    videoGallerySubtitle:
      'Major events across our branches, kept for your viewing pleasure.',
    videoLabel: 'Video',
    videosLabel: 'Videos',
    untitledEvent: 'Untitled Event',
    noEventsFound: 'No events found matching your search',
    noVideosYet: 'No videos yet',

    // Picture Gallery Screen
    pictureGalleryTitle: 'PICTURE GALLERY',
    pictureGallerySubtitle:
      'Memories of major events across different branches, kept for your viewing.',
    galleryNavTitle: 'Gallery',
    photo: 'Photo',
    photos: 'Photos',
    untitledEvent: 'Untitled Event',
    noEventsFound: 'No events found',
    noPicturesYet: 'No pictures yet',

    // Ministers Gallery Screen
    ministersNavTitle: 'Ministers',
    ministersBannerTitle: 'MINISTERS PROFILE',
    ministersBannerSubtitle:
      'Official profiles of the GKS ministry. Identifying and honouring those who labour in the word.',
    searchByName: 'Search by name...',
    unnamedMinister: 'Unnamed Minister',
    ministerLabel: 'Minister',
    devotedLabel: 'Devoted',
    contactNotProvided: 'Contact not provided',

    // Quiz Resources Screen
    quizNavTitle: 'Quiz Resources',
    quizSearchPlaceholder: 'Search by title, year, or category...',
    downloadPdf: 'Download PDF',
    details: 'Details',
    noResourcesFound: 'No resources found.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Quiz Details',
    openStudyMaterial: 'Open Study Material (PDF)',
    needClarification: 'Need Clarification?',
    clarificationDesc:
      "If you're confused about any question in this study material, ask our admins for help.",
    askQuestion: 'Ask a Question',

    // Quiz Help Screen
    askHelpNavTitle: 'Ask for Help',
    haveQuestionFromTitle: 'Have a question from "{title}"?',
    provideDetailsHelp:
      'Provide your details below and we will help clarify any confusion.',
    yourNameLabel: 'Your Name',
    enterFullNamePlaceholder: 'Enter your full name',
    whatsappNumberLabel: 'WhatsApp Number',
    whatsappPlaceholder: 'e.g. 08012345678',
    yourQuestionLabel: 'Your Question',
    questionPlaceholder: 'What part of the material is confusing?',
    submitQuestion: 'Submit Question',
    sending: 'Sending...',
    fillAllFields: 'Please fill in all fields',
    questionSentSuccess:
      'Your question has been sent. Our admins will get back to you shortly.',
    questionSendError: 'Failed to send your question. Please try again.',
    ok: 'OK',
    success: 'Success',
    error: 'Error',

    // Notices Screen
    noticesNavTitle: 'Notices',
    noTitle: 'No Title',
    noMessage: 'No message content.',
    viewAttachedDoc: 'View Attached Document',
    pdfFile: 'PDF File',
    noNoticesYet: 'No Notices Yet',

    // Contact Screen
    contactTitle: 'Contact Us',
    getInTouch: 'Get in Touch',
    contactDesc:
      "We'd love to hear from you. Your feedback helps us serve you better.",
    namePlaceholder: 'Enter your name',
    emailPlaceholder: 'Enter your email',
    selectCategory: 'What is this regarding?',
    complaint: 'Complaint',
    suggestion: 'Suggestion',
    request: 'Request',
    appreciation: 'Appreciation',
    messagePlaceholder: 'Write your message here...',
    sendMessage: 'Send Message',
    sendingMessage: 'Sending Message...',
    thankYou: 'Thank You!',
    contactSuccessMsg:
      'Your message has been sent successfully. We appreciate your feedback.',
    returnToApp: 'Return to App',
    submitError: 'Failed to submit message. Please try again.',

    // About Screen
    aboutUsNav: 'About Us',
    churchName: "God's Kingdom Society",
    churchSlogan: '(The Church of the Living God)',
    ourMission: 'Our Mission',
    historyVision: 'History & Vision',
    coreBeliefs: 'Core Beliefs',
    connectWithUs: 'Connect With Us',
    developedBy: 'Developed by HIGH-ER ENTERPRISES',
    allRightsReserved: 'All rights reserved.',
    churchMotto: "Towards God's perfect government",

    // Not Found Screen
    notFoundTitle: 'Oops!',
    screenNotExist: "This screen doesn't exist.",
    goHome: 'Go to home screen!',

    // Navigation / Global Menu
    options: 'Options',
    about: 'About',
    contact: 'Contact',
    adminPanel: 'Admin Panel',
  },

  //CHINESE TRANSLATIONS
  zh: {
    // Navigation
    home: '首页',
    hymns: '赞美诗',
    sermons: '讲道',
    songs: '歌曲',
    animations: '动画',
    profile: '个人资料',
    music: '音乐',
    contact: '联系我们',
    about: '关于我们',
    admin: '管理',
    notices: '公告',
    quizresources: '测验资源',
    live: '直播',
    archive: '存档',

    // Common
    search: '搜索',
    play: '播放',
    pause: '暂停',
    loading: '加载中...',
    error: '错误',
    save: '保存',
    cancel: '取消',
    submit: '提交',
    login: '登录',
    signup: '注册',
    logout: '登出',
    email: '电子邮件',
    password: '密码',
    name: '姓名',
    message: '留言',
    noSermons: '暂无讲道内容',
    noSongs: '暂无歌曲',
    noVideos: '暂无视频',
    noContent: '暂无内容',
    unknownDuration: '时长未知',
    unknownStyle: '风格未知',

    // Content
    duration: '时长',
    category: '类别',
    style: '风格',

    // Contact
    contactUs: '联系我们',
    contactDesc: '我们很乐意听取您的意见。请给我们留言，我们会尽快回复。',
    complaint: '投诉',
    suggestion: '建议',
    request: '请求',
    selectCategory: '选择类别',

    // About
    aboutUs: '关于我们',
    version: '版本',
    mission: '我们的使命',

    // Admin
    adminDashboard: '管理控制台',
    uploadContent: '上传内容',
    manageContent: '管理内容',
    viewMessages: '查看留言',
    addHymn: '添加赞美诗',
    addSermon: '添加讲道',
    uploadSong: '上传歌曲',
    uploadVideo: '上传视频',

    //onboarding
    skip: '跳过',
    startBtn: '开始',
    onboardingSubtitle1: '欢迎来到',
    onboardingTitle1: '神国协会 (GKS)',
    onboardingDesc1: '一个宣扬并实践上帝话语真理，以追求上帝救恩的基督徒组织。',
    onboardingSubtitle2: '在上帝的话语中成长',
    onboardingTitle2: '造就心灵的讲道',
    onboardingDesc2:
      '轻松获取 GKS 的文字、音频和视频格式讲道，学习圣经中原原本本的上帝之道。',
    onboardingSubtitle3: '敬拜上帝',
    onboardingTitle3: '优美的诗歌',
    onboardingDesc3:
      '与世界各地的信徒一起，通过优美的赞美诗歌向圣父与基督献上尊崇。',
    onboardingSubtitle4: '探索更多',
    onboardingTitle4: '更多功能',
    onboardingDesc4: '通过动画学习上帝的话语，并访问教会存档中的图片和视频。',

    // Home Screen
    homeNavTitle: '恩典',
    heroLabel: "神国协会 (GOD'S KINGDOM SOCIETY)",
    heroTitle: '迈向神完美的统治',
    heroDesc: '在永生上帝的教会中阅读、聆听并增长信心。',
    exploreResources: '探索资源',
    homeCardTitleSongs: '赞美诗歌',
    homeCardSubtitleSongs: '用于敬拜与默想的神圣旋律。',
    homeCardTitleSermons: '造就心灵的讲道',
    homeCardSubtitleSermons: '通过纯正的圣经教导加深您的理解。',
    homeCardTitleStories: '圣经故事',
    homeCardSubtitleStories: '通过叙述将属灵价值观生动地呈现。',
    homeCardTitleArchive: '存档',
    homeCardSubtitleArchive: '探索协会的历史记录和往事。',
    homeCardTitleGallery: '画廊',
    homeCardSubtitleGallery: '通过视觉之旅了解我们的社区和牧者。',
    homeCardTitleQuiz: '测验资源',
    homeCardSubtitleQuiz: '助您磨炼知识的学习材料和资源。',
    homeCardTitleGiving: '什一奉献与供献',
    homeCardSubtitleGiving: '为 GKS 的全球使命贡献力量。',
    homeCardTitleLive: '现场活动',
    homeCardSubtitleLive: '实时观看礼拜和特别活动。',

    // Sermons Main Screen
    sermonsBannerTitle: '造就心灵的讲道',
    sermonsBannerSubtitle:
      '获取不同语言的启发性讲道，用每种语言传播上帝的话语。',
    searchSermons: '搜索讲道、主题和类别...',
    textSermons: '文字讲道',
    readSermons: '按册数和主题分类',
    audioClips: '音频片段',
    listenSermons: '聆听造就心灵的讲道音频',
    videoSermons: '视频讲道',
    watchSermons: '观看直播环节和录像',
    dailyGuide: '每日指引',
    dailyGuideSubtitle: '每日研读上帝的话语',

    // Text Sermons Screen
    textSermonsBannerTitle: '文字讲道',
    textSermonsBannerSubtitle: '通过全文讲道阅读并研读上帝的话语。',
    searchPlaceholder: '搜索讲道...',
    subjectsCountLabel: '个主题',

    // Sermon Categories
    'Weekly Sermon Volume 1': '每周讲道 第一册',
    'Weekly Sermon Volume 2': '每周讲道 第二册',
    "God's Kingdom Advocate Volume 1": '神国倡导者 第一册',
    "God's Kingdom Advocate Volume 2": '神国倡导者 第二册',
    "God's Kingdom Advocate Volume 3": '神国倡导者 第三册',
    'Abridged Bible Subjects': '圣经主题简编',
    'The Ten Fundamental Truths': '十大基本真理',
    "GKS President's Feast Message": 'GKS 主席节期信息',
    "GKS President's Freedom Day Message": 'GKS 主席自由日信息',
    "GKS President's Youth Assembly Message": 'GKS 主席青年大会信息',
    'Sermon Summaries': '讲道摘要',
    'Questions and Answers': '问与答',

    // Sermon Detail Screen
    sermonDetail: '讲道详情',
    sermonNotFound: '未找到讲道内容',
    untitled: '无标题',
    gksSermon: 'GKS 讲道',
    audioAssistant: '语音助手',
    success: '成功',
    copiedToClipboard: '已复制到剪贴板',
    audioError: '音频错误',
    audioPlayError: '无法播放音频，请重试。',
    playbackControlError: '无法控制音频播放',
    part: '第',
    of: '之',

    // Audio Sermons Screen
    audioSermonsTitle: '音频讲道',
    audioSermonsBannerTitle: '音频讲道',
    audioSermonsBannerSubtitle: '通过按年份分类的音频讲道学习上帝的话语。',
    noAudioSermons: '暂无音频讲道',
    unknownYear: '未知年份',
    sermonsCountPlural: '篇讲道',
    sermonCountSingular: '篇讲道',
    sermonsLabel: '讲道',
    untitledSermon: '无标题讲道',
    noDate: '无日期',

    // Audio Player/Details Screen
    audioPlayer: '音频播放器',
    audioLoadError: '加载音频源失败。',
    errorSermonNotFound: '未找到讲道或无音频源可用。',
    permissionRequired: '需要权限',
    saveSermonPermission: '请允许访问权限以便将讲道保存到您的设备。',
    sermonSaved: '讲道已保存到您的设备！',
    fileSaveError: '无法保存文件。',
    noTitle: '无标题',
    unknownDate: '未知日期',

    // Sermon Videos Screen
    videoSermonsTitle: '视频讲道',
    videoPlural: '个视频',
    videoSingular: '个视频',
    loadingVideos: '正在加载视频...',
    noVideosInCategory: '该类别下未找到视频',
    sermonVideosBannerTitle: '视频讲道',
    sermonVideosBannerSubtitle: '观看按类别分类的讲道视频版本。',
    searchSermonVideosPlaceholder: '搜索讲道视频...',
    clearSearch: '清除',
    sermonVideoCategoriesTitle: '讲道视频类别',
    browseSermonsByCategory: '按类别浏览讲道',
    searchResults: '搜索结果',
    noSermonVideosFound: '未找到讲道视频',
    noSermonVideosAvailable: '暂无讲道视频',
    adjustSearchTerms: '请尝试调整您的搜索词',
    checkBackLaterSermons: '请稍后回来查看新视频',
    loadingMoreVideos: '正在加载更多视频...',
    watchNow: '立即观看',
    watch: '观看',

    // Video/Animation Detail
    linkCopied: '链接已复制到剪贴板！',
    shareSermonVideoLabel: '讲道视频',
    noCategory: '无类别',
    shareSermonVideoTitle: '分享讲道视频',
    shareVideoTitle: '分享视频',
    noTitle: '无标题',
    unknownDate: '未知日期',
    errorVideoNotFound: '未找到视频',
    languageLabel: '语言',
    share: '分享',

    // Daily Guide Screen
    dailyGuideTitle: '每日指引',
    dailyDevotionalBanner: '每日灵修',
    dailyDevotionalBannerSubtitle: '通过每日指引滋养您的心灵。',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    loadingDevotional: '正在加载灵修内容...',
    noDevotionalAvailable: '暂无灵修内容',
    checkBackFuture: '请在该日期回来查看新内容',
    noDevotionalPast: '该日期没有发布灵修内容',
    recentDevotionals: '近期灵修',
    dailyDevotionalFallback: '每日灵修',

    // Songs Screen
    songsNavTitle: '歌曲',
    songsBannerTitle: '赞美诗歌',
    songsBannerSubtitle:
      '通过一系列令人振奋的属灵歌曲和赞美诗进行敬拜，坚定您的信心。',
    featuredSongsTitle: '神治赞美诗歌',
    featuredSongsSubtitle: '（赞美诗与诗篇）',
    songsCountLabel: '首歌曲',
    seePlaylist: '查看播放列表',

    // Music Screen
    searchSongsPlaceholder: '搜索歌曲...',
    categoryLabel: '类别',
    songLoadError: '无法加载歌曲。',

    // Music Player Screen
    musicPlayerTitle: '音乐播放器',
    unknownCategory: '未知类别',
    permissionRequired: '需要权限',
    saveSongsPermission: '请允许访问权限以便将歌曲保存到您的设备。',
    songSavedSuccess: '歌曲已保存到您的设备！',
    saveFileError: '无法保存文件。',

    // Hymns/Psalms Screen
    hymnsNavTitle: '赞美诗',
    hymnsBannerTitle: '神治赞美诗歌',
    hymnSearchPlaceholder: '按编号或标题搜索',
    noHymnsFound: '未找到匹配的赞美诗或诗篇。',
    tspPrefix: 'TSP',
    psalmPrefix: '诗篇',

    // Animations Screen
    watchNow: '立即观看',
    loadingMoreVideos: '正在加载更多视频...',
    noVideosFound: '未找到视频',
    noAnimationsAvailable: '暂无动画',
    adjustSearchTerms: '请尝试调整您的搜索词',
    checkBackLater: '请稍后回来查看新内容',
    animationsBannerTitle: '圣经故事',
    animationsBannerSubtitle:
      '通过生动的视觉图解学习上帝的话语，让故事和人物跃然纸上。',
    searchAnimationsPlaceholder: '搜索动画...',
    clear: '清除',

    // Animation Detail
    linkCopied: '链接已复制到剪贴板！',
    shareVideo: '分享视频',
    errorVideoNotFound: '未找到视频',

    // Live Stream Screen
    liveStreamLoading: '正在加载直播...',
    liveStreamError: '加载直播失败，请重试。',
    refreshFailed: '刷新失败',
    refreshFailedMsg: '无法刷新直播',
    openLinkError: '无法打开链接',
    loadingStream: '正在加载流媒体...',
    streamUnavailable: '直播流不可用',
    openInYouTube: '在 YouTube 中打开',
    loadingHLSStream: '正在加载 HLS 流...',
    hlsStreamUnavailable: 'HLS 直播流不可用',
    couldNotLoadStream: '无法加载此直播流',
    external: '外部',
    streamLabel: '直播流',
    tapToWatchYouTube: '点击下方在 YouTube 应用中观看',
    externalStreamExternalOnly: '此类型的流媒体必须在外部打开',
    watchInBrowser: '在浏览器中观看',
    checkConnectionRetry: '请检查您的网络连接并重试。',
    retry: '重试',
    refreshing: '正在刷新...',
    refreshStreams: '刷新直播',
    liveLabel: '直播中',
    offlineLabel: '离线',
    streamOffline: '直播已离线',
    streamNotActive: '此直播当前未处于活动状态',
    streamTypeLabel: '类型：',
    noActiveStreams: '暂无活动直播',
    checkBackLaterLive: '请稍后回来查看现场直播',
    refresh: '刷新',
    unknown: '未知',

    // Archive Screen
    archiveBannerTitle: '存档',
    archiveBannerSubtitle:
      '您可以在这里找到教会以往活动的图片和视频，用于参考和纪念。',
    pictures: '图片',
    videos: '视频',

    // Archive Videos Screen
    videoArchiveTitle: '视频存档',
    videoArchiveSubtitle: '此页面包含教会往事活动的视频，用于参考和纪念。',
    untitledEvent: '无标题活动',
    video: '视频',
    videos: '视频',
    noEventsFound: '未找到符合搜索条件的活动',
    noVideosYet: '暂无视频',

    // Archive Pictures Screen
    pictureArchiveTitle: '图片存档',
    pictureArchiveSubtitle: '教会的神圣记忆与往事活动，供参考之用。',
    untitledEvent: '无标题活动',
    photo: '照片',
    photos: '照片',
    noEventsFound: '未找到活动',
    noPicturesYet: '暂无图片',

    // Gallery Screen
    galleryNavTitle: '画廊',
    galleryBannerTitle: '画廊',
    galleryBannerSubtitle:
      '在这里您可以找到 GKS 牧者的简介，以及教会各分部活动的图片和视频。',
    ministers: '牧者',

    // Video Gallery Screen
    videoGalleryTitle: '视频画廊',
    videoGallerySubtitle: '各分部的主要活动，供您观赏。',
    videoLabel: '视频',
    videosLabel: '视频',
    untitledEvent: '无标题活动',
    noEventsFound: '未找到符合搜索条件的活动',
    noVideosYet: '暂无视频',

    // Picture Gallery Screen
    pictureGalleryTitle: '图片画廊',
    pictureGallerySubtitle: '各分部主要活动的记忆，供您观赏。',
    galleryNavTitle: '画廊',
    photo: '照片',
    photos: '照片',
    untitledEvent: '无标题活动',
    noEventsFound: '未找到活动',
    noPicturesYet: '暂无图片',

    // Ministers Gallery Screen
    ministersNavTitle: '牧者',
    ministersBannerTitle: '牧者简介',
    ministersBannerSubtitle:
      'GKS 牧事部的官方简介。识别并尊崇那些在真道上劳苦的人。',
    searchByName: '按姓名搜索...',
    unnamedMinister: '未命名牧者',
    ministerLabel: '牧者',
    devotedLabel: '忠诚',
    contactNotProvided: '未提供联系方式',

    // Quiz Resources Screen
    quizNavTitle: '测验资源',
    quizSearchPlaceholder: '按标题、年份或类别搜索...',
    downloadPdf: '下载 PDF',
    details: '详情',
    noResourcesFound: '未找到相关资源。',

    // Quiz Detail Screen
    quizDetailNavTitle: '测验详情',
    openStudyMaterial: '打开学习资料 (PDF)',
    needClarification: '需要解答？',
    clarificationDesc:
      '如果您对本学习资料中的任何问题感到困惑，请寻求管理人员的帮助。',
    askQuestion: '提出问题',

    // Quiz Help Screen
    askHelpNavTitle: '寻求帮助',
    haveQuestionFromTitle: '关于“{title}”有疑问吗？',
    provideDetailsHelp: '请在下方提供您的详细信息，我们将帮助您解惑。',
    yourNameLabel: '您的姓名',
    enterFullNamePlaceholder: '请输入您的全名',
    whatsappNumberLabel: 'WhatsApp 号码',
    whatsappPlaceholder: '例如：08012345678',
    yourQuestionLabel: '您的问题',
    questionPlaceholder: '资料中哪部分让您感到困惑？',
    submitQuestion: '提交问题',
    sending: '发送中...',
    fillAllFields: '请填写所有字段',
    questionSentSuccess: '您的问题已发送。我们的管理人员会尽快回复您。',
    questionSendError: '发送问题失败，请重试。',
    ok: '确定',
    success: '成功',
    error: '错误',

    // Notices Screen
    noticesNavTitle: '公告',
    noTitle: '无标题',
    noMessage: '无消息内容。',
    viewAttachedDoc: '查看附件文档',
    pdfFile: 'PDF 文件',
    noNoticesYet: '暂无公告',

    // Contact Screen
    contactTitle: '联系我们',
    getInTouch: '取得联系',
    contactDesc: '我们很乐意听取您的意见。您的反馈将帮助我们更好地为您服务。',
    namePlaceholder: '请输入您的姓名',
    emailPlaceholder: '请输入您的电子邮件',
    selectCategory: '此事关于什么？',
    complaint: '投诉',
    suggestion: '建议',
    request: '请求',
    appreciation: '感谢',
    messagePlaceholder: '在此写下您的留言...',
    sendMessage: '发送留言',
    sendingMessage: '正在发送留言...',
    thankYou: '谢谢！',
    contactSuccessMsg: '您的留言已成功发送。感谢您的反馈。',
    returnToApp: '返回应用',
    submitError: '提交留言失败，请重试。',

    // About Screen
    aboutUsNav: '关于我们',
    churchName: "神国协会 (God's Kingdom Society)",
    churchSlogan: '（永生上帝的教会）',
    ourMission: '我们的使命',
    historyVision: '历史与愿景',
    coreBeliefs: '核心信仰',
    connectWithUs: '与我们联系',
    developedBy: '由 HIGH-ER ENTERPRISES 开发',
    allRightsReserved: '版权所有。',
    churchMotto: '迈向神完美的统治',

    // Not Found Screen
    notFoundTitle: '哎呀！',
    screenNotExist: '该页面不存在。',
    goHome: '返回首页',

    // Navigation / Global Menu
    options: '选项',
    about: '关于',
    contact: '联系',
    adminPanel: '管理面板',
  },

  // FRENCH TRANSLATIONS
  fr: {
    // Navigation
    home: 'Accueil',
    hymns: 'Cantiques',
    sermons: 'Sermons',
    songs: 'Chansons',
    animations: 'Animations',
    profile: 'Profil',
    music: 'Musique',
    contact: 'Contact',
    about: 'À propos',
    admin: 'Admin',
    notices: 'Avis',
    quizresources: 'RessourcesQuiz',
    live: 'En direct',
    archive: 'Archives',

    // Common
    search: 'Rechercher',
    play: 'Lire',
    pause: 'Pause',
    loading: 'Chargement...',
    error: 'Erreur',
    save: 'Enregistrer',
    cancel: 'Annuler',
    submit: 'Envoyer',
    login: 'Connexion',
    signup: "S'inscrire",
    logout: 'Déconnexion',
    email: 'E-mail',
    password: 'Mot de passe',
    name: 'Nom',
    message: 'Message',
    noSermons: 'Aucun sermon disponible',
    noSongs: 'Aucune chanson disponible',
    noVideos: 'Aucune vidéo disponible',
    noContent: 'Aucun contenu disponible',
    unknownDuration: 'Durée inconnue',
    unknownStyle: 'Style inconnu',

    // Content
    duration: 'Durée',
    category: 'Catégorie',
    style: 'Style',

    // Contact
    contactUs: 'Contactez-nous',
    contactDesc:
      'Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous vous répondrons dès que possible.',
    complaint: 'Plainte',
    suggestion: 'Suggestion',
    request: 'Demande',
    selectCategory: 'Sélectionnez une catégorie',

    // About
    aboutUs: 'À propos de nous',
    version: 'Version',
    mission: 'Notre Mission',

    // Admin
    adminDashboard: 'Tableau de bord Admin',
    uploadContent: 'Télécharger du contenu',
    manageContent: 'Gérer le contenu',
    viewMessages: 'Voir les messages',
    addHymn: 'Ajouter un cantique',
    addSermon: 'Ajouter un sermon',
    uploadSong: 'Télécharger une chanson',
    uploadVideo: 'Télécharger une vidéo',

    //onboarding
    skip: 'Passer',
    startBtn: 'COMMENCER',
    onboardingSubtitle1: 'Bienvenue à la',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Une organisation chrétienne où la vérité de la parole de Dieu est prêchée et pratiquée en vue du salut de Dieu.',
    onboardingSubtitle2: 'Grandissez dans la parole de Dieu avec',
    onboardingTitle2: 'Sermons édifiants',
    onboardingDesc2:
      'Accédez facilement aux sermons de la GKS en formats texte, audio et vidéo et apprenez la parole de Dieu telle qu’elle est dans la Bible.',
    onboardingSubtitle3: 'Adorez Dieu avec',
    onboardingTitle3: 'Chants gracieux',
    onboardingDesc3:
      'Rejoignez les croyants du monde entier pour honorer Dieu et le Christ à travers des chants de louange mélodieux.',
    onboardingSubtitle4: 'EXPLORER PLUS',
    onboardingTitle4: 'PLUS DE FONCTIONNALITÉS',
    onboardingDesc4:
      "Apprenez la parole de Dieu à travers des animations, et accédez aux photos et vidéos des archives de l'église.",

    // Home Screen
    homeNavTitle: 'Grâce',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Vers le gouvernement parfait de Dieu',
    heroDesc:
      "Lisez, écoutez et grandissez dans la foi avec l'Église du Dieu Vivant.",
    exploreResources: 'Explorer les ressources',
    homeCardTitleSongs: 'Chants de louanges',
    homeCardSubtitleSongs: "Mélodies sacrées pour l'adoration et la réflexion.",
    homeCardTitleSermons: 'Sermons édifiants',
    homeCardSubtitleSermons:
      'Approfondissez votre compréhension avec un enseignement biblique sain.',
    homeCardTitleStories: 'Histoires bibliques',
    homeCardSubtitleStories: 'Valeurs spirituelles illustrées par le récit.',
    homeCardTitleArchive: 'Archives',
    homeCardSubtitleArchive:
      'Explorez les dossiers historiques et les événements passés de la société.',
    homeCardTitleGallery: 'Galerie',
    homeCardSubtitleGallery:
      'Un voyage visuel à travers notre communauté et nos ministres.',
    homeCardTitleQuiz: 'Ressources de Quiz',
    homeCardSubtitleQuiz:
      "Matériel d'étude et ressources pour aiguiser vos connaissances.",
    homeCardTitleGiving: 'Dîmes et Offrandes',
    homeCardSubtitleGiving: 'Contribuez à la mission mondiale de la GKS.',
    homeCardTitleLive: 'Événements en direct',
    homeCardSubtitleLive:
      'Suivez les services et événements spéciaux en temps réel.',

    // Sermons Main Screen
    sermonsBannerTitle: 'SERMONS ÉDIFIANTS',
    sermonsBannerSubtitle:
      'Accédez à des sermons inspirants dans différentes langues, partageant la Parole de Dieu dans chaque langue.',
    searchSermons: 'Rechercher des sermons, sujets et catégories...',
    textSermons: 'Sermons textuels',
    readSermons: 'Organisés par volume et sujet',
    audioClips: 'Clips audio',
    listenSermons: "Écoutez l'audio de sermons édifiants",
    videoSermons: 'Sermons vidéo',
    watchSermons: 'Regardez les sessions en direct et les enregistrements',
    dailyGuide: 'Guide quotidien',
    dailyGuideSubtitle: 'Étudiez la parole de Dieu quotidiennement',

    // Text Sermons Screen
    textSermonsBannerTitle: 'SERMONS TEXTUELS',
    textSermonsBannerSubtitle:
      'Lisez et étudiez la parole de Dieu avec des sermons complets.',
    searchPlaceholder: 'Rechercher des sermons...',
    subjectsCountLabel: 'sujets',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Sermon Hebdomadaire Volume 1',
    'Weekly Sermon Volume 2': 'Sermon Hebdomadaire Volume 2',
    "God's Kingdom Advocate Volume 1": "God's Kingdom Advocate Volume 1",
    "God's Kingdom Advocate Volume 2": "God's Kingdom Advocate Volume 2",
    "God's Kingdom Advocate Volume 3": "God's Kingdom Advocate Volume 3",
    'Abridged Bible Subjects': 'Sujets Bibliques Abrégés',
    'The Ten Fundamental Truths': 'Les Dix Vérités Fondamentales',
    "GKS President's Feast Message": 'Message de fête du président de la GKS',
    "GKS President's Freedom Day Message":
      'Message du jour de la liberté du président de la GKS',
    "GKS President's Youth Assembly Message":
      "Message de l'assemblée des jeunes du président de la GKS",
    'Sermon Summaries': 'Résumés de sermons',
    'Questions and Answers': 'Questions et Réponses',

    // Sermon Detail Screen
    sermonDetail: 'Détail du Sermon',
    sermonNotFound: 'Sermon non trouvé',
    untitled: 'Sans titre',
    gksSermon: 'Sermon GKS',
    audioAssistant: 'Assistant Audio',
    success: 'Succès',
    copiedToClipboard: 'Copié dans le presse-papiers',
    audioError: 'Erreur Audio',
    audioPlayError: "Impossible de lire l'audio. Veuillez réessayer.",
    playbackControlError: 'Échec du contrôle de la lecture audio',
    part: 'Partie',
    of: 'de',

    // Audio Sermons Screen
    audioSermonsTitle: 'Sermons Audio',
    audioSermonsBannerTitle: 'SERMONS AUDIO',
    audioSermonsBannerSubtitle:
      'Apprenez la parole de Dieu avec des sermons audio, organisés par année.',
    noAudioSermons: 'Aucun sermon audio disponible',
    unknownYear: 'Inconnu',
    sermonsCountPlural: 'sermons',
    sermonCountSingular: 'sermon',
    sermonsLabel: 'Sermons',
    untitledSermon: 'Sermon sans titre',
    noDate: 'Pas de date',

    // Audio Player/Details Screen
    audioPlayer: 'Lecteur Audio',
    audioLoadError: 'Échec du chargement de la source audio.',
    errorSermonNotFound: 'Sermon non trouvé ou aucune source audio disponible.',
    permissionRequired: 'Autorisation requise',
    saveSermonPermission:
      "Veuillez autoriser l'accès pour enregistrer les sermons sur votre appareil.",
    sermonSaved: 'Sermon enregistré sur votre appareil !',
    fileSaveError: "Impossible d'enregistrer le fichier.",
    noTitle: 'Sans titre',
    unknownDate: 'Date inconnue',

    // Sermon Videos Screen
    videoSermonsTitle: 'Sermons Vidéo',
    videoPlural: 'vidéos',
    videoSingular: 'vidéo',
    loadingVideos: 'Chargement des vidéos...',
    noVideosInCategory: 'Aucune vidéo trouvée dans cette catégorie',
    sermonVideosBannerTitle: 'VIDÉOS DE SERMONS',
    sermonVideosBannerSubtitle:
      'Regardez les versions vidéo des sermons organisées par catégories.',
    searchSermonVideosPlaceholder: 'Rechercher des vidéos de sermons...',
    clearSearch: 'Effacer',
    sermonVideoCategoriesTitle: 'Catégories de vidéos de sermons',
    browseSermonsByCategory: 'Parcourir les sermons par catégorie',
    searchResults: 'Résultats de recherche',
    noSermonVideosFound: 'Aucune vidéo de sermon trouvée',
    noSermonVideosAvailable: 'Aucune vidéo de sermon disponible',
    adjustSearchTerms: "Essayez d'ajuster vos termes de recherche",
    checkBackLaterSermons:
      'Revenez plus tard pour de nouvelles vidéos de sermons',
    loadingMoreVideos: 'Chargement de plus de vidéos...',
    watchNow: 'Regarder maintenant',
    watch: 'Regarder',

    // Video/Animation Detail
    linkCopied: 'Lien copié dans le presse-papiers !',
    shareSermonVideoLabel: 'Vidéo de sermon',
    noCategory: 'Aucune catégorie',
    shareSermonVideoTitle: 'Partager la vidéo du sermon',
    shareVideoTitle: 'Partager la vidéo',
    noTitle: 'Sans titre',
    unknownDate: 'Date inconnue',
    errorVideoNotFound: 'Vidéo non trouvée',
    languageLabel: 'Langue',
    share: 'Partager',

    // Daily Guide Screen
    dailyGuideTitle: 'Guide Quotidien',
    dailyDevotionalBanner: 'Dévotion Quotidienne',
    dailyDevotionalBannerSubtitle:
      'Nourrissez votre esprit avec des conseils quotidiens.',
    today: "Aujourd'hui",
    yesterday: 'Hier',
    tomorrow: 'Demain',
    loadingDevotional: 'Chargement de la dévotion...',
    noDevotionalAvailable: 'Aucune dévotion disponible',
    checkBackFuture: 'Revenez à cette date pour une nouvelle dévotion',
    noDevotionalPast: "Aucune dévotion n'a été publiée pour cette date",
    recentDevotionals: 'Dévotions Récentes',
    dailyDevotionalFallback: 'Dévotion Quotidienne',

    // Songs Screen
    songsNavTitle: 'Chansons',
    songsBannerTitle: 'CHANTS DE LOUANGE',
    songsBannerSubtitle:
      'Adorez à travers une collection de chants spirituels et de cantiques édifiants qui renforcent votre foi.',
    featuredSongsTitle: 'Chants de louange théocratiques',
    featuredSongsSubtitle: '(Cantiques et Psaumes)',
    songsCountLabel: 'chansons',
    seePlaylist: 'Voir la liste de lecture',

    // Music Screen
    searchSongsPlaceholder: 'Rechercher des chansons...',
    categoryLabel: 'Catégorie',
    songLoadError: 'Impossible de charger les chansons.',

    // Music Player Screen
    musicPlayerTitle: 'Lecteur de musique',
    unknownCategory: 'Catégorie inconnue',
    permissionRequired: 'Autorisation requise',
    saveSongsPermission:
      "Veuillez autoriser l'accès pour enregistrer les chansons sur votre appareil.",
    songSavedSuccess: 'Chanson enregistrée sur votre appareil !',
    saveFileError: "Impossible d'enregistrer le fichier.",

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Cantiques',
    hymnsBannerTitle: 'Chants de louange théocratiques',
    hymnSearchPlaceholder: 'Rechercher par numéro ou titre',
    noHymnsFound:
      'Aucun cantique ou psaume trouvé correspondant à votre recherche.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Psaume',

    // Animations Screen
    watchNow: 'Regarder maintenant',
    loadingMoreVideos: 'Chargement de plus de vidéos...',
    noVideosFound: 'Aucune vidéo trouvée',
    noAnimationsAvailable: 'Aucune animation disponible',
    adjustSearchTerms: "Essayez d'ajuster vos termes de recherche",
    checkBackLater: 'Revenez plus tard pour de nouveaux contenus',
    animationsBannerTitle: 'HISTOIRES BIBLIQUES',
    animationsBannerSubtitle:
      'Apprenez la parole de Dieu à travers des illustrations visuelles qui donnent vie aux histoires et aux personnages.',
    searchAnimationsPlaceholder: 'Rechercher des animations...',
    clear: 'Effacer',

    // Animation Detail
    linkCopied: 'Lien copié dans le presse-papiers !',
    shareVideo: 'Partager la vidéo',
    errorVideoNotFound: 'Vidéo non trouvée',

    // Live Stream Screen
    liveStreamLoading: 'Chargement des flux...',
    liveStreamError: 'Échec du chargement des flux. Veuillez réessayer.',
    refreshFailed: 'Échec du rafraîchissement',
    refreshFailedMsg: 'Impossible de rafraîchir les flux',
    openLinkError: "Impossible d'ouvrir le lien",
    loadingStream: 'Chargement du flux...',
    streamUnavailable: 'Flux indisponible',
    openInYouTube: 'Ouvrir dans YouTube',
    loadingHLSStream: 'Chargement du flux HLS...',
    hlsStreamUnavailable: 'Flux HLS indisponible',
    couldNotLoadStream: 'Impossible de charger ce flux',
    external: 'EXTERNE',
    streamLabel: 'Flux',
    tapToWatchYouTube:
      "Appuyez ci-dessous pour regarder dans l'application YouTube",
    externalStreamExternalOnly: "Ce type de flux doit être ouvert à l'externe",
    watchInBrowser: 'Regarder dans le navigateur',
    checkConnectionRetry: 'Veuillez vérifier votre connexion et réessayer.',
    retry: 'Réessayer',
    refreshing: 'Rafraîchissement...',
    refreshStreams: 'Rafraîchir les flux',
    liveLabel: 'EN DIRECT',
    offlineLabel: 'HORS LIGNE',
    streamOffline: 'Flux hors ligne',
    streamNotActive: "Ce flux n'est pas actif actuellement",
    streamTypeLabel: 'Type : ',
    noActiveStreams: 'Aucun flux actif',
    checkBackLaterLive: 'Revenez plus tard pour les flux en direct',
    refresh: 'Rafraîchir',
    unknown: 'Inconnu',

    // Archive Screen
    archiveBannerTitle: 'ARCHIVES',
    archiveBannerSubtitle:
      "Ici vous trouverez des photos et vidéos d'anciens événements de l'église, conservées pour référence et souvenirs.",
    pictures: 'Photos',
    videos: 'Vidéos',

    // Archive Videos Screen
    videoArchiveTitle: 'ARCHIVES VIDÉO',
    videoArchiveSubtitle:
      "Cet écran contient des vidéos d'anciens événements de l'église, conservées pour référence et souvenirs.",
    untitledEvent: 'Événement sans titre',
    video: 'Vidéo',
    videos: 'Vidéos',
    noEventsFound: 'Aucun événement trouvé correspondant à votre recherche',
    noVideosYet: 'Pas encore de vidéos',

    // Archive Pictures Screen
    pictureArchiveTitle: 'ARCHIVES PHOTOS',
    pictureArchiveSubtitle:
      "Souvenirs sacrés et anciens événements de l'église, conservés pour référence.",
    untitledEvent: 'Événement sans titre',
    photo: 'Photo',
    photos: 'Photos',
    noEventsFound: 'Aucun événement trouvé',
    noPicturesYet: 'Pas encore de photos',

    // Gallery Screen
    galleryNavTitle: 'Galerie',
    galleryBannerTitle: 'GALERIE',
    galleryBannerSubtitle:
      "Ici vous trouverez le profil des ministres de la GKS, des photos et des vidéos d'événements à travers les branches de l'église.",
    ministers: 'Ministres',

    // Video Gallery Screen
    videoGalleryTitle: 'GALERIE VIDÉO',
    videoGallerySubtitle:
      'Événements majeurs à travers nos branches, conservés pour votre plaisir visuel.',
    videoLabel: 'Vidéo',
    videosLabel: 'Vidéos',
    untitledEvent: 'Événement sans titre',
    noEventsFound: 'Aucun événement trouvé correspondant à votre recherche',
    noVideosYet: 'Pas encore de vidéos',

    // Picture Gallery Screen
    pictureGalleryTitle: 'GALERIE PHOTOS',
    pictureGallerySubtitle:
      "Souvenirs d'événements majeurs dans différentes branches, conservés pour votre visualisation.",
    galleryNavTitle: 'Galerie',
    photo: 'Photo',
    photos: 'Photos',
    untitledEvent: 'Événement sans titre',
    noEventsFound: 'Aucun événement trouvé',
    noPicturesYet: 'Pas encore de photos',

    // Ministers Gallery Screen
    ministersNavTitle: 'Ministres',
    ministersBannerTitle: 'PROFIL DES MINISTRES',
    ministersBannerSubtitle:
      'Profils officiels du ministère de la GKS. Identifier et honorer ceux qui travaillent dans la parole.',
    searchByName: 'Rechercher par nom...',
    unnamedMinister: 'Ministre sans nom',
    ministerLabel: 'Ministre',
    devotedLabel: 'Dévoué',
    contactNotProvided: 'Contact non fourni',

    // Quiz Resources Screen
    quizNavTitle: 'Ressources de Quiz',
    quizSearchPlaceholder: 'Rechercher par titre, année ou catégorie...',
    downloadPdf: 'Télécharger PDF',
    details: 'Détails',
    noResourcesFound: 'Aucune ressource trouvée.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Détails du Quiz',
    openStudyMaterial: "Ouvrir le matériel d'étude (PDF)",
    needClarification: "Besoin d'éclaircissement ?",
    clarificationDesc:
      "Si vous avez un doute sur une question dans ce matériel d'étude, demandez de l'aide à nos administrateurs.",
    askQuestion: 'Poser une question',

    // Quiz Help Screen
    askHelpNavTitle: "Demander de l'aide",
    haveQuestionFromTitle: 'Avez-vous une question concernant "{title}" ?',
    provideDetailsHelp:
      'Fournissez vos coordonnées ci-dessous et nous vous aiderons à éclaircir toute confusion.',
    yourNameLabel: 'Votre Nom',
    enterFullNamePlaceholder: 'Entrez votre nom complet',
    whatsappNumberLabel: 'Numéro WhatsApp',
    whatsappPlaceholder: 'ex: 08012345678',
    yourQuestionLabel: 'Votre Question',
    questionPlaceholder: 'Quelle partie du matériel est confuse ?',
    submitQuestion: 'Envoyer la question',
    sending: 'Envoi...',
    fillAllFields: 'Veuillez remplir tous les champs',
    questionSentSuccess:
      'Votre question a été envoyée. Nos administrateurs vous répondront sous peu.',
    questionSendError:
      "Échec de l'envoi de votre question. Veuillez réessayer.",
    ok: 'OK',
    success: 'Succès',
    error: 'Erreur',

    // Notices Screen
    noticesNavTitle: 'Avis',
    noTitle: 'Sans titre',
    noMessage: 'Aucun contenu de message.',
    viewAttachedDoc: 'Voir le document joint',
    pdfFile: 'Fichier PDF',
    noNoticesYet: "Pas encore d'avis",

    // Contact Screen
    contactTitle: 'Contactez-nous',
    getInTouch: 'Entrez en contact',
    contactDesc:
      'Nous aimerions avoir de vos nouvelles. Vos commentaires nous aident à mieux vous servir.',
    namePlaceholder: 'Entrez votre nom',
    emailPlaceholder: 'Entrez votre e-mail',
    selectCategory: "À quel sujet s'agit-il ?",
    complaint: 'Plainte',
    suggestion: 'Suggestion',
    request: 'Demande',
    appreciation: 'Appréciation',
    messagePlaceholder: 'Écrivez votre message ici...',
    sendMessage: 'Envoyer le message',
    sendingMessage: 'Envoi du message...',
    thankYou: 'Merci !',
    contactSuccessMsg:
      'Votre message a été envoyé avec succès. Nous apprécions votre retour.',
    returnToApp: "Retour à l'application",
    submitError: "Échec de l'envoi du message. Veuillez réessayer.",

    // About Screen
    aboutUsNav: 'À propos de nous',
    churchName: "God's Kingdom Society",
    churchSlogan: "(L'Église du Dieu Vivant)",
    ourMission: 'Notre Mission',
    historyVision: 'Histoire et Vision',
    coreBeliefs: 'Croyances fondamentales',
    connectWithUs: 'Connectez-vous avec nous',
    developedBy: 'Développé par HIGH-ER ENTERPRISES',
    allRightsReserved: 'Tous droits réservés.',
    churchMotto: 'Vers le gouvernement parfait de Dieu',

    // Not Found Screen
    notFoundTitle: 'Oups !',
    screenNotExist: "Cet écran n'existe pas.",
    goHome: "Aller à l'écran d'accueil !",

    // Navigation / Global Menu
    options: 'Options',
    about: 'À propos',
    contact: 'Contact',
    adminPanel: 'Panneau Admin',
  },

  //SWAHILI TRANSLATIONS
  sw: {
    // Navigation
    home: 'Nyumbani',
    hymns: 'Nyimbo za Dini',
    sermons: 'Mahubiri',
    songs: 'Nyimbo',
    animations: 'Vikaragosi',
    profile: 'Wasifu',
    music: 'Muziki',
    contact: 'Wasiliana',
    about: 'Kuhusu',
    admin: 'Utawala',
    notices: 'Matangazo',
    quizresources: 'RasilimaliZaMaswali',
    live: 'Mubashara',
    archive: 'Kumbukumbu',

    // Common
    search: 'Tafuta',
    play: 'Cheza',
    pause: 'Simamisha',
    loading: 'Inapakia...',
    error: 'Hitilafu',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    submit: 'Wasilisha',
    login: 'Ingia',
    signup: 'Jisajili',
    logout: 'Ondoka',
    email: 'Barua Pepe',
    password: 'Nywila',
    name: 'Jina',
    message: 'Ujumbe',
    noSermons: 'Hakuna mahubiri yanayopatikana',
    noSongs: 'Hakuna nyimbo zinazopatikana',
    noVideos: 'Hakuna video zinazopatikana',
    noContent: 'Hakuna maudhui yanayopatikana',
    unknownDuration: 'Muda haujulikani',
    unknownStyle: 'Mtindo haujulikani',

    // Content
    duration: 'Muda',
    category: 'Jamii',
    style: 'Mtindo',

    // Contact
    contactUs: 'Wasiliana Nasi',
    contactDesc:
      'Tungependa kusikia kutoka kwako. Tutumie ujumbe nasi tutakujibu haraka iwezekanavyo.',
    complaint: 'Malalamiko',
    suggestion: 'Pendekezo',
    request: 'Ombi',
    selectCategory: 'Chagua Jamii',

    // About
    aboutUs: 'Kuhusu Sisi',
    version: 'Toleo',
    mission: 'Utume Wetu',

    // Admin
    adminDashboard: 'Dashibodi ya Utawala',
    uploadContent: 'Pakia Maudhui',
    manageContent: 'Simamia Maudhui',
    viewMessages: 'Angalia Ujumbe',
    addHymn: 'Ongeza Wimbo wa Dini',
    addSermon: 'Ongeza Hubiri',
    uploadSong: 'Pakia Wimbo',
    uploadVideo: 'Pakia Video',

    //onboarding
    skip: 'Ruka',
    startBtn: 'ANZA',
    onboardingSubtitle1: 'Karibu kwenye',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Shirika la Kikristo ambapo ukweli wa neno la Mungu unahubiriwa na kutendwa kwa lengo la kupata wokovu wa Mungu.',
    onboardingSubtitle2: 'Kua katika neno la Mungu kwa',
    onboardingTitle2: 'Mahubiri ya Kujenga',
    onboardingDesc2:
      'Pata ufikiaji rahisi wa mahubiri ya GKS katika maandishi, sauti na video na ujifunze neno la Mungu kama lilivyo katika Biblia.',
    onboardingSubtitle3: 'Mwabudu Mungu kwa',
    onboardingTitle3: 'Nyimbo za Neema',
    onboardingDesc3:
      'Jiunge na waumini wenzako duniani kote kutoa heshima kwa Mungu na Kristo kupitia nyimbo zenye kupendeza za sifa.',
    onboardingSubtitle4: 'GUNDUA ZAIDI',
    onboardingTitle4: 'VIPENGELE ZAIDI',
    onboardingDesc4:
      'Jifunze neno la Mungu kupitia vikaragosi, na upate ufikiaji wa picha na video katika kumbukumbu za kanisa.',

    // Home Screen
    homeNavTitle: 'Neema',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Kuelekea Serikali Kamilifu ya Mungu',
    heroDesc:
      'Soma, sikiliza, na ukue katika imani na Kanisa la Mungu Aliye Hai.',
    exploreResources: 'Gundua Rasilimali',
    homeCardTitleSongs: 'Nyimbo za Sifa',
    homeCardSubtitleSongs: 'Melodi takatifu kwa ajili ya ibada na tafakari.',
    homeCardTitleSermons: 'Mahubiri ya Kujenga',
    homeCardSubtitleSermons:
      'Ongeza uelewa wako kwa mafundisho sahihi ya Biblia.',
    homeCardTitleStories: 'Hadithi za Biblia',
    homeCardSubtitleStories:
      'Maadili ya kiroho yanayoletwa hai kupitia simulizi.',
    homeCardTitleArchive: 'Kumbukumbu',
    homeCardSubtitleArchive:
      'Gundua rekodi za kihistoria na matukio ya zamani ya chama.',
    homeCardTitleGallery: 'Matunzio',
    homeCardSubtitleGallery: 'Safari ya picha kupitia jamii yetu na watumishi.',
    homeCardTitleQuiz: 'Rasilimali za Maswali',
    homeCardSubtitleQuiz:
      'Nyenzo za kusomea na rasilimali za kuongeza maarifa yako.',
    homeCardTitleGiving: 'Zaka na Sadaka',
    homeCardSubtitleGiving: 'Changia katika utume wa kimataifa wa GKS.',
    homeCardTitleLive: 'Matukio Mubashara',
    homeCardSubtitleLive: 'Tazama ibada na matukio maalum kwa wakati halisi.',

    // Sermons Main Screen
    sermonsBannerTitle: 'MAHUBIRI YA KUJENGA',
    sermonsBannerSubtitle:
      'Fikia mahubiri ya kutia moyo katika lugha tofauti, ukishiriki Neno la Mungu kwa kila lugha.',
    searchSermons: 'Tafuta mahubiri, mada, na jamii...',
    textSermons: 'Mahubiri ya Maandishi',
    readSermons: 'Yamepangwa kwa juzuu na mada',
    audioClips: 'Vipande vya Sauti',
    listenSermons: 'Sikiliza sauti ya mahubiri ya kujenga',
    videoSermons: 'Mahubiri ya Video',
    watchSermons: 'Tazama vipindi mubashara na rekodi',
    dailyGuide: 'Mwongozo wa Kila Siku',
    dailyGuideSubtitle: 'Jifunze neno la Mungu kila siku',

    // Text Sermons Screen
    textSermonsBannerTitle: 'MAHUBIRI YA MAANDISHI',
    textSermonsBannerSubtitle:
      'Soma na ujifunze neno la Mungu kwa mahubiri ya maandishi kamili.',
    searchPlaceholder: 'Tafuta mahubiri...',
    subjectsCountLabel: 'mada',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Hubiri la Kila Wiki Juzuu la 1',
    'Weekly Sermon Volume 2': 'Hubiri la Kila Wiki Juzuu la 2',
    "God's Kingdom Advocate Volume 1": 'Mtetezi wa Ufalme wa Mungu Juzuu la 1',
    "God's Kingdom Advocate Volume 2": 'Mtetezi wa Ufalme wa Mungu Juzuu la 2',
    "God's Kingdom Advocate Volume 3": 'Mtetezi wa Ufalme wa Mungu Juzuu la 3',
    'Abridged Bible Subjects': 'Mada za Biblia Zilizofupishwa',
    'The Ten Fundamental Truths': 'Kweli Kumi za Msingi',
    "GKS President's Feast Message": 'Ujumbe wa Sikukuu wa Rais wa GKS',
    "GKS President's Freedom Day Message":
      'Ujumbe wa Siku ya Uhuru wa Rais wa GKS',
    "GKS President's Youth Assembly Message":
      'Ujumbe wa Mkutano wa Vijana wa Rais wa GKS',
    'Sermon Summaries': 'Muhtasari wa Mahubiri',
    'Questions and Answers': 'Maswali na Majibu',

    // Sermon Detail Screen
    sermonDetail: 'Maelezo ya Hubiri',
    sermonNotFound: 'Hubiri halijapatikana',
    untitled: 'Bila Kichwa',
    gksSermon: 'Hubiri la GKS',
    audioAssistant: 'Msaidizi wa Sauti',
    success: 'Mafanikio',
    copiedToClipboard: 'Imekiliwa kwenye ubao wa kunakili',
    audioError: 'Hitilafu ya Sauti',
    audioPlayError: 'Imeshindwa kucheza sauti. Tafadhali jaribu tena.',
    playbackControlError: 'Imeshindwa kudhibiti uchezaji wa sauti',
    part: 'Sehemu ya',
    of: 'ya',

    // Audio Sermons Screen
    audioSermonsTitle: 'Mahubiri ya Sauti',
    audioSermonsBannerTitle: 'MAHUBIRI YA SAUTI',
    audioSermonsBannerSubtitle:
      'Jifunze neno la Mungu kwa mahubiri ya sauti, yaliyopangwa kwa mwaka.',
    noAudioSermons: 'Hakuna mahubiri ya sauti yanayopatikana',
    unknownYear: 'Haijulikani',
    sermonsCountPlural: 'mahubiri',
    sermonCountSingular: 'hubiri',
    sermonsLabel: 'Mahubiri',
    untitledSermon: 'Hubiri Bila Kichwa',
    noDate: 'Hakuna tarehe',

    // Audio Player/Details Screen
    audioPlayer: 'Kicheza Sauti',
    audioLoadError: 'Imeshindwa kupakia chanzo cha sauti.',
    errorSermonNotFound: 'Hubiri halijapatikana au hakuna chanzo cha sauti.',
    permissionRequired: 'Ruhusa inahitajika',
    saveSermonPermission:
      'Tafadhali ruhusu ufikiaji ili kuhifadhi mahubiri kwenye kifaa chako.',
    sermonSaved: 'Hubiri limehifadhiwa kwenye kifaa chako!',
    fileSaveError: 'Haikuweza kuhifadhi faili.',
    noTitle: 'Bila Kichwa',
    unknownDate: 'Tarehe Haijulikani',

    // Sermon Videos Screen
    videoSermonsTitle: 'Mahubiri ya Video',
    videoPlural: 'video',
    videoSingular: 'video',
    loadingVideos: 'Inapakia video...',
    noVideosInCategory: 'Hakuna video zilizopatikana katika jamii hii',
    sermonVideosBannerTitle: 'VIDEO ZA MAHUBIRI',
    sermonVideosBannerSubtitle:
      'Tazama matoleo ya video ya mahubiri yaliyopangwa kwa jamii.',
    searchSermonVideosPlaceholder: 'Tafuta video za mahubiri...',
    clearSearch: 'Futa',
    sermonVideoCategoriesTitle: 'Jamii za Video za Mahubiri',
    browseSermonsByCategory: 'Vinjari mahubiri kwa jamii',
    searchResults: 'Matokeo ya Utafutaji',
    noSermonVideosFound: 'Hakuna video za mahubiri zilizopatikana',
    noSermonVideosAvailable: 'Hakuna video za mahubiri zinazopatikana',
    adjustSearchTerms: 'Jaribu kurekebisha maneno yako ya utafutaji',
    checkBackLaterSermons: 'Angalia tena baadaye kwa video mpya za mahubiri',
    loadingMoreVideos: 'Inapakia video zaidi...',
    watchNow: 'Tazama Sasa',
    watch: 'Tazama',

    // Video/Animation Detail
    linkCopied: 'Kiungo kimekaliwa!',
    shareSermonVideoLabel: 'Video ya Hubiri',
    noCategory: 'Hakuna jamii',
    shareSermonVideoTitle: 'Shiriki Video ya Hubiri',
    shareVideoTitle: 'Shiriki Video',
    noTitle: 'Bila Kichwa',
    unknownDate: 'Tarehe haijulikani',
    errorVideoNotFound: 'Video haijapatikana',
    languageLabel: 'Lugha',
    share: 'Shiriki',

    // Daily Guide Screen
    dailyGuideTitle: 'Mwongozo wa Kila Siku',
    dailyDevotionalBanner: 'Ibada ya Kila Siku',
    dailyDevotionalBannerSubtitle: 'Lisha roho yako kwa mwongozo wa kila siku.',
    today: 'Leo',
    yesterday: 'Jana',
    tomorrow: 'Kesho',
    loadingDevotional: 'Inapakia ibada...',
    noDevotionalAvailable: 'Hakuna Ibada Inayopatikana',
    checkBackFuture: 'Angalia tena tarehe hii kwa ibada mpya',
    noDevotionalPast: 'Hakuna ibada iliyochapishwa kwa tarehe hii',
    recentDevotionals: 'Ibada za Hivi Karibuni',
    dailyDevotionalFallback: 'Ibada ya Kila Siku',

    // Songs Screen
    songsNavTitle: 'Nyimbo',
    songsBannerTitle: 'NYIMBO ZA SIFA',
    songsBannerSubtitle:
      'Abudu kupitia mkusanyiko wa nyimbo za kiroho zinazoinua na kuimarisha imani yako.',
    featuredSongsTitle: 'Nyimbo za Sifa za Kitheokrasi',
    featuredSongsSubtitle: '(Zaburi na Nyimbo za Dini)',
    songsCountLabel: 'nyimbo',
    seePlaylist: 'Angalia Orodha ya Nyimbo',

    // Music Screen
    searchSongsPlaceholder: 'Tafuta nyimbo...',
    categoryLabel: 'Jamii',
    songLoadError: 'Imeshindwa kupakia nyimbo.',

    // Music Player Screen
    musicPlayerTitle: 'Kicheza Muziki',
    unknownCategory: 'Jamii Haijulikani',
    permissionRequired: 'Ruhusa inahitajika',
    saveSongsPermission:
      'Tafadhali ruhusu ufikiaji ili kuhifadhi nyimbo kwenye kifaa chako.',
    songSavedSuccess: 'Wimbo umehifadhiwa kwenye kifaa chako!',
    saveFileError: 'Haikuweza kuhifadhi faili.',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Nyimbo za Dini',
    hymnsBannerTitle: 'Nyimbo za Sifa za Kitheokrasi',
    hymnSearchPlaceholder: 'Tafuta kwa namba au kichwa',
    noHymnsFound: 'Hakuna Nyimbo za Dini au Zaburi zilizopatikana.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Zaburi',

    // Animations Screen
    watchNow: 'Tazama Sasa',
    loadingMoreVideos: 'Inapakia video zaidi...',
    noVideosFound: 'Hakuna video zilizopatikana',
    noAnimationsAvailable: 'Hakuna vikaragosi vinavyopatikana',
    adjustSearchTerms: 'Jaribu kurekebisha maneno yako ya utafutaji',
    checkBackLater: 'Angalia tena baadaye kwa maudhui mapya',
    animationsBannerTitle: 'HADITHI ZA BIBLIA',
    animationsBannerSubtitle:
      'Jifunze neno la Mungu kupitia vielelezo vya picha vinavyoleta hadithi na wahusika hai.',
    searchAnimationsPlaceholder: 'Tafuta vikaragosi...',
    clear: 'Futa',

    // Animation Detail
    linkCopied: 'Kiungo kimekaliwa!',
    shareVideo: 'Shiriki Video',
    errorVideoNotFound: 'Video haijapatikana',

    // Live Stream Screen
    liveStreamLoading: 'Inapakia matangazo...',
    liveStreamError: 'Imeshindwa kupakia matangazo. Tafadhali jaribu tena.',
    refreshFailed: 'Ufreshishaji Umeshindwa',
    refreshFailedMsg: 'Haikuweza kufufua matangazo',
    openLinkError: 'Haikuweza kufungua kiungo',
    loadingStream: 'Inapakia tangazo...',
    streamUnavailable: 'Tangazo halipatikani',
    openInYouTube: 'Fungua katika YouTube',
    loadingHLSStream: 'Inapakia tangazo la HLS...',
    hlsStreamUnavailable: 'Tangazo la HLS halipatikani',
    couldNotLoadStream: 'Haikuweza kupakia tangazo hili',
    external: 'NJE',
    streamLabel: 'Tangazo',
    tapToWatchYouTube: 'Gusa hapa chini kutazama kwenye programu ya YouTube',
    externalStreamExternalOnly: 'Aina hii ya tangazo lazima ifunguliwe nje',
    watchInBrowser: 'Tazama kwenye Kivinjari',
    checkConnectionRetry: 'Tafadhali angalia muunganisho wako na jaribu tena.',
    retry: 'Jaribu tena',
    refreshing: 'Inafufua...',
    refreshStreams: 'Fufua Matangazo',
    liveLabel: 'MUBASHARA',
    offlineLabel: 'NJE YA MTANDAO',
    streamOffline: 'Tangazo Liko Nje ya Mtandao',
    streamNotActive: 'Tangazo hili halitumiki kwa sasa',
    streamTypeLabel: 'Aina: ',
    noActiveStreams: 'Hakuna Matangazo Yanayotumika',
    checkBackLaterLive: 'Angalia tena baadaye kwa matangazo mubashara',
    refresh: 'Fufua',
    unknown: 'Haijulikani',

    // Archive Screen
    archiveBannerTitle: 'KUMBUKUMBU',
    archiveBannerSubtitle:
      'Hapa utapata picha na video za matukio ya zamani ya kanisa, zilizohifadhiwa kwa marejeo na kumbukumbu.',
    pictures: 'Picha',
    videos: 'Video',

    // Archive Videos Screen
    videoArchiveTitle: 'KUMBUKUMBU ZA VIDEO',
    videoArchiveSubtitle:
      'Skrini hii ina video za matukio ya zamani ya kanisa, zilizohifadhiwa kwa marejeo.',
    untitledEvent: 'Tukio Bila Kichwa',
    video: 'Video',
    videos: 'Video',
    noEventsFound: 'Hakuna matukio yaliyopatikana',
    noVideosYet: 'Bado hakuna video',

    // Archive Pictures Screen
    pictureArchiveTitle: 'KUMBUKUMBU ZA PICHA',
    pictureArchiveSubtitle:
      'Kumbukumbu takatifu na matukio ya zamani ya kanisa, zilizohifadhiwa kwa marejeo.',
    untitledEvent: 'Tukio Bila Kichwa',
    photo: 'Picha',
    photos: 'Picha',
    noEventsFound: 'Hakuna matukio yaliyopatikana',
    noPicturesYet: 'Bado hakuna picha',

    // Gallery Screen
    galleryNavTitle: 'Matunzio',
    galleryBannerTitle: 'MATUNZIO',
    galleryBannerSubtitle:
      'Hapa utapata wasifu wa watumishi wa GKS, picha na video za matukio kwenye matawi ya kanisa.',
    ministers: 'Watumishi',

    // Video Gallery Screen
    videoGalleryTitle: 'MATUNZIO YA VIDEO',
    videoGallerySubtitle:
      'Matukio makuu kwenye matawi yetu, yaliyohifadhiwa kwa ajili yako.',
    videoLabel: 'Video',
    videosLabel: 'Video',
    untitledEvent: 'Tukio Bila Kichwa',
    noEventsFound: 'Hakuna matukio yaliyopatikana',
    noVideosYet: 'Bado hakuna video',

    // Picture Gallery Screen
    pictureGalleryTitle: 'MATUNZIO YA PICHA',
    pictureGallerySubtitle:
      'Kumbukumbu za matukio makuu kwenye matawi tofauti.',
    galleryNavTitle: 'Matunzio',
    photo: 'Picha',
    photos: 'Picha',
    untitledEvent: 'Tukio Bila Kichwa',
    noEventsFound: 'Hakuna matukio yaliyopatikana',
    noPicturesYet: 'Bado hakuna picha',

    // Ministers Gallery Screen
    ministersNavTitle: 'Watumishi',
    ministersBannerTitle: 'WASIFU WA WATUMISHI',
    ministersBannerSubtitle:
      'Wasifu rasmi wa utumishi wa GKS. Kuwatambua na kuwaheshimu wanaofanya kazi katika neno.',
    searchByName: 'Tafuta kwa jina...',
    unnamedMinister: 'Mtumishi Asiye na Jina',
    ministerLabel: 'Mtumishi',
    devotedLabel: 'Aliyejitolea',
    contactNotProvided: 'Mawasiliano hayajatolewa',

    // Quiz Resources Screen
    quizNavTitle: 'Rasilimali za Maswali',
    quizSearchPlaceholder: 'Tafuta kwa kichwa, mwaka, au jamii...',
    downloadPdf: 'Pakua PDF',
    details: 'Maelezo',
    noResourcesFound: 'Hakuna rasilimali zilizopatikana.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Maelezo ya Maswali',
    openStudyMaterial: 'Fungua Nyenzo ya Kusomea (PDF)',
    needClarification: 'Unahitaji Ufafanuzi?',
    clarificationDesc:
      'Ikiwa umechanganyikiwa kuhusu swali lolote katika nyenzo hii, waombe wasimamizi wetu msaada.',
    askQuestion: 'Uliza Swali',

    // Quiz Help Screen
    askHelpNavTitle: 'Omba Msaada',
    haveQuestionFromTitle: 'Una swali kutoka "{title}"?',
    provideDetailsHelp:
      'Weka maelezo yako hapa chini nasi tutakusaidia kufafanua utatanishi wowote.',
    yourNameLabel: 'Jina Lako',
    enterFullNamePlaceholder: 'Ingiza jina lako kamili',
    whatsappNumberLabel: 'Namba ya WhatsApp',
    whatsappPlaceholder: 'mfano 08012345678',
    yourQuestionLabel: 'Swali Lako',
    questionPlaceholder: 'Ni sehemu gani ya nyenzo inachanganya?',
    submitQuestion: 'Wasilisha Swali',
    sending: 'Inatuma...',
    fillAllFields: 'Tafadhali jaza sehemu zote',
    questionSentSuccess:
      'Swali lako limetumwa. Wasimamizi wetu watawasiliana nawe hivi karibuni.',
    questionSendError: 'Imeshindwa kutuma swali lako. Tafadhali jaribu tena.',
    ok: 'SAWA',
    success: 'Mafanikio',
    error: 'Hitilafu',

    // Notices Screen
    noticesNavTitle: 'Matangazo',
    noTitle: 'Bila Kichwa',
    noMessage: 'Hakuna maudhui ya ujumbe.',
    viewAttachedDoc: 'Angalia Hati Iliyoambatishwa',
    pdfFile: 'Faili la PDF',
    noNoticesYet: 'Bado Hakuna Matangazo',

    // Contact Screen
    contactTitle: 'Wasiliana Nasi',
    getInTouch: 'Wasiliana',
    contactDesc:
      'Tungependa kusikia kutoka kwako. Maoni yako yanatusaidia kukuhudumia vyema.',
    namePlaceholder: 'Ingiza jina lako',
    emailPlaceholder: 'Ingiza barua pepe yako',
    selectCategory: 'Hii inahusu nini?',
    complaint: 'Malalamiko',
    suggestion: 'Pendekezo',
    request: 'Ombi',
    appreciation: 'Shukrani',
    messagePlaceholder: 'Andika ujumbe wako hapa...',
    sendMessage: 'Tuma Ujumbe',
    sendingMessage: 'Inatuma Ujumbe...',
    thankYou: 'Asante!',
    contactSuccessMsg:
      'Ujumbe wako umetumwa kwa mafanikio. Tunashukuru kwa maoni yako.',
    returnToApp: 'Rudi kwenye Programu',
    submitError: 'Imeshindwa kuwasilisha ujumbe. Tafadhali jaribu tena.',

    // About Screen
    aboutUsNav: 'Kuhusu Sisi',
    churchName: "God's Kingdom Society",
    churchSlogan: '(Kanisa la Mungu Aliye Hai)',
    ourMission: 'Utume Wetu',
    historyVision: 'Historia na Maono',
    coreBeliefs: 'Imani za Msingi',
    connectWithUs: 'Ungana Nasi',
    developedBy: 'Imeundwa na HIGH-ER ENTERPRISES',
    allRightsReserved: 'Haki zote zimehifadhiwa.',
    churchMotto: 'Kuelekea serikali kamilifu ya Mungu',

    // Not Found Screen
    notFoundTitle: 'Ohoo!',
    screenNotExist: 'Skrini hii haipo.',
    goHome: 'Nenda kwenye skrini ya nyumbani!',

    // Navigation / Global Menu
    options: 'Chaguzi',
    about: 'Kuhusu',
    contact: 'Wasiliana',
    adminPanel: 'Jopo la Utawala',
  },

  //HAUSA TRANSLATIONS
  ha: {
    // Navigation
    home: 'Gida',
    hymns: 'Wakokin Yabo',
    sermons: 'Wa’azi',
    songs: 'Wakoki',
    animations: 'Bidiyon Kwaikwayo',
    profile: 'Bayanan Kai',
    music: 'Waka',
    contact: 'Tuntuba',
    about: 'Game da Mu',
    admin: 'Shugabanci',
    notices: 'Sanarwa',
    quizresources: 'Abubuwan Tambayoyi',
    live: 'Kai Tsaye',
    archive: 'Taska',

    // Common
    search: 'Nema',
    play: 'Kunna',
    pause: 'Dakatar',
    loading: 'Yana budewa...',
    error: 'Kuskure',
    save: 'Ajiye',
    cancel: 'Soke',
    submit: 'Aika',
    login: 'Shiga',
    signup: 'Yi Rajista',
    logout: 'Fita',
    email: 'Imel',
    password: 'Kalmar Sirri',
    name: 'Suna',
    message: 'Sako',
    noSermons: 'Babu wa’azi a halin yanzu',
    noSongs: 'Babu wakoki a halin yanzu',
    noVideos: 'Babu bidiyo a halin yanzu',
    noContent: 'Babu komai a ciki',
    unknownDuration: 'Ba a san tsawon lokaci ba',
    unknownStyle: 'Ba a san nau’i ba',

    // Content
    duration: 'Tsawon Lokaci',
    category: 'Rukuni',
    style: 'Nau’i',

    // Contact
    contactUs: 'Tuntube Mu',
    contactDesc:
      'Muna son jin ra’ayinku. Ku aiko mana da sako, za mu ba ku amsa da wuri.',
    complaint: 'Korafe-korafe',
    suggestion: 'Shawarwari',
    request: 'Buqata',
    selectCategory: 'Zabi Rukuni',

    // About
    aboutUs: 'Game da Mu',
    version: 'Sigari',
    mission: 'Manufarmu',

    // Admin
    adminDashboard: 'Shafin Gudanarwa',
    uploadContent: 'Dora Sako',
    manageContent: 'Gyara Sakonni',
    viewMessages: 'Duba Sakonni',
    addHymn: 'Kara Wakokin Yabo',
    addSermon: 'Kara Wa’azi',
    uploadSong: 'Dora Waka',
    uploadVideo: 'Dora Bidiyo',

    //onboarding
    skip: 'Tsallake',
    startBtn: 'FARA',
    onboardingSubtitle1: 'Barka da zuwa',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Kungiyar Kiristoci inda ake koyarwa da aikata gaskiyar maganar Allah don samun ceton Allah.',
    onboardingSubtitle2: 'Kara sani a maganar Allah da',
    onboardingTitle2: 'Wa’azi Masu Kyautatawa',
    onboardingDesc2:
      'Samun wa’azin GKS cikin sauki ta rubutu, murya, da bidiyo don koyon maganar Allah yadda take a cikin Littafi Mai Tsarki.',
    onboardingSubtitle3: 'Bautawa Allah da',
    onboardingTitle3: 'Wakoki Masu Ratsa Zuciya',
    onboardingDesc3:
      'Kasance tare da masu imani a fadin duniya don girmama Allah da Almasihu ta wakokin yabo masu dadi.',
    onboardingSubtitle4: 'KARA BINCIKE',
    onboardingTitle4: 'WASU SAURAN ABUBUWA',
    onboardingDesc4:
      'Koyi maganar Allah ta hanyar bidiyon kwaikwayo, sannan ka duba hotuna da bidiyo a cikin taskar cocin.',

    // Home Screen
    homeNavTitle: 'Alheri',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Zuwa Ga Cikakkiyar Gwamnatin Allah',
    heroDesc:
      'Karanta, saurara, kuma ka kara girma a cikin imani tare da Cocin Allah Mai Rai.',
    exploreResources: 'Bincika Abubuwa',
    homeCardTitleSongs: 'Wakokin Yabo',
    homeCardSubtitleSongs: 'Wakoki masu tsarki don bauta da tunani.',
    homeCardTitleSermons: 'Wa’azi Masu Kyautatawa',
    homeCardSubtitleSermons:
      'Zurfafa fahimta tare da ingantaccen koyarwar Littafi Mai Tsarki.',
    homeCardTitleStories: 'Labaran Littafi Mai Tsarki',
    homeCardSubtitleStories: 'Darussan rayuwa ta hanyar labarai masu ma’ana.',
    homeCardTitleArchive: 'Taska',
    homeCardSubtitleArchive:
      'Bincika tarihin kungiyar da abubuwan da suka faru a baya.',
    homeCardTitleGallery: 'Hotuna',
    homeCardSubtitleGallery: 'Hotunan rayuwar al’ummarmu da jagororinmu.',
    homeCardTitleQuiz: 'Abubuwan Tambayoyi',
    homeCardSubtitleQuiz: 'Littattafan karatu da abubuwan karawa juna sani.',
    homeCardTitleGiving: 'Zakku da Sadaka',
    homeCardSubtitleGiving: 'Taimakawa aikin GKS a fadin duniya.',
    homeCardTitleLive: 'Shirye-shiryen Kai Tsaye',
    homeCardSubtitleLive:
      'Kalli ibada da sauran abubuwa a daidai lokacin da suke faruwa.',

    // Sermons Main Screen
    sermonsBannerTitle: 'WA’AZI MASU KYAUTATAWA',
    sermonsBannerSubtitle:
      'Samun wa’azi masu ratsa jiki a harsuna daban-daban don yada maganar Allah.',
    searchSermons: 'Nemi wa’azi, batutuwa, ko rukuni...',
    textSermons: 'Rubutaccen Wa’azi',
    readSermons: 'An tsara su ta juzu’i da batutuwa',
    audioClips: 'Muryoyin Wa’azi',
    listenSermons: 'Saurari muryoyin wa’azi masu kyautatawa',
    videoSermons: 'Bidiyon Wa’azi',
    watchSermons: 'Kalli shirye-shiryen kai tsaye da wadanda aka nada',
    dailyGuide: 'Jagorar Kullum',
    dailyGuideSubtitle: 'Yi nazarin maganar Allah kowace rana',

    // Text Sermons Screen
    textSermonsBannerTitle: 'RUBUTACCEN WA’AZI',
    textSermonsBannerSubtitle:
      'Karanta kuma yi nazarin maganar Allah tare da cikakkun rubutattun wa’azi.',
    searchPlaceholder: 'Nemi wa’azi...',
    subjectsCountLabel: 'batutuwa',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Wa’azin Mako Juzu’i na 1',
    'Weekly Sermon Volume 2': 'Wa’azin Mako Juzu’i na 2',
    "God's Kingdom Advocate Volume 1": "God's Kingdom Advocate Juzu’i na 1",
    "God's Kingdom Advocate Volume 2": "God's Kingdom Advocate Juzu’i na 2",
    "God's Kingdom Advocate Volume 3": "God's Kingdom Advocate Juzu’i na 3",
    'Abridged Bible Subjects': 'Takaitattun Batutuwan Littafi Mai Tsarki',
    'The Ten Fundamental Truths': 'Muhimman Gaskiya Guda Goma',
    "GKS President's Feast Message": 'Sakon Shugaban GKS na Biki',
    "GKS President's Freedom Day Message": 'Sakon Shugaban GKS na Ranar ‘Yanci',
    "GKS President's Youth Assembly Message":
      'Sakon Shugaban GKS ga Taron Matasa',
    'Sermon Summaries': 'Takaitaccen Bayanin Wa’azi',
    'Questions and Answers': 'Tambayoyi da Amsoshi',

    // Sermon Detail Screen
    sermonDetail: 'Bayanin Wa’azi',
    sermonNotFound: 'Ba a sami wa’azin ba',
    untitled: 'Babu Suna',
    gksSermon: 'Wa’azin GKS',
    audioAssistant: 'Mataimakin Murya',
    success: 'An yi nasara',
    copiedToClipboard: 'An kwafe sako',
    audioError: 'Kuskuren Murya',
    audioPlayError: 'Ba za a iya kunna murya ba. Sake gwadawa.',
    playbackControlError: 'An kasa sarrafa muryar',
    part: 'Kashi na',
    of: 'na',

    // Audio Sermons Screen
    audioSermonsTitle: 'Muryoyin Wa’azi',
    audioSermonsBannerTitle: 'MURYOYIN WA’AZI',
    audioSermonsBannerSubtitle:
      'Koyi maganar Allah ta muryoyin wa’azi, an tsara su ta shekaru.',
    noAudioSermons: 'Babu muryoyin wa’azi a halin yanzu',
    unknownYear: 'Ba a sani ba',
    sermonsCountPlural: 'wa’azi',
    sermonCountSingular: 'wa’azi',
    sermonsLabel: 'Wa’azi',
    untitledSermon: 'Wa’azi mara suna',
    noDate: 'Babu rana',

    // Audio Player/Details Screen
    audioPlayer: 'Inda ake Kunna Murya',
    audioLoadError: 'An kasa loda muryar.',
    errorSermonNotFound: 'Ba a sami wa’azi ko muryar ba.',
    permissionRequired: 'Ana bukatar izini',
    saveSermonPermission: 'Don Allah ba da izini don ajiye wa’azi a wayarka.',
    sermonSaved: 'An ajiye wa’azi a wayarka!',
    fileSaveError: 'Ba za a iya ajiye fayil din ba.',
    noTitle: 'Babu Suna',
    unknownDate: 'Ba a san rana ba',

    // Sermon Videos Screen
    videoSermonsTitle: 'Bidiyon Wa’azi',
    videoPlural: 'bidiyo',
    videoSingular: 'bidiyo',
    loadingVideos: 'Ana loda bidiyo...',
    noVideosInCategory: 'Babu bidiyo a wannan rukunin',
    sermonVideosBannerTitle: 'BIDIYON WA’AZI',
    sermonVideosBannerSubtitle: 'Kalli bidiyon wa’azi da aka tsara ta rukuni.',
    searchSermonVideosPlaceholder: 'Nemi bidiyon wa’azi...',
    clearSearch: 'Goge',
    sermonVideoCategoriesTitle: 'Rukunin Bidiyon Wa’azi',
    browseSermonsByCategory: 'Duba wa’azi ta rukuni',
    searchResults: 'Sakamakon Nema',
    noSermonVideosFound: 'Ba a sami bidiyon wa’azi ba',
    noSermonVideosAvailable: 'Babu bidiyon wa’azi a halin yanzu',
    adjustSearchTerms: 'Gwada sake rubuta kalmomin neman',
    checkBackLaterSermons: 'Ziyarce mu nan gaba don sababbin bidiyo',
    loadingMoreVideos: 'Ana loda wasu bidiyoyin...',
    watchNow: 'Kalla Yanzu',
    watch: 'Kalla',

    // Video/Animation Detail
    linkCopied: 'An kwafe mahadin!',
    shareSermonVideoLabel: 'Bidiyon Wa’azi',
    noCategory: 'Babu rukuni',
    shareSermonVideoTitle: 'Raba Bidiyon Wa’azi',
    shareVideoTitle: 'Raba Bidiyo',
    noTitle: 'Babu Suna',
    unknownDate: 'Ba a san rana ba',
    errorVideoNotFound: 'Ba a sami bidiyon ba',
    languageLabel: 'Harshe',
    share: 'Raba',

    // Daily Guide Screen
    dailyGuideTitle: 'Jagorar Kullum',
    dailyDevotionalBanner: 'Ibada ta Kullum',
    dailyDevotionalBannerSubtitle: 'Gina ruhinka da jagorar kullum.',
    today: 'Yau',
    yesterday: 'Jiya',
    tomorrow: 'Gobe',
    loadingDevotional: 'Ana loda ibada...',
    noDevotionalAvailable: 'Babu Ibada a Halin Yanzu',
    checkBackFuture: 'Ziyarce mu a wannan ranar don sabuwar ibada',
    noDevotionalPast: 'Babu ibadar da aka wallafa a wannan ranar',
    recentDevotionals: 'Ibada na kwanan nan',
    dailyDevotionalFallback: 'Ibada ta Kullum',

    // Songs Screen
    songsNavTitle: 'Wakoki',
    songsBannerTitle: 'WAKOKIN YABO',
    songsBannerSubtitle:
      'Bauta ta hanyar wakokin ruhaniya masu dadi da suke karfafa imani.',
    featuredSongsTitle: 'Wakokin Yabo na Allah',
    featuredSongsSubtitle: '(Zabura da Wakokin Yabo)',
    songsCountLabel: 'wakoki',
    seePlaylist: 'Duba Jerin Wakoki',

    // Music Screen
    searchSongsPlaceholder: 'Nemi wakoki...',
    categoryLabel: 'Rukuni',
    songLoadError: 'An kasa loda wakoki.',

    // Music Player Screen
    musicPlayerTitle: 'Inda ake Kunna Waka',
    unknownCategory: 'Ba a san rukuni ba',
    permissionRequired: 'Ana bukatar izini',
    saveSongsPermission: 'Don Allah ba da izini don ajiye wakoki a wayarka.',
    songSavedSuccess: 'An ajiye waka a wayarka!',
    saveFileError: 'Ba za a iya ajiye fayil din ba.',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Wakokin Yabo',
    hymnsBannerTitle: 'Wakokin Yabo na Allah',
    hymnSearchPlaceholder: 'Nemi ta lamba ko suna',
    noHymnsFound: 'Ba a sami Wakokin Yabo ko Zabura ba.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Zabura',

    // Animations Screen
    watchNow: 'Kalla Yanzu',
    loadingMoreVideos: 'Ana loda wasu bidiyoyin...',
    noVideosFound: 'Ba a sami bidiyo ba',
    noAnimationsAvailable: 'Babu bidiyon kwaikwayo a halin yanzu',
    adjustSearchTerms: 'Gwada sake rubuta kalmomin neman',
    checkBackLater: 'Ziyarce mu nan gaba don sababbin sakonni',
    animationsBannerTitle: 'LABARAN LITTAFI MAI TSARKI',
    animationsBannerSubtitle:
      'Koyi maganar Allah ta hanyar bidiyo masu nuna labarai da mutanen Littafi Mai Tsarki.',
    searchAnimationsPlaceholder: 'Nemi bidiyon kwaikwayo...',
    clear: 'Goge',

    // Animation Detail
    linkCopied: 'An kwafe mahadin!',
    shareVideo: 'Raba Bidiyo',
    errorVideoNotFound: 'Ba a sami bidiyon ba',

    // Live Stream Screen
    liveStreamLoading: 'Ana loda bidiyon kai tsaye...',
    liveStreamError: 'An kasa loda shirye-shirye. Sake gwadawa.',
    refreshFailed: 'Wurga Sabo ya gaza',
    refreshFailedMsg: 'Ba a iya sabunta shirye-shiryen ba',
    openLinkError: 'Ba za a iya bude mahadin ba',
    loadingStream: 'Ana loda shirin...',
    streamUnavailable: 'Babu shiri a halin yanzu',
    openInYouTube: 'Bude a YouTube',
    loadingHLSStream: 'Ana loda shirin HLS...',
    hlsStreamUnavailable: 'Shirin HLS babu shi',
    couldNotLoadStream: 'Ba za a iya loda wannan shirin ba',
    external: 'NA WAJE',
    streamLabel: 'Shirin Kai Tsaye',
    tapToWatchYouTube: 'Taba kasa don kallo a YouTube',
    externalStreamExternalOnly: 'Dole ne a bude wannan shirin ta waje',
    watchInBrowser: 'Kalla a Browser',
    checkConnectionRetry: 'Don Allah duba yanar garkuwarka ka sake gwadawa.',
    retry: 'Sake Gwadawa',
    refreshing: 'Ana sabuntawa...',
    refreshStreams: 'Sabunta Shirye-shirye',
    liveLabel: 'KAI TSAYE',
    offlineLabel: 'A KASHE',
    streamOffline: 'Babu Shirin Kai Tsaye',
    streamNotActive: 'Wannan shirin ba ya aiki a halin yanzu',
    streamTypeLabel: 'Nau’i: ',
    noActiveStreams: 'Babu Shirye-shirye Kai Tsaye',
    checkBackLaterLive: 'Ziyarce mu nan gaba don shirye-shiryen kai tsaye',
    refresh: 'Sabunta',
    unknown: 'Ba a sani ba',

    // Archive Screen
    archiveBannerTitle: 'TASKA',
    archiveBannerSubtitle:
      'Anan za ka sami hotuna da bidiyo na tsofaffin abubuwan da suka faru a coci don tunawa.',
    pictures: 'Hotuna',
    videos: 'Bidiyoyi',

    // Archive Videos Screen
    videoArchiveTitle: 'TASKAR BIDIYO',
    videoArchiveSubtitle:
      'Wannan shafin yana dauke da bidiyoyin tsofaffin ayyukan coci.',
    untitledEvent: 'Taro mara suna',
    video: 'Bidiyo',
    videos: 'Bidiyoyi',
    noEventsFound: 'Ba a sami taron da kake nema ba',
    noVideosYet: 'Babu bidiyo tukunna',

    // Archive Pictures Screen
    pictureArchiveTitle: 'TASKAR HOTUNA',
    pictureArchiveSubtitle:
      'Hotunan tsofaffin abubuwan da suka faru a coci don tunawa.',
    untitledEvent: 'Taro mara suna',
    photo: 'Hoto',
    photos: 'Hotuna',
    noEventsFound: 'Ba a sami taro ba',
    noPicturesYet: 'Babu hotuna tukunna',

    // Gallery Screen
    galleryNavTitle: 'Hotuna',
    galleryBannerTitle: 'HOTUNA DA BIDIYOYI',
    galleryBannerSubtitle:
      'Anan za ka sami bayanan jagororin GKS, hotuna da bidiyo na rassan coci daban-daban.',
    ministers: 'Jagorori',

    // Video Gallery Screen
    videoGalleryTitle: 'BIDIYOYIN TARIHI',
    videoGallerySubtitle:
      'Manyan abubuwan da suka faru a rassanmu daban-daban.',
    videoLabel: 'Bidiyo',
    videosLabel: 'Bidiyoyi',
    untitledEvent: 'Taro mara suna',
    noEventsFound: 'Ba a sami taron da kake nema ba',
    noVideosYet: 'Babu bidiyo tukunna',

    // Picture Gallery Screen
    pictureGalleryTitle: 'HOTUNAN TARIHI',
    pictureGallerySubtitle: 'Hotunan manyan ayyuka a rassan coci daban-daban.',
    galleryNavTitle: 'Hotuna',
    photo: 'Hoto',
    photos: 'Hotuna',
    untitledEvent: 'Taro mara suna',
    noEventsFound: 'Ba a sami taro ba',
    noPicturesYet: 'Babu hotuna tukunna',

    // Ministers Gallery Screen
    ministersNavTitle: 'Jagorori',
    ministersBannerTitle: 'BAYANAN JAGORORI',
    ministersBannerSubtitle:
      'Bayanan jagororin GKS. Karrama masu aiki a maganar Allah.',
    searchByName: 'Nemi da suna...',
    unnamedMinister: 'Jagora mara suna',
    ministerLabel: 'Jagora',
    devotedLabel: 'Mai sadaukarwa',
    contactNotProvided: 'Ba a bayar da lambar tuntuba ba',

    // Quiz Resources Screen
    quizNavTitle: 'Abubuwan Tambayoyi',
    quizSearchPlaceholder: 'Nemi da suna, shekara, ko rukuni...',
    downloadPdf: 'Dauko PDF',
    details: 'Bayanai',
    noResourcesFound: 'Ba a sami komai ba.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Bayanin Tambayoyi',
    openStudyMaterial: 'Bude Littafin Karatu (PDF)',
    needClarification: 'Kuna Bukatar Karin Bayani?',
    clarificationDesc:
      'Idan akwai abin da ya dame ka a tambayoyin, tuntubi shugabanninmu don taimako.',
    askQuestion: 'Yi Tambaya',

    // Quiz Help Screen
    askHelpNavTitle: 'Nemi Taimako',
    haveQuestionFromTitle: 'Kuna da tambaya akan "{title}"?',
    provideDetailsHelp:
      'Cika bayananka a kasa za mu taimaka maka wajen bayyana abin da ya shige maka duhu.',
    yourNameLabel: 'Sunanka',
    enterFullNamePlaceholder: 'Rubuta cikakken sunanka',
    whatsappNumberLabel: 'Lambar WhatsApp',
    whatsappPlaceholder: 'misali 08012345678',
    yourQuestionLabel: 'Tambayarka',
    questionPlaceholder: 'Wani bangare ne ba ka gane ba?',
    submitQuestion: 'Aika Tambaya',
    sending: 'Ana aikawa...',
    fillAllFields: 'Don Allah cika dukkan gurbi',
    questionSentSuccess:
      'An aika tambayarka. Shugabanninmu za su tuntube ka nan ba da dadewa ba.',
    questionSendError: 'An kasa aika tambayarka. Sake gwadawa.',
    ok: 'TO',
    success: 'An yi nasara',
    error: 'Kuskure',

    // Notices Screen
    noticesNavTitle: 'Sanarwa',
    noTitle: 'Babu Suna',
    noMessage: 'Babu sakon da aka rubuta.',
    viewAttachedDoc: 'Duba Takardar da Aka Dora',
    pdfFile: 'Fayil din PDF',
    noNoticesYet: 'Babu Sanarwa tukunna',

    // Contact Screen
    contactTitle: 'Tuntube Mu',
    getInTouch: 'Yi Magana da Mu',
    contactDesc:
      'Muna son jin ra’ayinku. Shawararku za ta taimaka mana wajen kyautata ayyukanmu.',
    namePlaceholder: 'Rubuta sunanka',
    emailPlaceholder: 'Rubuta imel dinka',
    selectCategory: 'Game da me wannan sakon yake?',
    complaint: 'Korafe-korafe',
    suggestion: 'Shawarwari',
    request: 'Buqata',
    appreciation: 'Godiya',
    messagePlaceholder: 'Rubuta sakonka anan...',
    sendMessage: 'Aika Sako',
    sendingMessage: 'Ana aikan sako...',
    thankYou: 'Na gode!',
    contactSuccessMsg:
      'An aika sakonka cikin nasara. Muna godiya da ra’ayinka.',
    returnToApp: 'Koma kan App din',
    submitError: 'An kasa aika sako. Sake gwadawa.',

    // About Screen
    aboutUsNav: 'Game da Mu',
    churchName: "God's Kingdom Society",
    churchSlogan: '(Cocin Allah Mai Rai)',
    ourMission: 'Manufarmu',
    historyVision: 'Tarihi da Burinmu',
    coreBeliefs: 'Abubuwan da Muka Yi Imani Da Su',
    connectWithUs: 'Tuntube Mu',
    developedBy: 'HIGH-ER ENTERPRISES ne suka samar da shi',
    allRightsReserved: 'Dukkan hakki na mallaka ne.',
    churchMotto: 'Zuwa ga cikakkiyar gwamnatin Allah',

    // Not Found Screen
    notFoundTitle: 'Kash!',
    screenNotExist: 'Wannan shafin babu shi.',
    goHome: 'Koma shafin gida!',

    // Navigation / Global Menu
    options: 'Wasu Zabuka',
    about: 'Game da Mu',
    contact: 'Tuntuba',
    adminPanel: 'Shafin Gudanarwa',
  },

  //IGBO TRANSLATIONS
  ig: {
    // Navigation
    home: 'Mbido',
    hymns: 'Abụ 禮',
    sermons: 'Ozizi',
    songs: 'Egwu',
    animations: 'Ihe nkiri Atụmatụ',
    profile: 'Nkọwa onye',
    music: 'Egwu',
    contact: 'Kpọtụrụ anyị',
    about: 'Maka anyị',
    admin: 'Onye nchịkwa',
    notices: 'Ọkwa',
    quizresources: 'Ihe Omume Ajụjụ',
    live: 'Nọ n’ikuku',
    archive: 'Ebe nchekwa',

    // Common
    search: 'Chọọ',
    play: 'Kpọọ',
    pause: 'Kwụsịtụ',
    loading: 'Ọ na-ebuba...',
    error: 'Mmejọ',
    save: 'Chekwaa',
    cancel: 'Kagbuo',
    submit: 'Nyefee',
    login: 'Banye',
    signup: 'Debanye aha',
    logout: 'Pụọ',
    email: 'Ozi-e',
    password: 'Okwu nzuzo',
    name: 'Aha',
    message: 'Ozi',
    noSermons: 'Ọ nweghị ozizi dị',
    noSongs: 'Ọ nweghị egwu dị',
    noVideos: 'Ọ nweghị vidiyo dị',
    noContent: 'Ọ nweghị ihe dị n’ime',
    unknownDuration: 'Amaghị ogologo oge',
    unknownStyle: 'Amaghị ụdị ya',

    // Content
    duration: 'Ogologo oge',
    category: 'Ụdị',
    style: 'Ụdị ya',

    // Contact
    contactUs: 'Kpọtụrụ Anyị',
    contactDesc:
      'Ọ ga-atọ anyị ụtọ ịnụ n’ọnụ gị. Zitere anyị ozi, anyị ga-aza gị ozugbo enwere ike.',
    complaint: 'Mkpesa',
    suggestion: 'Atụmatụ',
    request: 'Arịrịọ',
    selectCategory: 'Họrọ Ụdị',

    // About
    aboutUs: 'Maka Anyị',
    version: 'Ụdị',
    mission: 'Ebumnuche anyị',

    // Admin
    adminDashboard: 'Dashboard Nchịkwa',
    uploadContent: 'Bulite Ihe',
    manageContent: 'Nwee Ihe Ndị Dị n’Ime',
    viewMessages: 'Lee Ozi',
    addHymn: 'Tinye Abụ',
    addSermon: 'Tinye Ozizi',
    uploadSong: 'Bulite Egwu',
    uploadVideo: 'Bulite Vidiyo',

    //onboarding
    skip: 'Mafere',
    startBtn: 'BIDO',
    onboardingSubtitle1: 'Nnọọ na',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Nzukọ Ndị Kraịst ebe a na-ekwusa ma na-eme eziokwu nke okwu Chineke maka nzọpụta nke Chineke.',
    onboardingSubtitle2: 'Toonụ n’okwu Chineke site na',
    onboardingTitle2: 'Ozizi Na-ewuli Elu',
    onboardingDesc2:
      'Nweta ozizi GKS n’ụzọ dị mfe site n’ederede, ụda olu na vidiyo ma mụta okwu Chineke otú ọ dị n’ime Bible.',
    onboardingSubtitle3: 'Feenụ Chineke site na',
    onboardingTitle3: 'Egwu Amara',
    onboardingDesc3:
      'Soro ndị kwere ekwe n’ụwa niile na-asọpụrụ Chineke na Kraịst site n’abụ otuto na-atọ ụtọ.',
    onboardingSubtitle4: 'CHỌPỤTA IHE NDỊ ỌZỌ',
    onboardingTitle4: 'IHE NDỊ ỌZỌ DỊ N’IME',
    onboardingDesc4:
      'Mụta okwu Chineke site n’ihe nkiri atụmatụ, ma nweta foto na vidiyo dị n’ebe nchekwa ụka.',

    // Home Screen
    homeNavTitle: 'Amara',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Gaa n’Ọchịchị Chineke Zuru Okè',
    heroDesc: 'Gụọ, gee ntị, ma too n’okwukwe na Ụka Chineke dị ndụ.',
    exploreResources: 'Chọpụta Ihe Ndị Dị n’Ime',
    homeCardTitleSongs: 'Abụ Otuto',
    homeCardSubtitleSongs: 'Egwu dị nsọ maka ofufe na ntụgharị uche.',
    homeCardTitleSermons: 'Ozizi Na-ewuli Elu',
    homeCardSubtitleSermons: 'Mụta ihe nke ọma site n’ezi nkuzi Bible.',
    homeCardTitleStories: 'Akụkọ Bible',
    homeCardSubtitleStories: 'Ụkpụrụ ime mmụọ site n’akụkọ na-atọ ụtọ.',
    homeCardTitleArchive: 'Ebe Nchekwa',
    homeCardSubtitleArchive: 'Chọpụta ihe ndekọ akụkọ ihe mere eme nke otu a.',
    homeCardTitleGallery: 'Foto Ndị Dị n’Ime',
    homeCardSubtitleGallery: 'Njem vidiyo site n’obodo anyị na ndị ozi anyị.',
    homeCardTitleQuiz: 'Ihe Omume Ajụjụ',
    homeCardSubtitleQuiz: 'Ihe ọmụmụ iji mee ka ihe ọmụma gị dị nkọ.',
    homeCardTitleGiving: 'Ụratụ na Onyinye',
    homeCardSubtitleGiving: 'Tụnye ụtụ maka ọrụ GKS n’ụwa niile.',
    homeCardTitleLive: 'Ihe Omume Nọ n’Ikuku',
    homeCardSubtitleLive: 'Soro na ofufe na ihe omume pụrụ iche n’oge ahụ.',

    // Sermons Main Screen
    sermonsBannerTitle: 'OZIZI NA-EWULI ELU',
    sermonsBannerSubtitle:
      'Nweta ozizi na-akpali akpali n’asụsụ dị iche iche, na-ekerịta okwu Chineke n’asụsụ niile.',
    searchSermons: 'Chọọ ozizi, isiokwu, ma ọ bụ ụdị...',
    textSermons: 'Ozizi Ederede',
    readSermons: 'Ahaziri site na mpịakọta na isiokwu',
    audioClips: 'Ụda Olu',
    listenSermons: 'Gee ntị n’ozizi na-ewuli elu n’ụda olu',
    videoSermons: 'Ozizi Vidiyo',
    watchSermons: 'Lere ihe omume nọ n’ikuku na ndị e dekọrọ ede',
    dailyGuide: 'Nduzi kwa Ụbọchị',
    dailyGuideSubtitle: 'Na-amụ okwu Chineke kwa ụbọchị',

    // Text Sermons Screen
    textSermonsBannerTitle: 'OZIZI EDEREDE',
    textSermonsBannerSubtitle: 'Gụọ ma mụọ okwu Chineke site n’ozizi zuru ezu.',
    searchPlaceholder: 'Chọọ ozizi...',
    subjectsCountLabel: 'Isiokwu',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Ozizi kwa Izu Mpịakọta 1',
    'Weekly Sermon Volume 2': 'Ozizi kwa Izu Mpịakọta 2',
    "God's Kingdom Advocate Volume 1": "God's Kingdom Advocate Mpịakọta 1",
    "God's Kingdom Advocate Volume 2": "God's Kingdom Advocate Mpịakọta 2",
    "God's Kingdom Advocate Volume 3": "God's Kingdom Advocate Mpịakọta 3",
    'Abridged Bible Subjects': 'Isiokwu Bible Ndị A chịkọtara',
    'The Ten Fundamental Truths': 'Eziokwu Iri Ndị bụ Isi',
    "GKS President's Feast Message": 'Ozi Ememme Onye Isi GKS',
    "GKS President's Freedom Day Message":
      'Ozi Ụbọchị Nnwere Onwe Onye Isi GKS',
    "GKS President's Youth Assembly Message":
      'Ozi Nzukọ Ndị Na-eto Eto nke Onye Isi GKS',
    'Sermon Summaries': 'Nchịkọta Ozizi',
    'Questions and Answers': 'Ajụjụ na Azịza',

    // Sermon Detail Screen
    sermonDetail: 'Ozizi',
    sermonNotFound: 'Ahụghị ozizi',
    untitled: 'Enweghị aha',
    gksSermon: 'Ozizi GKS',
    audioAssistant: 'Onye Inyeaka Ụda',
    success: 'Ihe Agaala nke Ọma',
    copiedToClipboard: 'E depụtaghachiri ya',
    audioError: 'Mmejọ Ụda',
    audioPlayError: 'Enweghị ike ịkpọ ụda. Biko nwaa ọzọ.',
    playbackControlError: 'Enweghị ike ịchịkwa ọkpụkpọ ụda',
    part: 'Nkeji',
    of: 'nke',

    // Audio Sermons Screen
    audioSermonsTitle: 'Ozizi Ụda Olu',
    audioSermonsBannerTitle: 'OZIZI ỤDA OLU',
    audioSermonsBannerSubtitle:
      'Mụta okwu Chineke site n’ozizi ụda olu, nke ahaziri site n’afọ.',
    noAudioSermons: 'Ọ nweghị ozizi ụda olu dị',
    unknownYear: 'Amaghị ya',
    sermonsCountPlural: 'ozizi',
    sermonCountSingular: 'ozizi',
    sermonsLabel: 'Ozizi',
    untitledSermon: 'Ozizi Enweghị Aha',
    noDate: 'Enweghị ụbọchị',

    // Audio Player/Details Screen
    audioPlayer: 'Ihe Na-akpọ Ụda',
    audioLoadError: 'Enweghị ike ibubata ụda.',
    errorSermonNotFound: 'Ahụghị ozizi ma ọ bụ ụda.',
    permissionRequired: 'Achọrọ ikike',
    saveSermonPermission: 'Biko kwe ka anyị chekwaa ozizi na ekwentị gị.',
    sermonSaved: 'Echekwara ozizi n’ekwentị gị!',
    fileSaveError: 'Enweghị ike ichekwa faịlụ ahụ.',
    noTitle: 'Enweghị Aha',
    unknownDate: 'Amaghị Ụbọchị',

    // Sermon Videos Screen
    videoSermonsTitle: 'Ozizi Vidiyo',
    videoPlural: 'vidiyo',
    videoSingular: 'vidiyo',
    loadingVideos: 'Ọ na-ebuba vidiyo...',
    noVideosInCategory: 'Ahụghị vidiyo n’ụdị a',
    sermonVideosBannerTitle: 'VIDIYO OZIZI',
    sermonVideosBannerSubtitle:
      'Lere ụdị vidiyo nke ozizi ndị ahaziri n’ụdị dị iche iche.',
    searchSermonVideosPlaceholder: 'Chọọ vidiyo ozizi...',
    clearSearch: 'Hichapụ',
    sermonVideoCategoriesTitle: 'Ụdị Vidiyo Ozizi',
    browseSermonsByCategory: 'Chọọ ozizi site n’ụdị ya',
    searchResults: 'Ihe Ndị Achọtara',
    noSermonVideosFound: 'Ahụghị vidiyo ozizi',
    noSermonVideosAvailable: 'Ọ nweghị vidiyo ozizi dị',
    adjustSearchTerms: 'Nwaa ịgbanwe okwu ị na-achọ',
    checkBackLaterSermons: 'Lọghachi azụ ma emechaa maka vidiyo ọhụrụ',
    loadingMoreVideos: 'Ọ na-ebubata vidiyo ndị ọzọ...',
    watchNow: 'Lere Ugbu a',
    watch: 'Lere',

    // Video/Animation Detail
    linkCopied: 'E depụtaghachiri link ahụ!',
    shareSermonVideoLabel: 'Vidiyo Ozizi',
    noCategory: 'Enweghị ụdị',
    shareSermonVideoTitle: 'Kesaa Vidiyo Ozizi',
    shareVideoTitle: 'Kesaa Vidiyo',
    noTitle: 'Enweghị Aha',
    unknownDate: 'Amaghị ụbọchị',
    errorVideoNotFound: 'Ahụghị vidiyo',
    languageLabel: 'Asụsụ',
    share: 'Kesaa',

    // Daily Guide Screen
    dailyGuideTitle: 'Nduzi kwa Ụbọchị',
    dailyDevotionalBanner: 'Ekpere kwa Ụbọchị',
    dailyDevotionalBannerSubtitle:
      'Zụọ mkpụrụ obi gị site na nduzi kwa ụbọchị.',
    today: 'Taa',
    yesterday: 'Ụnyahụ',
    tomorrow: 'Echi',
    loadingDevotional: 'Ọ na-ebuba ekpere...',
    noDevotionalAvailable: 'Enweghị Ekpere Dị',
    checkBackFuture: 'Lọghachi n’ụbọchị a maka ekpere ọhụrụ',
    noDevotionalPast: 'E bipụtaghị ekpere ọ bụla maka ụbọchị a',
    recentDevotionals: 'Ekpere Ndị Dị nso',
    dailyDevotionalFallback: 'Ekpere kwa Ụbọchị',

    // Songs Screen
    songsNavTitle: 'Egwu',
    songsBannerTitle: 'ABỤ OTUTO',
    songsBannerSubtitle:
      'Feenụ Chineke site n’abụ ime mmụọ na abụ ọma na-ewusi okwukwe ike.',
    featuredSongsTitle: 'Abụ Otuto nke Chineke',
    featuredSongsSubtitle: '(Abụ na Zabura)',
    songsCountLabel: 'egwu',
    seePlaylist: 'Lee Egwu Ndị Dị n’Ime',

    // Music Screen
    searchSongsPlaceholder: 'Chọọ egwu...',
    categoryLabel: 'Ụdị',
    songLoadError: 'Enweghị ike ibubata egwu.',

    // Music Player Screen
    musicPlayerTitle: 'Ihe Na-akpọ Egwu',
    unknownCategory: 'Amaghị Ụdị Ya',
    permissionRequired: 'Achọrọ ikike',
    saveSongsPermission: 'Biko kwe ka anyị chekwaa egwu na ekwentị gị.',
    songSavedSuccess: 'Echekwara egwu n’ekwentị gị!',
    saveFileError: 'Enweghị ike ichekwa faịlụ ahụ.',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Abụ 禮',
    hymnsBannerTitle: 'Abụ Otuto nke Chineke',
    hymnSearchPlaceholder: 'Chọọ site na nọmba ma ọ bụ aha',
    noHymnsFound: 'Ahụghị Abụ ma ọ bụ Zabura kwekọrọ n’ihe ị na-achọ.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Zabura',

    // Animations Screen
    watchNow: 'Lere Ugbu a',
    loadingMoreVideos: 'Ọ na-ebubata vidiyo ndị ọzọ...',
    noVideosFound: 'Ahụghị vidiyo',
    noAnimationsAvailable: 'Ọ nweghị ihe nkiri atụmatụ dị',
    adjustSearchTerms: 'Nwaa ịgbanwe okwu ị na-achọ',
    checkBackLater: 'Lọghachi azụ ma emechaa maka ihe ọhụrụ',
    animationsBannerTitle: 'AKỤKỌ BIBLE',
    animationsBannerSubtitle:
      'Mụta okwu Chineke site n’ihe nkiri na-eme ka akụkọ na ndị mmadụ nọ na Bible dị ndụ.',
    searchAnimationsPlaceholder: 'Chọọ ihe nkiri atụmatụ...',
    clear: 'Hichapụ',

    // Animation Detail
    linkCopied: 'E depụtaghachiri link ahụ!',
    shareVideo: 'Kesaa Vidiyo',
    errorVideoNotFound: 'Ahụghị vidiyo',

    // Live Stream Screen
    liveStreamLoading: 'Ọ na-ebubata ihe omume...',
    liveStreamError: 'Enweghị ike ibubata ihe omume. Biko nwaa ọzọ.',
    refreshFailed: 'Nmelite Adaala',
    refreshFailedMsg: 'Enweghị ike imelite ihe omume',
    openLinkError: 'Enweghị ike imeghe link ahụ',
    loadingStream: 'Ọ na-ebubata ihe omume...',
    streamUnavailable: 'Ihe omume adịghị',
    openInYouTube: 'Mepee na YouTube',
    loadingHLSStream: 'Ọ na-ebubata HLS...',
    hlsStreamUnavailable: 'HLS adịghị',
    couldNotLoadStream: 'Enweghị ike ibubata ihe omume a',
    external: 'N’IHU',
    streamLabel: 'Ihe Omume',
    tapToWatchYouTube: 'Pịa n’okpuru ebe a ka ị lere na YouTube',
    externalStreamExternalOnly: 'Ụdị ihe omume a ga-emeghe n’ihu',
    watchInBrowser: 'Lere na Browser',
    checkConnectionRetry: 'Biko lelee netwọk gị ma nwaa ọzọ.',
    retry: 'Nwaa Ọzọ',
    refreshing: 'Ọ na-emelite...',
    refreshStreams: 'Melite Ihe Omume',
    liveLabel: 'NỌ N’IKUKU',
    offlineLabel: 'ANỌGHỊ N’IKUKU',
    streamOffline: 'Anọghị n’Ikuku',
    streamNotActive: 'Ihe omume a anọghị n’ikuku ugbu a',
    streamTypeLabel: 'Ụdị: ',
    noActiveStreams: 'Enweghị Ihe Omume Nọ n’Ikuku',
    checkBackLaterLive: 'Lọghachi azụ ma emechaa maka ihe omume nọ n’ikuku',
    refresh: 'Melite',
    unknown: 'Amaghị ya',

    // Archive Screen
    archiveBannerTitle: 'EBE NCHEKWA',
    archiveBannerSubtitle:
      'N’ebe a ka ị ga-ahụ foto na vidiyo nke ihe omume ochie nke ụka, nke e debere maka ncheta.',
    pictures: 'Foto',
    videos: 'Vidiyo',

    // Archive Videos Screen
    videoArchiveTitle: 'EBE NCHEKWA VIDIYO',
    videoArchiveSubtitle:
      'Ihuenyo a nwere vidiyo nke ihe omume ochie nke ụka, nke e debere maka ncheta.',
    untitledEvent: 'Ihe Omume Enweghị Aha',
    video: 'Vidiyo',
    videos: 'Vidiyo',
    noEventsFound: 'Ahụghị ihe omume kwekọrọ n’ihe ị na-achọ',
    noVideosYet: 'Enweghị vidiyo ugbu a',

    // Archive Pictures Screen
    pictureArchiveTitle: 'EBE NCHEKWA FOTO',
    pictureArchiveSubtitle:
      'Ncheta dị nsọ na ihe omume ochie nke ụka, nke e debere maka ntụaka.',
    untitledEvent: 'Ihe Omume Enweghị Aha',
    photo: 'Foto',
    photos: 'Foto Ndị Dị n’Ime',
    noEventsFound: 'Ahụghị ihe omume',
    noPicturesYet: 'Enweghị foto ugbu a',

    // Gallery Screen
    galleryNavTitle: 'Foto Ndị Dị n’Ime',
    galleryBannerTitle: 'FOTO NDỊ DỊ N’IME',
    galleryBannerSubtitle:
      'N’ebe a ka ị ga-ahụ nkọwa ndị ozi GKS, foto na vidiyo nke ihe omume n’akụkụ ụka niile.',
    ministers: 'Ndị Ozi',

    // Video Gallery Screen
    videoGalleryTitle: 'EBE VIDIYO DỊ',
    videoGallerySubtitle:
      'Ihe omume ndị dị mkpa n’akụkụ ụka anyị niile, maka nlele gị.',
    videoLabel: 'Vidiyo',
    videosLabel: 'Vidiyo',
    untitledEvent: 'Ihe Omume Enweghị Aha',
    noEventsFound: 'Ahụghị ihe omume kwekọrọ n’ihe ị na-achọ',
    noVideosYet: 'Enweghị vidiyo ugbu a',

    // Picture Gallery Screen
    pictureGalleryTitle: 'EBE FOTO DỊ',
    pictureGallerySubtitle:
      'Ncheta nke ihe omume ndị dị mkpa n’akụkụ ụka anyị niile.',
    galleryNavTitle: 'Foto Ndị Dị n’Ime',
    photo: 'Foto',
    photos: 'Foto Ndị Dị n’Ime',
    untitledEvent: 'Ihe Omume Enweghị Aha',
    noEventsFound: 'Ahụghị ihe omume',
    noPicturesYet: 'Enweghị foto ugbu a',

    // Ministers Gallery Screen
    ministersNavTitle: 'Ndị Ozi',
    ministersBannerTitle: 'NKỌWA NDỊ OZI',
    ministersBannerSubtitle:
      'Nkọwa ndị ozi ụka GKS. Ịmata na ịsọpụrụ ndị na-arụ ọrụ n’okwu Chineke.',
    searchByName: 'Chọọ site n’aha...',
    unnamedMinister: 'Onye Ozi Enweghị Aha',
    ministerLabel: 'Onye Ozi',
    devotedLabel: 'Onye nraranye',
    contactNotProvided: 'Enyeghị ama si akpọtụrụ anyị',

    // Quiz Resources Screen
    quizNavTitle: 'Ihe Omume Ajụjụ',
    quizSearchPlaceholder: 'Chọọ site n’aha, afọ, ma ọ bụ ụdị...',
    downloadPdf: 'Budata PDF',
    details: 'Nkọwa',
    noResourcesFound: 'Ahụghị ihe ọ bụla.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Nkọwa Ajụjụ',
    openStudyMaterial: 'Mepee Ihe Ọmụmụ (PDF)',
    needClarification: 'Ị chọrọ Nkọwa?',
    clarificationDesc:
      'Ọ bụrụ na ajụjụ ọ bụla gbagwojuru gị anya n’ihe ọmụmụ a, rịọ ndị nchịkwa anyị maka enyemaka.',
    askQuestion: 'Jụọ Ajụjụ',

    // Quiz Help Screen
    askHelpNavTitle: 'Rịọ maka Enyemaka',
    haveQuestionFromTitle: 'Ị nwere ajụjụ sitere na "{title}"?',
    provideDetailsHelp:
      'Tinye nkọwa gị n’okpuru ebe a, anyị ga-enyere gị aka kọwaa ihe gbagwojuru gị anya.',
    yourNameLabel: 'Aha Gị',
    enterFullNamePlaceholder: 'Tinye aha gị zuru ezu',
    whatsappNumberLabel: 'Nọmba WhatsApp',
    whatsappPlaceholder: 'dịka 08012345678',
    yourQuestionLabel: 'Ajụjụ Gị',
    questionPlaceholder: 'Olee akụkụ gbagwojuru gị anya?',
    submitQuestion: 'Nyefee Ajụjụ',
    sending: 'Ọ na-eziga...',
    fillAllFields: 'Biko dejupụta ebe niile',
    questionSentSuccess:
      'Ezila ajụjụ gị. Ndị nchịkwa anyị ga-akpọtụrụ gị n’oge na-adịghị anya.',
    questionSendError: 'Ezigaghị ajụjụ gị. Biko nwaa ọzọ.',
    ok: 'Ọ DỊ MMA',
    success: 'Ihe Agaala nke Ọma',
    error: 'Mmejọ',

    // Notices Screen
    noticesNavTitle: 'Ọkwa',
    noTitle: 'Enweghị Aha',
    noMessage: 'Enweghị ozi ọ bụla.',
    viewAttachedDoc: 'Lee Akwụkwọ Ndị Dị n’Ime',
    pdfFile: 'Faịlụ PDF',
    noNoticesYet: 'Enweghị Ọkwa Ugbu a',

    // Contact Screen
    contactTitle: 'Kpọtụrụ Anyị',
    getInTouch: 'Kparịta Anyị ụka',
    contactDesc:
      'Ọ ga-atọ anyị ụtọ ịnụ n’ọnụ gị. Atụmatụ gị ga-enyere anyị aka ijere gị ozi nke ọma.',
    namePlaceholder: 'Tinye aha gị',
    emailPlaceholder: 'Tinye ozi-e gị',
    selectCategory: 'Gịnị ka ihe a metụtara?',
    complaint: 'Mkpesa',
    suggestion: 'Atụmatụ',
    request: 'Arịrịọ',
    appreciation: 'Ekele',
    messagePlaceholder: 'Dee ozi gị n’ebe a...',
    sendMessage: 'Ziga Ozi',
    sendingMessage: 'Ọ na-eziga ozi...',
    thankYou: 'Imeela!',
    contactSuccessMsg:
      'Ezila ozi gị nke ọma. Anyị na-ekele gị maka atụmatụ gị.',
    returnToApp: 'Lọghachi na App',
    submitError: 'Ezigaghị ozi gị. Biko nwaa ọzọ.',

    // About Screen
    aboutUsNav: 'Maka Anyị',
    churchName: "God's Kingdom Society",
    churchSlogan: '(Ụka Chineke dị ndụ)',
    ourMission: 'Ebumnuche Anyị',
    historyVision: 'Akụkọ Ihe Mere Eme na Ọhụụ',
    coreBeliefs: 'Nkwenye Ndị bụ Isi',
    connectWithUs: 'Kpọtụrụ Anyị',
    developedBy: 'Nke HIGH-ER ENTERPRISES rụpụtara',
    allRightsReserved: 'Ikike niile echekwara.',
    churchMotto: 'Gaa n’ọchịchị Chineke zuru okè',

    // Not Found Screen
    notFoundTitle: 'Ewoo!',
    screenNotExist: 'Ihuenyo a adịghị.',
    goHome: 'Gaa n’ihuenyo mbido!',

    // Navigation / Global Menu
    options: 'Nhọrọ',
    about: 'Maka Anyị',
    contact: 'Kpọtụrụ',
    adminPanel: 'Ogwe Nchịkwa',
  },

  //YORUBA TRANSLATIONS
  yo: {
    // Navigation
    home: 'Ile',
    hymns: 'Orin Iyin',
    sermons: 'Iwaasu',
    songs: 'Orin',
    animations: 'Aworan Alagbeeka',
    profile: 'Ipo Mi',
    music: 'Orin',
    contact: 'Ikanisile',
    about: 'Nipa Wa',
    admin: 'Alakoso',
    notices: 'Ikilo',
    quizresources: 'Awọn Ohun Itọkasi Idanwo',
    live: 'Lori Afẹfẹ',
    archive: 'Ile Ifosoke',

    // Common
    search: 'Wa',
    play: 'Tẹ',
    pause: 'Duro',
    loading: 'O n gbe e jade...',
    error: 'Asise',
    save: 'Pamo',
    cancel: 'Fagile',
    submit: 'Firanse',
    login: 'Wole',
    signup: 'Forukosile',
    logout: 'Jade',
    email: 'Imeeli',
    password: 'Oruko Asiri',
    name: 'Oruko',
    message: 'Sako',
    noSermons: 'Ko si iwaasu kankan lowo',
    noSongs: 'Ko si orin kankan lowo',
    noVideos: 'Ko si fidio kankan lowo',
    noContent: 'Ko si nkan ninu re',
    unknownDuration: 'Akoko aimo',
    unknownStyle: 'Iru aimo',

    // Content
    duration: 'Akoko',
    category: 'Isori',
    style: 'Iru re',

    // Contact
    contactUs: 'Kan si Wa',
    contactDesc:
      'A o fe gbo lati odo yin. Fi sako ranse si wa, a o si dahun ni kete ti o ba seese.',
    complaint: 'Esun',
    suggestion: 'Ababa',
    request: 'Ibeere',
    selectCategory: 'Yan Isori',

    // About
    aboutUs: 'Nipa Wa',
    version: 'Iru',
    mission: 'Ise Wa',

    // Admin
    adminDashboard: 'Oju-ewe Alakoso',
    uploadContent: 'Gbe Nkan Soke',
    manageContent: 'Se Akoso Nkan',
    viewMessages: 'Wo Sakonni',
    addHymn: 'Fi Orin Iyin Kun',
    addSermon: 'Fi Iwaasu Kun',
    uploadSong: 'Gbe Orin Soke',
    uploadVideo: 'Gbe Fidio Soke',

    //onboarding
    skip: 'Rekọja',
    startBtn: 'BERE',
    onboardingSubtitle1: 'Kaabo si',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Eto Onigbagbo nibiti a ti n waasu ti a si n se otito oro Olorun fun igbala Olorun.',
    onboardingSubtitle2: 'Dagba ninu oro Olorun pelu',
    onboardingTitle2: 'Awọn Iwaasu Didara',
    onboardingDesc2:
      'Wọle si iwaasu GKS ni irọrun nipasẹ kikọ, ohun ati fidio lati kọ ẹkọ ọrọ Ọlọrun bi o ti wa ninu Bibeli.',
    onboardingSubtitle3: 'Sin Olorun pelu',
    onboardingTitle3: 'Awọn Orin Ore-ọfẹ',
    onboardingDesc3:
      'Darapọ mọ awọn onigbagbo ni agbaye lati bọla fun Ọlọrun ati Kristi nipasẹ awọn orin iyin aladun.',
    onboardingSubtitle4: 'ṢAWARI SIWAJU',
    onboardingTitle4: 'ÀWỌN ÈTÒ MÍÌRÀN',
    onboardingDesc4:
      'Kọ ẹkọ ọrọ Ọlọrun nipasẹ awọn aworan alagbeeka, ki o si wo awọn fọto ati awọn fidio lati ile ifosoke ijọ.',

    // Home Screen
    homeNavTitle: 'Oore-ofẹ',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Si Ijoba Pipe ti Olorun',
    heroDesc: 'Ka, tẹtí sí, kí o sì dàgbà nínú ìgbàgbọ́ pẹ̀lú Ìjọ Ọlọ́run Alààyè.',
    exploreResources: 'Ṣawari Awọn Ohun Itọkasi',
    homeCardTitleSongs: 'Orin Iyin',
    homeCardSubtitleSongs: 'Awọn orin mimọ fun ijọsin ati iṣaro.',
    homeCardTitleSermons: 'Iwaasu Didara',
    homeCardSubtitleSermons: 'Jinle ninu oye pelu ẹkọ Bibeli ti o daju.',
    homeCardTitleStories: 'Awọn Itan Bibeli',
    homeCardSubtitleStories: 'Awọn iwa giga ti emi nipasẹ awọn itan aladun.',
    homeCardTitleArchive: 'Ile Ifosoke',
    homeCardSubtitleArchive:
      'Ṣawari awọn igbasilẹ itan ati awọn iṣẹlẹ ti o ti kọja.',
    homeCardTitleGallery: 'Àwòrán',
    homeCardSubtitleGallery:
      'Irin-ajo aworan nipasẹ agbegbe wa ati awọn iranṣẹ wa.',
    homeCardTitleQuiz: 'Awọn Ohun Itọkasi Idanwo',
    homeCardSubtitleQuiz: 'Awọn ohun elo ikẹkọ lati mu imo rẹ pọ si.',
    homeCardTitleGiving: 'Idameji ati Ore',
    homeCardSubtitleGiving: 'Se itilẹhin fun iṣẹ GKS ni agbaye.',
    homeCardTitleLive: 'Iṣẹlẹ Lori Afẹfẹ',
    homeCardSubtitleLive:
      'Darapọ mọ ijọsin ati awọn iṣẹlẹ pataki ni akoko gidi.',

    // Sermons Main Screen
    sermonsBannerTitle: 'AWỌN IWAASU DIDARA',
    sermonsBannerSubtitle:
      'Wọle si awọn iwaasu iwuri ni awọn ede oriṣiriṣi fun itankale Ọrọ Ọlọrun.',
    searchSermons: 'Wa iwaasu, koko-ọrọ, tabi isori...',
    textSermons: 'Iwaasu Kikọ',
    readSermons: 'Ti a ṣeto nipasẹ iwọn ati koko-ọrọ',
    audioClips: 'Ohun Iwaasu',
    listenSermons: 'Tẹtí sí ohun iwaasu didara',
    videoSermons: 'Fidio Iwaasu',
    watchSermons: 'Wo awọn akoko lori afẹfẹ ati awọn ti a gbasilẹ',
    dailyGuide: 'Atọka Ojoojumọ',
    dailyGuideSubtitle: 'Se iwadi oro Olorun lojoojumo',

    // Text Sermons Screen
    textSermonsBannerTitle: 'IWAASU KIKỌ',
    textSermonsBannerSubtitle:
      'Ka ki o si kẹkọọ ọrọ Ọlọrun pẹlu awọn iwaasu kikọ ni kikun.',
    searchPlaceholder: 'Wa iwaasu...',
    subjectsCountLabel: 'koko-ọrọ',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Iwaasu Ọsẹ Iwọn 1',
    'Weekly Sermon Volume 2': 'Iwaasu Ọsẹ Iwọn 2',
    "God's Kingdom Advocate Volume 1": 'Olugbeja Ijoba Olorun Iwọn 1',
    "God's Kingdom Advocate Volume 2": 'Olugbeja Ijoba Olorun Iwọn 2',
    "God's Kingdom Advocate Volume 3": 'Olugbeja Ijoba Olorun Iwọn 3',
    'Abridged Bible Subjects': 'Koko-ọrọ Bibeli Ti A Ge Kuru',
    'The Ten Fundamental Truths': 'Awọn Otitọ Ipilẹ Mẹwa',
    "GKS President's Feast Message": 'Sako Àjọyọ̀ ti Ààrẹ GKS',
    "GKS President's Freedom Day Message": 'Sako Ọjọ Ominira ti Ààrẹ GKS',
    "GKS President's Youth Assembly Message": 'Sako Àpérò Àwọn Ọ̀dọ́ ti Ààrẹ GKS',
    'Sermon Summaries': 'Akopọ Iwaasu',
    'Questions and Answers': 'Awọn Ibeere ati Idahun',

    // Sermon Detail Screen
    sermonDetail: 'Ekunrere Iwaasu',
    sermonNotFound: 'A ko ri iwaasu naa',
    untitled: 'Ko ni akọle',
    gksSermon: 'Iwaasu GKS',
    audioAssistant: 'Oluranlowo Ohun',
    success: 'Aseyege',
    copiedToClipboard: 'A ti daakọ rẹ',
    audioError: 'Asise Ohun',
    audioPlayError: 'Ko le tẹ ohun naa. Jọwọ gbiyanju lẹẹkansii.',
    playbackControlError: 'Asise iṣakoso ohun',
    part: 'Apa',
    of: 'ninu',

    // Audio Sermons Screen
    audioSermonsTitle: 'Ohun Iwaasu',
    audioSermonsBannerTitle: 'OHUN IWAASU',
    audioSermonsBannerSubtitle:
      'Kọ ẹkọ ọrọ Ọlọrun pẹlu ohun iwaasu, ti a ṣeto nipasẹ ọdun.',
    noAudioSermons: 'Ko si ohun iwaasu kankan lowo',
    unknownYear: 'Aimo',
    sermonsCountPlural: 'iwaasu',
    sermonCountSingular: 'iwaasu',
    sermonsLabel: 'Iwaasu',
    untitledSermon: 'Iwaasu ti ko ni akọle',
    noDate: 'Ko si ọjọ',

    // Audio Player/Details Screen
    audioPlayer: 'Ẹrọ Orin',
    audioLoadError: 'Asise gbigbe ohun jade.',
    errorSermonNotFound: 'A ko ri iwaasu tabi ohun naa.',
    permissionRequired: 'Aaye nilo',
    saveSermonPermission: 'Jọwọ gba aaye laaye lati tọju iwaasu sori ẹrọ rẹ.',
    sermonSaved: 'A ti tọju iwaasu sori ẹrọ rẹ!',
    fileSaveError: 'Ko le tọju faili naa.',
    noTitle: 'Ko ni Akọle',
    unknownDate: 'Ọjọ aimọ',

    // Sermon Videos Screen
    videoSermonsTitle: 'Fidio Iwaasu',
    videoPlural: 'fidio',
    videoSingular: 'fidio',
    loadingVideos: 'O n gbe fidio jade...',
    noVideosInCategory: 'A ko ri fidio kankan ni isori yii',
    sermonVideosBannerTitle: 'AWỌN FIDIO IWAASU',
    sermonVideosBannerSubtitle: 'Wo awọn fidio iwaasu ti a ṣeto nipasẹ isori.',
    searchSermonVideosPlaceholder: 'Wa fidio iwaasu...',
    clearSearch: 'Pa rẹ',
    sermonVideoCategoriesTitle: 'Isori Fidio Iwaasu',
    browseSermonsByCategory: 'Wa iwaasu nipasẹ isori',
    searchResults: 'Esi Iwadi',
    noSermonVideosFound: 'A ko ri fidio iwaasu kankan',
    noSermonVideosAvailable: 'Ko si fidio iwaasu kankan lowo',
    adjustSearchTerms: 'Gbiyanju lati yipada ọrọ iwadi rẹ',
    checkBackLaterSermons: 'Pada wa nigbamii fun awọn fidio tuntun',
    loadingMoreVideos: 'O n gbe awọn fidio diẹ sii jade...',
    watchNow: 'Wo Nisisiyi',
    watch: 'Wo',

    // Video/Animation Detail
    linkCopied: 'A ti daakọ ọna asopọ!',
    shareSermonVideoLabel: 'Fidio Iwaasu',
    noCategory: 'Ko si isori',
    shareSermonVideoTitle: 'Pin Fidio Iwaasu',
    shareVideoTitle: 'Pin Fidio',
    noTitle: 'Ko ni Akọle',
    unknownDate: 'Ọjọ aimọ',
    errorVideoNotFound: 'A ko ri fidio naa',
    languageLabel: 'Ede',
    share: 'Pin',

    // Daily Guide Screen
    dailyGuideTitle: 'Atọka Ojoojumọ',
    dailyDevotionalBanner: 'Ẹsin Ojoojumọ',
    dailyDevotionalBannerSubtitle: 'Mú ọkàn rẹ sọjí pẹ̀lú ìtọ́sọ́nà ojoojúmọ́.',
    today: 'Oni',
    yesterday: 'Aná',
    tomorrow: 'Ọ̀la',
    loadingDevotional: 'O n gbe ẹsin jade...',
    noDevotionalAvailable: 'Ko si Ẹsin Lowo',
    checkBackFuture: 'Pada wa ni ọjọ yii fun ẹsin tuntun',
    noDevotionalPast: 'A ko tẹ ẹsin kankan jade fun ọjọ yii',
    recentDevotionals: 'Awọn Ẹsin To Nẹẹti',
    dailyDevotionalFallback: 'Ẹsin Ojoojumọ',

    // Songs Screen
    songsNavTitle: 'Orin',
    songsBannerTitle: 'ORIN IYIN',
    songsBannerSubtitle:
      'Sin pẹlu ikojọpọ awọn orin emi ti o n gbe ọkan soke ti o si n mu igbagbọ le.',
    featuredSongsTitle: 'Orin Iyin ti Olorun',
    featuredSongsSubtitle: '(Zabura ati Orin Iyin)',
    songsCountLabel: 'orin',
    seePlaylist: 'Wo Atẹle Orin',

    // Music Screen
    searchSongsPlaceholder: 'Wa orin...',
    categoryLabel: 'Isori',
    songLoadError: 'Asise gbigbe orin jade.',

    // Music Player Screen
    musicPlayerTitle: 'Ẹrọ Orin',
    unknownCategory: 'Isori aimọ',
    permissionRequired: 'Aaye nilo',
    saveSongsPermission: 'Jọwọ gba aaye laaye lati tọju orin sori ẹrọ rẹ.',
    songSavedSuccess: 'A ti tọju orin sori ẹrọ rẹ!',
    saveFileError: 'Ko le tọju faili naa.',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Orin Iyin',
    hymnsBannerTitle: 'Orin Iyin ti Olorun',
    hymnSearchPlaceholder: 'Wa nipasẹ nọmba tabi akọle',
    noHymnsFound: 'A ko ri Orin Iyin tabi Zabura kankan.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Zabura',

    // Animations Screen
    watchNow: 'Wo Nisisiyi',
    loadingMoreVideos: 'O n gbe awọn fidio diẹ sii jade...',
    noVideosFound: 'A ko ri fidio kankan',
    noAnimationsAvailable: 'Ko si aworan alagbeeka kankan lowo',
    adjustSearchTerms: 'Gbiyanju lati yipada ọrọ iwadi rẹ',
    checkBackLater: 'Pada wa nigbamii fun awọn nkan tuntun',
    animationsBannerTitle: 'AWỌN ITAN BIBELI',
    animationsBannerSubtitle:
      'Kọ ẹkọ ọrọ Ọlọrun nipasẹ awọn aworan ti o mu awọn itan ati awọn eniyan Bibeli sọjí.',
    searchAnimationsPlaceholder: 'Wa aworan alagbeeka...',
    clear: 'Pa rẹ',

    // Animation Detail
    linkCopied: 'A ti daakọ ọna asopọ!',
    shareVideo: 'Pin Fidio',
    errorVideoNotFound: 'A ko ri fidio naa',

    // Live Stream Screen
    liveStreamLoading: 'O n gbe iṣẹlẹ jade...',
    liveStreamError: 'Asise gbigbe iṣẹlẹ jade. Jọwọ gbiyanju lẹẹkansii.',
    refreshFailed: 'Asise itun sọji',
    refreshFailedMsg: 'Ko le tun awọn iṣẹlẹ sọji',
    openLinkError: 'Ko le ṣii ọna asopọ',
    loadingStream: 'O n gbe iṣẹlẹ jade...',
    streamUnavailable: 'Iṣẹlẹ ko si lowo',
    openInYouTube: 'Ṣii ni YouTube',
    loadingHLSStream: 'O n gbe HLS jade...',
    hlsStreamUnavailable: 'HLS ko si lowo',
    couldNotLoadStream: 'Ko le gbe iṣẹlẹ yii jade',
    external: 'LODE',
    streamLabel: 'Iṣẹlẹ',
    tapToWatchYouTube: 'Tẹ ni isalẹ lati wo lori YouTube',
    externalStreamExternalOnly: 'Iru iṣẹlẹ yii gbọdọ ṣii lode',
    watchInBrowser: 'Wo ninu Browser',
    checkConnectionRetry: 'Jọwọ ṣayẹwo intanẹẹti rẹ ki o gbiyanju lẹẹkansii.',
    retry: 'Gbiyanju lẹẹkansii',
    refreshing: 'O n tun sọji...',
    refreshStreams: 'Tun awọn Iṣẹlẹ Sọji',
    liveLabel: 'LORI AFẸFẸ',
    offlineLabel: 'KO SI LORI AFẸFẸ',
    streamOffline: 'Iṣẹlẹ ko si lori afẹfẹ',
    streamNotActive: 'Iṣẹlẹ yii ko ṣiṣẹ lọwọlọwọ',
    streamTypeLabel: 'Iru: ',
    noActiveStreams: 'Ko si Iṣẹlẹ kankan lori afẹfẹ',
    checkBackLaterLive: 'Pada wa nigbamii fun awọn iṣẹlẹ lori afẹfẹ',
    refresh: 'Tun sọji',
    unknown: 'Aimo',

    // Archive Screen
    archiveBannerTitle: 'ILE IFOSOKE',
    archiveBannerSubtitle:
      'Nibi ni iwọ yoo ti ri awọn fọto ati awọn fidio ti awọn iṣẹlẹ atijọ ti ijọ.',
    pictures: 'Fọto',
    videos: 'Fidio',

    // Archive Videos Screen
    videoArchiveTitle: 'IFOSOKE FIDIO',
    videoArchiveSubtitle:
      'Oju-ewe yii ni awọn fidio ti awọn iṣẹlẹ atijọ ti ijọ.',
    untitledEvent: 'Iṣẹlẹ ti ko ni akọle',
    video: 'Fidio',
    videos: 'Fidio',
    noEventsFound: 'A ko ri iṣẹlẹ kankan',
    noVideosYet: 'Ko si fidio kankan sibẹsibẹ',

    // Archive Pictures Screen
    pictureArchiveTitle: 'IFOSOKE FỌTO',
    pictureArchiveSubtitle: 'Awọn iranti mimọ ati awọn iṣẹlẹ atijọ ti ijọ.',
    untitledEvent: 'Iṣẹlẹ ti ko ni akọle',
    photo: 'Fọto',
    photos: 'Fọto',
    noEventsFound: 'A ko ri iṣẹlẹ kankan',
    noPicturesYet: 'Ko si fọto kankan sibẹsibẹ',

    // Gallery Screen
    galleryNavTitle: 'Àwòrán',
    galleryBannerTitle: 'ÀWÒRÁN',
    galleryBannerSubtitle:
      'Nibi ni iwọ yoo ti ri profaili awọn iranṣẹ GKS, awọn fọto ati awọn fidio ti awọn iṣẹlẹ ni awọn ẹka ijọ.',
    ministers: 'Awọn Iranṣẹ',

    // Video Gallery Screen
    videoGalleryTitle: 'ÀWÒRÁN FIDIO',
    videoGallerySubtitle: 'Awọn iṣẹlẹ pataki ni awọn ẹka wa, fun wiwo rẹ.',
    videoLabel: 'Fidio',
    videosLabel: 'Fidio',
    untitledEvent: 'Iṣẹlẹ ti ko ni akọle',
    noEventsFound: 'A ko ri iṣẹlẹ kankan',
    noVideosYet: 'Ko si fidio kankan sibẹsibẹ',

    // Picture Gallery Screen
    pictureGalleryTitle: 'ÀWÒRÁN FỌTO',
    pictureGallerySubtitle: 'Awọn iranti iṣẹlẹ pataki ni orisirisi ẹka.',
    galleryNavTitle: 'Àwòrán',
    photo: 'Fọto',
    photos: 'Fọto',
    untitledEvent: 'Iṣẹlẹ ti ko ni akọle',
    noEventsFound: 'A ko ri iṣẹlẹ kankan',
    noPicturesYet: 'Ko si fọto kankan sibẹsibẹ',

    // Ministers Gallery Screen
    ministersNavTitle: 'Awọn Iranṣẹ',
    ministersBannerTitle: 'PROFAILI AWỌN IRANṢẸ',
    ministersBannerSubtitle:
      'Profaili osise ti iṣẹ-ojiṣẹ GKS. Lati mọ ati bọla fun awọn ti n ṣiṣẹ ninu ọrọ.',
    searchByName: 'Wa nipasẹ orukọ...',
    unnamedMinister: 'Iranṣẹ ti ko ni orukọ',
    ministerLabel: 'Iranṣẹ',
    devotedLabel: 'Olufaraji',
    contactNotProvided: 'A ko pese lambar tuntuba',

    // Quiz Resources Screen
    quizNavTitle: 'Awọn Ohun Itọkasi Idanwo',
    quizSearchPlaceholder: 'Wa nipasẹ akọle, ọdun, tabi isori...',
    downloadPdf: 'Gba PDF',
    details: 'Ekunrere',
    noResourcesFound: 'A ko ri nkan kankan.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Ekunrere Idanwo',
    openStudyMaterial: 'Ṣii Ohun elo Ikẹkọ (PDF)',
    needClarification: 'Ṣe o nilo alaye diẹ sii?',
    clarificationDesc:
      'Ti o ba ni iyemeji nipa ibeere eyikeyi ninu ohun elo ikẹkọ yii, beere lọwọ awọn alakoso wa fun iranlọwọ.',
    askQuestion: 'Beere Ibeere',

    // Quiz Help Screen
    askHelpNavTitle: 'Beere fun Iranlọwọ',
    haveQuestionFromTitle: 'Ṣe o ni ibeere lati "{title}"?',
    provideDetailsHelp:
      'Pese awọn alaye rẹ ni isalẹ a o si ran ọ lọwọ lati ṣalaye eyikeyi rudurudu.',
    yourNameLabel: 'Oruko Re',
    enterFullNamePlaceholder: 'Tẹ orukọ rẹ ni kikun',
    whatsappNumberLabel: 'Nọmba WhatsApp',
    whatsappPlaceholder: 'apẹẹrẹ 08012345678',
    yourQuestionLabel: 'Ibeere Re',
    questionPlaceholder: 'Apa wo ni ohun elo naa ni o n daru rẹ loju?',
    submitQuestion: 'Firanse Ibeere',
    sending: 'O n firanse...',
    fillAllFields: 'Jọwọ kun gbogbo aaye',
    questionSentSuccess:
      'A ti firanṣẹ ibeere rẹ. Awọn alakoso wa yoo kan si ọ laipẹ.',
    questionSendError: 'Asise fifiranṣẹ ibeere rẹ. Jọwọ gbiyanju lẹẹkansii.',
    ok: 'O DARA',
    success: 'Aseyege',
    error: 'Asise',

    // Notices Screen
    noticesNavTitle: 'Ikilo',
    noTitle: 'Ko ni Akọle',
    noMessage: 'Ko si akoonu sako kankan.',
    viewAttachedDoc: 'Wo iwe ti a somọ',
    pdfFile: 'Faili PDF',
    noNoticesYet: 'Ko si ikilo kankan sibẹsibẹ',

    // Contact Screen
    contactTitle: 'Kan si Wa',
    getInTouch: 'Ba Wa Sọrọ',
    contactDesc:
      'A o fe gbo lati odo yin. Awọn esi rẹ n ran wa lọwọ lati sin ọ daradara.',
    namePlaceholder: 'Tẹ orukọ rẹ',
    emailPlaceholder: 'Tẹ imeeli rẹ',
    selectCategory: 'Kini eyi jẹ nipa?',
    complaint: 'Esun',
    suggestion: 'Ababa',
    request: 'Ibeere',
    appreciation: 'Imọriri',
    messagePlaceholder: 'Kọ sako rẹ si ibi...',
    sendMessage: 'Firanse Sako',
    sendingMessage: 'O n firanse sako...',
    thankYou: 'E seun!',
    contactSuccessMsg: 'A ti firanṣẹ sako rẹ ni aṣeyọri. A dupẹ fun esi rẹ.',
    returnToApp: 'Pada si App',
    submitError: 'Asise fifiranṣẹ sako. Jọwọ gbiyanju lẹẹkansii.',

    // About Screen
    aboutUsNav: 'Nipa Wa',
    churchName: "God's Kingdom Society",
    churchSlogan: '(Ìjọ Ọlọ́run Alààyè)',
    ourMission: 'Ise Wa',
    historyVision: 'Itan ati Iran',
    coreBeliefs: 'Awọn Igbagbọ Ipilẹ',
    connectWithUs: 'Kan si Wa',
    developedBy: 'Ti HIGH-ER ENTERPRISES ṣe amọja rẹ',
    allRightsReserved: 'Gbogbo ẹtọ wa ni ipamọ.',
    churchMotto: 'Si ijoba pipe ti Olorun',

    // Not Found Screen
    notFoundTitle: 'O ti o!',
    screenNotExist: 'Oju-ewe yii ko si.',
    goHome: 'Pada si ile!',

    // Navigation / Global Menu
    options: 'Awọn aṣayan',
    about: 'Nipa Wa',
    contact: 'Ikanisile',
    adminPanel: 'Igbimọ Alakoso',
  },

  //URHOBO TRANSLATIONS
  ur: {
    // Navigation
    home: 'Uvunẹ',
    hymns: 'Ine rẹ Ayere',
    sermons: 'Ota rẹ Ọghẹnẹ',
    songs: 'Ine',
    animations: 'Ighẹwẹ rẹ Ibebe',
    profile: 'Okrọ rẹ Ohwo',
    music: 'Inegbe',
    contact: 'Sẹ Anyi',
    about: 'Kpahen Anyi',
    admin: 'Inunue',
    notices: 'Oghwọrọ',
    quizresources: 'Ebe rẹ Onọ',
    live: 'Enuẹen',
    archive: 'Asan rẹ Ekpako',

    // Common
    search: 'Guọnọ',
    play: 'Kporo',
    pause: 'Mudia',
    loading: 'O cha...',
    error: 'Oshọ',
    save: 'Fiotọ',
    cancel: 'Siẹvwe',
    submit: 'Rho',
    login: 'Ruọvun',
    signup: 'Siobe',
    logout: 'Vwẹre',
    email: 'Imeeli',
    password: 'Ota rẹ Odidẹ',
    name: 'Odẹ',
    message: 'Ota',
    noSermons: 'Ota rẹ Ọghẹnẹ vuọvo herọ-ọ',
    noSongs: 'Ine vuọvo herọ-ọ',
    noVideos: 'Ighẹwẹ vuọvo herọ-ọ',
    noContent: 'Emuala vuọvo herọ-ọ',
    unknownDuration: 'Amọ oke rọye-en',
    unknownStyle: 'Amọ uruemu rọye-en',

    // Content
    duration: 'Oke',
    category: 'Otu',
    style: 'Uruemu',

    // Contact
    contactUs: 'Se Anyi',
    contactDesc:
      'O je anyi re anyi nyo nọ nẹ obọ rẹ ovwan. Rho ota rhe anyi, anyi ki kpahen kẹ ovwan kpakpata.',
    complaint: 'Eha',
    suggestion: 'Iruoro',
    request: 'Onyare',
    selectCategory: 'San Otu',

    // About
    aboutUs: 'Kpahen Anyi',
    version: 'Oruẹme',
    mission: 'Uruẹme rẹ Anyi',

    // Admin
    adminDashboard: 'Ite rẹ Inunue',
    uploadContent: 'Fi Emuala He',
    manageContent: 'Sẹ Emuala',
    viewMessages: 'Mrẹ Eta',
    addHymn: 'Fi Ine rẹ Ayere Ba',
    addSermon: 'Fi Ota rẹ Ọghẹnẹ Ba',
    uploadSong: 'Fi Ine He',
    uploadVideo: 'Fi Ighẹwẹ He',

    //onboarding
    skip: 'Vwrẹ',
    startBtn: 'TONRE',
    onboardingSubtitle1: 'Mavọ rhe',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Ẹga rẹ Iniọvo re rhuẹre ghwọghọ efele rẹ ota rẹ Ọghẹnẹ rere e mọ mrẹ usiwo rẹ Ọghẹnẹ.',
    onboardingSubtitle2: 'Rha mrẹ otọ rẹ ota rẹ Ọghẹnẹ vẹ',
    onboardingTitle2: 'Eta rẹ Ọghẹnẹ rẹ Efuanfon',
    onboardingDesc2:
      'Mrẹ eta rẹ GKS bẹbẹ vẹ obe, uphio, vẹ ighẹwẹ rere wu yono ota rẹ Ọghẹnẹ kerẹ obo rọ hẹ evun rẹ Baibol.',
    onboardingSubtitle3: 'Ga Ọghẹnẹ vẹ',
    onboardingTitle3: 'Ine rẹ Jiri',
    onboardingDesc3:
      'Kuomaga vẹ iniọvo rẹ akpọeje vwọ kẹ Ọghẹnẹ vẹ Kristi urinrin vẹ ine rẹ jiri rẹ emuẹfuon.',
    onboardingSubtitle4: 'GUỌNỌ PHIYA',
    onboardingTitle4: 'EFELE RẸ EBUOBUO',
    onboardingDesc4:
      'Yono ota rẹ Ọghẹnẹ vẹ ighẹwẹ rẹ ibebe, ji mrẹ ifoto vẹ ighẹwẹ rọ hẹ asan rẹ ekpako rẹ ẹga na.',

    // Home Screen
    homeNavTitle: 'Akpọfuwẹ',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Kpo Usuon rẹ Ọghẹnẹ rẹ Gba',
    heroDesc:
      'Se obe, nyo uphio, ji rha vwẹ esegbuyota vẹ Ẹga rẹ Ọghẹnẹ rọ hẹ Akpọ.',
    exploreResources: 'Guọnọ Ebe',
    homeCardTitleSongs: 'Ine rẹ Jiri',
    homeCardSubtitleSongs: 'Ine rẹ efuanfon rẹ ẹga vẹ iroro.',
    homeCardTitleSermons: 'Eta rẹ Ọghẹnẹ rẹ Efuanfon',
    homeCardSubtitleSermons: 'Rha mrẹ otọ rẹ ota rẹ Ọghẹnẹ rẹ gba.',
    homeCardTitleStories: 'Iku rẹ Baibol',
    homeCardSubtitleStories: 'Uruemu rẹ efuanfon vẹ iku rẹ emuẹfuon.',
    homeCardTitleArchive: 'Asan rẹ Ekpako',
    homeCardSubtitleArchive: 'Guọnọ iku rẹ ekpako vẹ emu rọ phia vwẹ emuoke.',
    homeCardTitleGallery: 'Ifoto',
    homeCardSubtitleGallery: 'Ughẹwẹ rẹ ifoto rẹ iniọvo vẹ idibo rẹ Ọghẹnẹ.',
    homeCardTitleQuiz: 'Ebe rẹ Onọ',
    homeCardSubtitleQuiz:
      'Ebe rẹ eyono vẹ emu rẹ eyono rẹ wu vwo rha mrẹ otọ rẹ emu.',
    homeCardTitleGiving: 'Igho rẹ Ihwe vẹ Inyare',
    homeCardSubtitleGiving: 'Bia ucho kẹ iruo rẹ GKS vwẹ akpọeje.',
    homeCardTitleLive: 'Uruẹme rẹ Enuẹen',
    homeCardSubtitleLive: 'Nyo ẹga vẹ uruẹme rẹ gidi vwẹ oke rọye.',

    // Sermons Main Screen
    sermonsBannerTitle: 'ETA RẸ ỌGHẸNẸ RẸ EFUANFON',
    sermonsBannerSubtitle:
      'Mrẹ eta rẹ Ọghẹnẹ vwẹ ephẹrẹ rẹ ebuobuo vwọ kpahen ota rẹ Ọghẹnẹ.',
    searchSermons: 'Guọnọ eta, ota, vẹ otu...',
    textSermons: 'Eta rẹ Obe',
    readSermons: 'Rọ hẹ evun rẹ obe vẹ ota',
    audioClips: 'Uphio rẹ Ota',
    listenSermons: 'Nyo uphio rẹ ota rẹ Ọghẹnẹ rẹ efuanfon',
    videoSermons: 'Ighẹwẹ rẹ Ota',
    watchSermons: 'Nyo uruẹme rẹ enuẹen vẹ rọ phioyotọ',
    dailyGuide: 'Ovwatọ rẹ Kẹdẹ-kẹdẹ',
    dailyGuideSubtitle: 'Yono ota rẹ Ọghẹnẹ kẹdẹ-kẹdẹ',

    // Text Sermons Screen
    textSermonsBannerTitle: 'ETA RẸ OBE',
    textSermonsBannerSubtitle: 'Se ji yono ota rẹ Ọghẹnẹ vẹ eta rẹ obe rẹ gba.',
    searchPlaceholder: 'Guọnọ eta...',
    subjectsCountLabel: 'ota',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Ota rẹ Ọkpọmako Obe 1',
    'Weekly Sermon Volume 2': 'Ota rẹ Ọkpọmako Obe 2',
    "God's Kingdom Advocate Volume 1": "God's Kingdom Advocate Obe 1",
    "God's Kingdom Advocate Volume 2": "God's Kingdom Advocate Obe 2",
    "God's Kingdom Advocate Volume 3": "God's Kingdom Advocate Obe 3",
    'Abridged Bible Subjects': 'Ota rẹ Baibol rẹ Kpẹre',
    'The Ten Fundamental Truths': 'Uyota rẹ Idibo Ihwe',
    "GKS President's Feast Message": 'Ota rẹ Ẹrẹvwe rẹ Olori rẹ GKS',
    "GKS President's Freedom Day Message":
      'Ota rẹ Ẹdẹ rẹ Ophuphu rẹ Olori rẹ GKS',
    "GKS President's Youth Assembly Message": 'Ota rẹ Ighene rẹ Olori rẹ GKS',
    'Sermon Summaries': 'Eta rẹ Kpẹre',
    'Questions and Answers': 'Onọ vẹ Ẹkpahọn',

    // Sermon Detail Screen
    sermonDetail: 'Iku rẹ Ota',
    sermonNotFound: 'A mrẹ ota rẹ Ọghẹnẹ na-a',
    untitled: 'Odẹ herọ-ọ',
    gksSermon: 'Ota rẹ GKS',
    audioAssistant: 'Ochu rẹ Uphio',
    success: 'Obuefuon',
    copiedToClipboard: 'A siobe na re',
    audioError: 'Oshọ rẹ Uphio',
    audioPlayError: 'A sa kporo uphio na-a. Gwọlọ rhuẹre.',
    playbackControlError: 'A sa sẹ uphio na-a',
    part: 'Abọ',
    of: 'rẹ',

    // Audio Sermons Screen
    audioSermonsTitle: 'Uphio rẹ Ota',
    audioSermonsBannerTitle: 'UPHIO RẸ OTA',
    audioSermonsBannerSubtitle:
      'Yono ota rẹ Ọghẹnẹ vẹ uphio rẹ ota, rọ hẹ otu rẹ ukpe.',
    noAudioSermons: 'Uphio rẹ ota vuọvo herọ-ọ',
    unknownYear: 'Amọ ukpe na-a',
    sermonsCountPlural: 'eta',
    sermonCountSingular: 'ota',
    sermonsLabel: 'Eta',
    untitledSermon: 'Ota rẹ odẹ herọ-ọ',
    noDate: 'Amọ ẹdẹ na-a',

    // Audio Player/Details Screen
    audioPlayer: 'Okporo rẹ Uphio',
    audioLoadError: 'Uphio na sa rhe-e.',
    errorSermonNotFound: 'A mrẹ ota na-a yẹrẹ uphio herọ-ọ.',
    permissionRequired: 'Inyare rẹ uphieyotọ',
    saveSermonPermission: 'Bia ucho rere e fion eta na kẹ waya wẹn.',
    sermonSaved: 'A fion ota na kẹ waya wẹn re!',
    fileSaveError: 'A sa fion obe na-a.',
    noTitle: 'Odẹ herọ-ọ',
    unknownDate: 'Amọ ẹdẹ na-a',

    // Sermon Videos Screen
    videoSermonsTitle: 'Ighẹwẹ rẹ Ota',
    videoPlural: 'ighẹwẹ',
    videoSingular: 'ughẹwẹ',
    loadingVideos: 'Ighẹwẹ na cha...',
    noVideosInCategory: 'A mrẹ ughẹwẹ vuọvo vwẹ otu na-a',
    sermonVideosBannerTitle: 'IGHẸWẸ RẸ ETA',
    sermonVideosBannerSubtitle: 'Nyo ighẹwẹ rẹ eta rọ hẹ otu rẹ ebuobuo.',
    searchSermonVideosPlaceholder: 'Guọnọ ighẹwẹ rẹ eta...',
    clearSearch: 'Rhuẹre',
    sermonVideoCategoriesTitle: 'Otu rẹ Ighẹwẹ rẹ Eta',
    browseSermonsByCategory: 'Guọnọ eta vwẹ otu rọye',
    searchResults: 'Emu rẹ wu mrẹre',
    noSermonVideosFound: 'A mrẹ ughẹwẹ rẹ ota vuọvo-o',
    noSermonVideosAvailable: 'Ughẹwẹ rẹ ota vuọvo herọ-ọ',
    adjustSearchTerms: 'Gwọlọ rhuẹre ota rẹ wu guọnọ',
    checkBackLaterSermons: 'Kpahen rhe oke ọfa kẹ ighẹwẹ rẹ kpokpọ',
    loadingMoreVideos: 'Ighẹwẹ efa cha...',
    watchNow: 'Nyo Ugbu na',
    watch: 'Nyo',

    // Video/Animation Detail
    linkCopied: 'A siobe na re!',
    shareSermonVideoLabel: 'Ughẹwẹ rẹ Ota',
    noCategory: 'Otu herọ-ọ',
    shareSermonVideoTitle: 'Ghẹ ughẹwẹ rẹ ota',
    shareVideoTitle: 'Ghẹ ughẹwẹ',
    noTitle: 'Odẹ herọ-ọ',
    unknownDate: 'Amọ ẹdẹ na-a',
    errorVideoNotFound: 'A mrẹ ughẹwẹ na-a',
    languageLabel: 'Ephẹrẹ',
    share: 'Ghẹ',

    // Daily Guide Screen
    dailyGuideTitle: 'Ovwatọ rẹ Kẹdẹ-kẹdẹ',
    dailyDevotionalBanner: 'Ẹga rẹ Kẹdẹ-kẹdẹ',
    dailyDevotionalBannerSubtitle: 'Ko uruemu wẹn vẹ ovwatọ rẹ kẹdẹ-kẹdẹ.',
    today: 'Nọna',
    yesterday: 'Ode',
    tomorrow: 'Odẹpha',
    loadingDevotional: 'Ẹga na cha...',
    noDevotionalAvailable: 'Ẹga vuọvo herọ-ọ',
    checkBackFuture: 'Kpahen rhe oke ọfa vwọ kẹ ẹga rẹ kpokpọ',
    noDevotionalPast: 'Ẹga vuọvo herọ-ọ vwẹ ẹdẹ na',
    recentDevotionals: 'Ẹga rẹ Kpẹkpẹre na',
    dailyDevotionalFallback: 'Ẹga rẹ Kẹdẹ-kẹdẹ',

    // Songs Screen
    songsNavTitle: 'Ine',
    songsBannerTitle: 'INE RẸ JIRI',
    songsBannerSubtitle:
      'Ga Ọghẹnẹ vẹ ine rẹ efuanfon rẹ rha vwẹ esegbuyota wẹn.',
    featuredSongsTitle: 'Ine rẹ Jiri rẹ Usuon Ọghẹnẹ',
    featuredSongsSubtitle: '(Ine rẹ Ayere vẹ Zabura)',
    songsCountLabel: 'ine',
    seePlaylist: 'Mrẹ Ine na',

    // Music Screen
    searchSongsPlaceholder: 'Guọnọ ine...',
    categoryLabel: 'Otu',
    songLoadError: 'A sa kporo ine na-a.',

    // Music Player Screen
    musicPlayerTitle: 'Okporo rẹ Ine',
    unknownCategory: 'Amọ otu na-a',
    permissionRequired: 'Inyare rẹ uphieyotọ',
    saveSongsPermission: 'Bia ucho rere e fion ine na kẹ waya wẹn.',
    songSavedSuccess: 'A fion ine na kẹ waya wẹn re!',
    saveFileError: 'A sa fion obe na-a.',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Ine rẹ Ayere',
    hymnsBannerTitle: 'Ine rẹ Jiri rẹ Usuon Ọghẹnẹ',
    hymnSearchPlaceholder: 'Guọnọ vẹ lamba yẹrẹ odẹ',
    noHymnsFound: 'A mrẹ Ine rẹ Ayere yẹrẹ Zabura vuọvo-o.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Zabura',

    // Animations Screen
    watchNow: 'Nyo Ugbu na',
    loadingMoreVideos: 'Ighẹwẹ efa cha...',
    noVideosFound: 'A mrẹ ughẹwẹ vuọvo-o',
    noAnimationsAvailable: 'Ighẹwẹ rẹ ibebe vuọvo herọ-ọ',
    adjustSearchTerms: 'Gwọlọ rhuẹre ota rẹ wu guọnọ',
    checkBackLater: 'Kpahen rhe oke ọfa vwọ kẹ emu rẹ kpokpọ',
    animationsBannerTitle: 'IKU RẸ BAIBOL',
    animationsBannerSubtitle:
      'Yono ota rẹ Ọghẹnẹ vẹ ighẹwẹ rẹ ibebe rẹ rha vwẹ otọ rẹ iku na.',
    searchAnimationsPlaceholder: 'Guọnọ ighẹwẹ rẹ ibebe...',
    clear: 'Rhuẹre',

    // Animation Detail
    linkCopied: 'A siobe na re!',
    shareVideo: 'Ghẹ ughẹwẹ',
    errorVideoNotFound: 'A mrẹ ughẹwẹ na-a',

    // Live Stream Screen
    liveStreamLoading: 'Uruẹme na cha...',
    liveStreamError: 'A sa mrẹ uruẹme na-a. Gwọlọ rhuẹre.',
    refreshFailed: 'A sa rhuẹre ọye-en',
    refreshFailedMsg: 'A sa rhuẹre uruẹme na-a',
    openLinkError: 'A sa rhiẹre ọye-en',
    loadingStream: 'Uruẹme na cha...',
    streamUnavailable: 'Uruẹme herọ-ọ',
    openInYouTube: 'Rhiẹre vwẹ YouTube',
    loadingHLSStream: 'HLS na cha...',
    hlsStreamUnavailable: 'HLS herọ-ọ',
    couldNotLoadStream: 'A sa rhiẹre uruẹme na-a',
    external: 'OBEFE',
    streamLabel: 'Uruẹme',
    tapToWatchYouTube: 'Dọn obotọ na rere wu nyo vwẹ YouTube',
    externalStreamExternalOnly: 'Uruẹme na sa rhiẹre vwẹ obefe ọvo',
    watchInBrowser: 'Nyo vwẹ Browser',
    checkConnectionRetry: 'Duvwẹ intanẹẹti wẹn rere wu gwọlọ rhuẹre.',
    retry: 'Gwọlọ rhuẹre',
    refreshing: 'O rhuẹre...',
    refreshStreams: 'Rhuẹre uruẹme na',
    liveLabel: 'ENUẸEN',
    offlineLabel: 'O HERỌ-Ọ',
    streamOffline: 'Uruẹme o herọ-ọ',
    streamNotActive: 'Uruẹme na o herọ-ọ ugbu na',
    streamTypeLabel: 'Oruẹme: ',
    noActiveStreams: 'Uruẹme vuọvo herọ-ọ',
    checkBackLaterLive: 'Kpahen rhe oke ọfa vwọ kẹ uruẹme rẹ enuẹen',
    refresh: 'Rhuẹre',
    unknown: 'Amọ ọye-en',

    // Archive Screen
    archiveBannerTitle: 'ASAN RẸ EKPAKO',
    archiveBannerSubtitle:
      'Wu cha mrẹ ifoto vẹ ighẹwẹ rẹ ekpako rẹ ẹga na vwẹ asan na.',
    pictures: 'Ifoto',
    videos: 'Ighẹwẹ',

    // Archive Videos Screen
    videoArchiveTitle: 'IGHẸWẸ RẸ EKPAKO',
    videoArchiveSubtitle: 'Asan na vwo ighẹwẹ rẹ uruẹme rẹ ekpako rẹ ẹga na.',
    untitledEvent: 'Uruẹme rẹ odẹ herọ-ọ',
    video: 'Ughẹwẹ',
    videos: 'Ighẹwẹ',
    noEventsFound: 'A mrẹ uruẹme vuọvo vwọ kpahen ota na-a',
    noVideosYet: 'Ighẹwẹ herọ-ọ ugbu na',

    // Archive Pictures Screen
    pictureArchiveTitle: 'IFOTO RẸ EKPAKO',
    pictureArchiveSubtitle: 'Ifoto rẹ ekpako rẹ uruẹme rẹ ẹga na.',
    untitledEvent: 'Uruẹme rẹ odẹ herọ-ọ',
    photo: 'Ifoto',
    photos: 'Ifoto',
    noEventsFound: 'A mrẹ uruẹme vuọvo-o',
    noPicturesYet: 'Ifoto herọ-ọ ugbu na',

    // Gallery Screen
    galleryNavTitle: 'Ifoto',
    galleryBannerTitle: 'IFOTO',
    galleryBannerSubtitle:
      'Wu cha mrẹ okrọ rẹ idibo rẹ Ọghẹnẹ vẹ ifoto rẹ uruẹme rẹ ẹga na vwẹ rassan ebuobuo.',
    ministers: 'Idibo rẹ Ọghẹnẹ',

    // Video Gallery Screen
    videoGalleryTitle: 'IGHẸWẸ RẸ IFOTO',
    videoGallerySubtitle: 'Uruẹme rẹ rassan rẹ anyi vwọ kẹ ughẹwẹ wẹn.',
    videoLabel: 'Ughẹwẹ',
    videosLabel: 'Ighẹwẹ',
    untitledEvent: 'Uruẹme rẹ odẹ herọ-ọ',
    noEventsFound: 'A mrẹ uruẹme vuọvo-o',
    noVideosYet: 'Ighẹwẹ herọ-ọ ugbu na',

    // Picture Gallery Screen
    pictureGalleryTitle: 'IFOTO RẸ UGHẸWẸ',
    pictureGallerySubtitle: 'Ifoto rẹ uruẹme rẹ rassan ebuobuo.',
    galleryNavTitle: 'Ifoto',
    photo: 'Ifoto',
    photos: 'Ifoto',
    untitledEvent: 'Uruẹme rẹ odẹ herọ-ọ',
    noEventsFound: 'A mrẹ uruẹme vuọvo-o',
    noPicturesYet: 'Ifoto herọ-ọ ugbu na',

    // Ministers Gallery Screen
    ministersNavTitle: 'Idibo rẹ Ọghẹnẹ',
    ministersBannerTitle: 'OKRỌ RẸ IDIBO RẸ ỌGHẸNẸ',
    ministersBannerSubtitle:
      'Okrọ rẹ idibo rẹ GKS. Mrẹ ọghọ vwọ kẹ otu rọ ga Ọghẹnẹ.',
    searchByName: 'Guọnọ vẹ odẹ...',
    unnamedMinister: 'Odibo rẹ odẹ herọ-ọ',
    ministerLabel: 'Odibo rẹ Ọghẹnẹ',
    devotedLabel: 'Otu rọ fuanfon',
    contactNotProvided: 'Odẹ herọ-ọ',

    // Quiz Resources Screen
    quizNavTitle: 'Ebe rẹ Onọ',
    quizSearchPlaceholder: 'Guọnọ vẹ odẹ, ukpe, yẹrẹ otu...',
    downloadPdf: 'Sio PDF rhe',
    details: 'Iku rọye',
    noResourcesFound: 'Ebe vuọvo herọ-ọ.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Iku rẹ Onọ',
    openStudyMaterial: 'Rhiẹre Ebe rẹ Eyono (PDF)',
    needClarification: 'Wu guọnọ eyono?',
    clarificationDesc:
      'Ọda fe wu vwo onọ vwọ kpahen ebe rẹ eyono na, se inunue rẹ anyi rere e cho wẹ.',
    askQuestion: 'Nọ Onọ',

    // Quiz Help Screen
    askHelpNavTitle: 'Se Anyi',
    haveQuestionFromTitle: 'Wu vwo onọ vwọ kpahen "{title}"?',
    provideDetailsHelp: 'Fi iku wẹnotọ rere anyi cho wẹ vwọ kpahen onọ na.',
    yourNameLabel: 'Odẹ Wẹn',
    enterFullNamePlaceholder: 'Sio odẹ wẹn eje',
    whatsappNumberLabel: 'Lamba rẹ WhatsApp',
    whatsappPlaceholder: 'kerẹ 08012345678',
    yourQuestionLabel: 'Onọ Wẹn',
    questionPlaceholder: 'Abọ vọ rọ rha wẹ ota?',
    submitQuestion: 'Rho Onọ Rhe',
    sending: 'O rho...',
    fillAllFields: 'Sio emu eje otọ',
    questionSentSuccess: 'A rho onọ rhe re. Inunue rẹ anyi cha se wẹ kpakpata.',
    questionSendError: 'A sa rho onọ rhe-e. Gwọlọ rhuẹre.',
    ok: 'O GBA',
    success: 'Obuefuon',
    error: 'Oshọ',

    // Notices Screen
    noticesNavTitle: 'Oghwọrọ',
    noTitle: 'Odẹ herọ-ọ',
    noMessage: 'Ota vuọvo herọ-ọ.',
    viewAttachedDoc: 'Mrẹ Obe rọ hẹ evun rọye',
    pdfFile: 'Obe rẹ PDF',
    noNoticesYet: 'Oghwọrọ vuọvo herọ-ọ ugbu na',

    // Contact Screen
    contactTitle: 'Se Anyi',
    getInTouch: 'Se Anyi Rhe',
    contactDesc:
      'O je anyi re anyi nyo nẹ obọ rẹ ovwan. Iruoro wẹn cha cho anyi.',
    namePlaceholder: 'Sio odẹ wẹn',
    emailPlaceholder: 'Sio imeeli wẹn',
    selectCategory: 'Die wu guọnọ nọ?',
    complaint: 'Eha',
    suggestion: 'Iruoro',
    request: 'Onyare',
    appreciation: 'Ẹwẹvwe',
    messagePlaceholder: 'Sio ota wẹn otọ...',
    sendMessage: 'Rho Ota Rhe',
    sendingMessage: 'O rho ota rhe...',
    thankYou: 'Wẹvwe!',
    contactSuccessMsg: 'A rho ota rhe re. Anyi wẹvwe kẹ iruoro wẹn.',
    returnToApp: 'Kpo App na',
    submitError: 'A sa rho ota rhe-e. Gwọlọ rhuẹre.',

    // About Screen
    aboutUsNav: 'Kpahen Anyi',
    churchName: "God's Kingdom Society",
    churchSlogan: '(Ẹga rẹ Ọghẹnẹ rọ hẹ Akpọ)',
    ourMission: 'Uruẹme rẹ Anyi',
    historyVision: 'Iku vẹ Eyẹ rẹ Anyi',
    coreBeliefs: 'Esegbuyota rẹ Anyi',
    connectWithUs: 'Se Anyi Rhe',
    developedBy: 'Otu rẹ HIGH-ER ENTERPRISES rhuẹre na',
    allRightsReserved: 'Emu eje ọye rẹ anyi.',
    churchMotto: 'Kpo usuon rẹ Ọghẹnẹ rẹ gba',

    // Not Found Screen
    notFoundTitle: 'Eshọ!',
    screenNotExist: 'Asan na o herọ-ọ.',
    goHome: 'Kpo uvunẹ!',

    // Navigation / Global Menu
    options: 'Efele',
    about: 'Kpahen Anyi',
    contact: 'Se Anyi',
    adminPanel: 'Ite rẹ Inunue',
  },

  //ISOKO TRANSLATIONS
  is: {
    // Navigation
    home: 'Oruọbe',
    hymns: 'Ile rẹ Ajiri',
    sermons: 'Owuhrẹ Ẹme Ọghẹnẹ',
    songs: 'Ile',
    animations: 'Ighẹwẹ Ebẹbe',
    profile: 'Okrọ Ohwo',
    music: 'Ilegbe',
    contact: 'Se Omai',
    about: 'Kpahe Omai',
    admin: 'Osẹri-Inunue',
    notices: 'Owhowho',
    quizresources: 'Ebe Enọ',
    live: 'Enuẹn',
    archive: 'Asan rẹ Ekpako',

    // Common
    search: 'Gwọlọ',
    play: 'Kporo',
    pause: 'Mudia',
    loading: 'O bi ziọ...',
    error: 'Thọ',
    save: 'Fiotọ',
    cancel: 'Siẹvwe',
    submit: 'Viè',
    login: 'Ruọuva',
    signup: 'Siobe-odẹ',
    logout: 'No-uva',
    email: 'Imeeli',
    password: 'Ome-asiri',
    name: 'Odẹ',
    message: 'Ome',
    noSermons: 'Owuhrẹ ọvo ọ rọ-ọ',
    noSongs: 'Ile ọvo e rọ-ọ',
    noVideos: 'Ighẹwẹ ọvo e rọ-ọ',
    noContent: 'Emuala ọvo e rọ-ọ',
    unknownDuration: 'Oke o re-e',
    unknownStyle: 'Uruemu o re-e',

    // Content
    duration: 'Oke',
    category: 'Otu',
    style: 'Uruemu',

    // Contact
    contactUs: 'Se Omai',
    contactDesc:
      'O weziri omai re ma yo nọ obọ rai. Viè eme rhe omai, ma te kpahe kẹ owhai kpakpata.',
    complaint: 'Eha',
    suggestion: 'Iroro',
    request: 'Ayare',
    selectCategory: 'Salọ Otu',

    // About
    aboutUs: 'Kpahe Omai',
    version: 'Oruẹme',
    mission: 'Iruo rẹ Omai',

    // Admin
    adminDashboard: 'Ofe rẹ Inunue',
    uploadContent: 'Fi Emuala Họ',
    manageContent: 'Sẹ Emuala',
    viewMessages: 'Rri Eme',
    addHymn: 'Fi Ile Ajiri Ba',
    addSermon: 'Fi Owuhrẹ Ba',
    uploadSong: 'Fi Ile Họ',
    uploadVideo: 'Fi Ighẹwẹ Họ',

    //onboarding
    skip: 'Vwrẹ',
    startBtn: 'MUHỌ',
    onboardingSubtitle1: 'Dọọ',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Ẹga rẹ Inievo nọ a gbe wuhrẹ uyota eme Ọghẹnẹ rọ kẹ usiwo Ọghẹnẹ.',
    onboardingSubtitle2: 'Ria vihọ evaọ eme Ọghẹnẹ vẹ',
    onboardingTitle2: 'Owuhrẹ Efuanfon',
    onboardingDesc2:
      'Mrẹ owuhrẹ GKS bẹbẹ evaọ obe, uyo, gbe ighẹwẹ re whọ yono eme Ọghẹnẹ wẹhẹ epanọ o rọ Baibol na.',
    onboardingSubtitle3: 'Ga Ọghẹnẹ vẹ',
    onboardingTitle3: 'Ile rẹ Ofuon',
    onboardingDesc3:
      'Kuomagbe inievo evaọ akpọ na soso re ma jiri Ọghẹnẹ gbe Kristi vẹ ile ajiri rẹ emuẹfuon.',
    onboardingSubtitle4: 'GWỌLỌ VIHỌ',
    onboardingTitle4: 'EFELE EFA',
    onboardingDesc4:
      'Yono eme Ọghẹnẹ vẹ ighẹwẹ ebẹbe, je rri ifoto gbe ighẹwẹ nọ e rọ asan ekpako ẹga na.',

    // Home Screen
    homeNavTitle: 'Ofuon',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Kpo Usuon Ọghẹnẹ nọ o Gba',
    heroDesc:
      'Se obe, yo uyo, je rria vihọ evaọ esegbuyota vẹ Ẹga Ọghẹnẹ rọ hẹ Akpọ.',
    exploreResources: 'Gwọlọ Ebe',
    homeCardTitleSongs: 'Ile Ajiri',
    homeCardSubtitleSongs: 'Ile efuanfon rẹ ẹga gbe iroro.',
    homeCardTitleSermons: 'Owuhrẹ Efuanfon',
    homeCardSubtitleSermons: 'Ria vihọ evaọ otọ eme Ọghẹnẹ nọ o gba.',
    homeCardTitleStories: 'Iku Baibol',
    homeCardSubtitleStories: 'Uruemu efuanfon vẹ iku emuẹfuon.',
    homeCardTitleArchive: 'Asan rẹ Ekpako',
    homeCardSubtitleArchive:
      'Gwọlọ iku ekpako gbe emu nọ e via evaọ oke nọ o vrẹ.',
    homeCardTitleGallery: 'Ifoto',
    homeCardSubtitleGallery: 'Ughẹwẹ ifoto rẹ inievo gbe idibo Ọghẹnẹ.',
    homeCardTitleQuiz: 'Ebe Enọ',
    homeCardSubtitleQuiz: 'Ebe eyono re whọ ria vihọ evaọ otọ eme.',
    homeCardTitleGiving: 'Igho-Ihwe gbe Inyare',
    homeCardSubtitleGiving: 'Fiobọ họ kẹ iruo GKS evaọ akpọ na soso.',
    homeCardTitleLive: 'Uruẹme Enuẹn',
    homeCardSubtitleLive: 'Yo ẹga gbe uruẹme evaọ oke nọ o be via.',

    // Sermons Main Screen
    sermonsBannerTitle: 'OWUHRẸ EFUANFON',
    sermonsBannerSubtitle: 'Mrẹ owuhrẹ evaọ ephẹrẹ sa-sa kpahe eme Ọghẹnẹ.',
    searchSermons: 'Gwọlọ owuhrẹ, eme, gbe otu...',
    textSermons: 'Eme Obe',
    readSermons: 'Nọ e rọ evun ebe gbe eme',
    audioClips: 'Uyo Owuhrẹ',
    listenSermons: 'Yo uyo owuhrẹ efuanfon',
    videoSermons: 'Ighẹwẹ Owuhrẹ',
    watchSermons: 'Rri uruẹme enuẹn gbe onọ a phioyotọ',
    dailyGuide: 'Omodero Kẹdẹ-kẹdẹ',
    dailyGuideSubtitle: 'Yono eme Ọghẹnẹ kẹdẹ-kẹdẹ',

    // Text Sermons Screen
    textSermonsBannerTitle: 'EME OBE',
    textSermonsBannerSubtitle: 'Se je yono eme Ọghẹnẹ vẹ eme obe nọ o gba.',
    searchPlaceholder: 'Gwọlọ eme...',
    subjectsCountLabel: 'eme',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Ome Ọkpọmako Obe 1',
    'Weekly Sermon Volume 2': 'Ome Ọkpọmako Obe 2',
    "God's Kingdom Advocate Volume 1": "God's Kingdom Advocate Obe 1",
    "God's Kingdom Advocate Volume 2": "God's Kingdom Advocate Obe 2",
    "God's Kingdom Advocate Volume 3": "God's Kingdom Advocate Obe 3",
    'Abridged Bible Subjects': 'Eme Baibol nọ a rhuẹre kpẹre',
    'The Ten Fundamental Truths': 'Uyota Idibo Ihwe',
    "GKS President's Feast Message": 'Ome Ẹrẹvwe Olori GKS',
    "GKS President's Freedom Day Message": 'Ome Ẹdẹ rẹ Usiwo Olori GKS',
    "GKS President's Youth Assembly Message": 'Ome Ighene Olori GKS',
    'Sermon Summaries': 'Eme rẹ Kpẹre',
    'Questions and Answers': 'Enọ gbe Ekpahọ',

    // Sermon Detail Screen
    sermonDetail: 'Iku Ome',
    sermonNotFound: 'A mrẹ owuhrẹ na-a',
    untitled: 'Odẹ o rọ-ọ',
    gksSermon: 'Owuhrẹ GKS',
    audioAssistant: 'Ocho-uyo',
    success: 'Obuefuon',
    copiedToClipboard: 'A siobe na no',
    audioError: 'Oshọ Uyo',
    audioPlayError: 'A sa kporo uyo na-a. Gwọlọ rhuẹre.',
    playbackControlError: 'A sa sẹ uyo na-a',
    part: 'Abọ',
    of: 'rẹ',

    // Audio Sermons Screen
    audioSermonsTitle: 'Uyo Owuhrẹ',
    audioSermonsBannerTitle: 'UYO OWUHRẸ',
    audioSermonsBannerSubtitle:
      'Yono eme Ọghẹnẹ vẹ uyo owuhrẹ nọ a rhuẹre kpahe ukpe.',
    noAudioSermons: 'Uyo owuhrẹ ọvo ọ rọ-ọ',
    unknownYear: 'Ukpe o re-e',
    sermonsCountPlural: 'eme',
    sermonCountSingular: 'ome',
    sermonsLabel: 'Eme',
    untitledSermon: 'Ome odẹ o rọ-ọ',
    noDate: 'Ẹdẹ o re-e',

    // Audio Player/Details Screen
    audioPlayer: 'Okporo Uyo',
    audioLoadError: 'Uyo na o sa rhe-e.',
    errorSermonNotFound: 'A mrẹ ome na-a hayo uyo ọ rọ-ọ.',
    permissionRequired: 'Ayare uphieyotọ',
    saveSermonPermission: 'Iviegbe fiobọ họ re a fion eme na kẹ waya ra.',
    sermonSaved: 'A fion ome na kẹ waya ra no!',
    fileSaveError: 'A sa fion obe na-a.',
    noTitle: 'Odẹ o rọ-ọ',
    unknownDate: 'Ẹdẹ o re-e',

    // Sermon Videos Screen
    videoSermonsTitle: 'Ighẹwẹ Owuhrẹ',
    videoPlural: 'ighẹwẹ',
    videoSingular: 'ughẹwẹ',
    loadingVideos: 'Ighẹwẹ na e bi ziọ...',
    noVideosInCategory: 'A mrẹ ughẹwẹ ọvo evaọ otu na-a',
    sermonVideosBannerTitle: 'IGHẸWẸ EME',
    sermonVideosBannerSubtitle: 'Rri ighẹwẹ eme nọ e rọ otu sa-sa.',
    searchSermonVideosPlaceholder: 'Gwọlọ ighẹwẹ eme...',
    clearSearch: 'Rhuẹre',
    sermonVideoCategoriesTitle: 'Otu Ighẹwẹ Eme',
    browseSermonsByCategory: 'Gwọlọ eme evaọ otu riẹ',
    searchResults: 'Emu nọ whọ mrẹre',
    noSermonVideosFound: 'A mrẹ ughẹwẹ eme ọvo-o',
    noSermonVideosAvailable: 'Ughẹwẹ eme ọvo ọ rọ-ọ',
    adjustSearchTerms: 'Gwọlọ rhuẹre eme nọ whọ be gwọlọ',
    checkBackLaterSermons: 'Kpahe rhe oke ọfa kẹ ighẹwẹ kpokpọ',
    loadingMoreVideos: 'Ighẹwẹ efa e bi ziọ...',
    watchNow: 'Rri Ugbu na',
    watch: 'Rri',

    // Video/Animation Detail
    linkCopied: 'A siobe na no!',
    shareSermonVideoLabel: 'Ughẹwẹ Ome',
    noCategory: 'Otu o rọ-ọ',
    shareSermonVideoTitle: 'Ghẹ ughẹwẹ ome',
    shareVideoTitle: 'Ghẹ ughẹwẹ',
    noTitle: 'Odẹ o rọ-ọ',
    unknownDate: 'Ẹdẹ o re-e',
    errorVideoNotFound: 'A mrẹ ughẹwẹ na-a',
    languageLabel: 'Ẹphẹrẹ',
    share: 'Ghẹ',

    // Daily Guide Screen
    dailyGuideTitle: 'Omodero Kẹdẹ-kẹdẹ',
    dailyDevotionalBanner: 'Ẹga Kẹdẹ-kẹdẹ',
    dailyDevotionalBannerSubtitle: 'Ko uruemu ra vẹ omodero kẹdẹ-kẹdẹ.',
    today: 'Nẹnẹ',
    yesterday: 'Ode',
    tomorrow: 'Odẹpha',
    loadingDevotional: 'Ẹga na o bi ziọ...',
    noDevotionalAvailable: 'Ẹga ọvo ọ rọ-ọ',
    checkBackFuture: 'Kpahe rhe oke ọfa kẹ ẹga kpokpọ',
    noDevotionalPast: 'Ẹga ọvo ọ rọ-ọ evaọ ẹdẹ na',
    recentDevotionals: 'Ẹga nọ e kẹle na',
    dailyDevotionalFallback: 'Ẹga Kẹdẹ-kẹdẹ',

    // Songs Screen
    songsNavTitle: 'Ile',
    songsBannerTitle: 'ILE AJIRI',
    songsBannerSubtitle:
      'Ga Ọghẹnẹ vẹ ile efuanfon nọ i re whuhrẹ esegbuyota ra.',
    featuredSongsTitle: 'Ile Ajiri rẹ Usuon Ọghẹnẹ',
    featuredSongsSubtitle: '(Ile Ajiri vẹ Zabura)',
    songsCountLabel: 'ile',
    seePlaylist: 'Mrẹ Ile na',

    // Music Screen
    searchSongsPlaceholder: 'Gwọlọ ile...',
    categoryLabel: 'Otu',
    songLoadError: 'A sa kporo ile na-a.',

    // Music Player Screen
    musicPlayerTitle: 'Okporo Ile',
    unknownCategory: 'Otu o re-e',
    permissionRequired: 'Ayare uphieyotọ',
    saveSongsPermission: 'Iviegbe fiobọ họ re a fion ile na kẹ waya ra.',
    songSavedSuccess: 'A fion ile na kẹ waya ra no!',
    saveFileError: 'A sa fion obe na-a.',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Ile Ajiri',
    hymnsBannerTitle: 'Ile Ajiri rẹ Usuon Ọghẹnẹ',
    hymnSearchPlaceholder: 'Gwọlọ vẹ lamba hayo odẹ',
    noHymnsFound: 'A mrẹ Ile Ajiri hayo Zabura ọvo-o.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Zabura',

    // Animations Screen
    watchNow: 'Rri Ugbu na',
    loadingMoreVideos: 'Ighẹwẹ efa e bi ziọ...',
    noVideosFound: 'A mrẹ ughẹwẹ ọvo-o',
    noAnimationsAvailable: 'Ighẹwẹ ebẹbe ọvo e rọ-ọ',
    adjustSearchTerms: 'Gwọlọ rhuẹre eme nọ whọ be gwọlọ',
    checkBackLater: 'Kpahe rhe oke ọfa kẹ emu kpokpọ',
    animationsBannerTitle: 'IKU BAIBOL',
    animationsBannerSubtitle:
      'Yono eme Ọghẹnẹ vẹ ighẹwẹ ebẹbe nọ e rria otọ iku na.',
    searchAnimationsPlaceholder: 'Gwọlọ ighẹwẹ ebẹbe...',
    clear: 'Rhuẹre',

    // Animation Detail
    linkCopied: 'A siobe na no!',
    shareVideo: 'Ghẹ ughẹwẹ',
    errorVideoNotFound: 'A mrẹ ughẹwẹ na-a',

    // Live Stream Screen
    liveStreamLoading: 'Uruẹme na o bi ziọ...',
    liveStreamError: 'A sa mrẹ uruẹme na-a. Gwọlọ rhuẹre.',
    refreshFailed: 'A sa rhuẹre iẹ-e',
    refreshFailedMsg: 'A sa rhuẹre uruẹme na-a',
    openLinkError: 'A sa rhiẹre iẹ-e',
    loadingStream: 'Uruẹme na o bi ziọ...',
    streamUnavailable: 'Uruẹme ọ rọ-ọ',
    openInYouTube: 'Rhiẹre evaọ YouTube',
    loadingHLSStream: 'HLS na o bi ziọ...',
    hlsStreamUnavailable: 'HLS ọ rọ-ọ',
    couldNotLoadStream: 'A sa rhiẹre uruẹme na-a',
    external: 'OBEFE',
    streamLabel: 'Uruẹme',
    tapToWatchYouTube: 'Kpare obotọ na re whọ rri evaọ YouTube',
    externalStreamExternalOnly: 'Uruẹme na o sa rhiẹre evaọ obefe ọvo',
    watchInBrowser: 'Rri evaọ Browser',
    checkConnectionRetry: 'Duvwẹ intanẹẹti ra re whọ gwọlọ rhuẹre.',
    retry: 'Gwọlọ rhuẹre',
    refreshing: 'O be rhuẹre...',
    refreshStreams: 'Rhuẹre uruẹme na',
    liveLabel: 'ENUẸN',
    offlineLabel: 'O RỌ-Ọ',
    streamOffline: 'Uruẹme o rọ-ọ',
    streamNotActive: 'Uruẹme na o rọ-ọ ugbu na',
    streamTypeLabel: 'Uruẹme: ',
    noActiveStreams: 'Uruẹme ọvo ọ rọ-ọ',
    checkBackLaterLive: 'Kpahe rhe oke ọfa kẹ uruẹme enuẹn',
    refresh: 'Rhuẹre',
    unknown: 'O re-e',

    // Archive Screen
    archiveBannerTitle: 'ASAN RẸ EKPAKO',
    archiveBannerSubtitle:
      'Whọ te mrẹ ifoto gbe ighẹwẹ ekpako rẹ ẹga na evaọ asan na.',
    pictures: 'Ifoto',
    videos: 'Ighẹwẹ',

    // Archive Videos Screen
    videoArchiveTitle: 'IGHẸWẸ EKPAKO',
    videoArchiveSubtitle: 'Ofe na o vwo ighẹwẹ uruẹme ekpako rẹ ẹga na.',
    untitledEvent: 'Uruẹme odẹ o rọ-ọ',
    video: 'Ughẹwẹ',
    videos: 'Ighẹwẹ',
    noEventsFound: 'A mrẹ uruẹme ọvo kpahe eme na-a',
    noVideosYet: 'Ighẹwẹ e rọ-ọ ugbu na',

    // Archive Pictures Screen
    pictureArchiveTitle: 'IFOTO EKPAKO',
    pictureArchiveSubtitle: 'Ifoto ekpako rẹ uruẹme rẹ ẹga na.',
    untitledEvent: 'Uruẹme odẹ o rọ-ọ',
    photo: 'Ifoto',
    photos: 'Ifoto',
    noEventsFound: 'A mrẹ uruẹme ọvo-o',
    noPicturesYet: 'Ifoto e rọ-ọ ugbu na',

    // Gallery Screen
    galleryNavTitle: 'Ifoto',
    galleryBannerTitle: 'IFOTO',
    galleryBannerSubtitle:
      'Whọ te mrẹ okrọ idibo Ọghẹnẹ gbe ifoto uruẹme ẹga na evaọ rassan sa-sa.',
    ministers: 'Idibo Ọghẹnẹ',

    // Video Gallery Screen
    videoGalleryTitle: 'IGHẸWẸ IFOTO',
    videoGallerySubtitle: 'Uruẹme rassan omai kẹ ughẹwẹ ra.',
    videoLabel: 'Ughẹwẹ',
    videosLabel: 'Ighẹwẹ',
    untitledEvent: 'Uruẹme odẹ o rọ-ọ',
    noEventsFound: 'A mrẹ uruẹme ọvo-o',
    noVideosYet: 'Ighẹwẹ e rọ-ọ ugbu na',

    // Picture Gallery Screen
    pictureGalleryTitle: 'IFOTO UGHẸWẸ',
    pictureGallerySubtitle: 'Ifoto uruẹme rassan sa-sa.',
    galleryNavTitle: 'Ifoto',
    photo: 'Ifoto',
    photos: 'Ifoto',
    untitledEvent: 'Uruẹme odẹ o rọ-ọ',
    noEventsFound: 'A mrẹ uruẹme ọvo-o',
    noPicturesYet: 'Ifoto e rọ-ọ ugbu na',

    // Ministers Gallery Screen
    ministersNavTitle: 'Idibo Ọghẹnẹ',
    ministersBannerTitle: 'OKRỌ IDIBO ỌGHẸNẸ',
    ministersBannerSubtitle:
      'Okrọ idibo GKS. Mrẹ ọghọ kẹ otu nọ a be ga Ọghẹnẹ.',
    searchByName: 'Gwọlọ vẹ odẹ...',
    unnamedMinister: 'Odibo odẹ o rọ-ọ',
    ministerLabel: 'Odibo Ọghẹnẹ',
    devotedLabel: 'Otu nọ o fuon',
    contactNotProvided: 'Odẹ o rọ-ọ',

    // Quiz Resources Screen
    quizNavTitle: 'Ebe Enọ',
    quizSearchPlaceholder: 'Gwọlọ vẹ odẹ, ukpe, hayo otu...',
    downloadPdf: 'Sio PDF rhe',
    details: 'Iku riẹ',
    noResourcesFound: 'Ebe ọvo e rọ-ọ.',

    // Quiz Detail Screen
    quizDetailNavTitle: 'Iku Enọ',
    openStudyMaterial: 'Rhiẹre Ebe Eyono (PDF)',
    needClarification: 'Whọ gwọlọ eyono?',
    clarificationDesc:
      'Otẹrọnọ whọ vwo onọ kpahe ebe eyono na, se inunue omai re ma cho owhẹ.',
    askQuestion: 'Nọ Onọ',

    // Quiz Help Screen
    askHelpNavTitle: 'Se Omai',
    haveQuestionFromTitle: 'Whọ vwo onọ kpahe "{title}"?',
    provideDetailsHelp: 'Fi iku ra họ re ma cho owhẹ kpahe onọ na.',
    yourNameLabel: 'Odẹ Ra',
    enterFullNamePlaceholder: 'Sio odẹ ra eje',
    whatsappNumberLabel: 'Lamba WhatsApp',
    whatsappPlaceholder: 'wẹhẹ 08012345678',
    yourQuestionLabel: 'Onọ Ra',
    questionPlaceholder: 'Abọ vọ nọ o be rẹ owhẹ ota?',
    submitQuestion: 'Viè Onọ Rhe',
    sending: 'O be viè...',
    fillAllFields: 'Sio emu eje họ',
    questionSentSuccess: 'A viè onọ rhe no. Inunue omai a te se owhẹ kpakpata.',
    questionSendError: 'A sa viè onọ rhe-e. Gwọlọ rhuẹre.',
    ok: 'O GBA',
    success: 'Obuefuon',
    error: 'Oshọ',

    // Notices Screen
    noticesNavTitle: 'Owhowho',
    noTitle: 'Odẹ o rọ-ọ',
    noMessage: 'Ome ọvo ọ rọ-ọ.',
    viewAttachedDoc: 'Mrẹ Obe nọ o rọ evun riẹ',
    pdfFile: 'Obe PDF',
    noNoticesYet: 'Owhowho ọvo ọ rọ-ọ ugbu na',

    // Contact Screen
    contactTitle: 'Se Omai',
    getInTouch: 'Se Omai Rhe',
    contactDesc: 'O weziri omai re ma yo nọ obọ rai. Iroro ra i te cho omai.',
    namePlaceholder: 'Sio odẹ ra',
    emailPlaceholder: 'Sio imeeli ra',
    selectCategory: 'Die whọ gwọlọ nọ?',
    complaint: 'Eha',
    suggestion: 'Iroro',
    request: 'Ayare',
    appreciation: 'Ẹwẹvwe',
    messagePlaceholder: 'Sio ome ra họ...',
    sendMessage: 'Viè Ome Rhe',
    sendingMessage: 'O be viè ome rhe...',
    thankYou: 'Ẹwẹvwe!',
    contactSuccessMsg: 'A viè ome rhe no. Ma wẹvwe kẹ iroro ra.',
    returnToApp: 'Kpo App na',
    submitError: 'A sa viè ome rhe-e. Gwọlọ rhuẹre.',

    // About Screen
    aboutUsNav: 'Kpahe Omai',
    churchName: "God's Kingdom Society",
    churchSlogan: '(Ẹga Ọghẹnẹ rọ hẹ Akpọ)',
    ourMission: 'Iruo Omai',
    historyVision: 'Iku vẹ Eyẹ Omai',
    coreBeliefs: 'Esegbuyota Omai',
    connectWithUs: 'Se Omai Rhe',
    developedBy: 'Otu HIGH-ER ENTERPRISES a rhuẹre iẹe',
    allRightsReserved: 'Emu eje ọ rẹ omai.',
    churchMotto: 'Kpo usuon Ọghẹnẹ nọ o gba',

    // Not Found Screen
    notFoundTitle: 'Eshọ!',
    screenNotExist: 'Asan na o rọ-ọ.',
    goHome: 'Kpo oruọbe!',

    // Navigation / Global Menu
    options: 'Efele',
    about: 'Kpahe Omai',
    contact: 'Se Omai',
    adminPanel: 'Ofe Inunue',
  },

  //ITSEKIRI TRANSLATIONS
  its: {
    // Navigation
    home: 'Uli',
    hymns: 'Ogun rẹ Ofun',
    sermons: 'Olukọ-ẹyọ',
    songs: 'Ogun',
    animations: 'Iworan-ebẹbe',
    profile: 'Ipo Mi',
    music: 'Ogun-ebẹbe',
    contact: 'Kan si Wa',
    about: 'Nipa Wa',
    admin: 'Olori',
    notices: 'Ifilo',
    quizresources: 'Eko rẹ Onọ',
    live: 'Oju-afẹfẹ',
    archive: 'Ile-atọjọ',

    // Common
    search: 'Guọmọ',
    play: 'Tẹ',
    pause: 'Duro',
    loading: 'O n bọ...',
    error: 'Aṣiṣe',
    save: 'Tọju',
    cancel: 'Fagile',
    submit: 'Firanṣẹ',
    login: 'Wọle',
    signup: 'Forukọsilẹ',
    logout: 'Jade',
    email: 'Imeeli',
    password: 'Ọrọ-aṣiri',
    name: 'Orukọ',
    message: 'Iṣẹ',
    noSermons: 'Olukọ kankan ko si',
    noSongs: 'Ogun kankan ko si',
    noVideos: 'Iworan kankan ko si',
    noContent: 'Kofo ni',
    unknownDuration: 'Akoko aimọ',
    unknownStyle: 'Iru aimọ',

    // Content
    duration: 'Akoko',
    category: 'Isọri',
    style: 'Iru rẹ',

    // Contact
    contactUs: 'Kan si Wa',
    contactDesc:
      'O ma jọ wa loju lati gbọ lati ọdọ rẹ. Firanṣẹ si wa, a o si dahun ni kete.',
    complaint: 'Ẹsun',
    suggestion: 'Ababa',
    request: 'Ibere',
    selectCategory: 'Yan Isọri',

    // About
    aboutUs: 'Nipa Wa',
    version: 'Iru',
    mission: 'Iṣẹ Wa',

    // Admin
    adminDashboard: 'Oju-ewe Olori',
    uploadContent: 'Gbe Nkan Soke',
    manageContent: 'Se Atọju Nkan',
    viewMessages: 'Wo Iṣẹ',
    addHymn: 'Fi Ogun Kun',
    addSermon: 'Fi Olukọ Kun',
    uploadSong: 'Gbe Ogun Soke',
    uploadVideo: 'Gbe Iworan Soke',

    //onboarding
    skip: 'Rekọja',
    startBtn: 'BẸRẸ',
    onboardingSubtitle1: 'Kabọ si',
    onboardingTitle1: "God's Kingdom Society",
    onboardingDesc1:
      'Ẹgbẹ Onigbagbọ nibiti a ti n kọ otitọ ọrọ Ọlọrun fun igbala Ọlọrun.',
    onboardingSubtitle2: 'Dagba ninu ọrọ Ọlọrun pẹlu',
    onboardingTitle2: 'Olukọ-ẹyọ Mimọ',
    onboardingDesc2:
      'Wọle si eko GKS ni irọrun ninu iwe, ohun ati iworan lati kọ ẹkọ ọrọ Ọlọrun bi o ti wa ninu Bibeli.',
    onboardingSubtitle3: 'Sin Ọlọrun pẹlu',
    onboardingTitle3: 'Ogun Ore-ọfẹ',
    onboardingDesc3:
      'Darapọ mọ awọn onigbagbọ ni agbaye lati bọla fun Ọlọrun ati Kristi pẹlu ogun iyin.',
    onboardingSubtitle4: 'GUỌMỌ SIWAJU',
    onboardingTitle4: 'NKAN MIIRAN',
    onboardingDesc4:
      'Kọ ẹkọ ọrọ Ọlọrun pẹlu iworan-ebẹbe, ki o si wo aworan ati iworan lati ile-atọjọ ijọ.',

    // Home Screen
    homeNavTitle: 'Ore-ọfẹ',
    heroLabel: "GOD'S KINGDOM SOCIETY",
    heroTitle: 'Si Ijọba Pipe ti Ọlọrun',
    heroDesc: 'Ka, gbọ ohun, ki o si dagba ninu igbagbọ pẹlu Ijọ Ọlọrun Alaye.',
    exploreResources: 'Guọmọ Nkan Eko',
    homeCardTitleSongs: 'Ogun Iyin',
    homeCardSubtitleSongs: 'Ogun mimọ fun ijọsin ati iṣaro.',
    homeCardTitleSermons: 'Olukọ-ẹyọ Mimọ',
    homeCardSubtitleSermons: 'Jinlẹ ninu oye pẹlu ẹkọ Bibeli.',
    homeCardTitleStories: 'Itan Bibeli',
    homeCardSubtitleStories: 'Iwa giga ti ẹmi pẹlu itan aladun.',
    homeCardTitleArchive: 'Ile-atọjọ',
    homeCardSubtitleArchive: 'Ṣawari awọn igbasilẹ itan ati iṣẹlẹ ti o kọja.',
    homeCardTitleGallery: 'Aworan',
    homeCardSubtitleGallery: 'Irin-ajo aworan pẹlu awọn iranṣẹ Ọlọrun.',
    homeCardTitleQuiz: 'Eko rẹ Onọ',
    homeCardSubtitleQuiz: 'Nkan ikẹkọ lati mu imọ rẹ pọ si.',
    homeCardTitleGiving: 'Idameji ati Ọrẹ',
    homeCardSubtitleGiving: 'Se atilẹhin fun iṣẹ GKS ni agbaye.',
    homeCardTitleLive: 'Oju-afẹfẹ',
    homeCardSubtitleLive: 'Darapọ mọ ijọsin ni akoko gidi.',

    // Sermons Main Screen
    sermonsBannerTitle: 'OLUKỌ-ẸYỌ MIMỌ',
    sermonsBannerSubtitle:
      'Wọle si awọn eko iwuri ni ede oriṣiriṣi fun ọrọ Ọlọrun.',
    searchSermons: 'Wa olukọ, koko-ọrọ, tabi isọri...',
    textSermons: 'Olukọ rẹ Iwe',
    readSermons: 'Ti a ṣeto nipasẹ iwọn ati koko-ọrọ',
    audioClips: 'Ohun rẹ Olukọ',
    listenSermons: 'Gbọ ohun olukọ mimọ',
    videoSermons: 'Iworan rẹ Olukọ',
    watchSermons: 'Wo awọn akoko lori afẹfẹ',
    dailyGuide: 'Atọka Ojoojumọ',
    dailyGuideSubtitle: 'Se iwadi ọrọ Ọlọrun lojoojumọ',

    // Text Sermons Screen
    textSermonsBannerTitle: 'OLUKỌ RẸ IWE',
    textSermonsBannerSubtitle: 'Ka ki o si kẹkọọ ọrọ Ọlọrun pẹlu eko kikun.',
    searchPlaceholder: 'Wa olukọ...',
    subjectsCountLabel: 'koko-ọrọ',

    // Sermon Categories
    'Weekly Sermon Volume 1': 'Olukọ Ọsẹ Iwọn 1',
    'Weekly Sermon Volume 2': 'Olukọ Ọsẹ Iwọn 2',
    "God's Kingdom Advocate Volume 1": 'Olugbeja Ijọba Ọlọrun Iwọn 1',
    'The Ten Fundamental Truths': 'Otitọ Ipilẹ Mẹwa',
    "GKS President's Feast Message": 'Iṣẹ Àjọyọ̀ ti Ààrẹ GKS',

    // Sermon Detail Screen
    sermonDetail: 'Ekunrere Olukọ',
    sermonNotFound: 'A ko ri eko naa',
    untitled: 'Ko ni akọle',
    gksSermon: 'Olukọ GKS',
    audioAssistant: 'Oluranlowo Ohun',
    success: 'Aṣeyọri',
    copiedToClipboard: 'A ti daakọ rẹ',
    audioError: 'Aṣiṣe Ohun',
    part: 'Apa',
    of: 'ninu',

    // Audio Sermons Screen
    audioSermonsTitle: 'Ohun rẹ Olukọ',
    audioSermonsBannerTitle: 'OHUN RẸ OLUKỌ',
    audioSermonsBannerSubtitle:
      'Kọ ẹkọ ọrọ Ọlọrun pẹlu ohun, ti a ṣeto nipasẹ ọdun.',
    noAudioSermons: 'Ko si ohun kankan ninu rẹ',
    unknownYear: 'Aimọ',
    sermonsCountPlural: 'eko',
    sermonsLabel: 'Eko',

    // Audio Player/Details Screen
    audioPlayer: 'Ẹrọ Ohun',
    audioLoadError: 'Asise gbigbe ohun jade.',
    errorSermonNotFound: 'A ko ri ohun naa.',
    permissionRequired: 'Aaye nilo',
    sermonSaved: 'A ti tọju eko sori phone rẹ!',
    noTitle: 'Ko ni Akọle',

    // Sermon Videos Screen
    videoSermonsTitle: 'Iworan rẹ Olukọ',
    loadingVideos: 'O n gbe iworan jade...',
    noVideosInCategory: 'A ko ri iworan kankan ni isọri yi',
    sermonVideosBannerTitle: 'IWORAN RẸ OLUKỌ',
    sermonVideosBannerSubtitle: 'Wo awọn iworan eko ti a ṣeto nipasẹ isọri.',
    searchSermonVideosPlaceholder: 'Wa iworan olukọ...',
    watchNow: 'Wo Nisisiyi',
    watch: 'Wo',

    // Video/Animation Detail
    linkCopied: 'A ti daakọ rẹ!',
    shareSermonVideoLabel: 'Iworan rẹ Olukọ',
    noCategory: 'Ko si isọri',
    shareVideoTitle: 'Pin Iworan',
    languageLabel: 'Ede',
    share: 'Pin',

    // Daily Guide Screen
    dailyGuideTitle: 'Atọka Ojoojumọ',
    dailyDevotionalBanner: 'Ẹsin Ojoojumọ',
    dailyDevotionalBannerSubtitle: 'Mú ọkàn rẹ sọjí lojoojúmọ́.',
    today: 'Oni',
    yesterday: 'Aná',
    tomorrow: 'Ọ̀la',
    noDevotionalAvailable: 'Ko si Ẹsin lọwọ',
    recentDevotionals: 'Ẹsin To Nẹẹti',

    // Songs Screen
    songsNavTitle: 'Ogun',
    songsBannerTitle: 'OGUN IYIN',
    songsBannerSubtitle: 'Sin pẹlu ogun ẹmi ti o n gbe ọkan soke.',
    featuredSongsTitle: 'Ogun Iyin ti Ọlọrun',
    featuredSongsSubtitle: '(Zabura ati Ogun Iyin)',
    songsCountLabel: 'ogun',
    seePlaylist: 'Wo Atẹle Ogun',

    // Music Player Screen
    musicPlayerTitle: 'Ẹrọ Ogun',
    unknownCategory: 'Isọri aimọ',
    songSavedSuccess: 'A ti tọju ogun sori phone rẹ!',

    // Hymns/Psalms Screen
    hymnsNavTitle: 'Ogun rẹ Ofun',
    hymnsBannerTitle: 'Ogun Iyin ti Ọlọrun',
    hymnSearchPlaceholder: 'Wa pẹlu nọmba tabi akọle',
    noHymnsFound: 'A ko ri Ogun tabi Zabura kankan.',
    tspPrefix: 'TSP',
    psalmPrefix: 'Zabura',

    // Animations Screen
    animationsBannerTitle: 'ITAN BIBELI',
    animationsBannerSubtitle: 'Kọ ẹkọ pẹlu iworan ti o mu itan Bibeli sọjí.',
    searchAnimationsPlaceholder: 'Wa iworan-ebẹbe...',

    // Live Stream Screen
    liveStreamLoading: 'O n gbe jade...',
    streamUnavailable: 'Iṣẹlẹ ko si lọwọ',
    openInYouTube: 'Ṣii ni YouTube',
    external: 'LODE',
    streamLabel: 'Iṣẹlẹ',
    watchInBrowser: 'Wo ninu Browser',
    liveLabel: 'OJU-AFẸFẸ',
    offlineLabel: 'KO SI NI AFẸFẸ',
    noActiveStreams: 'Ko si nkan lọwọ',
    refresh: 'Tun sọji',

    // Archive Screen
    archiveBannerTitle: 'ILE-ATỌJỌ',
    archiveBannerSubtitle:
      'Nibi ni iwọ yoo ti ri aworan ati iworan ti iṣẹlẹ atijọ.',
    pictures: 'Aworan',
    videos: 'Iworan',

    // Gallery Screen
    galleryNavTitle: 'Aworan',
    galleryBannerTitle: 'AWORAN',
    galleryBannerSubtitle: 'Nibi ni iwọ yoo ti ri profaili awọn iranṣẹ Ọlọrun.',
    ministers: 'Awọn Iranṣẹ',

    // Quiz Resources Screen
    quizNavTitle: 'Eko rẹ Onọ',
    quizSearchPlaceholder: 'Wa pẹlu akọle tabi ọdun...',
    downloadPdf: 'Gba PDF',
    details: 'Ekunrere',

    // Quiz Help Screen
    askHelpNavTitle: 'Beere fun Iranlọwọ',
    yourNameLabel: 'Orukọ Rẹ',
    whatsappNumberLabel: 'Lamba WhatsApp',
    yourQuestionLabel: 'Ibeere Rẹ',
    submitQuestion: 'Firanṣẹ Ibeere',
    ok: 'O DARA',

    // Notices Screen
    noticesNavTitle: 'Ifilo',
    noMessage: 'Ko si ifilo kankan.',
    pdfFile: 'Iwe PDF',

    // Contact Screen
    contactTitle: 'Kan si Wa',
    getInTouch: 'Ba Wa Sọrọ',
    namePlaceholder: 'Tẹ orukọ rẹ',
    emailPlaceholder: 'Tẹ imeeli rẹ',
    messagePlaceholder: 'Kọ sako rẹ si ibi...',
    sendMessage: 'Firanṣẹ Sako',
    thankYou: 'E ṣeun!',

    // About Screen
    aboutUsNav: 'Nipa Wa',
    churchName: "God's Kingdom Society",
    churchSlogan: '(Ijọ Ọlọrun Alaye)',
    ourMission: 'Iṣẹ Wa',
    allRightsReserved: 'Gbogbo ẹtọ wa ni ipamọ.',
    churchMotto: 'Si ijọba pipe ti Ọlọrun',

    // Not Found Screen
    notFoundTitle: 'Ewo!',
    screenNotExist: 'Oju-ewe yi ko si.',
    goHome: 'Pada si uli!',

    // Navigation / Global Menu
    options: 'Awọn aṣayan',
    adminPanel: 'Igbimọ Olori',
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
