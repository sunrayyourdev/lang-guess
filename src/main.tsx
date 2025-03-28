// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';
import quotesData from './quotes.json' with { type: "json" };

Devvit.configure({
  redditAPI: true,
});

// New helper function to get a random quote
function getRandomQuote() {
  return quotesData[Math.floor(Math.random() * quotesData.length)];
}

// New helper function to generate options based on a quote
function getOptions(quote: any) {
  const correctLanguage = quote.language;
  const randomLanguages = quotesData
    .map(q => q.language)
    .filter(lang => lang !== correctLanguage)
    .slice(0, 2);
  return [...randomLanguages, correctLanguage].sort(() => 0.5 - Math.random());
}

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Guess The Language',
      subredditName: subreddit.name,
      // Updated: add theming for preview
      preview: (
        <vstack height="100%" width="100%" alignment="middle center" backgroundColor="neutral-background">
          <text size="large" color="neutral-content">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Language Guessing',
  height: 'regular',
  render: (_context) => {
    // Updated: apply semantic tokens for theming in Experience Post
    const [quote, setQuote] = useState(getRandomQuote());
    const [selectedOption, setSelectedOption] = useState('');
    const [correctLanguage, setCorrectLanguage] = useState(quote.language);
    const [options, setOptions] = useState(getOptions(quote));

    // Added new state to track correctness
    const [isCorrect, setIsCorrect] = useState(false);
    // Added new state to toggle translation display
    const [showTranslation, setShowTranslation] = useState(false);

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle" backgroundColor="neutral-background">
        <text size="large" color="primary-plain">Guess The Language</text>
        <text size="xxlarge" width="80%" wrap={true} alignment="center middle" color="neutral-content">
          {showTranslation ? quote.translation : quote.quote}
        </text>
        <text size="large" color="neutral-content">Author: {quote.author}</text>
        <hstack gap="small" alignment="center middle">
          {options.map((option, index) => (
            <button
              key={index.toString()}
              icon={
              selectedOption === index.toString()
                ? isCorrect
                ? "checkmark"
                : "close"
                : undefined
              }
              onPress={() => {
              setSelectedOption(index.toString());
              if (option === correctLanguage) {
                setIsCorrect(true);
                setShowTranslation(true);
              } else {
                setIsCorrect(false);
                setShowTranslation(false);
              }
              }}
              appearance={
              selectedOption === index.toString()
                ? isCorrect
                ? "success"
                : "destructive"
                : "secondary"
              }
            >
              {option}
            </button>
          ))}
        </hstack>
        {/* Updated: conditionally show toggle button only if the answer is correct */}
        {isCorrect && (
          <hstack alignment="center middle" gap='small'>
            <button 
              onPress={() => setShowTranslation(!showTranslation)}
              icon='refresh'
              appearance='bordered'
            >
              {showTranslation ? 'Original' : 'English'}
            </button>
            <button 
              onPress={() => {
                const newQuote = getRandomQuote();
                setQuote(newQuote);
                setCorrectLanguage(newQuote.language);
                setOptions(getOptions(newQuote));
                setSelectedOption('');
                setIsCorrect(false);
                setShowTranslation(false);
              }}
              icon="forward"
              appearance='bordered'
            >
              Next
            </button>
          </hstack>
        )}
        {selectedOption !== "" && !isCorrect && (
          <text size="small">Try again</text>
        )}
        {/* Updated: conditionally show restart quiz button only if the answer is correct */}
        {isCorrect && (
          <hstack alignment="center middle">
            
          </hstack>
        )}
      </vstack>
    );
  },
});

export default Devvit;
