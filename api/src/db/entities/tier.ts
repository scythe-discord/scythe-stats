import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import MatComboTier from './mat-combo-tier';

@Entity()
export default class Tier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  rank: number;

  @OneToMany(() => MatComboTier, (matComboTier) => matComboTier.tier)
  matComboTiers: MatComboTier[];
}
