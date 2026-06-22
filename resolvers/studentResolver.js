const { GraphQLError } = require('graphql');
const students = require('../data/students');
const enrollments = require('../data/enrollments');
const courses = require('../data/courses');
const nextId = () => String(Math.max(0, ...students.map((s) => Number(s.id))) + 1);
const text = (value, field) => { if (typeof value !== 'string' || !value.trim()) throw new GraphQLError(`${field} cannot be empty.`, { extensions: { code: 'BAD_USER_INPUT' } }); return value.trim(); };
const get = (id) => students.find((s) => s.id === String(id));
const view = (student) => ({ ...student, enrolledCourses: () => enrollments.filter((e) => e.studentId === student.id).map((e) => courses.find((c) => c.id === e.courseId)).filter(Boolean) });
const missing = (id) => new GraphQLError(`Student with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });

module.exports = {
  students: () => students.map(view),
  student: ({ id }) => { const item = get(id); if (!item) throw missing(id); return view(item); },
  createStudent: ({ input }) => { const email = text(input.email, 'Email').toLowerCase(); if (students.some((s) => s.email.toLowerCase() === email)) throw new GraphQLError('A student with this email already exists.', { extensions: { code: 'DUPLICATE_RECORD' } }); const item = { id: nextId(), name: text(input.name, 'Name'), email, major: text(input.major, 'Major') }; students.push(item); return view(item); },
  updateStudent: ({ id, input }) => { const item = get(id); if (!item) throw missing(id); if (input.email !== undefined) { const email = text(input.email, 'Email').toLowerCase(); if (students.some((s) => s.id !== item.id && s.email.toLowerCase() === email)) throw new GraphQLError('A student with this email already exists.', { extensions: { code: 'DUPLICATE_RECORD' } }); item.email = email; } if (input.name !== undefined) item.name = text(input.name, 'Name'); if (input.major !== undefined) item.major = text(input.major, 'Major'); return view(item); },
  deleteStudent: ({ id }) => { const index = students.findIndex((s) => s.id === String(id)); if (index < 0) throw missing(id); if (enrollments.some((e) => e.studentId === String(id))) throw new GraphQLError('Cannot delete a student with active enrollments.', { extensions: { code: 'RELATIONSHIP_VIOLATION' } }); return view(students.splice(index, 1)[0]); }
};
