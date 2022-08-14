const { User, OfficialLetter, Reimbursement, sequelize } = require("../models");
const { verifyPassword } = require("../helpers/bcrypt");
const { signPayload } = require("../helpers/jwt");
const { getCityName, getGeocode } = require("../services/location");

class UserController {
  static async registerUser(req, res, next) {
    try {
      const {
        firstName,
        lastName,
        role,
        email,
        password,
        phoneNumber,
        address,
        position,
      } = req.body;
      const newUser = await User.create({
        ...req.body,
      });
      res.status(201).json({ message: "Successfully creating new user" });
    } catch (err) {
      next(err);
    }
  }

  static async loginAdmin(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: { email },
      });
      if (!user) return next({ name: "UserNotFound" });
      if (user.role != "Super Admin" && user.role != "Admin") {
        return next({ name: "NotAdmin" });
      }
      if (!verifyPassword(password, user.password)) {
        return next({ name: "UserNotFound" });
      }
      const token = signPayload({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.status(200).json({ message: "Login success", access_token: token });
    } catch (err) {
      next(err);
    }
  }

  static async loginAllUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: { email },
      });
      if (!user) return next({ name: "UserNotFound" });
      if (!verifyPassword(password, user.password)) {
        return next({ name: "UserNotFound" });
      }
      const token = signPayload({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.status(200).json({ message: "Login success", access_token: token });
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const response = await User.findAll();
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  static async getAllUsersDetails(req, res, next) {
    try {
      const response = await User.findAll({
        include: [
          {
            model: OfficialLetter,
            include: [
              {
                model: Reimbursement,
              },
            ],
          },
        ],
      });
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const response = await User.findByPk(id);
      if (!response) return next({ name: "UserNotFound" });
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const {
        firstName,
        lastName,
        role,
        email,
        password,
        phoneNumber,
        address,
        position,
      } = req.body;
      const { id } = req.params;
      const findUser = await User.findByPk(id);
      if (!findUser) return next({ name: "UserNotFound" });
      const updateUser = await User.update(
        {
          ...req.body,
        },
        {
          where: { id },
        }
      );
      res
        .status(200)
        .json({ message: `Successfully updating user ${findUser.id}` });
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const findUser = await User.findByPk(id);
      if (!findUser) return next({ name: "UserNotFound" });

      const findLetter = await OfficialLetter.findOne({
        where: { UserId: id },
      });

      const deleteUser = await User.destroy({
        where: { id },
        transaction: t,
      });

      const deletedLetter = await OfficialLetter.destroy({
        where: { UserId: id },
        transaction: t,
      });

      const deletedReimbursement = await Reimbursement.destroy({
        where: { OfficialLetterId: findLetter.id },
        transaction: t,
      });

      await t.commit();
      res
        .status(200)
        .json({ message: `Successfully deleting user ${findUser.id}` });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
}

module.exports = UserController;
