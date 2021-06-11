const { assert } = require('chai');
const mocha = require('mocha');
const {describe} = mocha.describe;
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedOutput);
  });

  it('should return true when a non-existen email been passed', () => {
    const user = getUserByEmail(testUsers, 'very@bad.com');
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});