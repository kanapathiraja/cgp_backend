import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn, OneToMany
} from "typeorm";
import { Cgp, CgpStatus } from './cgp.entity';
import { Appointments } from '../../appointment/entities/appointment.entity';

export enum Roles {
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
  DIRECTOR = 'DIRECTOR',
}

@Entity({ name: 'cgp_teams' })
export class CgpTeams {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', name: 'firstname', nullable: true })
  firstname: string;

  @Column({ type: 'varchar', name: 'lastname', nullable: true })
  lastname: string;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.COLLABORATOR })
  role: Roles;

  @Column({ type: 'varchar', name: 'designation', nullable: true })
  designation: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'text', name: 'banner_url', nullable: true })
  bannerUrl: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // 0 = INACTIVE , 1 = ACTIVE
  @Column({ type: 'integer', name: 'status', default: 0 })
  status: number;

  @Column({ name: 'address_complement', length: 100, nullable: true })
  addressComplement: string;

  @Column({ name: 'address_type', length: 100, nullable: true })
  addressType: string;

  @Column({ name: 'address_number', length: 100, nullable: true })
  addressNumber: string;

  @Column({ name: 'address_street', length: 100, nullable: true })
  addressStreet: string;

  @Column({ type: 'varchar', name: 'city', nullable: true })
  city: string;

  @Column({ name: 'country', length: 100, nullable: true })
  country: string;

  @Column({ name: 'postal_code', length: 100, nullable: true })
  postalCode: string;

  @Column({ type: 'text', name: 'address', nullable: true })
  address: string;

  @Column({ type: 'boolean', name: 'active', default: true, nullable: true })
  active: boolean;

  @Column({ type: 'text', name: 'contact_id', nullable: true })
  contactId: string;

  @ManyToOne((type) => Cgp)
  @JoinColumn({ name: 'cgp_id', referencedColumnName: 'id' })
  cgp: Cgp;

  @OneToMany(
    (type) => Appointments,
    (appointments) => appointments.cgpTeams,
    { cascade: true },
  )
  appointments: Appointments[];
}
