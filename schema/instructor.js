module.exports = `
  type Instructor {
    id: ID!
    name: String!
    department: String!
    assignedCourses: [Course!]!
  }

  input CreateInstructorInput { name: String!, department: String! }
  input UpdateInstructorInput { name: String, department: String }

  extend type Query {
    instructors: [Instructor!]!
    instructor(id: ID!): Instructor
  }

  extend type Mutation {
    createInstructor(input: CreateInstructorInput!): Instructor!
    updateInstructor(id: ID!, input: UpdateInstructorInput!): Instructor!
    deleteInstructor(id: ID!): Instructor!
  }
`;
