const mongoose = require('mongoose');
const Schema = mongoose.Schema;

async function getRandomAvatar() {
    const response = await fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API_KEY}&tag=&rating=g`
    );
    const json = await response.json();
    const avatarUrl = json.data.images.downsized.url;
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
            default: '',
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
        friendRequestsSent: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        friends: [
            {
                friend: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
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
                default: [],
            },
        ],
        notifications: [
            {
                content: {
                    type: String,
                    default: '',
                },
                sender: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                sentAt: {
                    type: Date,
                    default: Date.now,
                },
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
