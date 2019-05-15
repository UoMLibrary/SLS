const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourceSchema = new Schema(
    {
        featured: Boolean,
        title: String,
        description: String,
        duration: String,
        format: String,
        link: String,
        tags: [String]
    }
);

const resourceModel = mongoose.model('Resource', resourceSchema);

module.exports = {
    schema: resourceSchema,
    model: resourceModel
};