// .eleventy.js
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
    // 1. Copy Static Assets
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/assets");

    // 2. Robust Slugify Filter
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

    // 3. SECURE DATA FILTERS (Fixed to prevent "filter is not a function" errors)
    eleventyConfig.addFilter("getHero", function(posts) {
        const arr = Array.isArray(posts) ? posts : [];
        const featured = arr.filter(item => item.featured === true);
        if (featured.length > 0) return featured.slice(0, 5);
        return arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5);
    });

    eleventyConfig.addFilter("getTopAiring", function(posts) {
        const arr = Array.isArray(posts) ? posts : [];
        return arr
            .filter(item => item.status === "ongoing" || item.status === "upcoming")
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 20);
    });

    eleventyConfig.addFilter("filterByType", function(posts, type) {
        const arr = Array.isArray(posts) ? posts : [];
        return arr.filter(item => item.type === type);
    });

    eleventyConfig.addFilter("sortLatest", function(posts) {
        const arr = Array.isArray(posts) ? posts : [];
        return arr.sort((a, b) => (b.year || 0) - (a.year || 0));
    });

    eleventyConfig.addFilter("getRecommended", function(posts) {
        const arr = Array.isArray(posts) ? posts : [];
        return arr
            .map(item => ({
                ...item,
                recScore: (item.rating || 0) * 10 + (item.popularity || 0)
            }))
            .sort((a, b) => b.recScore - a.recScore)
            .slice(0, 20);
    });

    eleventyConfig.addFilter("truncate", function(str, length = 200) {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + '...';
    });

    eleventyConfig.addFilter("json", function(obj) {
        return JSON.stringify(obj);
    });

    eleventyConfig.addFilter("dump", function(obj) {
        return JSON.stringify(obj);
    });

    // 4. DATA HELPER (Reads your JSON once for use in Global Data and Collections)
    const loadPostsData = () => {
        try {
            const postsPath = path.join(__dirname, 'src/_data/posts.json');
            if (!fs.existsSync(postsPath)) return [];
            
            const rawData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
            // Fix for both JSON structures: [{...}] or {"posts": [...]}
            const postsArray = Array.isArray(rawData) ? rawData : (rawData.posts || []);
            
            // Generate watchLinks automatically for all templates
            return postsArray.map(item => ({
                ...item,
                watchLink: `/watch/${item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}/`
            }));
        } catch (error) {
            console.error('Error loading posts.json:', error);
            return [];
        }
    };

    // 5. GLOBAL DATA (Makes {{ posts }} available in Nunjucks)
    eleventyConfig.addGlobalData("posts", loadPostsData);

    // 6. COLLECTIONS (For sidebar and automated lists)
    eleventyConfig.addCollection("popularShows", () => {
        return loadPostsData().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    });

    eleventyConfig.addCollection("allPosts", () => {
        return loadPostsData();
    });

    // 7. BUILD SETTINGS
    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        },
        templateFormats: ["njk", "md", "html"],
        htmlTemplateEngine: "njk",
        dataTemplateEngine: "njk"
    };
};
