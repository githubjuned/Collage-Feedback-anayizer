import { analyzeFeedback } from "./analyzer";
import { DEPARTMENTS, type Department, type Feedback, type Status } from "../types";

const POSITIVE = [
  "The new smart classrooms are fantastic. Projectors work perfectly and the AC keeps the room comfortable during lectures.",
  "Prof. Mehta explains complex topics so clearly. Her doubt-clearing sessions are really helpful and engaging.",
  "The library's extended hours during exams were a huge help. Thank you for the quiet study rooms and great book collection.",
  "Wi-Fi speed in the academic block has improved a lot this semester. Online lectures and the LMS run smoothly now.",
  "The canteen's new menu is delicious and the staff is friendly. Food is fresh and hygienic.",
  "Campus bus service has been punctual this month. The drivers are polite and the route is convenient.",
  "Placement training sessions were excellent and very informative. The mock interviews gave me real confidence.",
  "Hostel warden is supportive and the rooms are clean. Really happy with the laundry facility.",
  "The scholarship office processed my documents quickly. Very helpful and responsive staff, thank you!",
  "Lab equipment is modern and the instructors are great. I really enjoy the hands-on projects.",
  "The campus security team responded quickly when I lost my ID card. I feel safe on campus, thank you.",
  "Online exam portal worked smoothly and results were published on time. Great improvement from last year.",
  "The mentorship programme is wonderful. My mentor is supportive and gives excellent career guidance.",
  "Sports ground and gym are well maintained. Love the new lighting and the clean washrooms.",
  "Fee payment portal is now fast and easy to use. Receipt was generated instantly, really appreciate it.",
  "The workshop on AI organised by faculty was outstanding. More such interactive sessions please.",
  "Hostel mess serves tasty food now, with good variety at breakfast and dinner. Thanks to the mess committee.",
  "Library e-resources and journal access are amazing, very useful for my research project.",
];

const NEUTRAL = [
  "Could we have the timetable for next semester shared a week earlier? It would help us plan electives.",
  "The canteen is okay but the menu has been the same for a while. A little variety would help.",
  "The bus timings are fine in the morning, but an additional evening route would help many of us.",
  "Assignment submission dates sometimes overlap across subjects. Please consider coordinating the schedule.",
  "Library is fine overall. Maybe add more charging points near the reading area.",
  "Wi-Fi works in most places, though the signal in the corridor is average.",
  "Classes are going as expected. Some topics could use more practical examples.",
  "The hostel rooms are adequate. A few more study tables would help.",
];

const NEGATIVE = [
  "A group of seniors is harassing juniors near the hostel block every night. We feel unsafe and nobody is taking action.",
  "There was a short circuit in the lab and sparks flew from the socket. It is dangerous and needs urgent attention before someone gets hurt.",
  "Several students got food poisoning after eating at the mess last night. The food was stale and the kitchen is unhygienic.",
  "The street lights near the back gate are not working and the area is very unsafe after 8 PM. Security guards are never present.",
  "Ragging incidents are being ignored by the hostel authorities. Students are scared to complain.",
  "Fire extinguishers in the Block C corridor have expired and the emergency exit is blocked. This is a serious safety hazard.",
  "Wi-Fi in the hostel has been down for two weeks. We cannot attend online classes or submit assignments, and nobody responds to our complaints.",
  "The water supply in the boys' hostel has been unavailable since Monday. This is unbearable, please fix it immediately.",
  "Our internal marks were calculated incorrectly and the department is ignoring requests for revaluation. This is unfair.",
  "The college bus is always late and overcrowded. Many students miss their first lectures every week.",
  "The roof is leaking in the classroom during rain and the benches get wet. It has been like this for months.",
  "The ERP portal keeps crashing during exam registration. Many students could not register before the deadline.",
  "Professor is consistently rude to students and refuses to answer doubts. Several of us are struggling in the subject.",
  "Scholarship amount is delayed again by three months. The administration office gives no clear response.",
  "Lab computers are outdated and half of them are not working. We cannot complete our practicals on time.",
  "The canteen food is overpriced and the quality has gone down. Tea is cold and the tables are dirty.",
  "The washrooms on the second floor are dirty and have no water. Please clean them regularly.",
  "Library lacks the latest reference books for the new syllabus. Many titles are unavailable.",
  "Syllabus is too heavy and the lectures are rushed and stressful. Please add extra revision classes.",
  "The AC in the seminar hall is not working and the room is very hot during sessions.",
  "Hostel laundry machines are broken, and the room fans make noise all night.",
  "The administration office takes too long to issue bonafide certificates. The process is confusing and slow.",
  "Parking area is overcrowded and there is no proper space for bikes. Please arrange more parking.",
  "Wi-Fi is very slow in the library and the reading rooms. Video streaming for lectures keeps buffering.",
  "Lectures are boring and the teaching is outdated. Please use more practical demonstrations.",
  "Exam timetable was released only three days before the exams. The schedule is stressful and confusing.",
  "Mess food is repeated every day and the portion is too small. Please improve the menu.",
  "Projector in room 204 is damaged and the sound system fails often. Classes get delayed.",
  "The shuttle driver drives rashly and doesn't follow the route. Please look into it.",
  "Water cooler near the library is not working. Drinking water is not available on the first floor.",
  "The library is a bit noisy during evenings and the seating is uncomfortable.",
  "The canteen queue is too long during lunch break. Please add one more counter.",
];

const NAMES = [
  "Aarav Sharma", "Priya Nair", "Rohan Gupta", "Ananya Iyer", "Vikram Singh", "Sneha Patel", "Karan Mehta", "Diya Reddy",
  "Arjun Verma", "Meera Joshi", "Rahul Das", "Ishita Kapoor", "Aditya Rao", "Neha Bansal", "Siddharth Menon", "Pooja Desai",
  "Kabir Malhotra", "Tanvi Kulkarni", "Harsh Vora", "Riya Chatterjee", "Manish Yadav", "Sana Khan", "Dev Pillai", "Lakshmi Narayan",
];

/** probability a department's feedback is positive — gives realistic variation */
const DEPT_POSITIVITY: Record<Department, number> = {
  "Computer Science": 0.34,
  Electronics: 0.26,
  Mechanical: 0.12,
  Civil: 0.18,
  "Business Admin": 0.4,
  Biotechnology: 0.3,
  Mathematics: 0.38,
  Architecture: 0.22,
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeed(): Feedback[] {
  const rnd = mulberry32(2024);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const now = Date.now();
  const DAY = 86400000;
  const out: Feedback[] = [];
  const N = 118;

  for (let i = 0; i < N; i++) {
    // volume grows over time (recent weeks busier)
    const t = Math.pow(rnd(), 0.72);
    const ageDays = (1 - t) * 84;
    const createdAt = new Date(now - ageDays * DAY - rnd() * 6 * 3600000).toISOString();
    const department = pick(DEPARTMENTS);
    // overall sentiment improves a bit over time
    const posBias = DEPT_POSITIVITY[department] + (1 - ageDays / 84) * 0.08;
    const r = rnd();
    const pool = r < posBias ? POSITIVE : r < posBias + (1 - posBias) * 0.26 ? NEUTRAL : NEGATIVE;
    const text = pick(pool);
    const base = analyzeFeedback(text);
    const rating =
      base.sentiment === "Positive" ? (rnd() < 0.65 ? 5 : 4) : base.sentiment === "Negative" ? (rnd() < 0.55 ? 1 : 2) : 3;
    const a = analyzeFeedback(text, rating);

    let status: Status;
    const sr = rnd();
    if (a.sentiment === "Positive") status = "Resolved";
    else if (ageDays > 40) status = sr < 0.72 ? "Resolved" : sr < 0.9 ? "In Progress" : "Open";
    else if (ageDays > 14) status = sr < 0.42 ? "Resolved" : sr < 0.72 ? "In Progress" : "Open";
    else status = sr < 0.12 ? "Resolved" : sr < 0.38 ? "In Progress" : "Open";
    if (a.priority === "Critical" && ageDays < 6 && status === "Resolved") status = "In Progress";

    const anonymous = rnd() < 0.2;
    out.push({
      ...a,
      id: `CP-${1000 + i}`,
      studentName: anonymous ? "Anonymous" : pick(NAMES),
      anonymous,
      department,
      year: 1 + Math.floor(rnd() * 4),
      rating,
      text,
      createdAt,
      status,
      assignee: a.suggestedOwner,
    });
  }
  return out.sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)).map((f, i, arr) => ({ ...f, id: `CP-${1000 + arr.length - i}` }));
}
