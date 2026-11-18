import type { Language } from "../types";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
];

export const SAMPLE_PROMPTS: Record<Language, string[]> = {
  en: [
    "A group of seniors is harassing juniors near the hostel block every night. We feel unsafe and nobody is taking action.",
    "Wi-Fi in the hostel has been down for two weeks. We cannot attend online classes or submit assignments, and nobody responds to our complaints.",
    "Prof. Mehta explains complex topics so clearly. Her doubt-clearing sessions are really helpful and engaging.",
    "The canteen's new menu is delicious and the staff is friendly. Food is fresh and hygienic.",
    "Could we have the exam timetable shared a week earlier? It would help us plan.",
  ],
  hi: [
    "हॉस्टल के पास कुछ लड़के देर रात तक रैगिंग और गाली-गलौज करते हैं। हम बहुत डरे हुए हैं और सुरक्षा गार्ड कुछ नहीं कर रहे।",
    "हॉस्टल में वाई-फाई पिछले दो हफ्तों से बंद है और कोई हमारी शिकायतों का जवाब नहीं दे रहा है।",
    "कंप्यूटर साइंस विभाग के प्रोफेसर बहुत अच्छा पढ़ाते हैं और प्रैक्टिकल में पूरा सहयोग करते हैं। बहुत अच्छा माहौल है।",
    "कैंटीन का नया मेनू काफी स्वादिष्ट है और सफाई का भी पूरा ध्यान रखा गया है। धन्यवाद।",
    "अगले सेमेस्टर का टाइमटेबल कृपया एक सप्ताह पहले जारी करें ताकि हम तैयारी की योजना बना सकें।",
  ],
  mr: [
    "वसतिगृहाजवळ रात्रीच्या वेळी रॅगिंग आणि गैरवर्तन सुरू असते, विद्यार्थ्यांमध्ये भीतीचे वातावरण आहे आणि सुरक्षारक्षक दुर्लक्ष करत आहेत.",
    "वसतिगृहात गेल्या आठवड्यापासून पिण्याच्या पाण्याची तीव्र टंचाई आहे आणि स्वच्छतागृहांमध्ये पाणी नसल्यामुळे दुर्गंधी पसरली आहे.",
    "प्राध्यापक देशपांडे यांचे व्याख्यान अतिशय उत्तम आणि माहितीपूर्ण असते. सर्व संकल्पना सहज स्पष्ट होतात.",
    "कॅन्टीनमधील नाश्ता आणि जेवणाचा दर्जा खूप सुधारला आहे, कर्मचारी देखील नम्र आहेत.",
    "पुढील सेमिस्टरचे वेळापत्रक किमान एक आठवडा आधी जाहीर करावे, अशी नम्र विनंती.",
  ],
};

export const UI_STRINGS = {
  en: {
    formTitle: "Student Feedback Portal",
    formSubtitle: "Voice your suggestions, campus issues, or appreciation. Our AI routes feedback to the responsible team in seconds.",
    anonymousNotice: "Anonymous submission is available. Your identity is fully protected.",
    nameLabel: "Your full name",
    emailLabel: "Student email address",
    departmentLabel: "Academic Department",
    yearLabel: "Year of study",
    ratingLabel: "Overall campus experience",
    feedbackLabel: "Share your detailed feedback or complaint",
    feedbackPlaceholder: "Write in English, Hindi (हिंदी) or Marathi (मराठी). Include specific locations, dates, or details...",
    submitBtn: "Submit feedback with AI triage",
    samplesHeading: "Click a sample to test AI:",
  },
  hi: {
    formTitle: "विद्यार्थी फीडबैक पोर्टल",
    formSubtitle: "अपने सुझाव, कॉलेज की समस्याएं या प्रशंसा साझा करें। हमारा AI सेकंडों में जिम्मेदार विभाग को शिकायत भेजता है।",
    anonymousNotice: "गुमनाम (Anonymous) सबमिशन की सुविधा उपलब्ध है। आपकी पहचान पूरी तरह सुरक्षित रहेगी।",
    nameLabel: "आपका पूरा नाम",
    emailLabel: "विद्यार्थी ईमेल आईडी",
    departmentLabel: "विभाग (Department)",
    yearLabel: "अध्ययन वर्ष",
    ratingLabel: "कॉलेज का समग्र अनुभव",
    feedbackLabel: "अपना फीडबैक या शिकायत विस्तार से लिखें",
    feedbackPlaceholder: "हिंदी (हिंदी), मराठी (मराठी) या अंग्रेजी में लिखें। स्थान, समय या जरूरी विवरण शामिल करें...",
    submitBtn: "AI विश्लेषण के साथ फीडबैक दर्ज करें",
    samplesHeading: "AI परीक्षण के लिए उदाहरण चुनें:",
  },
  mr: {
    formTitle: "विद्यार्थी अभिप्राय व तक्रार निवारण पोर्टल",
    formSubtitle: "आपल्या सूचना, समस्या किंवा कौतुक नोंदवा. आमचे AI काही सेकंदात संबंधित विभागाकडे तक्रार पोहोचवते.",
    anonymousNotice: "अनामित (Anonymous) अभिप्राय देण्याची सोय उपलब्ध आहे. आपली ओळख पूर्णपणे गोपनीय राहील.",
    nameLabel: "आपले पूर्ण नाव",
    emailLabel: "विद्यार्थी ईमेल पत्ता",
    departmentLabel: "शैक्षणिक विभाग",
    yearLabel: "शिक्षणाचे वर्ष",
    ratingLabel: "एकूण महाविद्यालयीन अनुभव",
    feedbackLabel: "आपला अभिप्राय किंवा तक्रार सविस्तर लिहा",
    feedbackPlaceholder: "मराठी (मराठी), हिंदी किंवा इंग्रजीत लिहा. ठिकाण, वेळ किंवा महत्त्वाचे मुद्दे नमूद करा...",
    submitBtn: "AI विश्लेषणासह अभिप्राय सादर करा",
    samplesHeading: "AI चाचणीसाठी नमुना वाक्य निवडा:",
  },
};
