const ApolloClient = require('@apollo/client').ApolloClient;
const InMemoryCache = require('@apollo/client').InMemoryCache;
const createHttpLink = require('@apollo/client').createHttpLink;
const gql = require('@apollo/client').gql;
const fetch = require('cross-fetch').fetch;


const client = new ApolloClient({
    link: createHttpLink({
        uri: 'https://different-squirrel.ap-south-1.aws.cloud.dgraph.io/graphql',
        fetch
    }),
    cache: new InMemoryCache()
});

const getQuoteQuery = gql`
    query GetRandomQuote($offset: Int = 1) {
        queryQuotation(first: 1, offset: $offset) {
            quotationText
        }
    }`

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

async function getRandomQuote() {
    const offset = 1;
    try {
        const quote = await client.query({ query: getQuoteQuery, variables: { offset } });
        console.log("Got quote", quote.data.queryQuotation[0].quotationText);
    }
    catch (error) {
        console.log("Failed to fetch quote:", error);
    }
}



module.exports = { getRandomQuote }

