const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/budget-tracko');
        if (process.env.NODE_ENV !== 'production') console.log('MongoDB Connected');
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
