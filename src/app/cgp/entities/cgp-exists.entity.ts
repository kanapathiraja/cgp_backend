import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OpenStatus {
  pending = 'Pending',
  doneAccepted = 'Done-Accepted',
  doneRejected = 'Done-Rejected',
}

@Entity({ name: 'cgp_exists' })
export class CgpExists {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'establishment_name', length: 100, nullable: true })
  establishmentName: string;

  @Column({ type: 'text', name: 'company_address', nullable: true })
  companyAddress: string;

  @Column({ name: 'e_siret', length: 100, nullable: true })
  eSiret: string;

  @Column({ name: 'h_orias', length: 100, nullable: true })
  hOrias: string;

  @Column({ name: 'h_cif', default: 0 })
  hCif: boolean;

  @Column({ name: 'contact_number', length: 100, nullable: true })
  contactNumber: string;

  @Column({ type: 'text', name: 'email', nullable: true })
  email: string;

  @Column({ type: 'text', name: 'comment', nullable: true })
  comment: string;

  @Column({ type: 'geography', name: 'geolocation', nullable: true })
  geoLocation: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // 0 = INACTIVE , 1 = ACTIVE
  @Column({ type: 'enum', enum: OpenStatus, default: OpenStatus.pending })
  status: OpenStatus;

  @Column({ name: 'h_company_rcs_siren', length: 500, nullable: true })
  hCompanyRcsSiren: string;

  @Column({ name: 'h_coa', default: 0 })
  hCoa: boolean;

  @Column({ name: 'address_complement', length: 500, nullable: true })
  addressComplement: string;

  @Column({ name: 'address_type', length: 500, nullable: true })
  addressType: string;

  @Column({ name: 'address_number', length: 500, nullable: true })
  addressNumber: string;

  @Column({ name: 'address_street', length: 500, nullable: true })
  addressStreet: string;

  @Column({ name: 'city', length: 500, nullable: true })
  city: string;

  @Column({ name: 'country', length: 500, nullable: true })
  country: string;

  @Column({ name: 'postal_code', length: 500, nullable: true })
  postalCode: string;

  @Column({ name: 'firstname', length: 500, nullable: true })
  firstname: string;

  @Column({ name: 'lastname', length: 500, nullable: true })
  lastname: string;

  @Column({ name: 'designation', length: 500, nullable: true })
  designation: string;

  @Column({ name: 'contact_person_email', length: 500, nullable: true })
  contactPersonEmail: string;
}
