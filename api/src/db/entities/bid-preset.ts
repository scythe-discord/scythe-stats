import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import BidGame from './bid-game';
import BidPresetSetting from './bid-preset-setting';

@Entity()
export default class BidPreset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  position: number;

  @OneToMany(
    () => BidPresetSetting,
    (bidPresetSetting) => bidPresetSetting.bidPreset,
    { eager: true }
  )
  bidPresetSettings: BidPresetSetting[];

  @OneToMany(() => BidGame, (bidGame) => bidGame.bidPreset)
  bidGames: BidGame[];

  @Column({ type: 'boolean', unique: true, nullable: true })
  default: boolean | null;
}
