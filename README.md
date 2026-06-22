# CampusConnect

CampusConnect is an in-memory academic management GraphQL API for students, instructors, courses, and enrollments.

## Run the project

```bash
npm install
npm start
```

Open the `/graphql` route in a browser for the GraphiQL IDE. It loads GraphiQL from a public CDN.

## Example queries

Fetch students and their enrolled courses:

```graphql
query {
  students {
    id
    name
    major
    enrolledCourses {
      id
      title
      credits
      instructor { name }
    }
  }
}
```

Fetch all course relationships:

```graphql
query {
  courses {
    title
    instructor { name department }
    enrolledStudents { name email }
  }
}
```

## Example mutations

Create a student using GraphiQL variables:

```graphql
mutation CreateStudent($input: CreateStudentInput!) {
  createStudent(input: $input) {
    id
    name
  }
}
```

Enroll a student using GraphiQL variables:

```graphql
mutation EnrollStudent($input: EnrollStudentInput!) {
  enrollStudent(input: $input) {
    id
    student { name }
    course { title }
  }
}
```

GraphQL errors include an `extensions.code` value, such as `BAD_USER_INPUT`, `DUPLICATE_RECORD`, `RELATIONSHIP_VIOLATION`, or `NOT_FOUND`.
