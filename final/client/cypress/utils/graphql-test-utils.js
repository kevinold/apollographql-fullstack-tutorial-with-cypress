// Utility to match GraphQL mutation based on the operation name
export const hasMutation = (req, operationName) => {
  const { body } = req;
  return body.hasOwnProperty("query") && body.query.includes(`mutation ${operationName}`)
}
  
// Utility to match GraphQL query based on the operation name
export const hasQuery = (req, operationName) => {
  const { body } = req;
  return body.hasOwnProperty("query") && body.query.includes(`query ${operationName}`)
}

export const aliasQuery = (req, operationName) => {
    if (hasQuery(req, operationName)) {
        req.alias = `gql${operationName}Query`
    }
}

export const aliasMutation = (req, operationName) => {
    if (hasMutation(req, operationName)) {
        req.alias = `gql${operationName}Mutation`
    }
}