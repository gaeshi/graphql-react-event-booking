const bcrypt = require('bcryptjs');

const User = require('../../models/user');

const BCRYPT_SALT_ROUNDS = 12;

module.exports = {
    createUser: async args => {
        const existingUser = await User.findOne({email: args.userInput.email});
        try {
            if (existingUser) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('User already exists.');
            }

            const hashedPassword = await bcrypt.hash(args.userInput.password, BCRYPT_SALT_ROUNDS);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });

            const result = await user.save();
            return {...result._doc, password: null, _id: result.id};
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
};