export const TYPES = {
  // Database
  DatabaseConnection: Symbol.for("DatabaseConnection"),

  // Services
  UserService: Symbol.for("UserService"),
  UserInfoService: Symbol.for("UserInfoService"),
  AuthService: Symbol.for("AuthService"),

  // Controllers
  UserController: Symbol.for("UserController"),
  GymController: Symbol.for("GymController"),

  // Repository
  Repository: Symbol.for("Repository"),

  // Others
  Caller: Symbol.for("CallerService"),
  Logger: Symbol.for("Logger"),
  ErrorHandler: Symbol.for("ErrorHandler"),
};
