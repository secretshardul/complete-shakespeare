const ApolloClient = require('@apollo/client').ApolloClient;
const InMemoryCache = require('@apollo/client').InMemoryCache;
const gql = require('@apollo/client').gql;

const client = new ApolloClient({
    uri: 'https://48p1r2roz4.sse.codesandbox.io',
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

module.exports = { getRandomQuote }

