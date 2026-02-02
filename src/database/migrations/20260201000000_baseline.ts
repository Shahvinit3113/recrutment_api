import { Knex } from 'knex';

/**
 * BASELINE MIGRATION
 * 
 * This migration captures the existing database schema.
 * It uses IF NOT EXISTS checks to be safe on existing databases.
 * 
 * For new databases: Creates all tables
 * For existing databases: Skips existing tables
 * 
 * Note: Adjust this migration based on your actual current database schema.
 */
export async function up(knex: Knex): Promise<void> {
  console.log('📦 Running baseline migration...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // ORGANIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('Organization'))) {
    await knex.schema.createTable('Organization', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('Name', 255).notNullable();
      table.text('Description').nullable();
      table.string('LogoUrl', 500).nullable();
      table.string('Phone', 20).nullable();
      table.string('Email', 255).nullable();
      table.string('Owner', 255).nullable();
      table.text('Address').nullable();
      table.string('OrgSite', 500).nullable();
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created Organization table');
  } else {
    console.log('  ⏭️  Organization table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('Users'))) {
    await knex.schema.createTable('Users', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('Email', 255).notNullable().unique();
      table.string('Password', 255).notNullable();
      table.string('Role', 50).defaultTo('Unknown');
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created Users table');
  } else {
    console.log('  ⏭️  Users table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // USER INFO
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('UserInfo'))) {
    await knex.schema.createTable('UserInfo', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('UserId', 36).notNullable();
      table.string('FirstName', 100).nullable();
      table.string('LastName', 100).nullable();
      table.string('Phone', 20).nullable();
      table.text('Address').nullable();
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();

      // Foreign key (optional - can be added later)
      // table.foreign('UserId').references('Uid').inTable('Users').onDelete('CASCADE');
    });
    console.log('  ✅ Created UserInfo table');
  } else {
    console.log('  ⏭️  UserInfo table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPARTMENT
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('Department'))) {
    await knex.schema.createTable('Department', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('Name', 255).notNullable();
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created Department table');
  } else {
    console.log('  ⏭️  Department table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POSITIONS
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('Positions'))) {
    await knex.schema.createTable('Positions', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('Name', 255).notNullable();
      table.text('Description').nullable();
      table.string('DepartmentId', 36).nullable();
      table.string('ApplicationTemplateId', 36).nullable();
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created Positions table');
  } else {
    console.log('  ⏭️  Positions table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('Task'))) {
    await knex.schema.createTable('Task', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('Name', 255).notNullable();
      table.text('Description').nullable();
      table.string('UserName', 255).nullable();
      table.string('Stack', 50).defaultTo('Web');
      table.timestamp('StartDate').nullable();
      table.timestamp('EndDate').nullable();
      table.string('Status', 50).defaultTo('Active');
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created Task table');
  } else {
    console.log('  ⏭️  Task table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM TEMPLATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('FormTemplate'))) {
    await knex.schema.createTable('FormTemplate', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('Name', 255).notNullable();
      table.text('Description').nullable();
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created FormTemplate table');
  } else {
    console.log('  ⏭️  FormTemplate table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('FormSection'))) {
    await knex.schema.createTable('FormSection', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('FormTemplateId', 36).notNullable();
      table.string('Title', 255).notNullable();
      table.integer('Order').defaultTo(0);
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created FormSection table');
  } else {
    console.log('  ⏭️  FormSection table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM FIELD
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('FormField'))) {
    await knex.schema.createTable('FormField', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('FormSectionId', 36).notNullable();
      table.string('Label', 255).notNullable();
      table.string('Type', 50).notNullable();
      table.boolean('IsRequired').defaultTo(false);
      table.text('Options').nullable();
      table.integer('Order').defaultTo(0);
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created FormField table');
  } else {
    console.log('  ⏭️  FormField table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPLICATION
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('Application'))) {
    await knex.schema.createTable('Application', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('UserId', 36).nullable();
      table.string('PositionId', 36).nullable();
      table.string('Status', 50).defaultTo('Submitted');
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created Application table');
  } else {
    console.log('  ⏭️  Application table already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMAIL TEMPLATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (!(await knex.schema.hasTable('EmailTemplate'))) {
    await knex.schema.createTable('EmailTemplate', (table) => {
      table.string('Uid', 36).primary();
      table.string('OrgId', 36).notNullable().index();
      table.string('Name', 255).notNullable();
      table.string('Subject', 500).notNullable();
      table.text('Body').notNullable();
      table.boolean('IsActive').defaultTo(true);
      table.boolean('IsDeleted').defaultTo(false).index();
      table.timestamp('CreatedOn').defaultTo(knex.fn.now());
      table.string('CreatedBy', 36).nullable();
      table.timestamp('UpdatedOn').nullable();
      table.string('UpdatedBy', 36).nullable();
      table.timestamp('DeletedOn').nullable();
    });
    console.log('  ✅ Created EmailTemplate table');
  } else {
    console.log('  ⏭️  EmailTemplate table already exists');
  }

  console.log('\n✅ Baseline migration complete!\n');
}

/**
 * Rollback the baseline migration
 * 
 * WARNING: This will drop all tables!
 * Only use in development or when you want to completely reset the database.
 */
export async function down(knex: Knex): Promise<void> {
  console.log('📦 Rolling back baseline migration...\n');

  // Drop tables in reverse order (respecting potential foreign keys)
  const tables = [
    'EmailTemplate',
    'Application',
    'FormField',
    'FormSection',
    'FormTemplate',
    'Task',
    'Positions',
    'Department',
    'UserInfo',
    'Users',
    'Organization',
  ];

  for (const tableName of tables) {
    if (await knex.schema.hasTable(tableName)) {
      await knex.schema.dropTable(tableName);
      console.log(`  ✅ Dropped ${tableName} table`);
    } else {
      console.log(`  ⏭️  ${tableName} table does not exist`);
    }
  }

  console.log('\n✅ Rollback complete!\n');
}
