import { UserModel } from './userModel';

describe('UserModel', () => {
  let model: UserModel;

  beforeEach(() => {
    model = new UserModel();
  });

  it('should create an instance', () => {
    expect(model).toBeTruthy();
  });

  it('should have default email as empty string', () => {
    expect(model.email).toBe('');
  });

  it('should have default password as empty string', () => {
    expect(model.password).toBe('');
  });

  it('should have default id as 0', () => {
    expect(model.id).toBe(0);
  });

  it('should allow setting email', () => {
    model.email = 'test@gmail.com';
    expect(model.email).toBe('test@gmail.com');
  });

  it('should allow setting password', () => {
    model.password = 'SecurePass1!';
    expect(model.password).toBe('SecurePass1!');
  });

  it('should allow setting id', () => {
    model.id = 42;
    expect(model.id).toBe(42);
  });
});
