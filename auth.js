import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRETKEY;
if (!secret) {
  console.error("You must set the SECRETKEY env variable!");
  process.exit(1);
}

import { User } from "./models.js";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { hash } from "crypto";

/**
 * hash a password using sha256 and then with salted bcrypt
 * @param {string} password
 * @returns {string} hashed password
 */
function hashPassword(password) {
  const sha256d = hash("sha256", password);
  return bcryptjs.hashSync(sha256d);
}

/**
 * @param {string} userPassword hashed password to compare against
 * @param {string} password
 * @returns {boolean} whether the two passwords match
 */
function comparePassword(userPassword, password) {
  const sha256d = hash("sha256", password);
  return bcryptjs.compareSync(sha256d, userPassword);
}

/**
 * attempt to register new user
 * @param {string} name
 * @param {string} password
 * @returns {Promise<string|User>} error message or newly created user
 */
export const Register = async (name, password) => {
  if (name == "" || password == "") return "Nem lehet üres neved vagy jelszód!";
  const existingUser = await User.findOne({ where: { name: name } });
  if (existingUser) return `Már létezik egy felhasználó a "${name}" névvel!`;
  const newUser = await User.create({
    name: name,
    password: hashPassword(password),
  });
  return newUser;
};

/**
 * attempt to login
 * @param {string} name
 * @param {string} password
 * @returns {Promise<string|User>} error message or logged in user
 */
export const Login = async (name, password) => {
  if (name == "" || password == "") return "Nem lehet üres neved vagy jelszód!";
  const existingUser = await User.findOne({ where: { name: name } });
  if (!existingUser) return `Nem létezik" ${name}" névvel felhasználó.`;
  if (!comparePassword(existingUser.password, password)) return "Rossz jelszó!";
  return existingUser;
};

/**
 * obtain new JWT for given user
 * @param {User} user
 * @returns {string} JWT
 */
export const ObtainToken = (user) => {
  return JWT.sign({ id: user.id }, secret, { expiresIn: "1y" });
};

/**
 * validate a JWT token
 * @param {string} token
 * @returns {Promise<User>} user, if token was valid
 */
export const ValidateToken = async (token) => {
  return await User.findByPk(JWT.verify(token, secret).id);
};
