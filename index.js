const express = require('express');
const cors = require('cors');
const path = require('path');
const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');

const schemas = ['student', 'course', 'instructor', 'enrollment'].map((name) => require(`./schema/${name}`));
const rootValue = Object.assign({}, ...['studentResolver', 'courseResolver', 'instructorResolver', 'enrollmentResolver'].map((name) => require(`./resolvers/${name}`)));
const students = require('./data/students');
const courses = require('./data/courses');
const instructors = require('./data/instructors');
const enrollments = require('./data/enrollments');
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
schema.getType('Student').getFields().enrolledCourses.resolve = (student) => enrollments
  .filter((enrollment) => enrollment.studentId === student.id)
  .map((enrollment) => courses.find((course) => course.id === enrollment.courseId)).filter(Boolean);
schema.getType('Course').getFields().instructor.resolve = (course) => course.instructorId
  ? instructors.find((instructor) => instructor.id === course.instructorId) || null : null;
schema.getType('Course').getFields().enrolledStudents.resolve = (course) => enrollments
  .filter((enrollment) => enrollment.courseId === course.id)
  .map((enrollment) => students.find((student) => student.id === enrollment.studentId)).filter(Boolean);
schema.getType('Instructor').getFields().assignedCourses.resolve = (instructor) => courses
  .filter((course) => course.instructorId === instructor.id);
schema.getType('Enrollment').getFields().student.resolve = (enrollment) => students
  .find((student) => student.id === enrollment.studentId);
schema.getType('Enrollment').getFields().course.resolve = (enrollment) => courses
  .find((course) => course.id === enrollment.courseId);
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
