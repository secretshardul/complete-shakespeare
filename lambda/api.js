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
            location
        }
    }`

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

async function getRandomQuote() {
    const QUOTE_COUNT = 1351;
    const offset = between(0, QUOTE_COUNT);
    try {
        const response = await client.query({ query: getQuoteQuery, variables: { offset } });
        let quote = response.data.queryQuotation[0].quotationText;
        let location = response.data.queryQuotation[0].location;
        quote = quote.replace(/<br>/g, ' '); // Replace all <br> tags
        location = location.replace(/<i>/g, ''); // Replace all <i> tags
        location = location.replace(/<\/i>/g, ''); // Replace all </i>. \/ is escaped backslash

        console.log('Got quote', quote);
        console.log('Got location', location);
        return `${quote}    - ${location}`;
    }
    catch (error) {
        console.log('Failed to fetch quote:', error);
        return 'API request failed';
    }
}

module.exports = { getRandomQuote }
