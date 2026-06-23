module.exports = `
  type Student {
    id: ID!
    fullName: String!
    gender: String!
    age: Int!
    className: String!
    parentContact: String!
    scores: [Score!]!
  }

  input CreateStudentInput {
    fullName: String!
    gender: String!
    age: Int!
    className: String!
    parentContact: String!
  }

  input UpdateStudentInput {
    fullName: String
    gender: String
    age: Int
    className: String
    parentContact: String
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
