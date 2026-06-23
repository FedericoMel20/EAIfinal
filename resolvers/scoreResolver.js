const { GraphQLError } = require('graphql');
const scores = require('../data/scores');
const students = require('../data/students');
const subjects = require('../data/subjects');
const nextId = () => String(Math.max(0, ...scores.map((s) => Number(s.id))) + 1);

const missingStudent = (id) => new GraphQLError(`Student with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
const missingSubject = (id) => new GraphQLError(`Subject with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
const missingScore = (id) => new GraphQLError(`Score with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
const bad = (msg) => new GraphQLError(msg, { extensions: { code: 'BAD_USER_INPUT' } });

const gradeFromScore = (value) => {
  if (value >= 85) return ['A', 'Excellent'];
  if (value >= 75) return ['B', 'Very Good'];
  if (value >= 65) return ['C', 'Credit'];
  if (value >= 55) return ['D', 'Satisfactory'];
  if (value >= 40) return ['E', 'Pass'];
  return ['F', 'Fail'];
};

module.exports = {
  scores: () => scores.map((item) => ({ ...item, grade: gradeFromScore(item.score)[0], remark: gradeFromScore(item.score)[1], student: () => students.find((s) => s.id === item.studentId), subject: () => subjects.find((s) => s.id === item.subjectId) })),
  score: ({ id }) => { const item = scores.find((s) => s.id === String(id)); if (!item) throw missingScore(id); return { ...item, grade: gradeFromScore(item.score)[0], remark: gradeFromScore(item.score)[1], student: () => students.find((s) => s.id === item.studentId), subject: () => subjects.find((s) => s.id === item.subjectId) }; },
  createScore: ({ input }) => {
    const studentId = String(input.studentId); const subjectId = String(input.subjectId); const scoreVal = Number(input.score);
    if (!students.some((s) => s.id === studentId)) throw missingStudent(studentId);
    if (!subjects.some((s) => s.id === subjectId)) throw missingSubject(subjectId);
    if (!Number.isFinite(scoreVal) || scoreVal < 0 || scoreVal > 100) throw bad('Score must be a number between 0 and 100.');
    if (scores.some((s) => s.studentId === studentId && s.subjectId === subjectId)) throw new GraphQLError('A score for this student and subject already exists.', { extensions: { code: 'DUPLICATE_RECORD' } });
    const item = { id: nextId(), studentId, subjectId, score: scoreVal };
    scores.push(item);
    return { ...item, grade: gradeFromScore(item.score)[0], remark: gradeFromScore(item.score)[1], student: () => students.find((s) => s.id === item.studentId), subject: () => subjects.find((s) => s.id === item.subjectId) };
  },
  updateScore: ({ id, input }) => {
    const item = scores.find((s) => s.id === String(id)); if (!item) throw missingScore(id);
    const studentId = input.studentId === undefined ? item.studentId : String(input.studentId);
    const subjectId = input.subjectId === undefined ? item.subjectId : String(input.subjectId);
    if (!students.some((s) => s.id === studentId)) throw missingStudent(studentId);
    if (!subjects.some((s) => s.id === subjectId)) throw missingSubject(subjectId);
    if (scores.some((score) => score.id !== item.id && score.studentId === studentId && score.subjectId === subjectId)) throw new GraphQLError('A score for this student and subject already exists.', { extensions: { code: 'DUPLICATE_RECORD' } });
    if (input.score !== undefined) {
      const scoreVal = Number(input.score);
      if (!Number.isFinite(scoreVal) || scoreVal < 0 || scoreVal > 100) throw bad('Score must be a number between 0 and 100.');
      item.score = scoreVal;
    }
    item.studentId = studentId;
    item.subjectId = subjectId;
    return { ...item, grade: gradeFromScore(item.score)[0], remark: gradeFromScore(item.score)[1], student: () => students.find((s) => s.id === item.studentId), subject: () => subjects.find((s) => s.id === item.subjectId) };
  },
  deleteScore: ({ id }) => {
    const index = scores.findIndex((s) => s.id === String(id)); if (index < 0) throw missingScore(id); return scores.splice(index, 1)[0];
  }
};
