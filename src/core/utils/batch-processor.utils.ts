/**
 * Configuration for batch processing operations
 */
export interface BatchConfig {
    /**
     * Maximum number of items per batch
     * @default 50
     */
    batchSize?: number;

    /**
     * Delay between batches in milliseconds
     * @default 0 (no delay)
     */
    delayMs?: number;

    /**
     * Whether to continue processing on batch failure
     * @default false
     */
    continueOnError?: boolean;
}

/**
 * Result of a batch processing operation
 */
export interface BatchResult<T> {
    /**
     * Successfully processed items
     */
    successful: T[];

    /**
     * Failed items with error information
     */
    failed: Array<{ item: any; error: Error }>;

    /**
     * Total number of batches processed
     */
    totalBatches: number;

    /**
     * Total processing time in milliseconds
     */
    processingTimeMs: number;
}

/**
 * Utility class for processing large datasets in optimized batches
 * @remarks Prevents memory overflow and database connection exhaustion
 */
export class BatchProcessor {
    /**
     * Split an array into smaller chunks
     * @param items Array to chunk
     * @param size Chunk size
     * @returns Array of chunks
     */
    static chunk<T>(items: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < items.length; i += size) {
            chunks.push(items.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Process items in batches with optional delay
     * @param items Items to process
     * @param processor Function to process each batch
     * @param config Batch configuration
     * @returns Batch processing result
     */
    static async processBatch<T, R>(
        items: T[],
        processor: (batch: T[]) => Promise<R[]>,
        config?: BatchConfig
    ): Promise<BatchResult<R>> {
        const batchSize = config?.batchSize || 50;
        const delayMs = config?.delayMs || 0;
        const continueOnError = config?.continueOnError || false;

        const batches = this.chunk(items, batchSize);
        const successful: R[] = [];
        const failed: Array<{ item: any; error: Error }> = [];
        const startTime = Date.now();

        for (let i = 0; i < batches.length; i++) {
            try {
                const results = await processor(batches[i]);
                successful.push(...results);

                // Add delay between batches if specified
                if (delayMs > 0 && i < batches.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
            } catch (error) {
                if (continueOnError) {
                    // Record failures and continue
                    batches[i].forEach((item) => {
                        failed.push({ item, error: error as Error });
                    });
                } else {
                    // Stop processing and throw error
                    throw error;
                }
            }
        }

        const processingTimeMs = Date.now() - startTime;

        return {
            successful,
            failed,
            totalBatches: batches.length,
            processingTimeMs,
        };
    }

    /**
     * Process items in parallel batches (use with caution)
     * @param items Items to process
     * @param processor Function to process each batch
     * @param config Batch configuration
     * @returns Batch processing result
     */
    static async processParallelBatches<T, R>(
        items: T[],
        processor: (batch: T[]) => Promise<R[]>,
        config?: BatchConfig
    ): Promise<BatchResult<R>> {
        const batchSize = config?.batchSize || 50;
        const batches = this.chunk(items, batchSize);
        const startTime = Date.now();

        const results = await Promise.allSettled(
            batches.map((batch) => processor(batch))
        );

        const successful: R[] = [];
        const failed: Array<{ item: any; error: Error }> = [];

        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                successful.push(...result.value);
            } else {
                batches[index].forEach((item) => {
                    failed.push({ item, error: result.reason });
                });
            }
        });

        const processingTimeMs = Date.now() - startTime;

        return {
            successful,
            failed,
            totalBatches: batches.length,
            processingTimeMs,
        };
    }
}
