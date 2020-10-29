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
    // uri: 'https://different-squirrel.ap-south-1.aws.cloud.dgraph.io/graphql',
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
        console.log("Got quote", quote);
    }
    catch (error) {
        console.log("Failed to fetch quote:", error);
    }
}

async function trial() {
    const data = await fetch("https://github.com");
    console.log("Making API call");
    console.log(data)

}

module.exports = { trial, getRandomQuote }

