const mongoose = require('mongoose');
const Schema = mongoose.Schema;

async function getRandomAvatar() {
    const response = await fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API_KEY}&tag=&rating=g`
    );
    const json = await response.json();
    const avatarUrl = json.data.images.original_mp4.mp4;
    return avatarUrl;
}

function getAvatarurl() {
    return getRandomAvatar();
}

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        avatar: {
            type: String,
            default: 'https://i.imgur.com/82lC0NF.jpeg',
        },
        description: {
            type: String,
            default: 'No description',
        },
        role: {
            type: String,
            default: 'user',
        },
        friendRequests: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        status: {
            type: String,
            default: 'offline',
        },
        conversations: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Conversation',
            },
        ],
        refreshToken: String,
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function () {
    if (this.avatar === '') {
        this.avatar = await getAvatarurl();
    }
});

userSchema.virtual('url').get(function () {
    return `/users/${this._id}`;
});

userSchema.virtual('createdAtFormatted').get(function () {
    return this.createdAt.toLocaleString();
});

userSchema.virtual('updatedAtFormatted').get(function () {
    return this.updatedAt.toLocaleString();
});

module.exports = mongoose.model('User', userSchema);
