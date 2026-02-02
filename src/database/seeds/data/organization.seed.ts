import { Organization } from '@/data/entities/organization';
import { SeedDefinition } from '../runners';
import { Utility } from '@/core/utils/common.utils';

/**
 * Default organization for development and testing
 */
export const DEFAULT_ORG_ID = 'org-default-001';

/**
 * Default organization seed data
 */
export const defaultOrganization: Organization = {
  Uid: DEFAULT_ORG_ID,
  OrgId: DEFAULT_ORG_ID,
  Name: 'Default Organization',
  Description: 'System default organization for development',
  LogoUrl: '',
  Phone: '',
  Email: 'info@default-org.local',
  Owner: 'System',
  Address: '',
  OrgSite: '',
  IsActive: true,
  IsDeleted: false,
  CreatedOn: new Date(),
  CreatedBy: 'system',
  UpdatedOn: null,
  UpdatedBy: null,
  DeletedOn: null,
};

/**
 * Organization seed definition
 */
export const organizationSeed: SeedDefinition<Organization> = {
  tableName: 'Organization',
  data: [defaultOrganization],
  upsertKeys: ['Uid'],
};
