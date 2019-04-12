'use strict';

const mongoose = require("mongoose");

const blogpostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String},
    author: {
        firstName: String,
        lastName: true},
    created: {type: Date, default: Date.now}
});

blogpostSchema.virtual("authorName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogpostSchema.methods.serialize = function () {
    return {
        id: this._id,
        author: this.authorName,
        title: this.title,
        content: this.content,
        created: this.created
    };
};

const Blogpost = mongoose.model("BlogPost", blogpostSchema);

module.exports = { Blogpost };