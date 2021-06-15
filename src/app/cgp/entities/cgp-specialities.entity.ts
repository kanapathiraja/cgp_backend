import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Cgp } from './cgp.entity';
import { Specialties } from './specialties.entity';

@Entity({ name: 'cgp_specialities' })
export class CgpSpecialities {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // 0 = INACTIVE , 1 = ACTIVE
  @Column({ type: 'integer', name: 'status', default: 1 })
  status: number;

  @ManyToOne((type) => Cgp, (cgp) => cgp.cgpSpecialities)
  @JoinColumn({ name: 'cgp_id', referencedColumnName: 'id' })
  cgp: Cgp;

  @ManyToOne(
    (type) => Specialties,
    (specialties) => specialties.cgpSpecialities,
  )
  @JoinColumn({ name: 'speciality_id', referencedColumnName: 'id' })
  specialties: Specialties;
}
