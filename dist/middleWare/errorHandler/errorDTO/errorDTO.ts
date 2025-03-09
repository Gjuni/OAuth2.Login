export class ErrorDTO {
    statusCode: number;
    code: number;
    description: string;
    path: string;
  
    constructor(statusCode: number, code: number, description: string, path: string) {
      this.statusCode = statusCode;
      this.code = code;
      this.description = description;
      this.path = path;
    }
  }