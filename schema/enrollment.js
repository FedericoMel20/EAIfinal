module.exports = `
  type Class {
    id: ID!
    name: String!
    level: Int!
    capacity: Int!
    totalStudents: Int!
    students: [Student!]!
  }

  input CreateClassInput {
    name: String!
    level: Int!
    capacity: Int!
  }

  input UpdateClassInput {
    name: String
    level: Int
    capacity: Int
  }

  extend type Query {
    classes: [Class!]!
    class(id: ID!): Class
  }

  extend type Mutation {
    createClass(input: CreateClassInput!): Class!
    updateClass(id: ID!, input: UpdateClassInput!): Class!
    deleteClass(id: ID!): Class!
  }
`;
