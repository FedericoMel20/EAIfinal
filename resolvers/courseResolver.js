const { GraphQLError } = require('graphql');
const courses = require('../data/courses');
const instructors = require('../data/instructors');
const students = require('../data/students');
const enrollments = require('../data/enrollments');
const fail = (message, code = 'BAD_USER_INPUT') => { throw new GraphQLError(message, { extensions: { code } }); };
const nextId = () => String(Math.max(0, ...courses.map((c) => Number(c.id))) + 1);
const get = (id) => courses.find((c) => c.id === String(id));
const view = (course) => ({ ...course, instructor: () => course.instructorId ? instructors.find((i) => i.id === course.instructorId) || null : null, enrolledStudents: () => enrollments.filter((e) => e.courseId === course.id).map((e) => students.find((s) => s.id === e.studentId)).filter(Boolean) });
const title = (value) => { if (typeof value !== 'string' || !value.trim()) fail('Course title cannot be empty.'); return value.trim(); };
const credits = (value) => { if (!Number.isInteger(value) || value < 1 || value > 6) fail('Credits must be between 1 and 6.'); return value; };
const uniqueTitle = (value, courseId) => { const cleanTitle = title(value); if (courses.some((course) => course.id !== courseId && course.title.toLowerCase() === cleanTitle.toLowerCase())) fail('A course with this title already exists.', 'DUPLICATE_RECORD'); return cleanTitle; };
const instructorId = (value) => { if (value == null) return null; if (!instructors.some((i) => i.id === String(value))) fail(`Instructor with id '${value}' was not found.`, 'NOT_FOUND'); return String(value); };
const missing = (id) => new GraphQLError(`Course with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });

module.exports = {
  courses: () => courses.map(view),
  course: ({ id }) => { const item = get(id); if (!item) throw missing(id); return view(item); },
  createCourse: ({ input }) => { const course = { id: nextId(), title: uniqueTitle(input.title), credits: credits(input.credits), instructorId: instructorId(input.instructorId) }; courses.push(course); return view(course); },
  updateCourse: ({ id, input }) => { const course = get(id); if (!course) throw missing(id); if (input.title !== undefined) course.title = uniqueTitle(input.title, course.id); if (input.credits !== undefined) course.credits = credits(input.credits); if (input.instructorId !== undefined) course.instructorId = instructorId(input.instructorId); return view(course); },
  deleteCourse: ({ id }) => { const index = courses.findIndex((c) => c.id === String(id)); if (index < 0) throw missing(id); if (enrollments.some((e) => e.courseId === String(id))) fail('Cannot delete a course with enrollments.', 'RELATIONSHIP_VIOLATION'); return view(courses.splice(index, 1)[0]); }
};
