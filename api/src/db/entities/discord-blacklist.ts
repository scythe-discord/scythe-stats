import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class DiscordBlacklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discordId: string;
}
