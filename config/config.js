require('dotenv').config();

module.exports = {
    development: {
        dialect: process.env.DB_DIALECT,
        storage: process.env.DB_NAME_DEVELOPMENT
    },
    test: {
        dialect: process.env.DB_DIALECT,
        storage: process.env.DB_NAME_TEST
    },
    production: {
        dialect: process.env.DB_DIALECT,
        storage: process.env.DB_NAME_PROD
    },
};
