import { BaseRepository } from "./baseRepository";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { Gym } from "@/types/gym";

interface CreateGymData {
  owner_id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  operating_hours?: any;
  amenities?: any;
  subscription_plans?: any;
}

interface UpdateGymData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  operating_hours?: any;
  amenities?: any;
  subscription_plans?: any;
  is_active?: boolean;
}

export class GymRepository extends BaseRepository<Gym> {
  constructor() {
    super("gyms");
  }

  async createGym(gymData: CreateGymData): Promise<Gym> {
    const { insertId } = await this.create(gymData);
    const gym = await this.findById(insertId);

    if (!gym) {
      throw new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        500,
        "Failed to create gym"
      );
    }

    return gym;
  }

  async updateGym(id: number, gymData: UpdateGymData): Promise<Gym> {
    const existingGym = await this.findById(id);
    if (!existingGym) {
      throw new AppError(ErrorCodes.RECORD_NOT_FOUND, 404, "Gym not found");
    }

    await this.updateById(id, gymData);
    const updatedGym = await this.findById(id);

    if (!updatedGym) {
      throw new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        500,
        "Failed to update gym"
      );
    }

    return updatedGym;
  }

  async findGymsByOwner(ownerId: number): Promise<Gym[]> {
    return await this.findMany(
      { owner_id: ownerId, is_active: true },
      { orderBy: [{ field: "created_at", direction: "DESC" }] }
    );
  }

  async findGymWithDetails(id: number): Promise<Gym | null> {
    const query = `
      SELECT g.*, u.first_name as owner_first_name, u.last_name as owner_last_name,
             COUNT(DISTINCT m.id) as total_members,
             COUNT(DISTINCT t.id) as total_trainers
      FROM gyms g
      JOIN users u ON g.owner_id = u.id
      LEFT JOIN members m ON g.id = m.gym_id AND m.is_active = true
      LEFT JOIN trainers t ON g.id = t.gym_id AND t.is_available = true
      WHERE g.id = ? AND g.is_active = true
      GROUP BY g.id
    `;

    return await this.executor.selectOne<Gym>(query, [id]);
  }

  async searchGyms(
    searchTerm: string,
    city?: string,
    limit: number = 20
  ): Promise<Gym[]> {
    let query = `
      SELECT g.*, u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM gyms g
      JOIN users u ON g.owner_id = u.id
      WHERE g.is_active = true
        AND (g.name LIKE ? OR g.description LIKE ?)
    `;

    const values = [`%${searchTerm}%`, `%${searchTerm}%`];

    if (city) {
      query += " AND g.city = ?";
      values.push(city);
    }

    query += " ORDER BY g.name ASC LIMIT ?";
    values.push(limit.toString());

    return await this.executeRawQuery<Gym[]>(query, values);
  }

  async getGymsByCity(city: string, limit: number = 50): Promise<Gym[]> {
    return await this.findMany(
      { city, is_active: true },
      {
        orderBy: [{ field: "name", direction: "ASC" }],
        limit,
      }
    );
  }

  async getGymStatistics(gymId: number): Promise<any> {
    const query = `
      SELECT 
        g.id,
        g.name,
        COUNT(DISTINCT m.id) as total_members,
        COUNT(DISTINCT CASE WHEN m.membership_end_date > CURDATE() THEN m.id END) as active_members,
        COUNT(DISTINCT t.id) as total_trainers,
        COUNT(DISTINCT ge.id) as total_equipment,
        AVG(tr.rating) as avg_trainer_rating
      FROM gyms g
      LEFT JOIN members m ON g.id = m.gym_id
      LEFT JOIN trainers t ON g.id = t.gym_id
      LEFT JOIN gym_equipment ge ON g.id = ge.gym_id AND ge.status = 'available'
      LEFT JOIN trainers tr ON g.id = tr.gym_id
      WHERE g.id = ? AND g.is_active = true
      GROUP BY g.id
    `;

    return await this.executor.selectOne(query, [gymId]);
  }
}
