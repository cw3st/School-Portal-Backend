const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  regNum: {
    type: String
  },
  role: {
    type: String
  },
  password: {
    type: String
  },
  confirmPassword: {
    type: String
  },
  currentLevel: {
    type: String
  },
  gpa: {
    type: String
  },
  department: {
    type: String
  },
  course1:{
    type: String
  },
  course2:{
    type: String
  },
  course3: {
    type: String
  },
  course4:{
    type: String
  },
  registered:{
    type: String
  },
  result1:{
  type: String
  },
  result2:{
    type: String
  },
  result3:{
    type: String
  },
  result4:{
    type: String
  },
  notregistered: {
    type: String
  },
  paid: {
    type: String
  },
  notpaid: {
    type: String
  }
});

module.exports = mongoose.model("Users", userSchema);
