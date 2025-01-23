/**
 * Utility functions for handling JSON fields in SQLite
 */
export class JsonField {
  /**
   * Convert a value to a JSON string for storage in SQLite
   */
  static serialize(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return JSON.stringify(value);
  }

  /**
   * Parse a JSON string from SQLite back to its original form
   */
  static deserialize<T>(value: string | null): T | null {
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error deserializing JSON field:', error);
      return null;
    }
  }
}
