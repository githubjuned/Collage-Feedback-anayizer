import re
import math
from typing import Dict, List, Tuple, Optional, Any

# =====================================================================
# CampusPulse AI - Multilingual NLP & Sentiment Analysis Engine
# Supports: English (en), Hindi (hi), Marathi (mr), and Romanized scripts
# =====================================================================

# Multilingual Sentiment Lexicons
POSITIVE_TERMS: Dict[str, float] = {
    # English
    "great": 2.0, "excellent": 3.0, "amazing": 3.0, "good": 1.5, "helpful": 2.0,
    "love": 2.5, "loved": 2.5, "best": 2.5, "clean": 1.5, "friendly": 2.0,
    "supportive": 2.0, "awesome": 3.0, "outstanding": 3.0, "improved": 2.0,
    "improvement": 2.0, "thank": 1.5, "thanks": 1.5, "happy": 2.0, "satisfied": 2.0,
    "fantastic": 3.0, "wonderful": 3.0, "engaging": 2.0, "smooth": 1.5, "smoothly": 1.5,
    "quick": 1.2, "quickly": 1.2, "fast": 1.2, "nice": 1.5, "impressed": 2.5,
    "enjoy": 2.0, "enjoyed": 2.0, "appreciate": 2.0, "informative": 2.0,
    "responsive": 2.0, "comfortable": 1.5, "delicious": 2.5, "tasty": 2.0,
    "interactive": 1.5, "resolved": 1.5, "recommend": 2.0, "modern": 1.5,
    "punctual": 2.0, "polite": 1.8, "fresh": 1.5, "hygienic": 2.0, "convenient": 1.5,
    "perfect": 2.5, "perfectly": 2.0, "easy": 1.2, "useful": 1.8, "safe": 1.5,

    # Hindi (Devanagari)
    "शानदार": 3.0, "उत्कृष्ट": 3.0, "बहुत अच्छा": 2.5, "अच्छा": 1.5, "अच्छी": 1.5,
    "मददगार": 2.0, "बढ़िया": 2.2, "साफ": 1.5, "स्वच्छ": 1.8, "सुंदर": 1.8,
    "धन्यवाद": 1.5, "संतुष्ट": 2.0, "खुश": 2.0, "स्वादिष्ट": 2.5, "समय पर": 1.8,
    "सराहनीय": 2.2, "सहयोगी": 2.0, "सुविधाजनक": 1.8, "तेज": 1.2, "सुरक्षित": 1.8,
    "आभार": 1.5, "आधुनिक": 1.5, "आरामदायक": 1.8, "सुलभ": 1.5, "उम्दा": 2.5,

    # Marathi (Devanagari)
    "छान": 2.0, "खूप छान": 2.8, "खूप चांगले": 2.8, "चांगले": 1.6, "चांगली": 1.6,
    "उत्तम": 3.0, "मदतशीर": 2.0, "आनंदी": 2.0, "समाधानी": 2.0, "कौतुकास्पद": 2.5,
    "स्वच्छता": 1.5, "वेळेवर": 1.8, "सोयीस्कर": 1.8, "चवदार": 2.2, "सुटसुटीत": 1.5,
    "सहकार्य": 1.8, "मार्गदर्शन": 1.8, "उपयुक्त": 1.8, "विश्वासार्ह": 2.0,

    # Romanized Hindi / Marathi (Hinglish/Marathlish)
    "accha": 1.5, "achha": 1.5, "bohot accha": 2.5, "bahut achha": 2.5, "shandar": 2.8,
    "badhiya": 2.2, "swachh": 1.8, "khoop chaan": 2.8, "uttam": 3.0, "mast": 2.0,
    "dhanyawad": 1.5, "madadgar": 2.0, "samadhani": 2.0
}

NEGATIVE_TERMS: Dict[str, float] = {
    # English
    "bad": -2.0, "poor": -2.5, "terrible": -3.0, "worst": -3.5, "horrible": -3.0,
    "awful": -3.0, "slow": -1.8, "dirty": -2.5, "broken": -2.5, "late": -1.5,
    "unhygienic": -3.0, "unsafe": -3.5, "rude": -2.5, "ignored": -2.5, "ignoring": -2.5,
    "delay": -1.5, "delayed": -2.0, "crowded": -1.5, "overcrowded": -2.0, "noisy": -1.5,
    "leak": -2.0, "leaking": -2.5, "smelly": -2.5, "stale": -2.5, "insects": -2.5,
    "cockroaches": -3.0, "rats": -3.0, "harassing": -4.0, "harassment": -4.0, "ragging": -4.5,
    "unfair": -3.0, "biased": -3.0, "disappointed": -2.5, "frustrating": -2.5,
    "annoying": -2.0, "useless": -3.0, "outdated": -2.0, "shortage": -2.0,
    "unavailable": -2.0, "issue": -1.0, "problem": -1.5, "problems": -1.5,
    "struggling": -2.0, "stressful": -2.0, "waste": -2.0, "overpriced": -2.5,
    "crashing": -2.5, "crashes": -2.5, "failed": -2.0, "fails": -2.0, "damaged": -2.5,
    "scared": -3.0, "danger": -3.0, "dangerous": -3.5, "hazard": -3.0, "hurt": -2.5,
    "poisoning": -4.5, "sparks": -2.8, "unbearable": -3.5, "refuses": -2.5, "refused": -2.5,

    # Hindi (Devanagari)
    "खराब": -2.5, "बेकार": -3.0, "गंदा": -2.5, "गंदगी": -2.5, "धीमा": -1.8,
    "समस्या": -1.5, "परेशानी": -2.0, "कठिनाई": -1.8, "शिकायत": -2.0, "असुरक्षित": -3.5,
    "रैगिंग": -4.5, "धमकी": -4.0, "छेड़छाड़": -4.5, "परेशान": -2.2, "नाराज": -2.2,
    "निराश": -2.5, "अपर्याप्त": -2.0, "टूटा हुआ": -2.5, "टूटी": -2.5, "दर्द": -2.0,
    "बीमार": -3.0, "फूड पॉइजनिंग": -4.5, "बासी": -2.5, "बदबू": -2.5, "लापरवाही": -3.0,
    "अनदेखी": -2.5, "रुकावट": -1.8, "लेट": -1.5, "विलंब": -2.0, "असहनीय": -3.5,
    "भ्रष्ट": -3.5, "भेदभाव": -3.0, "दुर्घटना": -3.5, "खतरा": -3.5,

    # Marathi (Devanagari)
    "वाईट": -2.5, "निकृष्ट": -3.0, "घाण": -2.5, "घाणेरडे": -2.8, "अस्वच्छ": -2.5,
    "त्रास": -2.5, "तक्रार": -2.0, "नाराजी": -2.0, "असमाधानी": -2.2, "अपमान": -3.5,
    "रॅगिंग": -4.5, "धमकावणे": -4.0, "असुरक्षित": -3.5, "अपघात": -3.5, "तुटलेले": -2.5,
    "नादुरुस्त": -2.5, "विलंब": -2.0, "उशीर": -1.8, "असह्य": -3.5, "दुर्लक्ष": -2.8,
    "अडचण": -1.8, "कमी": -1.5, "अपुरे": -2.0, "धोका": -3.5, "धोकादायक": -3.5,

    # Romanized Hindi / Marathi
    "kharab": -2.5, "bekar": -3.0, "ganda": -2.5, "pareshani": -2.0, "trass": -2.5,
    "shikayat": -2.0, "takrar": -2.0, "dhoka": -3.5, "khatra": -3.5, "asurakshit": -3.5
}

CRITICAL_TRIGGERS = [
    # English
    "ragging", "harass", "harassment", "assault", "threat", "threatened", "molest",
    "fire", "electric shock", "short circuit", "sparks", "injury", "injured",
    "accident", "food poisoning", "poisoning", "suicide", "stalk", "abuse", "drugs",
    "hospital", "fainted", "bleeding", "extinguisher", "emergency exit", "bully", "bullied",
    # Hindi
    "रैगिंग", "छेड़छाड़", "धमकी", "आग", "शॉर्ट सर्किट", "करंट", "चोट", "दुर्घटना",
    "फूड पॉइजनिंग", "जहर", "अस्पताल", "खतरा", "शोषण", "डर", "सुरक्षा का खतरा",
    # Marathi
    "रॅगिंग", "धमकावणे", "मारहाण", "आग", "शॉर्टसर्किट", "विद्युत धक्का", "जखमी",
    "अपघात", "विषबाधा", "हॉस्पिटल", "धोका", "छळ", "भीती"
]

URGENCY_TRIGGERS = [
    "urgent", "urgently", "immediately", "asap", "emergency", "dangerous", "serious",
    "hazard", "unbearable", "repeatedly", "ignored", "ignoring", "no action", "scared",
    "तुरंत", "जल्दी", "तत्काल", "अति आवश्यक", "खतरनाक", "गंभीर", "असहनीय", "अनदेखा",
    "तातडीने", "लगेच", "त्वरित", "धोकादायक", "असह्य", "गंभीर बाब"
]

CATEGORY_KEYWORDS = {
    "Academics": [
        "exam", "exams", "syllabus", "curriculum", "course", "courses", "assignment", "assignments",
        "timetable", "schedule", "marks", "revaluation", "internal", "semester", "lectures",
        "placement", "grading", "results", "practical", "workshop", "electives", "credits",
        "परीक्षा", "पाठ्यक्रम", "असाइनमेंट", "टाइमटेबल", "अंक", "रिजल्ट", "कक्षा", "पुनर्मूल्यांकन",
        "अभ्यासक्रम", "वेळापत्रक", "गुण", "निकाल", "प्रॅक्टिकल", "पुनर्मूल्यांकन"
    ],
    "Faculty": [
        "professor", "prof", "teacher", "faculty", "lecturer", "mentor", "teaching", "sir", "madam",
        "explains", "explain", "doubt", "doubts", "instructor", "attendance",
        "शिक्षक", "प्रोफेसर", "प्राध्यापक", "पढ़ाना", "सिखाना", "गुरु", "डाउट", "शिकवणे", "शंका"
    ],
    "Infrastructure": [
        "classroom", "building", "projector", "ac", "fan", "fans", "restroom", "washroom", "washrooms",
        "toilet", "bench", "benches", "parking", "lift", "elevator", "ground", "campus", "electricity",
        "power", "water", "roof", "ceiling", "furniture", "lights", "socket", "cooler", "drinking",
        "क्लासरूम", "इमारत", "प्रोजेक्टर", "पंखा", "शौचालय", "बाथरूम", "बेंच", "पार्किंग", "लिफ्ट",
        "बिजली", "पानी", "छत", "लाइट", "वर्गखोली", "स्वच्छतागृह", "पाणी", "लाईट", "पंखे", "कचरा"
    ],
    "Hostel": [
        "hostel", "hostels", "warden", "roommate", "dorm", "laundry", "curfew", "rooms", "room",
        "हॉस्टल", "छात्रावास", "वार्डन", "कमरा", "कमरे", "वसतिगृह", "खोली", "वॉर्डन", "राहाण्याची सोय"
    ],
    "Canteen": [
        "canteen", "food", "mess", "meal", "meals", "lunch", "breakfast", "dinner", "snack",
        "cafeteria", "menu", "tea", "coffee", "kitchen", "delicious", "tasty", "hygiene",
        "कैंटीन", "मेस", "खाना", "भोजन", "चाय", "नाश्ता", "रसोई", "कॅन्टीन", "जेवण", "मेसमधील", "अन्न"
    ],
    "Transport": [
        "bus", "buses", "transport", "route", "driver", "shuttle", "commute", "pickup", "van",
        "बस", "परिवहन", "रूट", "ड्राइवर", "गाड़ी", "वाहतूक", "चालक", "फेरी"
    ],
    "Library": [
        "library", "book", "books", "journal", "journals", "librarian", "reading", "borrow", "eresources",
        "लाइब्रेरी", "पुस्तकालय", "किताब", "किताबें", "ग्रंथालय", "पुस्तके", "वाचन"
    ],
    "IT & Wi-Fi": [
        "wifi", "wi-fi", "internet", "network", "portal", "website", "server", "login", "computer",
        "software", "lms", "erp", "app", "bandwidth", "signal", "buffering",
        "वाईफाई", "इंटरनेट", "नेटवर्क", "पोर्टल", "वेबसाइट", "कंप्यूटर", "सर्व्हर", "वायफाय", "लॉगिन"
    ],
    "Administration": [
        "office", "fee", "fees", "scholarship", "admin", "administration", "document", "documents",
        "certificate", "bonafide", "registrar", "clerk", "refund", "paperwork", "approval", "receipt",
        "कार्यालय", "फीस", "शुल्क", "छात्रवृत्ति", "दस्तावेज", "प्रमाणपत्र", "प्रशासन", "शिष्यवृत्ती", "कागदपत्रे"
    ],
    "Safety": [
        "harass", "harassment", "ragging", "unsafe", "security", "theft", "stolen", "fire", "assault",
        "threat", "bullying", "cctv", "emergency", "injury", "hazard", "guards", "guard", "scared",
        "सुरक्षा", "रैगिंग", "धमकी", "चोरी", "गार्ड", "सीसीटीवी", "भय", "रॅगिंग", "धोका", "सुरक्षा रक्षक"
    ]
}

CATEGORY_ACTIONS = {
    "Academics": {
        "action": "Escalate to the Academic Dean and review the schedule/assessment process.",
        "owner": "Academic Affairs"
    },
    "Faculty": {
        "action": "Share anonymised feedback with the HoD and arrange a mentoring conversation.",
        "owner": "Head of Department"
    },
    "Infrastructure": {
        "action": "Dispatch the facilities team for on-site inspection and repair.",
        "owner": "Facilities Team"
    },
    "Hostel": {
        "action": "Alert the Chief Warden and schedule a hostel inspection.",
        "owner": "Hostel Administration"
    },
    "Canteen": {
        "action": "Notify the mess committee and run a hygiene & quality audit.",
        "owner": "Mess Committee"
    },
    "Transport": {
        "action": "Review route timings and driver compliance with the Transport Office.",
        "owner": "Transport Office"
    },
    "Library": {
        "action": "Forward to the Chief Librarian for acquisition or service improvement.",
        "owner": "Library Services"
    },
    "IT & Wi-Fi": {
        "action": "Open a ticket with IT Services and check network/uptime logs.",
        "owner": "IT Services"
    },
    "Administration": {
        "action": "Route to the Registrar's office with a 48-hour response target.",
        "owner": "Registrar Office"
    },
    "Safety": {
        "action": "Immediately notify the Security Office and Student Welfare Cell.",
        "owner": "Security Office"
    },
    "General": {
        "action": "Triage manually and assign to the relevant office.",
        "owner": "Student Affairs"
    }
}

SLA_MATRIX = {
    "Critical": "Respond within 4 hours",
    "High": "Respond within 24 hours",
    "Medium": "Respond within 3 days",
    "Low": "Respond within 7 days"
}

def detect_language(text: str) -> str:
    """Detect whether text is primarily English, Hindi, or Marathi."""
    clean = text.strip()
    devanagari_chars = len(re.findall(r'[\u0900-\u097F]', clean))
    total_letters = len(re.findall(r'\w', clean))
    
    if total_letters > 0 and (devanagari_chars / total_letters) > 0.25:
        # Check for Marathi-specific markers
        marathi_markers = ["आहे", "नाही", "खूप", "झाले", "करावे", "मराठी", "वसतिगृह", "प्राध्यापक", "जेवण", "पाणी", "त्रास", "वेळ", "कॅन्टीन", "ग्रंथालय"]
        for marker in marathi_markers:
            if marker in clean:
                return "mr"
        return "hi"
    return "en"

def clean_and_tokenize(text: str) -> List[str]:
    # Replace common abbreviations
    t = text.lower()
    t = re.sub(r'wi-?fi', 'wifi', t)
    t = re.sub(r'e-resources', 'eresources', t)
    # Split by whitespace and punctuation, keeping Devanagari and Latin words
    tokens = re.findall(r'[\u0900-\u097Fa-zA-Z0-9]+', t)
    return tokens

def analyze_feedback(text: str, rating: Optional[int] = None) -> Dict[str, Any]:
    """
    Complete AI/NLP pipeline processing:
    1. Language Detection
    2. Sentiment Scoring (-1.0 to 1.0)
    3. Category Classification
    4. Urgency & Priority Detection (Critical/High/Medium/Low)
    5. Emotion Recognition
    6. Keyword Extraction
    7. Summary and Remediation generation
    """
    raw_text = text.strip()
    lang = detect_language(raw_text)
    lower_text = raw_text.lower()
    tokens = clean_and_tokenize(raw_text)

    # 1. Sentiment Calculation
    sentiment_sum = 0.0
    matched_words = []
    
    # Check multi-word phrase patterns
    phrases = [
        ("not working", -3.0), ("काम नहीं कर रहा", -3.0), ("चालत नाही", -3.0),
        ("no water", -3.0), ("पानी नहीं", -3.0), ("पाणी नाही", -3.0),
        ("not clean", -2.5), ("साफ नहीं", -2.5), ("स्वच्छ नाही", -2.5),
        ("no response", -3.0), ("कोई जवाब नहीं", -3.0), ("प्रतिसाद नाही", -3.0),
        ("food poisoning", -4.5), ("short circuit", -3.8), ("कचरा साचला", -2.5),
        ("thank you", 2.0), ("धन्यवाद", 2.0), ("खूप आभार", 2.0),
        ("very good", 2.5), ("बहुत अच्छा", 2.5), ("खूप छान", 2.5),
        ("superb", 2.8), ("excellent work", 3.0), ("great job", 2.5)
    ]
    for phrase, score_delta in phrases:
        if phrase in lower_text:
            sentiment_sum += score_delta
            matched_words.append(phrase)

    # Token-level scoring
    for i, token in enumerate(tokens):
        pos_val = POSITIVE_TERMS.get(token)
        neg_val = NEGATIVE_TERMS.get(token)
        val = pos_val if pos_val is not None else neg_val
        
        if val is not None:
            # Check context: negations and intensifiers
            prev_window = tokens[max(0, i-2):i]
            is_negated = any(p in ["not", "no", "never", "doesn't", "don't", "नहीं", "नाही", "नव्हते"] for p in prev_window)
            is_intensified = any(p in ["very", "extremely", "really", "so", "बहुत", "खूप", "अतिशय"] for p in prev_window)
            
            if is_intensified:
                val *= 1.4
            if is_negated:
                val = -val * 0.9
            
            sentiment_sum += val
            matched_words.append(token)

    # Combine text score with student rating if provided
    text_score = math.tanh(sentiment_sum / 5.5)
    if rating:
        rating_normalized = (rating - 3) / 2.0  # maps 1..5 to -1.0 .. 1.0
        final_score = (text_score * 0.75) + (rating_normalized * 0.25)
    else:
        final_score = text_score
    
    final_score = max(-1.0, min(1.0, final_score))

    if final_score > 0.16:
        sentiment = "Positive"
    elif final_score < -0.16:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    # Confidence calculation based on length, matched keywords, and score clarity
    confidence = 0.65 + (abs(final_score) * 0.25) + min(len(matched_words) * 0.02, 0.08)
    confidence = min(0.99, max(0.58, round(confidence, 2)))

    # 2. Category Classification
    cat_scores: Dict[str, int] = {}
    cat_matched: Dict[str, List[str]] = {}
    
    for cat, kws in CATEGORY_KEYWORDS.items():
        score = 0
        hits = []
        for kw in kws:
            if kw in lower_text:
                score += 2 if len(kw) > 4 else 1
                hits.append(kw)
        if score > 0:
            cat_scores[cat] = score
            cat_matched[cat] = hits

    # Check for direct critical safety overrides
    safety_triggers_found = [ct for ct in CRITICAL_TRIGGERS if ct in lower_text]
    if safety_triggers_found:
        cat_scores["Safety"] = cat_scores.get("Safety", 0) + 10
        cat_matched["Safety"] = cat_matched.get("Safety", []) + safety_triggers_found

    ranked_categories = sorted(cat_scores.items(), key=lambda x: x[1], reverse=True)
    if ranked_categories:
        primary_category = ranked_categories[0][0]
        secondary_category = ranked_categories[1][0] if len(ranked_categories) > 1 and ranked_categories[1][1] >= 2 else None
    else:
        primary_category = "General"
        secondary_category = None

    # 3. Priority and Urgency
    urgency = 0
    reasons = []

    # Check Critical Safety terms
    if safety_triggers_found:
        urgency += 50
        terms_snippet = ", ".join(set(safety_triggers_found[:3]))
        reasons.append(f"Safety & welfare hazard detected: '{terms_snippet}'")

    # Negative intensity
    if final_score < 0:
        intensity = int(abs(final_score) * 35)
        urgency += intensity
        reasons.append(f"Negative sentiment intensity ({int(abs(final_score)*100)}%)")

    # Urgency keywords
    urgency_hits = [ut for ut in URGENCY_TRIGGERS if ut in lower_text]
    if urgency_hits:
        urgency += min(len(urgency_hits) * 8, 25)
        reasons.append(f"High urgency phrasing: '{', '.join(urgency_hits[:2])}'")

    # Low rating boost
    if rating and rating <= 2:
        urgency += 12
        reasons.append(f"Low rating provided ({rating}/5)")

    # Category contextual weights
    if primary_category in ["Safety", "Hostel", "IT & Wi-Fi"] and final_score < 0:
        urgency += 10
        reasons.append(f"Direct impact area: {primary_category}")

    urgency = max(0, min(100, urgency))

    # Priority mapping
    if sentiment == "Positive":
        priority = "Low"
        reasons = ["Positive feedback received — no immediate corrective action needed"]
    elif safety_triggers_found and sentiment == "Negative":
        priority = "Critical"
    elif urgency >= 70:
        priority = "Critical"
    elif urgency >= 40:
        priority = "High"
    elif urgency >= 20:
        priority = "Medium"
    else:
        priority = "Low"
        if not reasons:
            reasons.append("Standard response priority — routine monitoring")

    # 4. Emotion Detection
    if sentiment == "Positive":
        emotion = "Delighted" if final_score > 0.55 else "Satisfied"
    elif sentiment == "Negative":
        if safety_triggers_found or any(w in lower_text for w in ["scared", "fear", "डर", "भीती", "धोका"]):
            emotion = "Fearful"
        elif any(w in lower_text for w in ["ignored", "again", "weeks", "months", "वारंवार", "कधीपासून", "कोई नहीं सुनता"]):
            emotion = "Frustrated"
        else:
            emotion = "Disappointed"
    else:
        if any(w in lower_text for w in ["suggest", "should", "could", "चाहिए", "सुझाव", "करावे", "सूचना"]):
            emotion = "Constructive"
        else:
            emotion = "Neutral"

    # 5. Keywords Extraction
    extracted_keywords = list(dict.fromkeys(matched_words + cat_matched.get(primary_category, [])))
    if not extracted_keywords:
        # Fallback to tokens
        extracted_keywords = [t for t in tokens if len(t) > 3][:5]
    else:
        extracted_keywords = extracted_keywords[:6]

    # 6. AI Summary Generation
    topic_kw = " & ".join(extracted_keywords[:2]) if extracted_keywords else primary_category.lower()
    if not raw_text:
        summary = "Awaiting feedback text..."
    elif sentiment == "Positive":
        summary = f"Student acknowledges strong performance in {primary_category} ({topic_kw})."
    elif sentiment == "Negative":
        prefix = "Urgent: Student" if priority in ["Critical", "High"] else "Student"
        summary = f"{prefix} highlights difficulties regarding {primary_category} ({topic_kw})."
    else:
        summary = f"Student shared constructive observations regarding {primary_category} ({topic_kw})."

    meta = CATEGORY_ACTIONS.get(primary_category, CATEGORY_ACTIONS["General"])
    if sentiment == "Positive":
        suggested_action = f"Acknowledge commendation with {meta['owner']} and log as departmental best practice."
    else:
        suggested_action = meta["action"]

    return {
        "language": lang,
        "sentiment": sentiment,
        "score": round(final_score, 2),
        "confidence": confidence,
        "category": primary_category,
        "secondary_category": secondary_category,
        "priority": priority,
        "urgency": urgency,
        "emotion": emotion,
        "keywords": extracted_keywords,
        "summary": summary,
        "reasons": reasons,
        "suggested_action": suggested_action,
        "suggested_owner": meta["owner"],
        "sla": SLA_MATRIX.get(priority, "Respond within 3 days")
    }
