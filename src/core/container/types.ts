export const TYPES = {
  // Database
  DatabaseConnection: Symbol.for("DatabaseConnection"),

  // Services
  UserService: Symbol.for("UserService"),
  GymService: Symbol.for("GymService"),

  // Controllers
  UserController: Symbol.for("UserController"),
  GymController: Symbol.for("GymController"),

  // Repository
  Resposity: Symbol.for("Resposity"),
  GymRepository: Symbol.for("GymRepository"),
  UserRepository: Symbol.for("UserRepository"),

  // Others
  Caller: Symbol.for("CallerService"),
  Logger: Symbol.for("Logger"),
  ErrorHandler: Symbol.for("ErrorHandler"),
};
