const User = require('../model/User');

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if (!users) return res.status(204).json({ message: 'No users found' });
    res.json(users);
};

const getUser = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res
            .status(204)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    res.json(user);
};

const getFriends = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOne({ _id: req.params.id })
        .populate('friends')
        .exec();
    if (!user) {
        return res
            .status(204)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    res.json(user.friends);
};

const updateUser = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
    }).exec();
    if (!user) {
        return res
            .status(204)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    res.json(user);
};

const deleteUser = async (req, res) => {
    if (!req?.body?.id)
        return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res
            .status(204)
            .json({ message: `User ID ${req.body.id} not found` });
    }
    const result = await user.deleteOne({ _id: req.body.id });
    res.json(result);
};

const addFriend = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res
            .status(409)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    if (user.username === req.body.friend) {
        return res.status(400).json({ message: "You can't add yourself!" });
    }
    const friend = await User.findOne({
        username: req.body.friend,
    }).exec();
    if (!friend) {
        return res.status(409).json({
            message: `Friend ID ${req.body.friend} not found`,
        });
    }
    if (user.friends.includes(friend._id)) {
        return res.status(400).json({
            message: `Friend ${friend.username} already added`,
        });
    }
    if (user.friendRequestsSent.includes(friend._id)) {
        return res.status(400).json({
            message: `Friend request already sent to ${friend.username}`,
        });
    }
    friend.friendRequests.push(user._id);
    friend.notifications.push({
        content: `${user.username} sent you a friend request`,
        sender: user._id,
    });
    user.friendRequestsSent.push(friend._id);
    await friend.save();
    await user.save();
    res.json({
        message: `Friend request sent to ${friend.username}`,
    });
};

const acceptFriend = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOne({ _id: req.params.id })
        .populate('friendRequests')
        .populate('friends')
        .exec();
    if (!user) {
        return res
            .status(409)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    const friend = await User.findOne({
        _id: req.body.friend,
    })
        .populate('friendRequestsSent')
        .populate('friends')
        .exec();
    if (!friend) {
        return res.status(409).json({
            message: `Friend ID ${req.body.friend} not found`,
        });
    }
    if (user.friends.includes(friend._id)) {
        return res.status(400).json({
            message: `Friend ${friend.username} already added`,
        });
    }
    user.friends.push(friend._id);
    friend.friends.push(user._id);
    user.friendRequests = user.friendRequests.filter(
        (receiver) => receiver._id !== friend._id
    );
    friend.friendRequestsSent = friend.friendRequestsSent.filter(
        (sender) => sender._id !== user._id
    );
    await friend.save();
    await user.save();
    res.json({
        message: `Friend ${friend.username} added`,
    });
};

const getNotifications = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOne({ _id: req.params.id })
        .populate('notifications.sender')
        .exec();
    if (!user) {
        return res
            .status(204)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    res.json(user.notifications);
};

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getFriends,
    addFriend,
    acceptFriend,
    getNotifications,
};
