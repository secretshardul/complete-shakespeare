const ApolloClient = require('@apollo/client').ApolloClient;
const InMemoryCache = require('@apollo/client').InMemoryCache;
const createHttpLink = require('@apollo/client').createHttpLink;
const gql = require('@apollo/client').gql;
const fetch = require('cross-fetch').fetch;
const lunr = require('lunr');

const client = new ApolloClient({
    link: createHttpLink({
        uri: 'https://different-squirrel.ap-south-1.aws.cloud.dgraph.io/graphql',
        fetch
    }),
    cache: new InMemoryCache()
});

const GET_QUOTE_QUERY = gql`
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
        const response = await client.query({ query: GET_QUOTE_QUERY, variables: { offset } });
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

const WHO_SAID_QUERY = gql`
    query WhoSaid($phase: String) {
        queryParagraph(filter: {plainText: {alloftext: $phase}}) {
            plainText
            character {
                charName
            }
        }
    }`;

async function whoSaid(phase) {
    try {
        const response = await client.query({ query: WHO_SAID_QUERY, variables: { phase } });
        console.log('Matching phases and characters are');
        console.log(JSON.stringify(response.data.queryParagraph));
        const paragraphs = response.data.queryParagraph;

        var idx = lunr(function () {
            this.ref('position')
            this.field('text')

            paragraphs.forEach((paragraph, position) => {
                const item = {
                    position,
                    text: paragraph.plainText
                };
                console.log("Adding item to Lunr: ", JSON.stringify(item));

                this.add(item);
            });
        });
        const searchResult = idx.search(phase);
        console.log("Got lunr search result");
        console.log(JSON.stringify(searchResult));

    } catch (error) {
        console.log(error);
    }
}

module.exports = { getRandomQuote, whoSaid }
