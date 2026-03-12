import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Account } from './entities/account.entity';
import { UserProfile } from './entities/user-profile.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepository: Repository<RevokedToken>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const email = dto.email.trim().toLowerCase();
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const existing = await this.accountRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const account = this.accountRepository.create({
      email,
      passwordHash,
      role: 'User',
      status: 'Pending',
    });

    const savedAccount = await this.accountRepository.save(account);

    const profile = this.userProfileRepository.create({
      accountId: savedAccount.accountId,
      fullName: dto.fullName,
      totalQuestions: 0,
      totalContributions: 0,
    });

    const savedProfile = await this.userProfileRepository.save(profile);

    return {
      message: 'Account created. Verification pending.',
      accountId: savedAccount.accountId,
      userId: savedProfile.userId,
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Invalid verification token');
    }

    const account = await this.accountRepository.findOne({
      where: { status: 'Pending' },
      order: { createdAt: 'DESC' },
    });

    if (!account) {
      throw new BadRequestException('Invalid verification token');
    }

    account.status = 'Active';
    await this.accountRepository.save(account);

    return { message: 'Account activated' };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const account = await this.accountRepository.findOne({ where: { email } });
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (account.status !== 'Active') {
      throw new UnauthorizedException('Account not active');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { accountId: account.accountId },
    });

    if (profile) {
      profile.lastLoginAt = new Date();
      await this.userProfileRepository.save(profile);
    }

    const token = await this.jwtService.signAsync({
      sub: profile?.userId ?? account.accountId,
      email: account.email,
      role: account.role,
      accountId: account.accountId,
    });

    return {
      token,
      role: account.role,
      redirect: '/app',
    };
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException('Token required');
    }

    const exists = await this.revokedTokenRepository.findOne({
      where: { token },
    });
    if (!exists) {
      await this.revokedTokenRepository.save({ token });
    }

    return { message: 'Logged out', redirect: '/' };
  }

  async isTokenRevoked(token: string) {
    const revoked = await this.revokedTokenRepository.findOne({
      where: { token },
    });
    return Boolean(revoked);
  }

  private generateToken() {
    return [...Array(32)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }
}
