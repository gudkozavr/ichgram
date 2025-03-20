import jwt from 'jsonwebtoken';
import 'dotenv/config';

class JwtService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor(secretKey: string, expiresIn: string = '12h') {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  public generateToken(
    payload: Record<string, unknown>,
    expires?: string
  ): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: '1d' // Используем переданное время жизни или значение по умолчанию
    });
  }

  public verifyToken(token: string): Record<string, unknown> | null {
    try {
      return jwt.verify(token, this.secretKey) as Record<string, unknown>;
    } catch (error) {
      console.error('Invalid token:', { error: (error as Error).message });
      return null;
    }
  }
}

export default new JwtService(process.env.JWT_SECRET || 'your-secret-key');
