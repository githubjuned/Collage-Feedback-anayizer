import datetime
import random
from app.nlp_engine import analyze_feedback
from app.models import Feedback

DEPARTMENTS = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Business Admin",
    "Biotechnology",
    "Mathematics",
    "Architecture"
]

SEED_ITEMS = [
    # English Positive
    ("The new smart classrooms are fantastic. Projectors work perfectly and the AC keeps the room comfortable during lectures.", 5, "Computer Science", "Rohan Sharma", False),
    ("Prof. Mehta explains complex topics so clearly. Her doubt-clearing sessions are really helpful and engaging.", 5, "Mathematics", "Pooja Patel", False),
    ("The library's extended hours during exams were a huge help. Thank you for the quiet study rooms and great book collection.", 5, "Biotechnology", "Anonymous", True),
    ("Wi-Fi speed in the academic block has improved a lot this semester. Online lectures and the LMS run smoothly now.", 4, "Computer Science", "Devendra Joshi", False),
    ("The canteen's new menu is delicious and the staff is friendly. Food is fresh and hygienic.", 5, "Business Admin", "Karan Verma", False),
    ("Campus bus service has been punctual this month. The drivers are polite and the route is convenient.", 4, "Civil", "Sunita Nair", False),
    ("Placement training sessions were excellent and very informative. The mock interviews gave me real confidence.", 5, "Computer Science", "Aditya Gupta", False),
    ("Hostel warden is supportive and the rooms are clean. Really happy with the laundry facility.", 4, "Mechanical", "Vikas Rao", False),
    ("The scholarship office processed my documents quickly. Very helpful and responsive staff, thank you!", 5, "Architecture", "Meera Kulkarni", False),
    ("Lab equipment is modern and the instructors are great. I really enjoy the hands-on projects.", 5, "Electronics", "Harsh Vardhan", False),
    
    # Hindi Positive & Neutral
    ("कंप्यूटर साइंस विभाग के प्रोफेसर बहुत अच्छा पढ़ाते हैं और प्रैक्टिकल में पूरा सहयोग करते हैं। बहुत अच्छा माहौल है।", 5, "Computer Science", "अमित कुमार", False),
    ("लाइब्रेरी में नई किताबों का संग्रह बहुत बढ़िया है। पढ़ाई के लिए शांत वातावरण मिलता है। धन्यवाद।", 5, "Biotechnology", "सुमन मिश्रा", False),
    ("कैंटीन में नाश्ते का विकल्प ठीक है, लेकिन दोपहर के खाने में थोड़ी और विविधता हो तो अच्छा रहेगा।", 3, "Business Admin", "Anonymous", True),
    ("कॉलेज बस सुबह समय पर आती है, लेकिन शाम को रूट थोड़ा लंबा हो जाता है। कृपया विचार करें।", 3, "Civil", "राहुल यादव", False),

    # Marathi Positive & Neutral
    ("वसतिगृहातील स्वच्छता आणि व्यवस्थापन खूप चांगले आहे. वॉर्डन सरांचे सहकार्य नेहमी मिळते.", 5, "Mechanical", "ओंकार पाटील", False),
    ("प्राध्यापक देशपांडे यांचे व्याख्यान अतिशय उत्तम आणि माहितीपूर्ण असते. सर्व संकल्पना स्पष्ट होतात.", 5, "Electronics", "प्रिया सावंत", False),
    ("ग्रंथालयात अभ्यासासाठी पुरेशी जागा उपलब्ध असते, फक्त वायफाय नेटवर्क कधीकधी मंद चालते.", 3, "Architecture", " Anonymous", True),
    ("पुढील सेमिस्टरचे वेळापत्रक किमान एक आठवडा आधी जाहीर करावे, अशी नम्र विनंती.", 3, "Mathematics", "अनिकेत शिंदे", False),

    # English Neutral
    ("Could we have the timetable for next semester shared a week earlier? It would help us plan electives.", 3, "Computer Science", "Anonymous", True),
    ("The canteen is okay but the menu has been the same for a while. A little variety would help.", 3, "Mechanical", "Nikhil Sen", False),
    ("The bus timings are fine in the morning, but an additional evening route would help many of us.", 3, "Civil", "Ayesha Khan", False),
    ("Wi-Fi works in most places, though the signal in the corridor is average.", 3, "Electronics", "Anonymous", True),

    # Critical & High Negatives (English, Hindi, Marathi)
    ("A group of seniors is harassing juniors near the hostel block every night. We feel unsafe and nobody is taking action.", 1, "Computer Science", "Anonymous", True),
    ("There was a short circuit in the lab and sparks flew from the socket. It is dangerous and needs urgent attention before someone gets hurt.", 1, "Electronics", "Rajesh Deshmukh", False),
    ("Several students got food poisoning after eating at the mess last night. The food was stale and the kitchen is unhygienic.", 1, "Mechanical", "Anonymous", True),
    ("The street lights near the back gate are not working and the area is very unsafe after 8 PM. Security guards are never present.", 1, "Architecture", "Sneha Iyer", False),
    ("Fire extinguishers in the Block C corridor have expired and the emergency exit is blocked. This is a serious safety hazard.", 1, "Civil", "Gaurav Singh", False),
    ("Wi-Fi in the hostel has been down for two weeks. We cannot attend online classes or submit assignments, and nobody responds to our complaints.", 1, "Computer Science", "Ananya Roy", False),
    ("The water supply in the boys' hostel has been unavailable since Monday. This is unbearable, please fix it immediately.", 1, "Business Admin", "Anonymous", True),
    ("Our internal marks were calculated incorrectly and the department is ignoring requests for revaluation. This is unfair.", 2, "Mathematics", "Tanvi Bhatia", False),
    ("The college bus is always late and overcrowded. Many students miss their first lectures every week.", 2, "Civil", "Kunal Shah", False),
    ("The ERP portal keeps crashing during exam registration. Many students could not register before the deadline.", 1, "Computer Science", "Anonymous", True),
    
    # Hindi Critical & Negative
    ("हॉस्टल के पास कुछ लड़के देर रात तक रैगिंग और गाली-गलौज करते हैं। हम बहुत डरे हुए हैं और सुरक्षा गार्ड कुछ नहीं कर रहे।", 1, "Electronics", "Anonymous", True),
    ("मेस के खाने में कीड़े निकले हैं और कई छात्र बीमार पड़ गए हैं। तुरंत रसोई का निरीक्षण किया जाए।", 1, "Mechanical", "सचिन तिवारी", False),
    ("परीक्षा फॉर्म भरते समय ऑनलाइन सर्वर क्रैश हो जाता है। फीस कट गई लेकिन रसीद नहीं मिली।", 1, "Business Admin", "नेहा वर्मा", False),
    ("गर्मी में क्लासरूम के पंखे खराब हैं और पीने के पानी का कूलर पिछले एक महीने से बंद पड़ा है।", 2, "Civil", "विकास पांडे", False),

    # Marathi Critical & Negative
    ("हॉस्टेलमध्ये गेल्या आठवड्यापासून पिण्याच्या पाण्याची तीव्र टंचाई आहे. स्वच्छतागृहांमध्ये पाणी नसल्यामुळे दुर्गंधी पसरली आहे.", 1, "Architecture", " Anonymous", True),
    ("लॅबमधील कॉम्प्युटर्स जुने आणि नादुरुस्त आहेत, प्रॅक्टिकल वेळेत पूर्ण करता येत नाहीत. अनेक वेळा तक्रार करूनही दखल घेतली नाही.", 2, "Computer Science", "प्रतीक कांबळे", False),
    ("कॉलेजच्या मुख्य प्रवेशद्वाराजवळ रात्रीच्या वेळी पथदिवे बंद असतात, मुलींसाठी हा परिसर अत्यंत असुरक्षित वाटतो.", 1, "Biotechnology", " Anonymous", True),
    ("मेसमधील जेवण अत्यंत निकृष्ट दर्जाचे असून जेवल्याने अनेक विद्यार्थ्यांना उलट्या आणि त्रास झाला आहे.", 1, "Mechanical", "स्वप्निल मोरे", False)
]

def generate_seed_feedbacks():
    feedbacks = []
    now = datetime.datetime.utcnow()
    
    for idx, (text, rating, dept, name, anon) in enumerate(SEED_ITEMS, start=1001):
        # Stagger creation dates across the past 80 days
        days_ago = random.randint(1, 80)
        hours_ago = random.randint(0, 23)
        created_dt = now - datetime.timedelta(days=days_ago, hours=hours_ago)
        
        analysis = analyze_feedback(text, rating)
        
        # Decide status based on age & priority
        if days_ago > 30 and analysis["priority"] in ["Low", "Medium"]:
            status = "Resolved"
        elif days_ago > 14:
            status = random.choice(["In Progress", "Resolved", "Open"])
        else:
            status = "Open" if analysis["priority"] in ["Critical", "High"] else random.choice(["Open", "In Progress"])

        fb = Feedback(
            id=f"CP-{idx}",
            student_name=name if not anon else "Anonymous",
            anonymous=anon,
            email=f"student{idx}@campus.edu" if not anon else None,
            department=dept,
            year=random.choice([1, 2, 3, 4]),
            rating=rating,
            text=text,
            language=analysis["language"],
            sentiment=analysis["sentiment"],
            score=analysis["score"],
            confidence=analysis["confidence"],
            category=analysis["category"],
            secondary_category=analysis["secondary_category"],
            priority=analysis["priority"],
            urgency=analysis["urgency"],
            emotion=analysis["emotion"],
            keywords_json=None,
            summary=analysis["summary"],
            reasons_json=None,
            suggested_action=analysis["suggested_action"],
            suggested_owner=analysis["suggested_owner"],
            sla=analysis["sla"],
            status=status,
            assignee=analysis["suggested_owner"] if status != "Open" else None,
            is_demo=True,
            created_at=created_dt,
            updated_at=created_dt
        )
        fb.keywords = analysis["keywords"]
        fb.reasons = analysis["reasons"]
        feedbacks.append(fb)

    return feedbacks
