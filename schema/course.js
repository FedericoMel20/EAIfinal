module.exports = `
  type Course {
    id: ID!
    title: String!
    credits: Int!
    instructorId: ID
    instructor: Instructor
    enrolledStudents: [Student!]!
  }

  input CreateCourseInput {
    title: String!
    credits: Int!
    instructorId: ID
  }

  input UpdateCourseInput {
    title: String
    credits: Int
    instructorId: ID
  }

  extend type Query {
    courses: [Course!]!
    course(id: ID!): Course
  }

  extend type Mutation {
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Course!
  }
`;
