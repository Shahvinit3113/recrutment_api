export const TYPES = {
  // Database
  DatabaseConnection: Symbol.for("DatabaseConnection"),
  UnitOfWork: Symbol.for("UnitOfWork"),

  // Services
  UserService: Symbol.for("UserService"),
  UserInfoService: Symbol.for("UserInfoService"),
  AuthService: Symbol.for("AuthService"),
  TaskService: Symbol.for("TaskService"),
  PositionsService: Symbol.for("PositionsService"),
  OrganizationService: Symbol.for("OrganizationService"),
  DepartmentService: Symbol.for("DepartmentService"),
  FormTemplateService: Symbol.for("FormTemplateService"),
  FormSectionService: Symbol.for("FormSectionService"),
  FormFieldService: Symbol.for("FormFieldService"),

  // Repository
  Repository: Symbol.for("Repository"),

  // Others
  Caller: Symbol.for("CallerService"),
  Logger: Symbol.for("Logger"),
  ErrorHandler: Symbol.for("ErrorHandler"),
};
