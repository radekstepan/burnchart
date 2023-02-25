export type GetMilestoneIssuesQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', id: string, nameWithOwner: string, milestone?: { __typename?: 'Milestone', id: string, number: number, title: string, description?: string | null, createdAt: any, dueOn?: any | null, issues: { __typename?: 'IssueConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, nodes?: Array<{ __typename?: 'Issue', id: string, number: number, title: string, closedAt?: any | null, labels?: { __typename?: 'LabelConnection', nodes?: Array<{ __typename?: 'Label', name: string } | null> | null } | null } | null> | null } } | null } | null };
export type GetMilestoneIssuesQueryVariables = {
  owner: string;
  repo: string;
  milestone: number;
  cursor?: string;
};

export default `#graphql
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
          first: 50
          orderBy: { field: UPDATED_AT, direction: ASC }
        ) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            number
            title
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
`;
