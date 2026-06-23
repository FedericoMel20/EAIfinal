module.exports = `
  type Subject {
    id: ID!
    name: String!
  }

  input CreateSubjectInput { name: String! }
  input UpdateSubjectInput { name: String }

  extend type Query {
    subjects: [Subject!]!
    subject(id: ID!): Subject
  }

  extend type Mutation {
    createSubject(input: CreateSubjectInput!): Subject!
    updateSubject(id: ID!, input: UpdateSubjectInput!): Subject!
    deleteSubject(id: ID!): Subject!
  }
`;
