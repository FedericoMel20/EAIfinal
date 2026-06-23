const { GraphQLError } = require('graphql');
const students = require('../data/students');
const scores = require('../data/scores');
const classes = require('../data/classes');
const subjects = require('../data/subjects');
const nextId = () => String(Math.max(0, ...students.map((s) => Number(s.id))) + 1);
const text = (value, field) => { if (typeof value !== 'string' || !value.trim()) throw new GraphQLError(`${field} cannot be empty.`, { extensions: { code: 'BAD_USER_INPUT' } }); return value.trim(); };
const get = (id) => students.find((s) => s.id === String(id));
const gradeFromScore = (value) => {
  if (value >= 85) return ['A', 'Excellent'];
  if (value >= 75) return ['B', 'Very Good'];
  if (value >= 65) return ['C', 'Credit'];
  if (value >= 55) return ['D', 'Satisfactory'];
  if (value >= 40) return ['E', 'Pass'];
  return ['F', 'Fail'];
};
const buildScoreView = (item) => ({
  ...item,
  grade: gradeFromScore(item.score)[0],
  remark: gradeFromScore(item.score)[1],
  student: () => students.find((s) => s.id === item.studentId),
  subject: () => subjects.find((s) => s.id === item.subjectId)
});
const view = (student) => ({
  ...student,
  scores: () => scores.filter((sc) => sc.studentId === student.id).map(buildScoreView)
});
const missing = (id) => new GraphQLError(`Student with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });

module.exports = {
  students: () => students.map(view),
  student: ({ id }) => { const item = get(id); if (!item) throw missing(id); return view(item); },
  createStudent: ({ input }) => {
    const item = {
      id: nextId(),
      fullName: text(input.fullName, 'Full name'),
      gender: text(input.gender, 'Gender'),
      age: Number(input.age) || 0,
      className: text(input.className, 'Class'),
      parentContact: text(input.parentContact, 'Parent contact')
    };
    if (!classes.some((c) => c.name === item.className)) throw new GraphQLError(`Class '${item.className}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
    students.push(item);
    return view(item);
  },
  updateStudent: ({ id, input }) => {
    const item = get(id); if (!item) throw missing(id);
    if (input.fullName !== undefined) item.fullName = text(input.fullName, 'Full name');
    if (input.gender !== undefined) item.gender = text(input.gender, 'Gender');
    if (input.age !== undefined) {
      const age = Number(input.age);
      if (!Number.isInteger(age) || age < 1) throw new GraphQLError('Age must be a positive whole number.', { extensions: { code: 'BAD_USER_INPUT' } });
      item.age = age;
    }
    if (input.className !== undefined) {
      if (!classes.some((c) => c.name === input.className)) throw new GraphQLError(`Class '${input.className}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
      item.className = text(input.className, 'Class');
    }
    if (input.parentContact !== undefined) item.parentContact = text(input.parentContact, 'Parent contact');
    return view(item);
  },
  deleteStudent: ({ id }) => {
    const index = students.findIndex((s) => s.id === String(id)); if (index < 0) throw missing(id);
    for (let scoreIndex = scores.length - 1; scoreIndex >= 0; scoreIndex -= 1) if (scores[scoreIndex].studentId === String(id)) scores.splice(scoreIndex, 1);
    return students.splice(index, 1)[0];
  }
};
