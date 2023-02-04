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
        # TODO sort by closedAt
        issues(
          after: $cursor
          first: 10
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
                id
                name
              }
            }
          }
        }
      }
    }
  }
`);
