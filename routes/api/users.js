const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');

router.get('/', usersController.getAllUsers);

router
    .route('/:id')
    .get(usersController.getUser)
    .put(usersController.updateUser)
    .delete(usersController.deleteUser);

router.post('/:id/add', usersController.addFriend);

router.post('/:id/accept', usersController.acceptFriend);

router.get('/:id/friends', usersController.getFriends);

router.get('/:id/notifications', usersController.getNotifications);

module.exports = router;
