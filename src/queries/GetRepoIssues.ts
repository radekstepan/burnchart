export type GetRepoIssuesQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', id: string, nameWithOwner: string, milestones?: { __typename?: 'MilestoneConnection', nodes?: Array<{ __typename?: 'Milestone', id: string, number: number, title: string, description?: string | null, createdAt: any, dueOn?: any | null, issues: { __typename?: 'IssueConnection', pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean }, nodes?: Array<{ __typename?: 'Issue', id: string, number: number, title: string, closedAt?: any | null, labels?: { __typename?: 'LabelConnection', nodes?: Array<{ __typename?: 'Label', name: string } | null> | null } | null } | null> | null } } | null> | null } | null } | null };
export type GetRepoIssuesQueryVariables = {
  owner: string;
  repo: string;
};


export default `#graphql
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
          issues(
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
  }
`;
