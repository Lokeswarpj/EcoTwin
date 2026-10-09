export type LanguageCode = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr' | 'ml' | 'dual';

export interface RegionalLanguageInfo {
  code: LanguageCode;
  name: string;
  native: string;
}

export const CITY_REGIONAL_MAP: Record<string, RegionalLanguageInfo> = {
  Bengaluru: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  Delhi: { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  Hyderabad: { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  Chennai: { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  Mumbai: { code: 'mr', name: 'Marathi', native: 'मराठी' },
  Kochi: { code: 'ml', name: 'Malayalam', native: 'മലയാളം' }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'dual' as LanguageCode, name: 'Dual Mode', native: 'English + Regional' },
  { code: 'en' as LanguageCode, name: 'English', native: 'English' },
  { code: 'hi' as LanguageCode, name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn' as LanguageCode, name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te' as LanguageCode, name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta' as LanguageCode, name: 'Tamil', native: 'தமிழ்' },
  { code: 'mr' as LanguageCode, name: 'Marathi', native: 'मराठी' },
  { code: 'ml' as LanguageCode, name: 'Malayalam', native: 'മലയാളം' }
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  // Navigation & Hero
  'app.title': {
    en: 'EcoTwin',
    hi: 'इकोट्विन (EcoTwin)',
    kn: 'ಇಕೋಟ್ಯ್ವಿನ್ (EcoTwin)',
    te: 'ఎకోట్విన్ (EcoTwin)',
    ta: 'எகோட்வின் (EcoTwin)',
    mr: 'इकोट्विन (EcoTwin)',
    ml: 'എക്കോട്വിൻ (EcoTwin)'
  },
  'nav.autopilot': {
    en: 'Launch Autopilot',
    hi: 'ऑटोपायलट शुरू करें',
    kn: 'ಆಟೋಪೈಲಟ್ ಪ್ರಾರಂಭಿಸಿ',
    te: 'ఆటోపైలట్ ప్రారంభించండి',
    ta: 'ஆட்டோபைலட்டைத் தொடங்கு',
    mr: 'ऑटोपायलट सुरू करा',
    ml: 'ഓട്ടോപൈലറ്റ് ആരംഭിക്കുക'
  },
  'hero.title': {
    en: 'Your Planet Budget, run by an AI Autopilot.',
    hi: 'आपका गृह बजट, AI ऑटोपायलट द्वारा संचालित।',
    kn: 'ನಿಮ್ಮ ಭೂಮಿ ಬಜೆಟ್, AI ಆಟೋಪೈಲಟ್‌ನಿಂದ ನಿರ್ವಹಿಸಲಾಗಿದೆ.',
    te: 'మీ ప్లానెట్ బడ్జెట్, AI ఆటోపైలట్ చేత నిర్వహించబడుతుంది.',
    ta: 'உங்கள் பூமி பட்ஜெட், AI ஆட்டோபைலட்டால் இயக்கப்படுகிறது.',
    mr: 'तुमचे पृथ्वी बजेट, AI ऑटोपायलट द्वारे संचालित.',
    ml: 'നിങ്ങളുടെ പ്ലാനറ്റ് ബജറ്റ്, AI ഓട്ടോപൈലറ്റ് നിയന്ത്രിക്കുന്നു.'
  },
  'hero.subtitle': {
    en: 'One score for your daily carbon, waste, and water. Driven by cooperating Gemini AI agents to keep your lifestyle within planetary boundaries.',
    hi: 'आपके दैनिक कार्बन, अपशिष्ट और पानी के लिए एक समग्र स्कोर। ग्रह की 1.5°C सीमाओं में रहने के लिए जेमिनी AI एजेंट्स द्वारा संचालित।',
    kn: 'ನಿಮ್ಮ ದೈನಂದಿನ ಇಂಗಾಲ, ತ್ಯಾಜ್ಯ ಮತ್ತು ನೀರಿಗೆ ಒಂದೇ ಸ್ಕೋರ್. ಗ್ರಹದ ಮಿತಿಗಳಲ್ಲಿ ಬದುಕಲು ಜೆಮಿನಿ AI ಏಜೆಂಟ್‌ಗಳಿಂದ ನಿರ್ವಹಣೆ.',
    te: 'మీ రోజువారీ కార్బన్, వ్యర్థాలు మరియు నీటికి ఒకే స్కోర్. పర్యావరణ పరిమితుల్లో జీవించడానికి జెమినీ AI ఏజెంట్స్ సహాయం.',
    ta: 'உங்கள் தினசரி கார்பன், கழிவு மற்றும் நீருக்கான ஒற்றை மதிப்பெண். ஜெமினி AI முகவர்களால் வழிநடத்தப்படுகிறது.',
    mr: 'तुमच्या दैनंदिन कार्बन, कचरा आणि पाण्यासाठी एकच स्कोअर. जीवनशैली मर्यादेत ठेवण्यासाठी जेमिनी AI एजंट्स मदत करतात.',
    ml: 'നിങ്ങളുടെ ദൈനംദിന കാർബൺ, മാലിന്യം, വെള്ളം എന്നിവയ്ക്കായി ഒരു സ്കോർ. ജെമിനി AI ഏജന്റുകൾ നിയന്ത്രിക്കുന്നു.'
  },
  'hero.btn.scan': {
    en: 'Snap & Scan Item',
    hi: 'फ़ोटो लें और स्कैन करें',
    kn: 'ಫೋಟೋ ತೆಗೆದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    te: 'ఫోటో తీసి స్కాన్ చేయండి',
    ta: 'படம் எடுத்து ஸ்கேன் செய்',
    mr: 'फोटो काढा आणि स्कॅन करा',
    ml: 'ഫോട്ടോ എടുത്ത് സ്കാൻ ചെയ്യുക'
  },
  'hero.btn.demo': {
    en: 'View Live Demo',
    hi: 'लाइव डेमो देखें',
    kn: 'ಲೈವ್ ಡೆಮೊ ವೀಕ್ಷಿಸಿ',
    te: 'లైవ్ డెమో చూడండి',
    ta: 'நேரடி டெமோ காண்க',
    mr: 'थेट डेमो पहा',
    ml: 'തത്സമയ ഡെമോ കാണുക'
  },

  // Upload Hub Tabs
  'tab.waste': {
    en: 'Waste Photo',
    hi: 'कचरा फ़ोटो',
    kn: 'ತ್ಯಾಜ್ಯ ಫೋಟೋ',
    te: 'వ్యర్థాల ఫోటో',
    ta: 'கழிவு புகைப்படம்',
    mr: 'कचरा फोटो',
    ml: 'മാലിന്യ ഫോട്ടോ'
  },
  'tab.food': {
    en: 'Fridge / Receipt',
    hi: 'फ्रिज / रसीद',
    kn: 'ಫ್ರಿಜ್ / ರಸೀದಿ',
    te: 'ఫ్రిజ్ / రసీదు',
    ta: 'பிரிட்ஜ் / ரசீது',
    mr: 'फ्रिज / पावती',
    ml: 'ഫ്രിഡ്ജ് / രസീത്'
  },
  'tab.energy': {
    en: 'Electricity Bill',
    hi: 'बिजली बिल',
    kn: 'ವಿದ್ಯುತ್ ಬಿಲ್',
    te: 'విద్యుత్ బిల్లు',
    ta: 'மின் கட்டண பில்',
    mr: 'वीज बिल',
    ml: 'വൈദ്യുതി ബിൽ'
  },
  'tab.mobility': {
    en: 'Commute Note',
    hi: 'यात्रा नोट',
    kn: 'ಪ್ರಯಾಣದ ಮಾಹಿತಿ',
    te: 'ప్రయాణ వివరాలు',
    ta: 'பயணக் குறிப்பு',
    mr: 'प्रवास नोंद',
    ml: 'യാത്രാ കുറിപ്പ്'
  },
  'upload.browse': {
    en: 'Browse Device Photos',
    hi: 'डिवाइस से फ़ोटो चुनें',
    kn: 'ಸಾಧನದಿಂದ ಫೋಟೋ ಆರಿಸಿ',
    te: 'డివైజ్ నుండి ఫోటో ఎంచుకోండి',
    ta: 'சாதனத்திலிருந்து படத்தைத் தேர்ந்தெடுக்கவும்',
    mr: 'डिव्हाइसमधून फोटो निवडा',
    ml: 'ഉപകരണത്തിൽ നിന്ന് ഫോട്ടോ തിരഞ്ഞെടുക്കുക'
  },
  'upload.prompt': {
    en: 'Upload or drag & drop item photo for instant Gemini AI audit',
    hi: 'तुरंत जेमिनी AI ऑडिट के लिए फ़ोटो अपलोड या ड्रैग करें',
    kn: 'ತಕ್ಷಣದ ಜೆಮಿನಿ AI ಪರಿಶೀಲನೆಗಾಗಿ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    te: 'తక్షణ జెమిని AI ఆడిట్ కోసం ఫోటోను అప్‌లోడ్ చేయండి',
    ta: 'உடனடி ஜெமினி AI தணிக்கைக்கு புகைப்படத்தைப் பதிவேற்றவும்',
    mr: 'त्वरित जेमिनी AI तपासणीसाठी फोटो अपलोड करा',
    ml: 'ഉടൻ ജെമിനി AI പരിശോധനക്കായി ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക'
  },

  // Metrics
  'metric.score': {
    en: 'Planet Score',
    hi: 'गृह स्कोर',
    kn: 'ಪ್ಲಾನೆಟ್ ಸ್ಕೋರ್',
    te: 'ప్లానెట్ స్కోర్',
    ta: 'பூமி மதிப்பெண்',
    mr: 'प्लॅनेट स्कोअर',
    ml: 'പ്ലാനറ്റ് സ്കോർ'
  },
  'metric.carbon': {
    en: 'Carbon Used',
    hi: 'कार्बन उपयोग',
    kn: 'ಬಳಸಿದ ಇಂಗಾಲ',
    te: 'ఉపయోగించిన కార్బన్',
    ta: 'பயன்படுத்திய கார்பன்',
    mr: 'वापरलेला कार्बन',
    ml: 'ഉപയോഗിച്ച കാർബൺ'
  },
  'metric.waste': {
    en: 'Waste Diverted',
    hi: 'बचाया गया कचरा',
    kn: 'ರೀಸೈಕಲ್ ಮಾಡಿದ ತ್ಯಾಜ್ಯ',
    te: 'రీసైకిల్ చేసిన వ్యర్థాలు',
    ta: 'மீட்டெடுக்கப்பட்ட கழிவு',
    mr: 'पुनരുપಯೋಗ කළ कचरा',
    ml: 'പുനരുപയോഗിച്ച മാലിന്യം'
  },
  'metric.water': {
    en: 'Virtual Water',
    hi: 'आभासी जल',
    kn: 'ವರ್ಚುವಲ್ ನೀರು',
    te: 'వర్చువల్ వాటర్',
    ta: 'மெய்நிகர் நீர்',
    mr: 'व्हर्च्युअल पाणी',
    ml: 'വെർച്വൽ വാട്ടർ'
  },
  'metric.days_left': {
    en: 'days left in budget cycle',
    hi: 'बजट चक्र में शेष दिन',
    kn: 'ಬಜೆಟ್ ಚಕ್ರದಲ್ಲಿ ಉಳಿದ ದಿನಗಳು',
    te: 'బడ్జెట్ చక్రంలో మిగిలిన రోజులు',
    ta: 'பட்ஜெட் சுழற்சியில் மீதமுள்ள நாட்கள்',
    mr: 'बजेट चक्रात शिल्लक दिवस',
    ml: 'ബജറ്റ് ചക്രത്തിൽ ബാക്കിയുള്ള ദിവസങ്ങൾ'
  },

  // Action Stream
  'action.stream_title': {
    en: 'AI Action Stream',
    hi: 'AI एक्शन स्ट्रीम',
    kn: 'AI ಕ್ರಿಯಾ ಸ್ಟ್ರೀಮ್',
    te: 'AI యాక్షన్ స్ట్రీమ్',
    ta: 'AI செயல் ஸ்ட்ரீம்',
    mr: 'AI कृती प्रवाह',
    ml: 'AI ആക്ഷൻ സ്ട്രീം'
  },
  'action.stream_sub': {
    en: 'Active planetary interventions generated by cooperating Gemini agents.',
    hi: 'सहयोगी जेमिनी एजेंट्स द्वारा अनुशंसित सक्रिय हस्तक्षेप।',
    kn: 'ಜೆಮಿನಿ ಏಜೆಂಟ್‌ಗಳಿಂದ ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಕ್ರಿಯ ಕ್ರಮಗಳು.',
    te: 'జెమినీ ఏజెంట్లు రూపొందించిన పర్యావరణ చర్యలు.',
    ta: 'ஜெமினி முகவர்களால் உருவாக்கப்பட்ட தற்போதைய செயல்பாடுகள்.',
    mr: 'सहयोगी जेमिनी एजंट्स द्वारे सुचविलेल्या कृती.',
    ml: 'ജെമിനി ഏജന്റുകൾ തയ്യാറാക്കിയ സജീവ ഇടപെടലുകൾ.'
  },
  'action.history_btn': {
    en: 'View Audit History',
    hi: 'ऑडिट इतिहास देखें',
    kn: 'ಆಡಿಟ್ ಇತಿಹಾಸ ವೀಕ್ಷಿಸಿ',
    te: 'ఆడిట్ చరిత్రను చూడండి',
    ta: 'தணிக்கை வரலாற்றைக் காண்க',
    mr: 'तपासणी इतिहास पहा',
    ml: 'ഓഡിറ്റ് ചരിത്രം കാണുക'
  },

  // Solar Panel
  'solar.title': {
    en: 'Rooftop Solar Potential',
    hi: 'छत सौर ऊर्जा क्षमता',
    kn: 'ರೂಫ್‌ಟಾಪ್ ಸೌರ ಸಾಮರ್ಥ್ಯ',
    te: 'రూఫ్‌టాప్ సోలార్ సామర్థ్యం',
    ta: 'கூரை சூரிய மின்சக்தி சாத்தியம்',
    mr: 'छतावरील सौर क्षमता',
    ml: 'റൂഫ്‌ടോപ്പ് സൗരോർജ്ജ സാധ്യത'
  },
  'solar.simulate_btn': {
    en: 'Calculate Clean Yield',
    hi: 'सौर बचत की गणना करें',
    kn: 'ಸೌರ ಉಳಿತಾಯ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
    te: 'సౌర పొదుపు లెక్కించండి',
    ta: 'சூரிய சேமிப்பைக் கணக்கிடு',
    mr: 'सौर बचत गणना करा',
    ml: 'സൗരോർജ്ജ ലാഭം കണക്കാക്കുക'
  },

  // Autopilot Modal
  'autopilot.modal_title': {
    en: 'AI Autopilot Weekly Plan',
    hi: 'AI ऑटोपायलट साप्ताहिक योजना',
    kn: 'AI ಆಟೋಪೈಲಟ್ ಸಾಪ್ತಾಹಿಕ ಯೋಜನೆ',
    te: 'AI ఆటోపైలట్ వారపు ప్రణాళిక',
    ta: 'AI ஆட்டோபைலட் வாராந்திர திட்டம்',
    mr: 'AI ऑटोपायलट साप्ताहिक योजना',
    ml: 'AI ഓട്ടോപൈലറ്റ് പ്രതിവാര പദ്ധതി'
  },
  'autopilot.apply_btn': {
    en: 'Apply Plan & View on Dashboard',
    hi: 'योजना लागू करें और डैशबोर्ड पर देखें',
    kn: 'ಯೋಜನೆ ಅನ್ವಯಿಸಿ ಮತ್ತು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
    te: 'ప్లాన్ వర్తింపజేసి డ్యాష్‌బోర్డ్‌లో చూడండి',
    ta: 'திட்டத்தைப் பயன்படுத்தி டாஷ்போர்டில் காண்க',
    mr: 'योजना लागू करा आणि डॅशबोर्डवर पहा',
    ml: 'പ്ലാൻ നടപ്പിലാക്കി ഡാഷ്‌ബോർഡിൽ കാണുക'
  },
  'autopilot.rerun_btn': {
    en: 'Re-Run AI Autopilot',
    hi: 'पुनः ऑटोपायलट चलाएं',
    kn: 'ಮತ್ತೆ ಆಟೋಪೈಲಟ್ ರನ್ ಮಾಡಿ',
    te: 'మళ్లీ ఆటోపైలట్ రన్ చేయండి',
    ta: 'மீண்டும் ஆட்டோபைலட்டை இயக்கு',
    mr: 'पुन्हा ऑटोपायलट चालवा',
    ml: 'വീണ്ടും ഓട്ടോപൈലറ്റ് പ്രവർത്തിപ്പിക്കുക'
  }
};

/**
 * Helper to fetch localized string.
 * Supports dual mode: "English / Regional"
 */
export function getTranslation(key: string, lang: LanguageCode, city: string = 'Bengaluru'): string {
  const item = TRANSLATIONS[key];
  if (!item) return key;

  if (lang === 'dual') {
    const regional = CITY_REGIONAL_MAP[city]?.code || 'kn';
    const enText = item['en'] || key;
    const regText = item[regional] || item['hi'] || '';
    if (regText && regText !== enText) {
      return `${enText} (${regText})`;
    }
    return enText;
  }

  return item[lang] || item['en'] || key;
}
