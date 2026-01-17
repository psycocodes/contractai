export const logger = {
  info: (message: string, ...args: any[]): void => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  
  error: (message: string, error?: any): void => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  
  warn: (message: string, ...args: any[]): void => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
};
