import { graphql } from "../__generated";

export default graphql(`#graphql
  query GetRepoIssues(
    $owner: String!
    $repo: String!
  ) {
    repository(
      owner: $owner,
      name: $repo
    ) {
      id
      nameWithOwner
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
          # TODO sort by closedAt
          issues(first: 10) {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              id
              closedAt
              labels(first: 10) {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`);
