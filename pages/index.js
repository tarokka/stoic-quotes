import Head from 'next/head';
import { useState, useEffect } from 'react';

const PIXABAY_API_KEY = '22938273-e75df13fc567874b6c73e7dad'; // <-- IMPORTANT: Replace with your Pixabay API Key

export default function Home() {
  const [quote, setQuote] = useState({ text: '', author: '' });
  // State for background images for cross-fade effect
  const [bg1, setBg1] = useState({ url: '', opacity: 0 });
  const [bg2, setBg2] = useState({ url: '', opacity: 0 });
  const [isBg1Active, setIsBg1Active] = useState(true); // Tracks which background div is currently primary

  // Function to fetch initial data (quote and first image)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch Initial Quote
      try {
        const quoteResponse = await fetch(`https://stoic-quotes.com/api/quote?_=${new Date().getTime()}`);
        const quoteData = await quoteResponse.json();
        setQuote({ text: quoteData.text, author: quoteData.author || 'Unknown' });
      } catch (error) {
        console.error("Failed to fetch initial quote", error);
        setQuote({ text: 'The best revenge is not to be like your enemy.', author: 'Marcus Aurelius' });
      }

      // Fetch Initial Image
      if (PIXABAY_API_KEY === 'YOUR_PIXABAY_API_KEY') {
        console.warn("Pixabay API Key is not set. Skipping initial image fetch.");
        setBg1({ url: '', opacity: 1 }); // Fallback to no image or a default one
      } else {
        try {
          const imageResponse = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=inspirational+landscape&image_type=photo&orientation=horizontal&safesearch=true&per_page=100`);
          const imageData = await imageResponse.json();
          if (imageData.hits && imageData.hits.length > 0) {
            const randomIndex = Math.floor(Math.random() * imageData.hits.length);
            // Set initial background directly to bg1 without fade for the very first load
            setBg1({ url: imageData.hits[randomIndex].largeImageURL, opacity: 1 });
            setIsBg1Active(true);
          } else {
            setBg1({ url: '', opacity: 1 }); // Fallback if no images found
          }
        } catch (error) {
          console.error("Failed to fetch initial image from Pixabay", error);
          setBg1({ url: '', opacity: 1 }); // Fallback on error
        }
      }
    };
    fetchInitialData();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle new quote and image fetching on button click
  const handleNewQuoteAndImage = async () => {
    console.log("handleNewQuoteAndImage called");

    // Fetch New Quote
    try {
      const quoteResponse = await fetch(`https://stoic-quotes.com/api/quote?_=${new Date().getTime()}`);
      const quoteData = await quoteResponse.json();
      console.log("Quote API Data received:", quoteData);
      setQuote({ text: quoteData.text, author: quoteData.author || 'Unknown' });
    } catch (error) {
      console.error("Failed to fetch quote", error);
      setQuote({ text: 'Another path to wisdom is through resilience in adversity.', author: 'Seneca' }); // Different fallback for subsequent errors
    }

    // Fetch New Image from Pixabay
    if (PIXABAY_API_KEY === 'YOUR_PIXABAY_API_KEY') {
      console.warn("Pixabay API Key is not set. Skipping image fetch.");
      return; // No new image if key is missing
    }

    try {
      const imageResponse = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=inspirational+landscape&image_type=photo&orientation=horizontal&safesearch=true&per_page=100`);
      const imageData = await imageResponse.json();
      console.log("Pixabay API Data received:", imageData);

      if (imageData.hits && imageData.hits.length > 0) {
        const randomIndex = Math.floor(Math.random() * imageData.hits.length);
        const newImageUrl = imageData.hits[randomIndex].largeImageURL;

        if (isBg1Active) {
          setBg2({ url: newImageUrl, opacity: 0 }); // Load into bg2, initially transparent
          setTimeout(() => { // Allow image to start loading
            setBg1(prev => ({ ...prev, opacity: 0 })); // Fade out bg1
            setBg2(prev => ({ ...prev, opacity: 1 })); // Fade in bg2
            setIsBg1Active(false); // bg2 is now active
          }, 50); // 50ms delay
        } else {
          setBg1({ url: newImageUrl, opacity: 0 }); // Load into bg1, initially transparent
          setTimeout(() => { // Allow image to start loading
            setBg2(prev => ({ ...prev, opacity: 0 })); // Fade out bg2
            setBg1(prev => ({ ...prev, opacity: 1 })); // Fade in bg1
            setIsBg1Active(true); // bg1 is now active
          }, 50);
        }
      } else {
        console.warn("No new images found from Pixabay for the query.");
      }
    } catch (error) {
      console.error("Failed to fetch new image from Pixabay", error);
    }
  };

  const handleCopyQuote = () => {
    if (quote.text && quote.author) {
      const textToCopy = `"${quote.text}" - ${quote.author}`;
      console.log("Copying to clipboard:", textToCopy);
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert("Quote copied to clipboard!"); // Consider a more modern notification system later
        })
        .catch(err => {
          console.error("Failed to copy quote: ", err);
          alert("Failed to copy quote.");
        });
    } else {
      alert("No quote to copy.");
    }
  };

  const handleShareLinkedIn = () => {
    if (quote.text && quote.author) {
      const text = `"${quote.text}" - ${quote.author}`;
      const pageUrl = window.location.href;
      console.log("LinkedIn Share - Text:", text, "URL:", pageUrl);
      const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=A%20Stoic%20Quote&summary=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("No quote to share.");
    }
  };

  const handleShareFacebook = () => {
    if (quote.text && quote.author) {
      const text = `"${quote.text}" - ${quote.author}`;
      const pageUrl = window.location.href;
      console.log("Facebook Share - Text:", text, "URL:", pageUrl);
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("No quote to share.");
    }
  };

  const handleShareX = () => {
    if (quote.text && quote.author) {
      const pageUrl = window.location.href;
      const fullText = `"${quote.text}" - ${quote.author} ${pageUrl}`;
      console.log("X Share - Full Text:", fullText);
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("No quote to share.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900"> {/* Fallback background */}
      {/* Background Image Layer 1 */}
      <div
        style={{ backgroundImage: bg1.url ? `url(${bg1.url})` : 'none', opacity: bg1.opacity }}
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0"
      />
      {/* Background Image Layer 2 */}
      <div
        style={{ backgroundImage: bg2.url ? `url(${bg2.url})` : 'none', opacity: bg2.opacity }}
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-1"
      />

      {/* Overlay to improve text readability */}
      <div className="absolute inset-0 bg-black opacity-50 z-2"></div>

      {/* Content Container - must be above backgrounds and overlay */}
      <div className="relative z-3 flex flex-col items-center justify-center min-h-screen text-white p-4">
        <Head>
          <title>Stoic Quote Generator</title>
          <meta name="description" content="Generate random Stoic quotes and share them." />
          <meta property="og:title" content="Stoic Quote Generator" />
          <meta property="og:description" content="Discover timeless wisdom with randomly generated Stoic quotes and share them with your friends." />
          <meta property="og:type" content="website" />
          {/* Add og:url and og:image when you have a deployed URL and a specific image */}
          {/* <meta property="og:url" content="YOUR_DEPLOYED_SITE_URL" /> */}
          {/* <meta property="og:image" content="YOUR_PREVIEW_IMAGE_URL" /> */}
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <div className="bg-gray-800 bg-opacity-75 p-6 sm:p-8 rounded-lg shadow-xl max-w-2xl w-full backdrop-blur-sm">
            <p className="text-xl sm:text-2xl md:text-3xl italic mb-4">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-md sm:text-lg md:text-xl text-gray-300 mb-8">
              - {quote.author}
            </p>
            <button
              onClick={handleNewQuoteAndImage}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 mb-8"
            >
              New Quote
            </button>

            {/* Share Buttons Container */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleCopyQuote}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
              >
                Copy Quote
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
              >
                Share on LinkedIn
              </button>
              <button
                onClick={handleShareFacebook}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-75"
              >
                Share on Facebook
              </button>
              <button
                onClick={handleShareX}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-75"
              >
                Share on X
              </button>
            </div>
          </div>
        </main>

        <footer className="w-full h-24 flex items-center justify-center border-t border-gray-700 mt-12">
          <p className="text-gray-400">
            Another n3k0 craft works experiment. Images from Pixabay.
          </p>
        </footer>
      </div>
    </div>
  );
} 