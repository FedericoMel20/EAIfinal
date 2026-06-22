const { GraphQLError } = require('graphql');
const instructors = require('../data/instructors');
const courses = require('../data/courses');
const clean = (value, field) => { if (typeof value !== 'string' || !value.trim()) throw new GraphQLError(`${field} cannot be empty.`, { extensions: { code: 'BAD_USER_INPUT' } }); return value.trim(); };
const get = (id) => instructors.find((i) => i.id === String(id));
const view = (instructor) => ({ ...instructor, assignedCourses: () => courses.filter((c) => c.instructorId === instructor.id) });
const missing = (id) => new GraphQLError(`Instructor with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
const nextId = () => String(Math.max(0, ...instructors.map((i) => Number(i.id))) + 1);

module.exports = {
  instructors: () => instructors.map(view),
  instructor: ({ id }) => { const item = get(id); if (!item) throw missing(id); return view(item); },
  createInstructor: ({ input }) => { const item = { id: nextId(), name: clean(input.name, 'Name'), department: clean(input.department, 'Department') }; instructors.push(item); return view(item); },
  updateInstructor: ({ id, input }) => { const item = get(id); if (!item) throw missing(id); if (input.name !== undefined) item.name = clean(input.name, 'Name'); if (input.department !== undefined) item.department = clean(input.department, 'Department'); return view(item); },
  deleteInstructor: ({ id }) => { const index = instructors.findIndex((i) => i.id === String(id)); if (index < 0) throw missing(id); if (courses.some((c) => c.instructorId === String(id))) throw new GraphQLError('Cannot delete an instructor assigned to courses.', { extensions: { code: 'RELATIONSHIP_VIOLATION' } }); return view(instructors.splice(index, 1)[0]); }
};
