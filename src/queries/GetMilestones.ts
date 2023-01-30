import { graphql } from "../__generated";

export default graphql(`#graphql
  query GetMilestones($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      milestones(
        first: 100
        states: [OPEN]
        orderBy: { field: DUE_DATE, direction: ASC }
      ) {
        nodes {
          id
        }
      }
    }
  }
`);
