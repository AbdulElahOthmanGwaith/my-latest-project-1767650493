/**
 * مترجم عربي - أمهري - تطبيق جافاسكريبت
 * Arabic Amharic Translator - JavaScript Application
 */

// ============================================
// التهيئة والمتغيرات العامة
// ============================================

const App = {
    // حالة التطبيق
    state: {
        sourceLang: 'ar',
        targetLang: 'am',
        sourceText: '',
        translatedText: '',
        pronunciationText: '',
        isTranslating: false,
        isSpeaking: false,
        isRecording: false,
        speechRecognitionSupported: false,
        debounceTimer: null,
        history: []
    },

    // عناصر DOM
    elements: {},

    // تكوين الترجمة
    config: {
        debounceTime: 1500,
        debounceTimeLong: 3000,
        maxHistoryItems: 100,
        maxTextLength: 50000,
        longTextThreshold: 5000,
        apiEndpoints: {
            google: 'https://translate.googleapis.com/translate_a/single',
            libre: 'https://libretranslate.com/translate'
        },
        
        // جدول تحويل الحروف الأمهرية إلى نطق عربي (شامل)
        amharicToArabic: {
            // ሐ - ها (حرف الألف)
            'ሀ': 'ها', 'ሁ': 'هو', 'ሂ': 'هي', 'ሃ': 'ها', 'ሄ': 'هَي', 'ህ': 'ه', 'ሆ': 'هو',
            
            // ለ - لا (حرف اللام)
            'ለ': 'لا', 'ሉ': 'لو', 'ሊ': 'لي', 'ላ': 'لا', 'ሌ': 'لي', 'ል': 'ل', 'ሎ': 'لو',
            
            // ሐ - ها (حرف الحاء)
            'ሐ': 'ها', 'ሑ': 'هو', 'ሒ': 'هي', 'ሓ': 'ها', 'ሔ': 'هَي', 'ሕ': 'ه', 'ሖ': 'هو',
            
            // መ - ما (حرف الميم)
            'መ': 'ما', 'ሙ': 'مو', 'ሚ': 'مي', 'ማ': 'ما', 'ሜ': 'مي', 'ም': 'م', 'ሞ': 'مو',
            
            // ነ - نا (حرف النون)
            'ነ': 'نا', 'ኑ': 'نو', 'ኒ': 'ني', 'ና': 'نا', 'ኔ': 'ني', 'ን': 'ن', 'ኖ': 'نو',
            
            // ቀ - قَا (حرف القاف)
            'ቀ': 'قا', 'ቁ': 'قو', 'ቂ': 'قي', 'ቃ': 'قا', 'ቄ': 'قي', 'ቅ': 'ق', 'ቆ': 'قو',
            
            // በ - با (حرف الباء)
            'በ': 'با', 'ቡ': 'بو', 'ቢ': 'بي', 'ባ': 'با', 'ቤ': 'بي', 'ብ': 'ب', 'ቦ': 'بو',
            
            // ተ - تا (حرف التاء)
            'ተ': 'تا', 'ቱ': 'تو', 'ቲ': 'تي', 'ታ': 'تا', 'ቴ': 'تي', 'ት': 'ت', 'ቶ': 'تو',
            
            // ኀ - ها (حرف الحاء-alt)
            'ኀ': 'ها', 'ኁ': 'هو', 'ኂ': 'هي', 'ኃ': 'ها', 'ኄ': 'هي', 'ኅ': 'ه', 'ኆ': 'هو',
            
            // አ - ا (حرف الألف-alt)
            'አ': 'ا', 'ኡ': 'و', 'ኢ': 'ي', 'ኣ': 'ا', 'ኤ': 'ي', 'እ': 'إ', 'ኦ': 'و',
            
            // ወ - وا (حرف الواو)
            'ወ': 'وا', 'ዉ': 'وو', 'ዊ': 'وي', 'ዋ': 'وا', 'ዌ': 'وي', 'ው': 'و', 'ዎ': 'وو',
            
            // ዐ - ا (حرف العين)
            'ዐ': 'ا', 'ዑ': 'و', 'ዒ': 'ي', 'ዓ': 'ا', 'ዔ': 'ي', 'ዕ': 'ع', 'ዖ': 'و',
            
            // ዘ - زا (حرف الزين)
            'ዘ': 'زا', 'ዙ': 'زو', 'ዚ': 'زي', 'ዛ': 'زا', 'ዜ': 'زي', 'ዝ': 'ز', 'ዞ': 'زو',
            
            // ዠ - جا (حرف الجيم)
            'ዠ': 'جا', 'ዡ': 'جو', 'ዢ': 'جي', 'ዣ': 'جا', 'ዤ': 'جي', 'ዥ': 'ج', 'ዦ': 'جو',
            
            // ደ - دا (حرف الدال)
            'ደ': 'دا', 'ዱ': 'دو', 'ዲ': 'دي', 'ዳ': 'دا', 'ዴ': 'دي', 'ድ': 'د', 'ዶ': 'دو',
            
            // ገ - جا (حرف الجيم-alt)
            'ገ': 'جا', 'ጉ': 'جو', 'ጊ': 'جي', 'ጋ': 'جا', 'ጌ': 'جي', 'ግ': 'ج', 'ጎ': 'جو',
            
            // ጠ - تا (حرف الطاء)
            'ጠ': 'تا', 'ጡ': 'تو', 'ጢ': 'تي', 'ጣ': 'تا', 'ጤ': 'تي', 'ጥ': 'ت', 'ጦ': 'تو',
            
            // ጨ - جا (حرف الجيم-alt2)
            'ጨ': 'جا', 'ጩ': 'جو', 'ጪ': 'جي', 'ጫ': 'جا', 'ጬ': 'جي', 'ጭ': 'ج', 'ጮ': 'جو',
            
            // ፀ - صا (حرف الصاد)
            'ፀ': 'صا', 'ፁ': 'صو', 'ፂ': 'صي', 'ፃ': 'صا', 'ፄ': 'صي', 'ፅ': 'ص', 'ፆ': 'صو',
            
            // ፈ -فا (حرف الفاء)
            'ፈ': 'فا', 'ፉ': 'فو', 'ፊ': 'في', 'ፋ': 'فا', 'ፌ': 'في', 'ፍ': 'ف', 'ፎ': 'فو',
            
            // ፐ - با (حرف الباء-alt)
            'ፐ': 'با', 'ፑ': 'بو', 'ፒ': 'بي', 'ፓ': 'با', 'ፔ': 'بي', 'ፕ': 'ب', 'ፖ': 'بو',
            
            // ከ - كا (حرف الكاف)
            'ከ': 'كا', 'ኩ': 'كو', 'ኪ': 'كي', 'ካ': 'كا', 'ኬ': 'كي', 'ክ': 'ك', 'ኮ': 'كو',
            
            // ኸ - خا (حرف الخاء)
            'ኸ': 'خا', 'ኹ': 'خو', 'ኺ': 'خي', 'ኻ': 'خا', 'ኼ': 'خي', 'ኽ': 'خ', 'ኾ': 'خو',
            
            // ዚ - زي (ዚ متكرر)
            'ዚ': 'زي', 'ዛ': 'زا', 'ዜ': 'زي', 'ዝ': 'ز', 'ዞ': 'زو', 'ዟ': 'زي',
            
            // ጘ - جا (حرف الجيم-alt3)
            'ጘ': 'جا', 'ጙ': 'جو', 'ጚ': 'جي', 'ጛ': 'جا', 'ጜ': 'جي', 'ጝ': 'ج', 'ጞ': 'جو',
            
            // ጠ - ጪ (مكرر)
            'ጧ': 'تا', 'ጪ': 'جي',
            
            // ፹ - ፻ (حروف إضافية)
            '፹': 'تشي', '፺': 'تشي', '፻': 'نو', '፼': 'فا',
            
            // علامات الترقيم والروابط
            '።': '।', '፣': '،', '፤': '؛', '፦': '،', '፥': '،',
            
            // أرقام أمهرية
            '፩': '1', '፪': '2', '፫': '3', '፬': '4', '፭': '5',
            '፮': '6', '፯': '7', '፰': '8', '፱': '9', '፲': '10',
            
            // كلمات وعبارات شائعة
            'እንደ': 'إندي', 'ሰላም': 'سيلام', 'አመሰግናለሁ': 'أميسيجنالو',
            'እንደምን': 'إنديمين', 'አለህ': 'أليخ', 'እባክህ': 'إيباكيك',
            'ስላለ': 'سيلال', 'ይህ': 'ييخ', 'ያንዳንዱ': 'يادانادو',
            'በጣም': 'باتام', 'አይደለም': 'أيديلام',
            
            // كلمات إضافية شائعة
            'ሙሉ': 'مولو', 'ሙላት': 'مولات', 'ሙሽራ': 'موشرا',
            'ሚዛን': 'ميزان', 'ምስጢር': 'مسيغير',
            'ስም': 'سيم', 'ስልክ': 'سيليک',
            'ስለ': 'سيلي', 'ስትጠቀም': 'ستتيقيم',
            'እኔ': 'إيني', 'አንተ': 'أنتي', 'እሱ': 'إيسو',
            'እሷ': 'إيسوا', 'እነሱ': 'إينيسو', 'እናንተ': 'إينانتي',
            'ዓለም': 'عالم', 'ሀገር': 'هاگر', 'ቤት': 'بيت',
            'ውሃ': 'واها', 'ወይን': 'واين', 'ወተት': 'واتت',
            'ስጋ': 'سيگا', 'ዳቦ': 'دابو', 'ጨስት': 'تشست',
            'ቀዝቃዛ': 'قيزاقازا', 'በረዶ': 'بارودو',
            'እግር': 'إگير', 'እጅ': 'إجي', 'ፍቅር': 'فيقير',
            'ፍትህ': 'فيتخ', 'ፍርሃት': 'فيرخات',
            'ጥልቅ': 'تيليق', 'ጥበብ': 'تيبيب',
            'ማእዛን': 'مايزان', 'መልካም': 'مليكان',
            'መምህር': 'ميميهر', 'ተማሪ': 'تيماري',
            'ዶክተር': 'دوکتير', 'ነጋዴ': 'ناگادي',
            'ሸቀጤ': 'شيکيتي', 'ሸቀጥ': 'شيکيت',
            'ገበሬ': 'گاباري', 'ገበር': 'گابير',
            'ሐላፊ': 'هالافي', 'ሐሙስ': 'هاموس',
            'ዓርብ': 'عارب', 'ቅዳሜ': 'قداسامو',
            'እሑድ': 'إيهد', 'ማክሰኞ': 'ماکيسانو',
            'ትሪክ': 'تيريك', 'ትራንስፖርት': 'ترانسبورت',
            'ተክል': 'تيکل', 'አበባ': 'أبابا', 'ዕጣን': 'عطنان',
            'ቀልድ': 'قيليد', 'ቃል': 'قال', 'አስተርጓሚ': 'أستارغامي',
            'ማስተርጓሚ': 'ماستارغامي', 'ተረጎም': 'تيرغوم',
            'ተቋም': 'تيقوم', 'ወሰን': 'واسان', 'ብር': 'بير',
            'ብሔር': 'بيهير', 'ብሔረሰብ': 'بيهيريسيب',
            'ብሩህ': 'بيروه', 'ብክል': 'بيکل', 'ተስፋ': 'تيسفا',
            'ስራ': 'سيرا', 'ሥራ': 'شير', 'ባሕር': 'باحر',
            'ባሕርይ': 'باحري', 'ባሪያ': 'باريا', 'ባዶ': 'بادو',
            'አሁን': 'أهون', 'አስቀድሞ': 'أسقديمو', 'አስር': 'أسير',
            'አስራት': 'أسيرات', 'አሳብ': 'أصاب', 'አሳው': 'أساو',
            'አሳተም': 'أساتيم', 'አሳብስ': 'أسابيس', 'አሽር': 'أشير',
            'እስከ': 'إسکي', 'እስካሁን': 'إسکاهون', 'እስካሂድ': 'إسکاهيميد',
            'እስካልኩ': 'إسکالکو', 'እስከምንድን': 'إسکي مندين',
            'ወደ': 'وادا', 'ወደፊት': 'وادا فيت', 'ወይስ': 'ويس',
            'ወሰደ': 'واسادا', 'ወረደ': 'وارادا', 'ወሰን': 'واسان',
            'ወሰንኩ': 'واسانکو', 'ወሰደው': 'واساداو', 'ወርቅ': 'ويرجو',
            'ወርዶ': 'ويرودو', 'ወርዶም': 'ويرودوم', 'ወርጭ': 'ويريج',
            'ዘነበ': 'زينا', 'ዘንጉ': 'زينجو', 'ዘረ': 'زيرا',
            'ዘርነት': 'زيرانيت', 'ዘወረደ': 'زاويرادا', 'ዘይት': 'زيت',
            'ዘሩ': 'زيرو', 'ዘሩት': 'زيروت', 'ዘነበት': 'زينابيت',
            'በቅሎ': 'بقيلو', 'በቂ': 'باقي', 'በቀል': 'باقيل', 'በር': 'بير',
            'በረዶ': 'بارودو', 'በረዶት': 'بارودوت', 'በረከት': 'باراكيت',
            'በረቀቀ': 'باراقاقا', 'በረተ': 'باراتا', 'በረበ': 'بارابار',
            'ተበየነ': 'تيبيان', 'ተበራነ': 'تيباران', 'ተበበረ': 'تيبارير',
            'ተበበነ': 'تيبابيت', 'ተበረነ': 'تيباراني',
            'ተባረከ': 'تيباريكا', 'ተባረከት': 'تيباريکيت',
            'ተብራራ': 'تيبيرادا', 'ተብራራት': 'تيبيرادات',
            'ተምሳሌት': 'تميصلبيت', 'ተምሳሌትና': 'تميصلبيتنا',
            'ተምሳሌታዊ': 'تميصلتاوي', 'ተምሳሌታዊው': 'تميصلتاويو',
            'ተማመን': 'تيمايمين', 'ተማመንኩ': 'تيمايمينکو',
            'ተማመነው': 'تيمايميناو', 'ተማመነች': 'تيمايمينيتش',
            'ተማሪ': 'تيماري', 'ተማሪው': 'تيماريو', 'ተማሪነት': 'تيمارينيت',
            'ተማሪያን': 'تيماريان', 'ተማረ': 'تيماارا', 'ተማረት': 'تيمااريت',
            'ተማለል': 'تيماالي', 'ተማለለ': 'تيمااليي',
            'ተማከረ': 'تيماکارا', 'ተማከረት': 'تيماکاريت',
            'ተማከለ': 'تيماکال', 'ተማከለት': 'تيماکاليت',
            'ተራ': 'تيرا', 'ተራራ': 'تيرارا', 'ተራማጅ': 'تيراميج',
            'ተራት': 'تيرات', 'ተራም': 'تيرام', 'ተራካ': 'تيراكا',
            'ተሸጋገረ': 'تيشاغارا', 'ተሸገረት': 'تيشاغاريت',
            'ተሸሸገ': 'تيشا شيغا', 'ተሸሸገት': 'تيشا شيغات',
            'ተሹመለከተ': 'تيشوميتكايت', 'ተሹመለከተት': 'تيشوميتكايتيت',
            'ተሻገረ': 'تيشاغارا', 'ተሻገረት': 'تيشاغاريت',
            'ተሻለ': 'تيشالا', 'ተሻተረ': 'تيشا تارا',
            'ተሻተረት': 'تيشا تاريت', 'ተሻተረው': 'تيشا تاراو',
            'ተናገረ': 'تيناغارا', 'ተናገረት': 'تيناغاريت',
            'ተናገሩ': 'تيناغارو', 'ተናገረው': 'تيناغاراو',
            'ተነገረ': 'تيناغارا', 'ተነገረት': 'تيناغاريت',
            'ተከተለ': 'تيكييتالا', 'ተከተለት': 'تيكييتاليت',
            'ተከተለው': 'تيكييتالاو', 'ተከተለች': 'تيكييتالاتش',
            'ተከተል': 'تيكييتال', 'ተከተለችት': 'تيكييتالياتشيت',
            'ተከላከለ': 'تيکالاكالا', 'ተከላከለት': 'تيکالاكالاتيت',
            'ተከልኝ': 'تيکالاج', 'ተከልኝት': 'تيکالاجيت',
            'ተከምነ': 'تيکوماني', 'ተከምነት': 'تيکومانيت',
            'ተኩላ': 'تيکولا', 'ተኩላት': 'تيکولات',
            'ተኩስ': 'تيکوس', 'ተኩስት': 'تيکوسيت',
            'ተናበበ': 'تينابابي', 'ተናበበት': 'تينابابييت',
            'ተናበበው': 'تينابابي او', 'ተናበበች': 'تينابابييتش',
            'ተናዝዞ': 'تينازوزو', 'ተናዝዞት': 'تينازوزوتي',
            'ተናዝዘ': 'تينازيزا', 'ተናዝዘት': 'تينازيزاتي',
            'ተኔረዝዞ': 'تينيريزوزو', 'ተኔረዝዞት': 'تينيريزوزوتي',
            'ተንጋጋ': 'تينغاغا', 'ተንጋጋት': 'تينغاغات',
            'ተንጋጋው': 'تينغاغاو', 'ተንጋጋዋ': 'تينغاغاوِيا',
            'ተንኮለከለ': 'تينکوليكالا', 'ተንኮለከለት': 'تينکوليكالاتيت',
            'ተንኮል': 'تينکول', 'ተንኮልት': 'تينکوليت',
            'ተንከፈለ': 'تينكيفالا', 'ተንከፈለት': 'تينكيفالاتيت',
            'ተንከፈለው': 'تينكيفالااو', 'ተንከፈለች': 'تينكيفالاتيتش',
            'ተንከፋፈለ': 'تينكيفافالا', 'ተንከፋፈለት': 'تينكيفافالاتيت',
            'ተንዛዘነ': 'تينزازاني', 'ተንዛዘነት': 'تينزازانيت',
            'ተንዝዘነ': 'تينزيزاني', 'ተንዝዘነት': 'تينزيزانيت',
            'ተንዝዞ': 'تينزيزوزو', 'ተንዝዞት': 'تينزيزوزوتي',
            'ተንጠበጠ': 'تينتيبيتِ', 'ተንጠበጠት': 'تينتيبيتِيت',
            'ተንጠራጠረ': 'تينتياراغارا', 'ተንጠራጠረት': 'تينتياراغاريت',
            'ተንጠራጠረው': 'تينتياراغارااو', 'ተንጠራጠረች': 'تينتياراغاراتيتش',
            'ተንፋስ': 'تينفاس', 'ተንፋስት': 'تينفاسيت',
            'ተንፈሰ': 'تينفاسا', 'ተንፈሰት': 'تينفاسات',
            'ተንፈሰው': 'تينفاساو', 'ተንፈሰች': 'تينفاساتيتش',
            'ተንፈቀፈቀ': 'تينفاقيفيقا', 'ተንፈቀፈቀት': 'تينفاقيفيقاقيت',
            'ተንፈቀፈቀው': 'تينفاقيفيقااو', 'ተንፈቀፈቀች': 'تينفاقيفيقاقاتيتش',
            'ተንፋልና': 'تينفالنِنا', 'ተንፋልናት': 'تينفالنِّنات',
            'ተንፋልቃ': 'تينفالقِنا', 'ተንፋልቃት': 'تينفالقِّنات',
            'ተንፋልቅ': 'تينفالقِج', 'ተንፋልቅት': 'تينفالقِجيت',
            'ተንፋልቅና': 'تينفالقِجنا', 'ተንፋልቅናት': 'تينفالقِجنت',
            'ተንፈተፈተ': 'تينفاتِفات', 'ተንፈተፈተት': 'تينفاتِفاتيت',
            'ተንፈተፈተው': 'تينفاتِفاتاو', 'ተንፈተፈተች': 'تينفاتِفاتاتيتش',
            'ተንፋስን': 'تينفاسين', 'ተንፋስንት': 'تينفاسينيت',
            'ተንፋስም': 'تينفاسيم', 'ተንፋስምት': 'تينفاسيميت',
            'ተንፋስንና': 'تينفاسيننا', 'ተንፋስንናት': 'تينفاسيننت',
            'ተንፋስንዋ': 'تينفاسينوا', 'ተንፋስንዋት': 'تينفاسينوايت',
            'ተንፋስንዋን': 'تينفاسينواين', 'ተንፋስንዋንት': 'تينفاسينواينيت',
            'ተንፋስንዋንታ': 'تينفاسينواينتا', 'ተንፋስንዋንታት': 'تينفاسينواينتت',
            'ተንፋስንዋንታዋ': 'تينفاسينواينتاوا', 'ተንፋስንዋንታዋት': 'تينفاسينواينتاوايت',
            'ተንፋስንዋንታዋን': 'تينفاسينواينتاواين', 'ተንፋስንዋንታዋንት': 'تينفاسينواينتاواينيت',
            'ተንፋስንዋንታዋንዋ': 'تينفاسينواينتاواينوا', 'ተንፋስንዋንታዋንዋት': 'تينفاسينواينتاواينوايت',
            'ተንፋስንዋንታዋንዋን': 'تينفاسينواينتاواينواين', 'ተንፋስንዋንታዋንዋንት': 'تينفاسينواينتاواينواينيت',
            'ተንፋስንዋንታዋንዋንዋ': 'تينفاسينواينتاواينواينوا', 'ተንፋስንዋንታዋንዋንዋት': 'تينفاسينواينتاواينواينوايت',
            'ተንፋስንዋንታዋንዋንዋን': 'تينفاسينواينتاواينواينواين', 'ተንፋስንዋንታዋንዋንዋንት': 'تينفاسينواينتاواينواينواينيت',
            'ተንፋስንዋንታዋንዋንዋንዋ': 'تينفاسينواينتاواينواينواينوا', 'ተንፋስንዋንታዋንዋንዋንዋት': 'تينفاسينواينتاواينواينواينوايت'
        }
    },

    // تهيئة التطبيق
    init() {
        this.cacheElements();
        this.loadTheme();
        this.loadHistory();
        this.initSpeechRecognition();
        this.bindEvents();
        this.setupServiceWorker();
        this.setupAutoResize();
        this.showToast('مرحباً! يمكنك الآن الترجمة من العربية إلى الأمهرية', 'success');
    },

    // تهيئة التعرف على الكلام
    initSpeechRecognition() {
        // التحقق من دعم المتصفح
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            this.speechRecognitionSupported = false;
            if (this.elements.voiceInputBtn) {
                this.elements.voiceInputBtn.classList.add('error');
                this.elements.voiceInputBtn.setAttribute('title', 'التعرف على الكلام غير مدعوم في هذا المتصفح');
            }
            return;
        }

        this.speechRecognitionSupported = true;
        this.recognition = new SpeechRecognition();
        
        // إعدادات التعرف على الكلام
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ar-SA'; // العربية السعودية
        
        // ربط الأحداث
        this.recognition.onstart = () => {
            this.state.isRecording = true;
            this.updateRecordingUI(true);
        };

        this.recognition.onend = () => {
            this.state.isRecording = false;
            this.updateRecordingUI(false);
            
            // إذا كان هناك نص، قم بالترجمة
            if (this.state.sourceText.trim()) {
                this.translate();
            }
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // تحديث النص
            if (finalTranscript) {
                this.state.sourceText = (this.state.sourceText + finalTranscript).trim();
            } else {
                this.state.sourceText = this.state.sourceText.replace(interimTranscript, '').trim() + interimTranscript;
            }

            this.elements.sourceText.value = this.state.sourceText;
            this.updateStats(this.state.sourceText);
            this.elements.translateBtn.disabled = !this.state.sourceText.trim();
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.state.isRecording = false;
            this.updateRecordingUI(false);
            
            // معالجة الأخطاء
            this.handleSpeechError(event.error);
        };

        this.recognition.onspeechend = () => {
            // عند انتهاء الكلام، أوقف التسجيل
            this.recognition.stop();
        };
    },

    // معالجة أخطاء التعرف على الكلام
    handleSpeechError(error) {
        const errorMessages = {
            'no-speech': 'لم يتم اكتشاف أي كلام. يرجى المحاولة مرة أخرى.',
            'audio-capture': 'لا يوجد ميكروفون متاح.',
            'not-allowed': 'تم رفض إذن الوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.',
            'network': 'خطأ في الشبكة. يتطلب التعرف على الكلام اتصالاً بالإنترنت.',
            'aborted': 'تم إلغاء التعرف على الكلام.',
            'language-not-supported': 'اللغة العربية غير مدعومة.',
            'service-not-allowed': 'خدمة التعرف على الكلام غير مسموح بها.'
        };

        const message = errorMessages[error] || `حدث خطأ: ${error}`;
        this.showToast(message, 'error');
    },

    // تحديث واجهة التسجيل
    updateRecordingUI(isRecording) {
        const indicator = this.elements.recordingIndicator;
        const btn = this.elements.voiceInputBtn;

        if (isRecording) {
            indicator.style.display = 'flex';
            btn.classList.add('recording');
            btn.setAttribute('aria-label', 'إيقاف التسجيل');
        } else {
            indicator.style.display = 'none';
            btn.classList.remove('recording');
            btn.setAttribute('aria-label', 'إدخال صوتي');
        }
    },

    // بدء/إيقاف التسجيل
    toggleRecording() {
        if (!this.speechRecognitionSupported) {
            this.showToast('المتصفح لا يدعم التعرف على الكلام. يرجى استخدام Chrome أو Edge.', 'warning');
            return;
        }

        if (this.state.isRecording) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
                this.showToast('حدث خطأ أثناء بدء التعرف على الكلام', 'error');
            }
        }
    },

    // تخزين عناصر DOM
    cacheElements() {
        this.elements = {
            // الرأس والثيم
            themeToggle: document.getElementById('theme-toggle'),
            loadingBar: document.getElementById('loading-bar'),

            // اللغات
            sourceLang: document.getElementById('source-lang'),
            targetLang: document.getElementById('target-lang'),
            swapBtn: document.getElementById('swap-languages'),
            sourceLabel: document.getElementById('source-label'),
            targetLabel: document.getElementById('target-label'),

            // النصوص
            sourceText: document.getElementById('source-text'),
            resultText: document.getElementById('result-text'),
            charCount: document.getElementById('char-count'),
            translateBtn: document.getElementById('translate-btn'),

            // الإدخال الصوتي
            voiceInputBtn: document.getElementById('voice-input-btn'),
            recordingIndicator: document.getElementById('recording-indicator'),

            // الإجراءات
            sourceSpeech: document.getElementById('source-speech'),
            sourceClear: document.getElementById('source-clear'),
            targetSpeech: document.getElementById('target-speech'),
            pronunciationSpeech: document.getElementById('pronunciation-speech'),
            targetCopy: document.getElementById('target-copy'),
            targetShare: document.getElementById('target-share'),
            copyPronunciation: document.getElementById('copy-pronunciation'),

            // قسم النطق
            pronunciationSection: document.getElementById('pronunciation-section'),
            pronunciationText: document.getElementById('pronunciation-text'),

            // التحميل
            loadingSpinner: document.getElementById('loading-spinner'),

            // السجل
            historySection: document.getElementById('history-section'),
            historyList: document.getElementById('history-list'),
            emptyHistory: document.getElementById('empty-history'),
            clearHistory: document.getElementById('clear-history'),

            // الإشعارات
            toast: document.getElementById('toast'),

            // نافذة الخطأ
            errorModal: document.getElementById('error-modal'),
            errorMessage: document.getElementById('error-message'),
            closeModal: document.getElementById('close-modal')
        };
    },

    // ربط الأحداث
    bindEvents() {
        // تبديل الثيم
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // تبديل اللغات
        this.elements.swapBtn.addEventListener('click', () => this.swapLanguages());

        // تغيير اللغة
        this.elements.sourceLang.addEventListener('change', (e) => this.handleLanguageChange('source', e.target.value));
        this.elements.targetLang.addEventListener('change', (e) => this.handleLanguageChange('target', e.target.value));

        // إدخال النص
        this.elements.sourceText.addEventListener('input', (e) => this.handleInput(e));

        // زر الترجمة
        this.elements.translateBtn.addEventListener('click', () => this.translate());

        // مسح النص
        this.elements.sourceClear.addEventListener('click', () => this.clearSourceText());

        // الإدخال الصوتي
        this.elements.voiceInputBtn.addEventListener('click', () => this.toggleRecording());

        // النطق
        this.elements.sourceSpeech.addEventListener('click', () => this.speak('source'));
        this.elements.targetSpeech.addEventListener('click', () => this.speak('target'));

        // نطق النطق العربي
        this.elements.pronunciationSpeech.addEventListener('click', () => this.speakPronunciation());

        // نسخ الترجمة
        this.elements.targetCopy.addEventListener('click', () => this.copyToClipboard());

        // نسخ النطق
        this.elements.copyPronunciation.addEventListener('click', () => this.copyPronunciationToClipboard());

        // مشاركة الترجمة
        this.elements.targetShare.addEventListener('click', () => this.shareTranslation());

        // مسح السجل
        this.elements.clearHistory.addEventListener('click', () => this.clearHistory());

        // إغلاق نافذة الخطأ
        this.elements.closeModal.addEventListener('click', () => this.hideErrorModal());
        this.elements.errorModal.addEventListener('click', (e) => {
            if (e.target === this.elements.errorModal) this.hideErrorModal();
        });

        // اختصار لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // اتصل بالترجمة عند الضغط على Enter مع Ctrl
        this.elements.sourceText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.translate();
            }
        });
    },

    // ============================================
    // إدارة الثيم
    // ============================================

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (systemPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        this.updateLoadingBar();
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateLoadingBar();
    },

    updateLoadingBar() {
        this.elements.loadingBar.classList.add('complete');
        setTimeout(() => {
            this.elements.loadingBar.classList.remove('active', 'complete');
        }, 500);
    },

    // ============================================
    // إدارة اللغات
    // ============================================

    handleLanguageChange(type, lang) {
        if (type === 'source') {
            this.state.sourceLang = lang;
            this.elements.sourceLabel.textContent = this.getLangName(lang);

            // تحديث اتجاه النص
            this.updateTextDirection(this.elements.sourceText, lang);

            // تحديث فئة الخط للنص الأمهري
            if (lang === 'am') {
                this.elements.sourceText.classList.add('amharic-text');
            } else {
                this.elements.sourceText.classList.remove('amharic-text');
            }
        } else {
            this.state.targetLang = lang;
            this.elements.targetLabel.textContent = this.getLangName(lang);

            // تحديث فئة الخط للنتيجة الأمهرية
            if (lang === 'am') {
                this.elements.resultText.classList.remove('arabic-result');
            } else {
                this.elements.resultText.classList.add('arabic-result');
            }
        }

        // إعادة الترجمة إذا كان هناك نص
        if (this.state.sourceText.trim()) {
            this.translate();
        }
    },

    swapLanguages() {
        const tempLang = this.state.sourceLang;
        const tempText = this.state.sourceText;

        // تبديل اللغات
        this.state.sourceLang = this.state.targetLang;
        this.state.targetLang = tempLang;

        // تحديث واجهة المستخدم
        this.elements.sourceLang.value = this.state.sourceLang;
        this.elements.targetLang.value = this.state.targetLang;
        this.elements.sourceLabel.textContent = this.getLangName(this.state.sourceLang);
        this.elements.targetLabel.textContent = this.getLangName(this.state.targetLang);

        // نقل النص
        this.state.sourceText = this.state.translatedText;
        this.elements.sourceText.value = this.state.sourceText;
        this.handleInput({ target: this.elements.sourceText });

        // تحديث الفئات
        if (this.state.sourceLang === 'am') {
            this.elements.sourceText.classList.add('amharic-text');
        } else {
            this.elements.sourceText.classList.remove('amharic-text');
        }

        if (this.state.targetLang !== 'am') {
            this.elements.resultText.classList.add('arabic-result');
        } else {
            this.elements.resultText.classList.remove('arabic-result');
        }

        // إعادة الترجمة
        if (this.state.sourceText.trim()) {
            this.translate();
        }

        // تأثير بصري
        this.animateSwap();
    },

    animateSwap() {
        this.elements.swapBtn.style.transform = 'rotate(180deg) scale(1.2)';
        setTimeout(() => {
            this.elements.swapBtn.style.transform = '';
        }, 300);
    },

    getLangName(code) {
        const names = {
            'ar': 'العربية',
            'am': 'الأمهرية',
            'en': 'الإنجليزية'
        };
        return names[code] || code;
    },

    updateTextDirection(element, lang) {
        element.dir = lang === 'ar' ? 'rtl' : 'ltr';
        element.style.textAlign = lang === 'ar' ? 'right' : 'left';
    },

    // ============================================
    // إدارة النص والإدخال
    // ============================================

    handleInput(e) {
        const text = e.target.value;
        this.state.sourceText = text;

        // تحديث الإحصائيات
        this.updateStats(text);

        // تفعيل/تعطيل زر الترجمة
        this.elements.translateBtn.disabled = !text.trim();

        // إزالة الترجمة القديمة
        if (!text.trim()) {
            this.elements.resultText.textContent = '';
            this.state.translatedText = '';
            return;
        }

        // تأخير الترجمة (Debounce) - أطول للنصوص الطويلة
        clearTimeout(this.state.debounceTimer);
        const debounceTime = text.length > this.config.longTextThreshold 
            ? this.config.debounceTimeLong 
            : this.config.debounceTime;
        this.state.debounceTimer = setTimeout(() => {
            this.translate();
        }, debounceTime);
    },

    updateStats(text) {
        // حساب الكلمات (فصل المسافات)
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        // حساب الأسطر (فصل السطر الجديد)
        const lines = text.split(/\n/).filter(line => line.trim().length > 0);
        const lineCount = Math.max(1, lines.length);

        // حساب الفقرات (فصل سطرين فارغين)
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const paragraphCount = Math.max(1, paragraphs.length);

        // حساب الأحرف
        const charCount = text.length;

        // حساب نسبة التقدم
        const progressPercent = Math.min(100, Math.round((charCount / this.config.maxTextLength) * 100));

        // تحديث العناصر
        document.getElementById('word-count').textContent = wordCount.toLocaleString();
        document.getElementById('sentence-count').textContent = lineCount.toLocaleString();
        document.getElementById('paragraph-count').textContent = paragraphCount.toLocaleString();
        document.getElementById('char-count').textContent = charCount.toLocaleString();
        
        // تحديث شريط التقدم
        const progressFill = document.getElementById('progress-fill');
        const progressPercentEl = document.getElementById('progress-percent');
        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        if (progressPercentEl) {
            progressPercentEl.textContent = progressPercent + '%';
        }

        // تحديث ألوان التحذير
        this.updateStatWarning('word-stat', wordCount, 10000);
        this.updateStatWarning('sentence-stat', lineCount, 2000);
        this.updateStatWarning('paragraph-stat', paragraphCount, 500);
        this.updateStatWarning('char-stat', charCount, 50000);
        
        // تحديث شريط التقدم
        const progressStat = document.getElementById('progress-stat');
        if (progressStat) {
            progressStat.classList.remove('warning', 'danger');
            if (charCount >= this.config.maxTextLength) {
                progressStat.classList.add('danger');
            } else if (progressPercent >= 90) {
                progressStat.classList.add('warning');
            }
        }
    },

    updateStatWarning(elementId, value, limit) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.remove('warning', 'danger');

        if (value >= limit) {
            element.classList.add('danger');
        } else if (value >= limit * 0.9) {
            element.classList.add('warning');
        }
    },

    setupAutoResize() {
        const resizeTextarea = () => {
            this.elements.sourceText.style.height = 'auto';
            this.elements.sourceText.style.height = Math.max(120, this.elements.sourceText.scrollHeight) + 'px';
        };

        this.elements.sourceText.addEventListener('input', resizeTextarea);
    },

    clearSourceText() {
        this.elements.sourceText.value = '';
        this.elements.resultText.textContent = '';
        this.state.sourceText = '';
        this.state.translatedText = '';
        this.state.pronunciationText = '';
        this.elements.pronunciationSection.style.display = 'none';
        this.elements.pronunciationSection.classList.remove('visible');
        this.updateStats('');
        this.elements.translateBtn.disabled = true;
        this.elements.sourceText.focus();
    },

    // ============================================
    // الترجمة
    // ============================================

    async translate() {
        const text = this.state.sourceText.trim();

        if (!text) {
            this.showToast('الرجاء إدخال نص للترجمة', 'warning');
            return;
        }

        if (text.length > this.config.maxTextLength) {
            this.showError(`النص طويل جداً. الحد الأقصى هو ${this.config.maxTextLength.toLocaleString()} حرف`);
            return;
        }

        this.state.isTranslating = true;

        // رسالة تحميل مخصصة للنصوص الطويلة
        const loadingText = text.length > this.config.longTextThreshold 
            ? `جاري ترجمة ${(text.length / 1000).toFixed(1)}k حرف...` 
            : 'جاري الترجمة...';
        this.showLoading(loadingText);

        try {
            // محاولة الترجمة باستخدام Google Translate
            const result = await this.translateWithGoogle(text, this.state.sourceLang, this.state.targetLang);

            if (result) {
                this.state.translatedText = result;
                this.elements.resultText.textContent = result;
                
                // إنشاء النطق العربي للنص الأمهري
                const pronunciation = this.transliterateToArabic(result);
                this.state.pronunciationText = pronunciation;
                this.updatePronunciationDisplay(pronunciation);
                
                this.addToHistory(text, result);
            } else {
                throw new Error('فشل في الحصول على الترجمة');
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.state.isTranslating = false;
            this.hideLoading();
        }
    },

    async translateWithGoogle(text, sourceLang, targetLang) {
        try {
            // استخدام Google Translate API (مجاني جزئياً)
            const url = `${this.config.apiEndpoints.google}?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data && data[0]) {
                // استخراج النص المترجم
                let translatedText = '';
                data[0].forEach(item => {
                    if (item[0]) {
                        translatedText += item[0];
                    }
                });
                return translatedText.trim();
            }

            return null;
        } catch (error) {
            console.error('Google Translate error:', error);
            // محاولة استخدام ترجمة بديلة
            return this.translateWithLibre(text, sourceLang, targetLang);
        }
    },

    async translateWithLibre(text, sourceLang, targetLang) {
        try {
            const response = await fetch(this.config.apiEndpoints.libre + '/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                })
            });

            if (!response.ok) {
                throw new Error('LibreTranslate request failed');
            }

            const data = await response.json();
            return data.translatedText;
        } catch (error) {
            console.error('LibreTranslate error:', error);
            throw error;
        }
    },

    // ============================================
    // تحويل النص الأمهري إلى نطق عربي
    // ============================================

    transliterateToArabic(amharicText) {
        if (!amharicText || !this.config.amharicToArabic) {
            return '';
        }

        let pronunciation = amharicText;
        
        // استبدال الكلمات والجمل الكاملة أولاً (الأولوية للكلمات الأطول)
        const sortedKeys = Object.keys(this.config.amharicToArabic).sort((a, b) => b.length - a.length);
        
        for (const key of sortedKeys) {
            const arabic = this.config.amharicToArabic[key];
            // استبدال مع مراعاة حدود الكلمات
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            pronunciation = pronunciation.replace(regex, arabic);
        }

        // تحسينات إضافية للنص
        pronunciation = this.cleanUpPronunciation(pronunciation);
        
        return pronunciation;
    },

    cleanUpPronunciation(text) {
        // إزالة المسافات المتكررة
        text = text.replace(/\s+/g, ' ').trim();
        
        // إضافة مسافات قبل وأ بعد علامات الترقيم
        text = text.replace(/([،.!؟])/g, ' $1 ');
        
        // إزالة أي حروف أمهرية متبقية لم يتم تحويلها
        // نطاق الحروف الأمهرية (Ethiopic): U+1200 إلى U+137F
        text = text.replace(/[\u1200-\u137F]/g, '');
        
        // إزالة الأرقام الأمهرية المتبقية (U+1369 إلى U+137C)
        text = text.replace(/[\u1369-\u137C]/g, '');
        
        // إزالة علامات الترقيم الأمهرية المتبقية
        text = text.replace(/[።፣፤፦፥፧፨]/g, '');
        
        // إزالة المسافات الزائدة مرة أخرى
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    },

    updatePronunciationDisplay(pronunciation) {
        if (!pronunciation) {
            this.elements.pronunciationSection.style.display = 'none';
            return;
        }

        this.elements.pronunciationText.textContent = pronunciation;
        this.elements.pronunciationSection.style.display = 'block';
        this.elements.pronunciationSection.classList.add('visible');
    },

    speakPronunciation() {
        const pronunciation = this.state.pronunciationText;
        
        if (!pronunciation) {
            this.showToast('لا يوجد نطق للقراءة', 'warning');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(pronunciation);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1;

        utterance.onstart = () => {
            this.elements.pronunciationSpeech.classList.add('speaking');
        };

        utterance.onend = () => {
            this.elements.pronunciationSpeech.classList.remove('speaking');
        };

        utterance.onerror = (error) => {
            this.elements.pronunciationSpeech.classList.remove('speaking');
            this.showToast('حدث خطأ في النطق', 'error');
        };

        window.speechSynthesis.speak(utterance);
    },

    async copyPronunciationToClipboard() {
        const pronunciation = this.state.pronunciationText;

        if (!pronunciation) {
            this.showToast('لا يوجد نطق للنسخ', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(pronunciation);
            this.showToast('تم نسخ النطق بنجاح', 'success');
        } catch (error) {
            // طريقة بديلة
            const textarea = document.createElement('textarea');
            textarea.value = pronunciation;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('تم نسخ النطق بنجاح', 'success');
        }
    },

    // ============================================
    // النطق الصوتي
    // ============================================

    speak(type) {
        const text = type === 'source' ? this.state.sourceText : this.state.translatedText;
        const lang = type === 'source' ? this.state.sourceLang : this.state.targetLang;

        if (!text.trim()) {
            this.showToast('لا يوجد نص للنطق', 'warning');
            return;
        }

        // التحقق من دعم اللغة
        const supportedLangs = ['ar', 'en'];
        if (!supportedLangs.includes(lang)) {
            this.showToast('عذراً، النطق غير مدعوم لهذه اللغة حالياً', 'warning');
            return;
        }

        if (this.state.isSpeaking) {
            window.speechSynthesis.cancel();
            this.state.isSpeaking = false;
            this.updateSpeakingIndicator(type, false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => {
            this.state.isSpeaking = true;
            this.updateSpeakingIndicator(type, true);
        };

        utterance.onend = () => {
            this.state.isSpeaking = false;
            this.updateSpeakingIndicator(type, false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.state.isSpeaking = false;
            this.updateSpeakingIndicator(type, false);
            this.showToast('حدث خطأ في النطق', 'error');
        };

        window.speechSynthesis.speak(utterance);
    },

    updateSpeakingIndicator(type, speaking) {
        const btn = type === 'source' ? this.elements.sourceSpeech : this.elements.targetSpeech;
        if (speaking) {
            btn.classList.add('speaking');
            btn.setAttribute('aria-label', 'إيقاف النطق');
        } else {
            btn.classList.remove('speaking');
            btn.setAttribute('aria-label', type === 'source' ? 'النطق' : 'النطق');
        }
    },

    // ============================================
    // النسخ والمشاركة
    // ============================================

    async copyToClipboard() {
        const text = this.state.translatedText;

        if (!text.trim()) {
            this.showToast('لا يوجد نص للنسخ', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('تم نسخ الترجمة بنجاح', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            // طريقة بديلة للنسخ
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('تم نسخ الترجمة بنجاح', 'success');
        }
    },

    async shareTranslation() {
        const text = this.state.translatedText;

        if (!text.trim()) {
            this.showToast('لا يوجد نص للمشاركة', 'warning');
            return;
        }

        const shareData = {
            title: 'مترجم عربي - أمهري',
            text: `الترجمة:\n${text}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                this.showToast('تم مشاركة الترجمة', 'success');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.copyToClipboard();
                }
            }
        } else {
            this.copyToClipboard();
        }
    },

    // ============================================
    // إدارة السجل
    // ============================================

    addToHistory(source, target) {
        const historyItem = {
            id: Date.now(),
            sourceLang: this.state.sourceLang,
            targetLang: this.state.targetLang,
            sourceText: source,
            targetText: target,
            timestamp: new Date().toISOString()
        };

        this.state.history.unshift(historyItem);

        // حذف العناصر الزائدة
        if (this.state.history.length > this.config.maxHistoryItems) {
            this.state.history = this.state.history.slice(0, this.config.maxHistoryItems);
        }

        this.saveHistory();
        this.renderHistory();
    },

    loadHistory() {
        try {
            const saved = localStorage.getItem('translationHistory');
            if (saved) {
                this.state.history = JSON.parse(saved);
                this.renderHistory();
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.state.history = [];
        }
    },

    saveHistory() {
        try {
            localStorage.setItem('translationHistory', JSON.stringify(this.state.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    },

    renderHistory() {
        if (this.state.history.length === 0) {
            this.elements.historyList.innerHTML = '';
            this.elements.emptyHistory.classList.remove('hidden');
            return;
        }

        this.elements.emptyHistory.classList.add('hidden');

        this.elements.historyList.innerHTML = this.state.history.map(item => `
            <div class="history-item" data-id="${item.id}" onclick="App.loadFromHistory(${item.id})">
                <div class="history-header">
                    <span class="history-langs">${this.getLangName(item.sourceLang)} → ${this.getLangName(item.targetLang)}</span>
                    <span class="history-time">${this.formatTime(item.timestamp)}</span>
                </div>
                <div class="history-content">
                    <div class="history-source">${this.escapeHtml(item.sourceText)}</div>
                    <div class="history-target">${this.escapeHtml(item.targetText)}</div>
                </div>
            </div>
        `).join('');
    },

    loadFromHistory(id) {
        const item = this.state.history.find(h => h.id === id);
        if (!item) return;

        // تعيين اللغات
        this.state.sourceLang = item.sourceLang;
        this.state.targetLang = item.targetLang;

        this.elements.sourceLang.value = item.sourceLang;
        this.elements.targetLang.value = item.targetLang;

        this.elements.sourceLabel.textContent = this.getLangName(item.sourceLang);
        this.elements.targetLabel.textContent = this.getLangName(item.targetLang);

        // تعيين النص
        this.state.sourceText = item.sourceText;
        this.state.translatedText = item.targetText;

        this.elements.sourceText.value = item.sourceText;
        this.elements.resultText.textContent = item.targetText;
        this.updateStats(item.sourceText);

        // تفعيل زر الترجمة
        this.elements.translateBtn.disabled = false;

        // تحديث الفئات
        if (item.sourceLang === 'am') {
            this.elements.sourceText.classList.add('amharic-text');
        } else {
            this.elements.sourceText.classList.remove('amharic-text');
        }

        // التمرير للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    clearHistory() {
        if (this.state.history.length === 0) return;

        if (confirm('هل أنت متأكد من مسح جميع الترجمات؟')) {
            this.state.history = [];
            this.saveHistory();
            this.renderHistory();
            this.showToast('تم مسح السجل بنجاح', 'success');
        }
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) {
            return 'الآن';
        } else if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `منذ ${minutes} دقيقة`;
        } else if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `منذ ${hours} ساعة`;
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    },

    // ============================================
    // تحميل وإخفاء التحميل
    // ============================================

    showLoading(message = null) {
        this.elements.loadingSpinner.classList.add('active');
        this.elements.resultText.style.display = 'none';
        
        if (message) {
            const spinnerText = this.elements.loadingSpinner.querySelector('span');
            if (spinnerText) {
                spinnerText.textContent = message;
            }
        }
    },

    hideLoading() {
        this.elements.loadingSpinner.classList.remove('active');
        this.elements.resultText.style.display = 'block';
        
        // إعادة تعيين نص التحميل
        const spinnerText = this.elements.loadingSpinner.querySelector('span');
        if (spinnerText) {
            spinnerText.textContent = 'جاري الترجمة...';
        }
    },

    // ============================================
    // الإشعارات والأخطاء
    // ============================================

    showToast(message, type = 'info') {
        const toast = this.elements.toast;
        toast.textContent = message;
        toast.className = 'toast ' + type;

        // إظهار الإشعار
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // إخفاء الإشعار بعد 3 ثوانٍ
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.classList.add('active');
    },

    hideErrorModal() {
        this.elements.errorModal.classList.remove('active');
    },

    getErrorMessage(error) {
        if (!navigator.onLine) {
            return 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى';
        }

        if (error.message.includes('Network') || error.name === 'TypeError') {
            return 'حدث خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى';
        }

        if (error.message.includes('429')) {
            return 'تم تجاوز حد الطلبات. يرجى الانتظار قليلاً والمحاولة مرة أخرى';
        }

        return 'حدث خطأ أثناء الترجمة. يرجى المحاولة مرة أخرى';
    },

    // ============================================
    // اختصارات لوحة المفاتيح
    // ============================================

    handleKeyboardShortcuts(e) {
        // Ctrl + Enter للترجمة
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.translate();
        }

        // Ctrl + D لمسح النص
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            this.clearSourceText();
        }

        // Escape لإخفاء النافذة
        if (e.key === 'Escape') {
            this.hideErrorModal();
        }
    },

    // ============================================
    // خدمة PWA
    // ============================================

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    },

    // ============================================
    // أدوات مساعدة
    // ============================================

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// تصدير للاستخدام العام
window.App = App;
