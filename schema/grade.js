module.exports = `
  type Grade {
    id: ID!
    studentId: ID!
    courseId: ID!
    grade: String!
    student: Student!
    course: Course!
  }

  input AssignGradeInput { studentId: ID!, courseId: ID!, grade: String! }
  input UpdateGradeInput { grade: String! }

  extend type Query {
    grades: [Grade!]!
    grade(id: ID!): Grade
  }

  extend type Mutation {
    assignGrade(input: AssignGradeInput!): Grade!
    updateGrade(id: ID!, input: UpdateGradeInput!): Grade!
    deleteGrade(id: ID!): Grade!
  }
`;
