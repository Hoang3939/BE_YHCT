import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Expert' })
export class Expert {
  @PrimaryGeneratedColumn('uuid', { name: 'expertId' })
  expertId!: string;

  @Column({ name: 'accountId', type: 'uniqueidentifier' })
  accountId!: string;

  @Column({ name: 'expertCode', type: 'nvarchar', length: 50 })
  expertCode!: string;
}
