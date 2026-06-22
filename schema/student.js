module.exports = `
  type Student {
    id: ID!
    name: String!
    email: String!
    major: String!
    enrolledCourses: [Course!]!
  }

  input CreateStudentInput {
    name: String!
    email: String!
    major: String!
  }

  input UpdateStudentInput {
    name: String
    email: String
    major: String
  }

  type Query {
    students: [Student!]!
    student(id: ID!): Student
  }

  type Mutation {
    createStudent(input: CreateStudentInput!): Student!
    updateStudent(id: ID!, input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Student!
  }
`;
