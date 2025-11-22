import { REGULAR_COLS, PRACTICE_COLS } from './constants';

export const mapCourseGrades = (courseGrades) =>
  (courseGrades || []).map((course, idx) => {
    let midterm = '';
    let final = '';
    let regulars = [];
    let practices = [];
    (course.assessments || []).forEach((a) => {
      if (a.assessmentTypeId === 3) midterm = a.score ?? '';
      if (a.assessmentTypeId === 4) final = a.score ?? '';
      if (a.assessmentTypeId === 1 && Array.isArray(a.regularPointsDetails))
        regulars = a.regularPointsDetails.map((r) => r.score ?? '');
      if (a.assessmentTypeId === 2) {
        // Practice assessments have score directly, not in regularPointsDetails
        practices.push(a.score ?? '');
      }
    });
    while (regulars.length < REGULAR_COLS) regulars.push('');
    while (practices.length < PRACTICE_COLS) practices.push('');
    return {
      key: course.sectionId,
      index: idx + 1,
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      credits: course.credits ?? '',
      midterm,
      final,
      finalScore: course.finalScore ?? '',
      gradeLetter: course.gradeLetter || '',
      gpa4: course.gpa4 ?? '',
      rank: course.rank || '',
      note: course.note || '',
      tbqt: course.tbqt || '',
      passed: course.passed ?? '',
      ...Object.fromEntries(regulars.map((v, i) => [`regular${i + 1}`, v])),
      ...Object.fromEntries(practices.map((v, i) => [`practice${i + 1}`, v])),
    };
  });
