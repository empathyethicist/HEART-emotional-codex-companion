// Client-side EMID generation utilities
import { nanoid } from "nanoid";

export interface EmidComponents {
  userPrefix: string;
  emotionFamily: string;
  timestamp: string;
  uniqueId: string;
}

export class EmidGenerator {
  private static instance: EmidGenerator;
  
  private constructor() {}
  
  static getInstance(): EmidGenerator {
    if (!EmidGenerator.instance) {
      EmidGenerator.instance = new EmidGenerator();
    }
    return EmidGenerator.instance;
  }

  // Generate a new EMID following the format: USR009-EMOTION-TIMESTAMP-ID-XXX
  generateEmid(emotionFamily: string, variantCode?: string): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const shortId = nanoid(6).toLowerCase();
    
    // If we have a specific variant code (like JOY-007), append the numerical portion
    if (variantCode && variantCode.includes('-')) {
      const numericPart = variantCode.split('-')[1]; // Extract "007" from "JOY-007"
      return `USR009-${emotionFamily.toUpperCase()}-${timestamp}Z-${shortId}-${numericPart}`;
    }
    
    return `USR009-${emotionFamily.toUpperCase()}-${timestamp}Z-${shortId}`;
  }

  // Parse an existing EMID into its components
  parseEmid(emid: string): EmidComponents | null {
    const pattern = /^(USR\d+)-([A-Z]+)-(\d{8}T\d{6}Z)-([a-z0-9]+)$/;
    const match = emid.match(pattern);
    
    if (!match) {
      return null;
    }
    
    return {
      userPrefix: match[1],
      emotionFamily: match[2],
      timestamp: match[3],
      uniqueId: match[4]
    };
  }

  // Validate EMID format
  validateEmid(emid: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!emid) {
      errors.push('EMID cannot be empty');
      return { isValid: false, errors };
    }
    
    const components = this.parseEmid(emid);
    
    if (!components) {
      errors.push('Invalid EMID format. Expected: USR009-EMOTION-TIMESTAMP-ID');
      return { isValid: false, errors };
    }
    
    // Validate timestamp format
    const timestampPattern = /^\d{8}T\d{6}Z$/;
    if (!timestampPattern.test(components.timestamp)) {
      errors.push('Invalid timestamp format in EMID');
    }
    
    // Validate emotion family (basic check)
    if (components.emotionFamily.length < 2) {
      errors.push('Emotion family too short in EMID');
    }
    
    // Validate unique ID
    if (components.uniqueId.length !== 6) {
      errors.push('Invalid unique ID length in EMID');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Extract timestamp from EMID and convert to readable format
  getTimestampFromEmid(emid: string): Date | null {
    const components = this.parseEmid(emid);
    if (!components) {
      return null;
    }
    
    try {
      // Convert from YYYYMMDDTHHMMSSZ to ISO format
      const timestamp = components.timestamp;
      const year = timestamp.substring(0, 4);
      const month = timestamp.substring(4, 6);
      const day = timestamp.substring(6, 8);
      const hour = timestamp.substring(9, 11);
      const minute = timestamp.substring(11, 13);
      const second = timestamp.substring(13, 15);
      
      const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
      return new Date(isoString);
    } catch (error) {
      return null;
    }
  }

  // Generate a batch of EMIDs for bulk operations
  generateBatchEmids(emotionFamily: string, count: number): string[] {
    const emids: string[] = [];
    
    for (let i = 0; i < count; i++) {
      emids.push(this.generateEmid(emotionFamily));
      // Small delay to ensure unique timestamps
      if (i < count - 1) {
        const now = Date.now();
        while (Date.now() === now) {
          // Wait for next millisecond
        }
      }
    }
    
    return emids;
  }

  // Format EMID for display with optional highlighting
  formatEmidForDisplay(emid: string, highlightComponent?: keyof EmidComponents): string {
    const components = this.parseEmid(emid);
    if (!components) {
      return emid;
    }
    
    const parts = [
      components.userPrefix,
      components.emotionFamily,
      components.timestamp,
      components.uniqueId
    ];
    
    return parts.join('-');
  }

  // Check if EMID belongs to current session (within last hour)
  isRecentEmid(emid: string): boolean {
    const timestamp = this.getTimestampFromEmid(emid);
    if (!timestamp) {
      return false;
    }
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return timestamp > oneHourAgo;
  }
}

export const emidGenerator = EmidGenerator.getInstance();

// Utility functions for common EMID operations
export const generateEmid = (emotionFamily: string, variantCode?: string): string => {
  return emidGenerator.generateEmid(emotionFamily, variantCode);
};

export const validateEmid = (emid: string): boolean => {
  return emidGenerator.validateEmid(emid).isValid;
};

export const parseEmid = (emid: string): EmidComponents | null => {
  return emidGenerator.parseEmid(emid);
};

export const getEmidTimestamp = (emid: string): Date | null => {
  return emidGenerator.getTimestampFromEmid(emid);
};
