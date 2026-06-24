module.exports = `
  type Score {
    id: ID!
    studentId: ID!
    subjectId: ID!
    score: Int!
    grade: String!
    remark: String!
    student: Student!
    subject: Subject!
  }

  input CreateScoreInput { studentId: ID!, subjectId: ID!, score: Int! }
  input UpdateScoreInput { studentId: ID, subjectId: ID, score: Int }

  extend type Query {
    scores: [Score!]!
    score(id: ID!): Score
  }

  extend type Mutation {
    createScore(input: CreateScoreInput!): Score!
    updateScore(id: ID!, input: UpdateScoreInput!): Score!
    deleteScore(id: ID!): Score!
  }
`;
