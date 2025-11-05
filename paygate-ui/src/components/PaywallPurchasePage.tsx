import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

interface PaywallData {
  id: string;
  title: string;
  description: string;
  price: number;
  creator: {
    name: string;
    logo: string;
    verified: boolean;
  };
  contentPreview: {
    images: string[];
    videoUrl?: string;
    sampleText?: string;
  };
  contentDetails: {
    format: string;
    size: string;
    includes: string[];
  };
  purchaseCount: number;
  reviews: {
    rating: number;
    comment: string;
    author: string;
  }[];
}

const PaywallPurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Mock paywall data - in a real implementation, this would come from an API
  const paywallData: PaywallData = {
    id,
    title: 'Premium Content Access',
    description: 'Unlock exclusive content and get access to our premium library',
    price: 19.99,
    creator: {
      name: 'Creator Name',
      logo: 'https://via.placeholder.com/60x60',
      verified: true
    },
    contentPreview: {
      images: [
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400',
        'https://via.placeholder.com/600x400'
      ],
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      sampleText: 'This is a sample of the premium content you will receive access to...'
    },
    contentDetails: {
      format: 'Digital Download + Streaming',
      size: '1.5 GB',
      includes: [
        'Full Premium Content Library',
        'Exclusive Video Tutorials',
        'PDF Guides & Resources',
        'Monthly Updates'
      ]
    },
    purchaseCount: 245,
    reviews: [
      { rating: 5, comment: 'Great content, worth every penny!', author: 'John D.' },
      { rating: 4, comment: 'High quality material with great insights', author: 'Sarah M.' },
      { rating: 5, comment: 'Changed my perspective on the topic', author: 'Mike R.' }
    ]
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle purchase logic here
    console.log('Processing purchase for:', email, discountCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={paywallData.creator.logo} 
              alt="Creator Logo" 
              className="h-10 w-10 rounded-md"
            />
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {paywallData.creator.name}
              </h1>
              <div className="flex items-center">
                {paywallData.creator.verified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secured with SSL</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Content Preview & Details */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {paywallData.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {paywallData.description}
                </p>

                {/* Content Preview Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Preview</h2>
                  <div className="space-y-4">
                    {paywallData.contentPreview.videoUrl && (
                      <div className="aspect-w-16 aspect-h-9">
                        <video 
                          src={paywallData.contentPreview.videoUrl} 
                          controls
                          className="w-full rounded-lg"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2">
                      {paywallData.contentPreview.images.map((img, index) => (
                        <img 
                          key={index}
                          src={img} 
                          alt={`Preview ${index + 1}`}
                          className="rounded-md object-cover h-32 w-full"
                        />
                      ))}
                    </div>
                    
                    {paywallData.contentPreview.sampleText && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <p className="text-gray-700 dark:text-gray-300">
                          {paywallData.contentPreview.sampleText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's Included</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        Format: {paywallData.contentDetails.format}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        Size: {paywallData.contentDetails.size}
                      </span>
                    </li>
                    {paywallData.contentDetails.includes.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social Proof */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What Others Say</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-medium">{paywallData.purchaseCount}</span> people purchased this
                    </p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">(4.2/5)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {paywallData.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                        <div className="flex items-center mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">{review.author}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Checkout */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
              {/* Pricing Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 dark:text-gray-300">Price</span>
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${paywallData.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="discountCode"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter discount code"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">
                      Apply
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handlePurchase}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    {['card', 'paypal', 'apple', 'google'].map((method) => (
                      <div 
                        key={method}
                        className={`flex items-center p-3 border rounded-md cursor-pointer ${
                          paymentMethod === method 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        <input
                          type="radio"
                          id={method}
                          name="paymentMethod"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor={method} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="guestCheckout"
                      name="guestCheckout"
                      type="checkbox"
                      checked={guestCheckout}
                      onChange={(e) => setGuestCheckout(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="guestCheckout" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Checkout as guest
                    </label>
                  </div>
                </div>

                <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  <p>By purchasing, you agree to our Terms of Service and Privacy Policy. You will be charged ${paywallData.price.toFixed(2)} and gain immediate access to the content.</p>
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Get Instant Access
                  </button>
                </div>
              </form>

              <div className="flex justify-center items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure payment • SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Contact Support</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Refund Policy</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Account</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">My Account</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Purchase History</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Downloads</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Powered by</h3>
              <div className="mt-4 flex items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-bold">PG</span>
                  </div>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium">PayGate</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-base text-gray-600 dark:text-gray-300">&copy; {new Date().getFullYear()} {paywallData.creator.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaywallPurchasePage;