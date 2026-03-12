import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'revoked_tokens' })
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 512 })
  token: string;

  @CreateDateColumn()
  revokedAt: Date;
}
