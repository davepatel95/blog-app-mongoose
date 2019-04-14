'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:8080/blog-app-mongoose";
exports.PORT = process.env.PORT || 8080;