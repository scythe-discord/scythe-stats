import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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
    (bidPresetSetting) => bidPresetSetting.bidPreset
  )
  bidPresetSettings: BidPresetSetting[];
}
