// GitHub GraphQL API queries.

export default {
  allProjectsForOrg: `
    query($login: String!) {
      organization(login: $login) {
        projects(first: 100) {
          nodes {
            name
            number
            createdAt
          }
        }
      }
    }
  `,
  allProjectsForRepo: `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name){
        projects(first: 100, states: OPEN) {
          nodes {
            name
            number
            createdAt
          }
        }
      }
    }
  `,
  oneProject: `
    query($owner: String!, $name: String!, $project_number: Int!) {
      repository(owner: $owner, name: $name) {
        project(number: $project_number) {
          createdAt
          closedAt
          columns(first: 10) {
            nodes {
              name
              cards(first: 100) {
                nodes {
                  content {
                    ... on Issue {
                      number
                      title
                      createdAt
                      state
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
        }
      }
    }
  `,
  oneOrgProject: `
    query($login: String!, $project_number: Int!) {
      organization(login: $login) {
        project(number: $project_number) {
          createdAt
          closedAt
          columns(first: 10) {
            nodes {
              name
              cards(first: 100) {
                nodes {
                  content {
                    ... on Issue {
                      number
                      title
                      createdAt
                      state
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
};
