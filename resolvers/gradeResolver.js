const { GraphQLError } = require('graphql');
const grades = require('../data/grades');
const students = require('../data/students');
const courses = require('../data/courses');
const enrollments = require('../data/enrollments');

const allowedGrades = new Set(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']);
const nextId = () => String(Math.max(0, ...grades.map((item) => Number(item.id))) + 1);
const get = (id) => grades.find((item) => item.id === String(id));
const view = (item) => ({
  ...item,
  student: () => students.find((student) => student.id === item.studentId),
  course: () => courses.find((course) => course.id === item.courseId)
});
const error = (message, code) => new GraphQLError(message, { extensions: { code } });
const validGrade = (value) => {
  const grade = String(value || '').trim().toUpperCase();
  if (!allowedGrades.has(grade)) throw error('Grade must be one of A, A-, B+, B, B-, C+, C, C-, D, or F.', 'BAD_USER_INPUT');
  return grade;
};
const missing = (id) => error(`Grade with id '${id}' was not found.`, 'NOT_FOUND');

module.exports = {
  grades: () => grades.map(view),
  grade: ({ id }) => { const item = get(id); if (!item) throw missing(id); return view(item); },
  assignGrade: ({ input }) => {
    const studentId = String(input.studentId);
    const courseId = String(input.courseId);
    if (!students.some((student) => student.id === studentId)) throw error(`Student with id '${studentId}' was not found.`, 'NOT_FOUND');
    if (!courses.some((course) => course.id === courseId)) throw error(`Course with id '${courseId}' was not found.`, 'NOT_FOUND');
    if (!enrollments.some((enrollment) => enrollment.studentId === studentId && enrollment.courseId === courseId)) throw error('A grade can only be assigned after the student is enrolled in this course.', 'RELATIONSHIP_VIOLATION');
    if (grades.some((item) => item.studentId === studentId && item.courseId === courseId)) throw error('A grade already exists for this student and course.', 'DUPLICATE_RECORD');
    const item = { id: nextId(), studentId, courseId, grade: validGrade(input.grade) };
    grades.push(item);
    return view(item);
  },
  updateGrade: ({ id, input }) => {
    const item = get(id); if (!item) throw missing(id);
    item.grade = validGrade(input.grade);
    return view(item);
  },
  deleteGrade: ({ id }) => {
    const index = grades.findIndex((item) => item.id === String(id));
    if (index < 0) throw missing(id);
    return view(grades.splice(index, 1)[0]);
  }
};
