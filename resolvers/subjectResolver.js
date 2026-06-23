const { GraphQLError } = require('graphql');
const subjects = require('../data/subjects');
const nextId = () => String(Math.max(0, ...subjects.map((s) => Number(s.id))) + 1);
const text = (value, field) => { if (typeof value !== 'string' || !value.trim()) throw new GraphQLError(`${field} cannot be empty.`, { extensions: { code: 'BAD_USER_INPUT' } }); return value.trim(); };
const get = (id) => subjects.find((s) => s.id === String(id));
const view = (subject) => ({ ...subject });
const missing = (id) => new GraphQLError(`Subject with id '${id}' was not found.`, { extensions: { code: 'NOT_FOUND' } });

module.exports = {
  subjects: () => subjects.map(view),
  subject: ({ id }) => { const item = get(id); if (!item) throw missing(id); return view(item); },
  createSubject: ({ input }) => { const item = { id: nextId(), name: text(input.name, 'Name') }; if (subjects.some((s) => s.name.toLowerCase() === item.name.toLowerCase())) throw new GraphQLError('A subject with this name already exists.', { extensions: { code: 'DUPLICATE_RECORD' } }); subjects.push(item); return view(item); },
  updateSubject: ({ id, input }) => { const item = get(id); if (!item) throw missing(id); if (input.name !== undefined) item.name = text(input.name, 'Name'); return view(item); },
  deleteSubject: ({ id }) => { const index = subjects.findIndex((s) => s.id === String(id)); if (index < 0) throw missing(id); return subjects.splice(index, 1)[0]; }
};
