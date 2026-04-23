const { User } = require("../models");
const { signToken } = require("../utils/auth");

module.exports = {
  // get a single user by id or username
  async getSingleUser({ user = null, params }, res) {
    const foundUser = await User.findOne({
      $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
    })
      .select("-__v")
      .populate({
        path: 'cardio',
        select: '-__v',
        options: { 
          lean: true,
          strict: false
        }
      })
      .populate({
        path: 'resistance',
        select: '-__v',
        // Explicitly include all fields to ensure completed is included
        options: { 
          lean: true,
          strict: false
        }
      })

    if (!foundUser) {
      return res.status(400).json({ message: 'Cannot find a user with this id!' });
    }

    // Ensure cardio exercises have completed field
    if (foundUser.cardio) {
      foundUser.cardio = foundUser.cardio.map(exercise => ({
        ...exercise,
        completed: Boolean(exercise.completed), // Ensure boolean value, default to false
        calories: exercise.caloriesBurned || exercise.calories || 0 // Handle different calorie field names
      }));
    }

    // Ensure resistance exercises have completed field and calories
    if (foundUser.resistance) {
      foundUser.resistance = foundUser.resistance.map(exercise => ({
        ...exercise,
        completed: Boolean(exercise.completed), // Ensure boolean value, default to false
        calories: exercise.calories || 0 // Ensure calories field exists
      }));
    }

    res.json(foundUser);
  },

  // create a user, sign a token, and send it back to sign up page
  async createUser({ body }, res) {
    const user = await User.create(body);

    if (!user) {
      return res.status(400).json({ message: "Something is wrong!" });
    }
    const token = signToken(user);
    res.json({ token, user });
  },

  // login a user, sign a token, and send it back to login page
  async login({ body }, res) {
    const user = await User.findOne({
      $or: [{ username: body.username }, { email: body.email }],
    });
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      return res.status(400).json({ message: "Wrong password!" });
    }
    const token = signToken(user);
    res.json({ token, user });
  },
};
