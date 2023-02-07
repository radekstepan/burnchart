/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "#graphql\n  query GetMilestoneIssues(\n    $owner: String!\n    $repo: String!\n    $milestone: Int!\n    $cursor: String\n  ) {\n    repository(\n      owner: $owner,\n      name: $repo\n    ) {\n      id\n      nameWithOwner\n      milestone(number: $milestone) {\n        id\n        number\n        title\n        description\n        createdAt\n        dueOn\n        issues(\n          after: $cursor\n          first: 50\n          orderBy: { field: UPDATED_AT, direction: ASC }\n        ) {\n          pageInfo {\n            endCursor\n            hasNextPage\n          }\n          nodes {\n            id\n            number\n            title\n            url\n            closedAt\n            labels(first: 10) {\n              nodes {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetMilestoneIssuesDocument,
    "#graphql\n  query GetRepoIssues(\n    $owner: String!\n    $repo: String!\n  ) {\n    repository(\n      owner: $owner,\n      name: $repo\n    ) {\n      id\n      nameWithOwner\n      milestones(\n        first: 20 # TODO pagination\n        states: [OPEN]\n        orderBy: { field: DUE_DATE, direction: ASC }\n      ) {\n        nodes {\n          id\n          number\n          title\n          description\n          createdAt\n          dueOn\n          issues(\n            first: 50\n            orderBy: { field: UPDATED_AT, direction: ASC }\n          ) {\n            pageInfo {\n              endCursor\n              hasNextPage\n            }\n            nodes {\n              id\n              number\n              title\n              url\n              closedAt\n              labels(first: 10) {\n                nodes {\n                  name\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetRepoIssuesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "#graphql\n  query GetMilestoneIssues(\n    $owner: String!\n    $repo: String!\n    $milestone: Int!\n    $cursor: String\n  ) {\n    repository(\n      owner: $owner,\n      name: $repo\n    ) {\n      id\n      nameWithOwner\n      milestone(number: $milestone) {\n        id\n        number\n        title\n        description\n        createdAt\n        dueOn\n        issues(\n          after: $cursor\n          first: 50\n          orderBy: { field: UPDATED_AT, direction: ASC }\n        ) {\n          pageInfo {\n            endCursor\n            hasNextPage\n          }\n          nodes {\n            id\n            number\n            title\n            url\n            closedAt\n            labels(first: 10) {\n              nodes {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["#graphql\n  query GetMilestoneIssues(\n    $owner: String!\n    $repo: String!\n    $milestone: Int!\n    $cursor: String\n  ) {\n    repository(\n      owner: $owner,\n      name: $repo\n    ) {\n      id\n      nameWithOwner\n      milestone(number: $milestone) {\n        id\n        number\n        title\n        description\n        createdAt\n        dueOn\n        issues(\n          after: $cursor\n          first: 50\n          orderBy: { field: UPDATED_AT, direction: ASC }\n        ) {\n          pageInfo {\n            endCursor\n            hasNextPage\n          }\n          nodes {\n            id\n            number\n            title\n            url\n            closedAt\n            labels(first: 10) {\n              nodes {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "#graphql\n  query GetRepoIssues(\n    $owner: String!\n    $repo: String!\n  ) {\n    repository(\n      owner: $owner,\n      name: $repo\n    ) {\n      id\n      nameWithOwner\n      milestones(\n        first: 20 # TODO pagination\n        states: [OPEN]\n        orderBy: { field: DUE_DATE, direction: ASC }\n      ) {\n        nodes {\n          id\n          number\n          title\n          description\n          createdAt\n          dueOn\n          issues(\n            first: 50\n            orderBy: { field: UPDATED_AT, direction: ASC }\n          ) {\n            pageInfo {\n              endCursor\n              hasNextPage\n            }\n            nodes {\n              id\n              number\n              title\n              url\n              closedAt\n              labels(first: 10) {\n                nodes {\n                  name\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["#graphql\n  query GetRepoIssues(\n    $owner: String!\n    $repo: String!\n  ) {\n    repository(\n      owner: $owner,\n      name: $repo\n    ) {\n      id\n      nameWithOwner\n      milestones(\n        first: 20 # TODO pagination\n        states: [OPEN]\n        orderBy: { field: DUE_DATE, direction: ASC }\n      ) {\n        nodes {\n          id\n          number\n          title\n          description\n          createdAt\n          dueOn\n          issues(\n            first: 50\n            orderBy: { field: UPDATED_AT, direction: ASC }\n          ) {\n            pageInfo {\n              endCursor\n              hasNextPage\n            }\n            nodes {\n              id\n              number\n              title\n              url\n              closedAt\n              labels(first: 10) {\n                nodes {\n                  name\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;