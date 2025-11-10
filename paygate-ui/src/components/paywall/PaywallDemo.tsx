import React from 'react';
import Paywall from './Paywall';

const PaywallDemo: React.FC = () => {
  // Sample content to be protected by the paywall
  const previewContent = (
    <div className="prose max-w-none">
      <h3>Exclusive Article Preview</h3>
      <p>
        This is a preview of the premium content. The full article contains valuable insights, 
        in-depth analysis, and expert opinions that will help you understand the topic better.
      </p>
      <p>
        Here's a preview of what you'll get with the full article:
      </p>
      <ul>
        <li>Comprehensive market analysis</li>
        <li>Expert interviews and insights</li>
        <li>Actionable strategies</li>
        <li>Exclusive data and research</li>
      </ul>
      <div className="h-64 bg-gradient-to-b from-gray-100 to-white flex items-center justify-center">
        <p className="text-gray-400">Premium content preview</p>
      </div>
    </div>
  );

  const fullContent = (
    <div className="prose max-w-none">
      <h1>The Complete Guide to Building a Successful Online Business</h1>
      <p className="text-gray-600">Published on October 23, 2023 • 10 min read</p>
      
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-8">
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
          <p className="text-gray-400">Featured Image</p>
        </div>
      </div>
      
      <p className="lead">
        In this comprehensive guide, we'll explore the key strategies and tactics used by successful 
        online entrepreneurs to build and scale their businesses in today's competitive landscape.
      </p>
      
      <h2>Introduction</h2>
      <p>
        The digital revolution has opened up unprecedented opportunities for entrepreneurs. 
        With the right approach, anyone can build a successful online business from anywhere in the world.
      </p>
      
      <h2>Finding Your Niche</h2>
      <p>
        The foundation of any successful online business is a well-defined niche. Here's how to find yours:
      </p>
      <ul>
        <li>Identify your passions and expertise</li>
        <li>Research market demand</li>
        <li>Analyze the competition</li>
        <li>Validate your idea before investing heavily</li>
      </ul>
      
      <h2>Building Your Online Presence</h2>
      <p>
        Your website is your digital storefront. Make it count with these essential elements:
      </p>
      <ul>
        <li>Professional design that reflects your brand</li>
        <li>Mobile-responsive layout</li>
        <li>Clear value proposition</li>
        <li>Strong call-to-action</li>
      </ul>
      
      <div className="bg-blue-50 p-4 rounded-lg my-6">
        <h3 className="text-blue-800">Pro Tip</h3>
        <p className="text-blue-700">
          Focus on building an email list from day one. It's the most valuable asset for any online business.
        </p>
      </div>
      
      <h2>Monetization Strategies</h2>
      <p>
        There are multiple ways to generate revenue from your online business. Here are the most effective ones:
      </p>
      <ul>
        <li>Digital products (eBooks, courses, templates)</li>
        <li>Membership sites</li>
        <li>Affiliate marketing</li>
        <li>Coaching and consulting services</li>
      </ul>
      
      <h2>Scaling Your Business</h2>
      <p>
        Once you've established a solid foundation, it's time to scale. Consider these strategies:
      </p>
      <ul>
        <li>Automation of repetitive tasks</li>
        <li>Outsourcing non-core activities</li>
        <li>Expanding to new markets</li>
        <li>Upselling to existing customers</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>
        Building a successful online business takes time, effort, and persistence. By following these 
        strategies and staying focused on providing value to your audience, you can create a sustainable 
        and profitable online business.
      </p>
      
      <div className="mt-12 pt-6 border-t border-gray-200">
        <h3>About the Author</h3>
        <div className="flex items-center space-x-4 mt-4">
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">JD</span>
          </div>
          <div>
            <p className="font-medium">{user?.full_name || user?.name || user?.email?.split('@')[0] || 'Customer'}</p>
            <p className="text-sm text-gray-500">Digital Entrepreneur & Content Creator</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Paywall
          contentId="premium-article-1"
          previewContent={previewContent}
          fullContent={fullContent}
          price={4.99}
          title="Premium Article: Building a Successful Online Business"
          description="Unlock the complete guide to building a profitable online business with expert strategies and actionable insights."
        />
      </div>
    </div>
  );
};

export default PaywallDemo;
