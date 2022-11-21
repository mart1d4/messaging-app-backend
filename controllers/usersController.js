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
            .status(204)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    const friend = await User.findOne({
        username: req.body.username,
    }).exec();
    if (!friend) {
        return res.status(204).json({
            message: `Friend ID ${req.body.friendId} not found`,
        });
    }
    user.friendRequests.push(friend);
    await user.save();
    res.json({
        message: `Friend request sent to ${friend.username}`,
        friend: {
            username: friend.username,
            avatar: friend.avatar,
            status: friend.status,
        },
    });
};

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    addFriend,
};
