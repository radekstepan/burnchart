import { graphql } from "../__generated";

export default graphql(`#graphql
  query GetMilestoneIssues(
    $owner: String!
    $repo: String!
    $milestone: Int!
    $cursor: String
  ) {
    repository(
      owner: $owner,
      name: $repo
    ) {
      id
      nameWithOwner
      milestone(number: $milestone) {
        id
        number
        title
        description
        createdAt
        dueOn
        issues(
          after: $cursor
          first: 10
          orderBy: { field: UPDATED_AT, direction: ASC }
        ) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            closedAt
            labels(first: 10) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  }
`);
