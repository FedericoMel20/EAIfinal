module.exports = `
  type Enrollment {
    id: ID!
    studentId: ID!
    courseId: ID!
    student: Student!
    course: Course!
  }

  input EnrollStudentInput { studentId: ID!, courseId: ID! }

  extend type Query {
    enrollments: [Enrollment!]!
    enrollment(id: ID!): Enrollment
  }

  extend type Mutation {
    enrollStudent(input: EnrollStudentInput!): Enrollment!
    deleteEnrollment(id: ID!): Enrollment!
  }
`;
