const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const asyncHandler = require('../middleware/asyncHandler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isPaid: user.isPaid,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isPaid: user.isPaid,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// @desc    Auth user with Google
// @route   POST /api/users/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { tokenId } = req.body;

    // Validate tokenId
    if (!tokenId) {
        console.error('Google Auth Error: No tokenId provided');
        return res.status(400).json({ message: 'No Google token provided' });
    }

    // Validate GOOGLE_CLIENT_ID is set
    if (!process.env.GOOGLE_CLIENT_ID) {
        console.error('Google Auth Error: GOOGLE_CLIENT_ID not configured');
        return res.status(500).json({ message: 'Server configuration error: Google Client ID not set' });
    }

    console.log('Attempting Google authentication...');
    console.log('Token received (first 20 chars):', tokenId.substring(0, 20) + '...');
    console.log('Using Client ID:', process.env.GOOGLE_CLIENT_ID);

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { name, email, sub: googleId } = payload;

        console.log('Google token verified successfully for:', email);

        let user = await User.findOne({ email });

        if (user) {
            console.log('Existing user found:', email);
            // User exists, check if they have a googleId
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
                console.log('Updated user with Google ID');
            }
        } else {
            // New user, create them
            console.log('Creating new user:', email);
            user = await User.create({
                name,
                email,
                googleId,
                // No password for Google users
            });
            console.log('New user created successfully');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isPaid: user.isPaid,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('=== Google Auth Error ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        console.error('========================');

        // Provide more specific error messages
        let errorMessage = 'Google authentication failed';
        if (error.message.includes('Token used too late')) {
            errorMessage = 'Google token expired. Please try again.';
        } else if (error.message.includes('Invalid token')) {
            errorMessage = 'Invalid Google token. Please try again.';
        } else if (error.message.includes('audience')) {
            errorMessage = 'Google Client ID mismatch. Please contact support.';
        }

        res.status(401).json({
            message: errorMessage,
            details: error.message
        });
    }
});

module.exports = {
    registerUser,
    authUser,
    googleLogin,
};
