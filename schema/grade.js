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

  input AssignScoreInput { studentId: ID!, subjectId: ID!, score: Int! }
  input UpdateScoreInput { score: Int! }

  extend type Query {
    scores: [Score!]!
    score(id: ID!): Score
  }

  extend type Mutation {
    assignScore(input: AssignScoreInput!): Score!
    updateScore(id: ID!, input: UpdateScoreInput!): Score!
    deleteScore(id: ID!): Score!
  }
`;
