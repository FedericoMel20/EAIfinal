const express = require('express');
const cors = require('cors');
const path = require('path');
const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');

const schemas = ['student', 'course', 'enrollment', 'grade'].map((name) => require(`./schema/${name}`));
// Note: schema files were repurposed: course -> subject, enrollment -> class, grade -> score
const rootValue = Object.assign({}, ...['studentResolver', 'subjectResolver', 'classResolver', 'scoreResolver'].map((name) => require(`./resolvers/${name}`)));
const students = require('./data/students');
const subjects = require('./data/subjects');
const classes = require('./data/classes');
const scores = require('./data/scores');
const schema = buildSchema(schemas.join('\n'));
const formatError = (error) => ({
  message: error.message,
  locations: error.locations,
  path: error.path,
  extensions: {
    code: error.extensions?.code || (error.originalError ? 'INTERNAL_SERVER_ERROR' : 'GRAPHQL_VALIDATION_FAILED')
  }
});

// Field resolvers keep relationships correct even when an object originates
// from another relationship resolver rather than a top-level query.
// Attach field resolvers for new school model
schema.getType('Student').getFields().scores.resolve = (student) => scores.filter((s) => s.studentId === student.id);
schema.getType('Class').getFields().students.resolve = (cls) => students.filter((s) => s.className === cls.name);
schema.getType('Class').getFields().totalStudents.resolve = (cls) => students.filter((s) => s.className === cls.name).length;
schema.getType('Score').getFields().student.resolve = (score) => students.find((st) => st.id === score.studentId);
schema.getType('Score').getFields().subject.resolve = (score) => subjects.find((sub) => sub.id === score.subjectId);
schema.getType('Score').getFields().grade.resolve = (score) => {
  if (typeof score.score !== 'number') return null;
  if (score.score >= 85) return 'A';
  if (score.score >= 75) return 'B';
  if (score.score >= 65) return 'C';
  if (score.score >= 55) return 'D';
  if (score.score >= 40) return 'E';
  return 'F';
};
schema.getType('Score').getFields().remark.resolve = (score) => {
  if (typeof score.score !== 'number') return null;
  if (score.score >= 85) return 'Excellent';
  if (score.score >= 75) return 'Very Good';
  if (score.score >= 65) return 'Credit';
  if (score.score >= 55) return 'Satisfactory';
  if (score.score >= 40) return 'Pass';
  return 'Fail';
};
const app = express();
app.use(cors());
app.get('/graphql', (_req, res) => res.sendFile(path.join(__dirname, 'graphiql.html')));
app.all('/graphql', createHandler({ schema, rootValue, formatError }));
app.use((error, _req, res, _next) => {
  console.error('Unexpected server error:', error);
  res.status(500).json({
    errors: [{ message: 'An unexpected server error occurred.', extensions: { code: 'INTERNAL_SERVER_ERROR' } }]
  });
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  const serverUrl = `http://localhost:${port}`;
  console.log(`CampusConnect server URL: ${serverUrl}`);
  console.log(`GraphQL endpoint: ${serverUrl}/graphql`);
  console.log(`GraphiQL available: ${serverUrl}/graphql`);
});
