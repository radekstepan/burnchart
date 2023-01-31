import { graphql } from "../__generated";

export default graphql(`#graphql
  query GetMilestones($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      milestones(
        first: 20 # TODO pagination
        states: [OPEN]
        orderBy: { field: DUE_DATE, direction: ASC }
      ) {
        nodes {
          id
          number
          title
          description
          createdAt
          dueOn
          issues(
            first: 100 # TODO pagination
          ) {
            nodes {
              id
              closedAt
              labels(first: 10) {
                nodes {
                  id
                  description
                }
              }
            }
          }
        }
      }
    }
  }
`);
