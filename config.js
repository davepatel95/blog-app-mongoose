'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/blog-post-app";
exports.port = process.env.PORT || 8080;