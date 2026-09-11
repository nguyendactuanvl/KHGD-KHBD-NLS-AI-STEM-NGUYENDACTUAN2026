const body = {
  lesson: "Hàm số lượng giác",
  requirement: "Học sinh hiểu hàm số lượng giác",
  digitalComp: "None",
  aiComp: "None",
  stem: "None",
  grade: 11,
  periods: 2,
  subject: "Toán",
  textbook: "Kết nối tri thức"
};

const topic = body.lesson || body.topic || body.lessonName || 'Mệnh đề';
const grade = body.grade || 'Lớp 10';
const periods = body.periods || body.numPeriods || 4;
const requirements = body.requirement || body.requirements || body.objectives || body.details || '';

console.log({topic, grade, periods, requirements});
