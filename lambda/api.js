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
    query GetRandomQuote {
        queryQuotation(first: 1, offset: 10) {
            quotationText
        }
    }`

async function getRandomQuote() {
    try {
        const quote = await client.query({ query: getQuoteQuery });
        console.log("Got quote", quote.data.queryQuotation[0]);

    }
    catch (error) {
        console.log("Failed to fetch quote:", error);
    }
}



module.exports = { getRandomQuote }

