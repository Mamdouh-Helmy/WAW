import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const translations = {
  ar: {
    nav: {
      home: 'الرئيسية',
      tech: 'تكنولوجي',
      horizons: 'ثقافي',
      social: 'اجتماعي',
      podcast: 'بودكاست',
    },
    tags: {
      aboutReports: 'عن التقارير',
      ai: 'الذكاء الاصطناعي',
      robot: 'روبوت',
      saudi23: 'السعودية ٢٣',
      economy: 'اقتصاد ورقمية',
      programs: 'برامج',
      arabicCinema: 'السينما العربية',
    },
    hero: {
      slide1: { category: 'تكنولوجيا', title: 'دبي تستعد لاستضافة أكبر حدث تقني في المنطقة ومستقبل الذكاء الاصطناعي', time: 'قبل ٤ ساعات' },
      slide2: { category: 'آفاق', title: 'أزمة تمويل تلوح في وول ستريت.. هل تهدد الشركات والوظائف؟', time: 'قبل ٦ ساعات' },
      slide3: { category: 'اجتماعي', title: 'صناعة المحتوى الرقمي وتأثيرها على الشباب في العصر الحديث', time: 'قبل ساعتين' },
    },
    mediaCards: {
      video: 'فيديو', images: 'صور', article: 'مقال',
      card1: 'من أين العزة والكرامة؟ شهادات من عهد الصحابة في الشرق الأوسط',
      card2: 'عطر من الماضي ينتعش في الأسواق الحديثة بتركيبة فريدة',
      card3: 'الذكاء الاصطناعي يقرأ العقول بدقة تفوق التوقعات العلمية',
      card4: 'السيارات الكهربائية تسيطر على معارض جنيف في مفاجأة كبرى',
      card5: 'احتجاجات واسعة تجتاح عدة عواصم حول العالم وسط أزمة غلاء',
      card6: 'الهواتف الذكية تكتسب ميزات جديدة في الجيل القادم',
    },
    loadMore: 'تحميل المزيد',
    podcasts: {
      title: 'بودكاست',
      ep: 'الحلقة',
      episode1: { number: '٧٤', title: 'ما مدى تأثير التوتر النفسي والاجتماعي', host: 'أحمد علي', duration: '١٢ دقيقة' },
      episode2: { number: '٢٤', title: 'مستقبل التقنية مع ثورة الذكاء الاصطناعي', host: 'خديجة حسن', duration: '٤٥ دقيقة' },
      episode3: { number: '٥', title: 'حوارات ثقافية: الهوية العربية في عصر العولمة', host: 'محمود زيد', duration: '٣٠ دقيقة' },
    },
    articles: {
      title: 'مقالات', viewAll: 'عرض الكُل',
      article1: 'كيف تغير وسائل التواصل الاجتماعي مستقبل الإعلام؟',
      article2: 'صناعة المحتوى الرقمي: فرص وتحديات أمام الجيل الصاعد',
      article3: 'مستقبل الإعلام الرقمي في العالم العربي بين الواقع والمأمول',
    },
    mostRead: {
      title: 'الأكثر رواجًا',
      item1: 'ترامب: هرمز مفتوح.. لكن الحصار على إيران مستمر',
      item2: 'فتح هرمز يضغط النفط ويرفع وول ستريت',
      item3: 'منزل مارادونا.. ملجأ الفقراء في الأرجنتين',
      item4: 'من جورج إلى إليزابيث وتشارلز.. كيف ترمم لندن صدع أميركا؟',
      categories: { politics: 'سياسة', business: 'مال واعمال', football: 'كرة قدم', diplomacy: 'دبلوماسية' },
    },
    footer: {
      description: 'منصة إخبارية إعلامية متخصصة في نقل الحقائق وبث الوعي في العالم العربي بكل حيادية وشفافية.',
      copyright: 'جميع الحقوق محفوظة واو © ٢٠٢٦',
      explore: 'استكشف', importantLinks: 'روابط هامة',
      about: 'عن واو', terms: 'شروط الخدمة', privacy: 'سياسة الخصوصية',
      cookies: 'ملفات تعريف الارتباط', contact: 'تواصل معنا',
    },
    categories: { tech: 'تكنولوجيا', horizons: 'ثقافي', social: 'اجتماعي', home: 'عام', podcast: 'بودكاست' , documentary : 'عام' },
    reels: {
      title: 'فيديوهات قصيرة', previous: 'السابق', next: 'التالي',
      watchOnYoutube: 'مشاهدة على يوتيوب', back: 'رجوع',
      views: 'مشاهدة', noDescription: 'لا يوجد وصف لهذه الفقرة',
      shortClip: 'فيديوهات قصيرة', otherClips: 'فيديوهات قصيرة أخرى',
    },
  },

  en: {
    nav: {
      home: 'Home', tech: 'Technology', horizons: 'Cultural', social: 'Social', podcast: 'Podcast',
    },
    tags: {
      aboutReports: 'About Reports', ai: 'Artificial Intelligence', robot: 'Robot',
      saudi23: 'Saudi 23', economy: 'Economy & Digital', programs: 'Programs', arabicCinema: 'Arabic Cinema',
    },
    hero: {
      slide1: { category: 'Technology', title: 'Dubai Prepares to Host the Largest Tech Event in the Region and the Future of AI', time: '4 hours ago' },
      slide2: { category: 'Cultural', title: 'Funding Crisis Looms on Wall Street.. Does it Threaten Companies and Jobs?', time: '6 hours ago' },
      slide3: { category: 'Social', title: 'Digital Content Creation and Its Impact on Youth in the Modern Era', time: '2 hours ago' },
    },
    mediaCards: {
      video: 'Video', images: 'Images', article: 'Article',
      card1: 'Where is Dignity and Honor? Testimonies from the Era of Companions in the Middle East',
      card2: 'A Scent from the Past Revives in Modern Markets with a Unique Formula',
      card3: 'AI Reads Minds with Accuracy Exceeding Scientific Expectations',
      card4: 'Electric Cars Dominate Geneva Shows in a Major Surprise',
      card5: 'Widespread Protests Sweep Several Capitals Amid Inflation Crisis',
      card6: 'Smartphones Gain New Features in the Next Generation',
    },
    loadMore: 'Load More',
    podcasts: {
      title: 'Podcast',
      ep: 'Episode',
      episode1: { number: '74', title: 'The Impact of Psychological and Social Stress', host: 'Ahmed Ali', duration: '12 minutes' },
      episode2: { number: '24', title: 'The Future of Technology with the AI Revolution', host: 'Khadija Hassan', duration: '45 minutes' },
      episode3: { number: '5', title: 'Cultural Dialogues: Arab Identity in the Age of Globalization', host: 'Mahmoud Zaid', duration: '30 minutes' },
    },
    articles: {
      title: 'Articles', viewAll: 'View All',
      article1: 'How Social Media is Changing the Future of Media?',
      article2: 'Digital Content Creation: Opportunities and Challenges for the Rising Generation',
      article3: 'The Future of Digital Media in the Arab World Between Reality and Hope',
    },
    mostRead: {
      title: 'Most Read',
      item1: 'Trump: Hormuz Open.. But Sanctions on Iran Continue',
      item2: 'Opening Hormuz Pressures Oil and Lifts Wall Street',
      item3: "Maradona's House.. Shelter for the Poor in Argentina",
      item4: 'From George to Elizabeth and Charles.. How Does London Repair America\'s Rift?',
      categories: { politics: 'Politics', business: 'Business', football: 'Football', diplomacy: 'Diplomacy' },
    },
    footer: {
      description: 'A specialized news and media platform dedicated to conveying facts and spreading awareness in the Arab world with neutrality and transparency.',
      copyright: 'All Rights Reserved WAW © 2026',
      explore: 'Explore', importantLinks: 'Important Links',
      about: 'About WAW', terms: 'Terms of Service', privacy: 'Privacy Policy',
      cookies: 'Cookie Policy', contact: 'Contact Us',
    },
    categories: { tech: 'Technology', horizons: 'Cultural', social: 'Social', home: 'General', podcast: 'Podcast' },
    reels: {
      title: 'Short Clips', previous: 'Previous', next: 'Next',
      watchOnYoutube: 'Watch on YouTube', back: 'Back',
      views: 'views', noDescription: 'No description available',
      shortClip: 'Short Clip', otherClips: 'Other Short Clips',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('waw-language') || 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    localStorage.setItem('waw-language', language);
  }, [language, dir]);

  const toggleLanguage = () => setLanguage(prev => prev === 'ar' ? 'en' : 'ar');

  const value = {
    language,
    lang: language,
    dir,
    toggleLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};