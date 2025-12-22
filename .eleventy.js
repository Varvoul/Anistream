// .eleventy.js
module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Add filters for sorting and slicing
  eleventyConfig.addFilter("sortByRating", function(posts) {
    return posts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  });

  eleventyConfig.addFilter("sortByViews", function(posts) {
    return posts.sort((a, b) => {
      const viewsA = parseInt((a.views || "0").replace(/[^0-9]/g, '')) || 0;
      const viewsB = parseInt((b.views || "0").replace(/[^0-9]/g, '')) || 0;
      return viewsB - viewsA; // Descending order
    });
  });

  eleventyConfig.addFilter("slice", function(array, start, end) {
    return array.slice(start, end);
  });

  eleventyConfig.addFilter("getRandomItems", function(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  });

  eleventyConfig.addFilter("filterByType", function(posts, type) {
    return posts.filter(post => post.type === type);
  });

  // ADD THIS FILTER:
  eleventyConfig.addFilter("default", function(value, defaultValue) {
    return value || defaultValue;
  });

  // Add global data transformations
  eleventyConfig.addGlobalData("popularShows", function() {
    try {
      const posts = require('./src/_data/posts.json');
      const allPosts = posts.posts || [];
      
      // Sort by views (convert string like "1.2K" to numbers)
      return allPosts
        .map(post => {
          let viewCount = 0;
          if (typeof post.views === 'string') {
            if (post.views.includes('K')) {
              viewCount = parseFloat(post.views.replace('K', '')) * 1000;
            } else if (post.views.includes('M')) {
              viewCount = parseFloat(post.views.replace('M', '')) * 1000000;
            } else {
              viewCount = parseInt(post.views.replace(/[^0-9]/g, '')) || 0;
            }
          } else {
            viewCount = post.views || 0;
          }
          return { ...post, _viewCount: viewCount };
        })
        .sort((a, b) => b._viewCount - a._viewCount)
        .slice(0, 10)
        .map(post => {
          const { _viewCount, ...rest } = post;
          return rest;
        });
    } catch (error) {
      console.error('Error loading popular shows:', error);
      return [];
    }
  });

  eleventyConfig.addGlobalData("recommendedShows", function() {
    try {
      const posts = require('./src/_data/posts.json');
      const allPosts = posts.posts || [];
      
      // Get random shows for recommendations
      const shuffled = [...allPosts].sort(() => 0.5 - Math.random());
      
      return shuffled.slice(0, 12).map(post => ({
        title: post.title,
        poster: post.poster || post.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image',
        type: post.type || 'TV',
        episodeCount: post.totalEpisodes || post.episodeCount || 12,
        duration: post.duration || '24m',
        year: post.year || '2023',
        genres: post.genres || ['Action'],
        rating: post.rating || 7.0,
        views: post.views || '500'
      }));
    } catch (error) {
      console.error('Error loading recommended shows:', error);
      return [];
    }
  });

  // FIX THIS: Change from shortcode to filter
  eleventyConfig.addFilter("slugify", function(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  });

  // Add collection for all posts
  eleventyConfig.addCollection("allPosts", function(api) {
    try {
      const posts = require('./src/_data/posts.json');
      return posts.posts || [];
    } catch (error) {
      console.error('Error creating posts collection:', error);
      return [];
    }
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html", "json"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};
