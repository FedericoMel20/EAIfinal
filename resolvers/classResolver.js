const { GraphQLError } = require('graphql');
const classes = require('../data/classes');
const students = require('../data/students');
const nextId = () => String(Math.max(0, ...classes.map((c) => Number(c.id))) + 1);
const validLevels = [7, 8, 9];
const text = (value, field) => { if (typeof value !== 'string' || !value.trim()) throw new GraphQLError(`${field} cannot be empty.`, { extensions: { code: 'BAD_USER_INPUT' } }); return value.trim(); };
const integer = (value, field) => { const num = Number(value); if (!Number.isFinite(num) || num < 1) throw new GraphQLError(`${field} must be a positive number.`, { extensions: { code: 'BAD_USER_INPUT' } }); return Math.round(num); };
const findClass = (id) => classes.find((c) => c.id === String(id));
const view = (c) => ({ ...c, totalStudents: () => students.filter((s) => s.className === c.name).length, students: () => students.filter((s) => s.className === c.name) });
const missing = (id) => new GraphQLError(`Class with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });
module.exports = {
  classes: () => classes.map(view),
  class: ({ id }) => { const item = findClass(id); if (!item) throw missing(id); return view(item); },
  createClass: ({ input }) => {
    const name = text(input.name, 'Class name');
    const level = integer(input.level, 'Level');
    const capacity = integer(input.capacity, 'Capacity');
    if (!validLevels.includes(level)) throw new GraphQLError('Level must be 7, 8, or 9.', { extensions: { code: 'BAD_USER_INPUT' } });
    if (classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) throw new GraphQLError('A class with this name already exists.', { extensions: { code: 'DUPLICATE_RECORD' } });
    const item = { id: nextId(), name, level, capacity };
    classes.push(item);
    return view(item);
  },
  updateClass: ({ id, input }) => {
    const item = findClass(id); if (!item) throw missing(id);
    if (input.name !== undefined) {
      const name = text(input.name, 'Class name');
      if (classes.some((c) => c.id !== item.id && c.name.toLowerCase() === name.toLowerCase())) throw new GraphQLError('A class with this name already exists.', { extensions: { code: 'DUPLICATE_RECORD' } });
      const oldName = item.name;
      item.name = name;
      students.filter((student) => student.className === oldName).forEach((student) => { student.className = name; });
    }
    if (input.level !== undefined) {
      const level = integer(input.level, 'Level');
      if (!validLevels.includes(level)) throw new GraphQLError('Level must be 7, 8, or 9.', { extensions: { code: 'BAD_USER_INPUT' } });
      item.level = level;
    }
    if (input.capacity !== undefined) {
      item.capacity = integer(input.capacity, 'Capacity');
    }
    return view(item);
  },
  deleteClass: ({ id }) => {
    const item = findClass(id); if (!item) throw missing(id);
    if (students.some((s) => s.className === item.name)) throw new GraphQLError('Cannot delete class while students are assigned.', { extensions: { code: 'RELATIONSHIP_VIOLATION' } });
    return classes.splice(classes.findIndex((c) => c.id === String(id)), 1)[0];
  }
};
