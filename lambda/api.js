const ApolloClient = require('@apollo/client').ApolloClient;
const InMemoryCache = require('@apollo/client').InMemoryCache;
const createHttpLink = require('@apollo/client').createHttpLink;
const gql = require('@apollo/client').gql;
const fetch = require('cross-fetch').fetch;
const lunr = require('lunr');

const client = new ApolloClient({
    link: createHttpLink({
        uri: 'https://lowly-statement.ap-south-1.aws.cloud.dgraph.io/graphql',
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
            work {
                title
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
                    position: position.toString(),
                    text: paragraph.plainText
                };
                console.log("Adding item to Lunr: ", JSON.stringify(item));

                this.add(item);
            });
        });
        const searchResult = idx.search(phase);
        console.log("Got lunr search result");
        console.log(JSON.stringify(searchResult));
        const match = searchResult[0];
        const matchIndex = parseInt(match.ref, 10);

        const matchParagraph = paragraphs[matchIndex];
        console.log('Matching paragraph: ', JSON.stringify(matchParagraph));
        const character = matchParagraph.character.charName;
        const work = matchParagraph.work.title;
        let text = matchParagraph.plainText;
        text = text.replace(/\[p\]/g, ' ');
        console.log('Cleaned text: ', text);
        const resp = `${character} said this in the play ${work}. He says ${text}`;

        return resp;
    } catch (error) {
        console.log(error);
        return 'Failed to find speaker';
    }
}

const SEARCH_CHARACTER_QUERY = gql`
  query SearchCharacterQuery($name: String) {
    queryCharacter(filter: {charName: {allofterms: $name}}) {
      charName
      description
      works {
        title
      }
    }
  }
`;


async function searchCharacter(name) {
    console.log('Searching for ', name);
    const response = await client.query({ query: SEARCH_CHARACTER_QUERY, variables: { name } });
    console.log('Got response', response);
    const charData = response.data.queryCharacter[0];
    const { charName, description, works } = charData;
    return `${charName} is the ${description} in the work ${works[0].title}`;
}

const SEARCH_GENRE_QUERY = gql`
  query SearchGenre($genre: String = "tragedies") {
    queryGenre(filter: {genreName: {alloftext: $genre}}) {
      genreName
      works {
        title
      }
    }
  }
`;

async function listWorksByGenre(genre) {
    console.log('Searching for works under', genre);
    const response = await client.query({ query: SEARCH_GENRE_QUERY, variables: { genre } });
    console.log('Got response', response);
    const charData = response.data.queryGenre[0];
    const { genreName, works } = response.data.queryGenre[0];
    let output = `Shakespeare's works of the genre ${genreName} are`;
    works.forEach((work, index) => {
        switch (index) {
            case 0: output = output.concat(` ${work.title}`);
                break;
            case works.length - 1: output = output.concat(`and ${work.title}`);
                break;
            default: output = output.concat(`, ${work.title}`);
        }
    })
    return output;
}

module.exports = { getRandomQuote, whoSaid, searchCharacter, listWorksByGenre }
