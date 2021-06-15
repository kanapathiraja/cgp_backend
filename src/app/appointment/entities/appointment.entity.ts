import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { CgpTeams } from '../../cgp/entities/cgp-teams.entity';
import { Users } from '../../users/entities/users.entity';
import { Cgp } from '../../cgp/entities/cgp.entity';

export enum AppointmentStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity({ name: 'appointments' })
export class Appointments {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'appointment_type', length: 100, nullable: true })
  appointmentType: string;

  @Column({ type: 'text', name: 'reason', nullable: true })
  reason: string;

  @Column({ name: 'date', length: 100, nullable: true })
  date: string;

  @Column({ name: 'slot_start_time', length: 100, nullable: true })
  slotStartTime: string;

  @Column({ name: 'slot_end_time', length: 100, nullable: true })
  slotEndTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'integer', name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ type: 'integer', name: 'updated_by', nullable: true })
  updatedBy: number;

  @ManyToOne((type) => Cgp, (cgp) => cgp.appointments)
  @JoinColumn({ name: 'cgp_id', referencedColumnName: 'id' })
  cgp: Cgp;

  @ManyToOne((type) => CgpTeams, (cgpTeams) => cgpTeams.appointments)
  @JoinColumn({ name: 'teams_id', referencedColumnName: 'id' })
  cgpTeams: CgpTeams;

  @ManyToOne((type) => Users, (users) => users.appointments)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  users: Users;
}
