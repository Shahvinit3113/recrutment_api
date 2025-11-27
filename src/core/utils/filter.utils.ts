import { Filter } from "@/data/filters/filter";

/**
 * Utility functions for Filter operations
 */
export class FilterUtils {
    /**
     * Get the calculated offset for database queries
     * @param filter Filter object
     * @returns The OFFSET value for SQL queries
     */
    static getOffset(filter: Filter): number {
        const page = filter.Page && filter.Page > 0 ? filter.Page : 1;
        const pageSize = FilterUtils.getPageSize(filter);
        return (page - 1) * pageSize;
    }

    /**
     * Get validated page size (ensures it doesn't exceed maximum)
     * @param filter Filter object
     * @returns Validated page size
     */
    static getPageSize(filter: Filter): number {
        const maxPageSize = 100;
        const defaultPageSize = 20;

        if (!filter.PageSize || filter.PageSize <= 0) {
            return defaultPageSize;
        }

        return Math.min(filter.PageSize, maxPageSize);
    }

    /**
     * Check if pagination is enabled
     * @param filter Filter object
     * @returns true if pagination parameters are set
     */
    static isPaginated(filter: Filter): boolean {
        return filter.Page !== undefined && filter.PageSize !== undefined;
    }
}
