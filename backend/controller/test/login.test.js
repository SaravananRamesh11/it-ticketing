// login.test.js
const { checkUser,validatePassword,generateToken} = require('../function/login'); // adjust path
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const bcrypt = require('bcrypt');

// Mock modules
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken'); 


// --- checkUser tests ---
test('throws error if employeeId not found', async () => {
  User.findOne.mockResolvedValue(null);
  await expect(checkUser('1234')).rejects.toThrow('Invalid Employee ID or password');
});

test('returns user if employeeId exists', async () => {
  const fakeUser = { employeeId: 'VISTA1234', name: 'John' };
  User.findOne.mockResolvedValue(fakeUser);
  const user = await checkUser('VISTA1234');
  expect(user).toBe(fakeUser);
});

// --- validatePassword tests ---
test('throws error if password does not match', async () => {
  bcrypt.compare.mockResolvedValue(false);
  await expect(validatePassword('wrongpass', 'hashedpassword'))
    .rejects.toThrow('Invalid Employee ID or password');
});

test('returns true if password matches', async () => {
  bcrypt.compare.mockResolvedValue(true);
  const result = await validatePassword('correctpass', 'hashedpassword');
  expect(result).toBe(true);
});

test('throws error if hashedPassword is missing', async () => {
  await expect(validatePassword('any', null))
    .rejects.toThrow('Password not set for user');
});


//-----jwt sign function-------

test('calls jwt.sign with correct payload and secret', () => {
  const fakeUser = { role: 'admin', _id: '123', employeeId: 'VISTA1234' };
  const fakeToken = 'fake.jwt.token';

  jwt.sign.mockReturnValue(fakeToken);

  const token = generateToken(fakeUser);

  expect(jwt.sign).toHaveBeenCalledWith(
    { role: 'admin', id: '123', employeeId: 'VISTA1234' },
    process.env.JWT_SECRET || 'igiuug3erq',
    { expiresIn: '1h' }
  );
  expect(token).toBe(fakeToken);
});

test('throws error if user is not provided', () => {
  expect(() => generateToken(null)).toThrow('User data is required');
});

