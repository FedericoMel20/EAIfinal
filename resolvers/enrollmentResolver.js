const { GraphQLError } = require('graphql');
const enrollments = require('../data/enrollments');
const students = require('../data/students');
const courses = require('../data/courses');
const view = (item) => ({ ...item, student: () => students.find((s) => s.id === item.studentId), course: () => courses.find((c) => c.id === item.courseId) });
const missing = (id) => new GraphQLError(`Enrollment with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
const nextId = () => String(Math.max(0, ...enrollments.map((e) => Number(e.id))) + 1);

module.exports = {
  enrollments: () => enrollments.map(view),
  enrollment: ({ id }) => { const item = enrollments.find((e) => e.id === String(id)); if (!item) throw missing(id); return view(item); },
  enrollStudent: ({ input }) => { const studentId = String(input.studentId); const courseId = String(input.courseId); if (!students.some((s) => s.id === studentId)) throw new GraphQLError(`Student with id '${studentId}' was not found.`, { extensions: { code: 'NOT_FOUND' } }); if (!courses.some((c) => c.id === courseId)) throw new GraphQLError(`Course with id '${courseId}' was not found.`, { extensions: { code: 'NOT_FOUND' } }); if (enrollments.some((e) => e.studentId === studentId && e.courseId === courseId)) throw new GraphQLError('This student is already enrolled in this course.', { extensions: { code: 'DUPLICATE_RECORD' } }); const item = { id: nextId(), studentId, courseId }; enrollments.push(item); return view(item); },
  deleteEnrollment: ({ id }) => { const index = enrollments.findIndex((e) => e.id === String(id)); if (index < 0) throw missing(id); return view(enrollments.splice(index, 1)[0]); }
};
