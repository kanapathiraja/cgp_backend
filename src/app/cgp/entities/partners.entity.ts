import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";


@Entity({ name: 'partners' })
export class Partners {

  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: string;

  @Column({ type: 'text', name: 'partner_name', nullable: true })
  partnerName: string;

  @Column({ name: 'e_siret', length: 100, nullable: true })
  eSiret: string;

  // 0 = INACTIVE , 1 = ACTIVE
  @IsNotEmpty()
  @Column({ type: 'boolean', name: 'active', default: 1 })
  active: boolean;

  @Column({ type: 'integer', name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ type: 'integer', name: 'updated_by', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: true})
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: true})
  updatedAt: Date;

}