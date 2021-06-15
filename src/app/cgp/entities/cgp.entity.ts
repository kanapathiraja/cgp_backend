import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn,
    ManyToOne
} from "typeorm";
import { CgpPracticalInfo } from "./cgp-practicalInfo.entity";
import { CgpSpecialities } from "./cgp-specialities.entity";
import { CgpTeams } from "./cgp-teams.entity";
import { CgpClients } from './cgp-clients.entity';
import { CgpPartners } from './cgp-partners.entity';
import { Users } from 'src/app/users/entities/users.entity';
import { CgpSubtopics } from './cgp-subtopics.entity';
import { CgpTags } from './cgp-tags.entity';
import { CgpArticles } from './cgp_articles.entity';
import { Appointments } from '../../appointment/entities/appointment.entity';

export enum CgpStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'cgp' })
export class Cgp {
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

  @Column({ type: 'text', name: 'reason', nullable: true })
  reason: string;

  @Column({ type: 'varchar', name: 'website', nullable: true })
  website: string;

  @Column({ type: 'varchar', name: 'foundedYear', nullable: true })
  foundedYear: string;

  @Column({ type: 'text', name: 'presentation_text', nullable: true })
  presentationText: string;

  @Column({ type: 'varchar', name: 'linkedin', nullable: true })
  linkedIn: string;

  @Column({ type: 'varchar', name: 'facebook', nullable: true })
  facebook: string;

  @Column({ type: 'varchar', name: 'twitter', nullable: true })
  twitter: string;

  @Column({ type: 'text', name: 'banner_image', nullable: true })
  bannerImage: string;

  @Column({ type: 'geography', name: 'geolocation', nullable: true })
  geoLocation: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // 0 = INACTIVE , 1 = ACTIVE
  @Column({ type: 'enum', enum: CgpStatus, default: CgpStatus.PENDING })
  status: CgpStatus;

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

  @Column({ name: 'youtube', length: 500, nullable: true })
  youtube: string;

  @Column({ name: 'instagram', length: 500, nullable: true })
  instagram: string;

  @Column({ name: 'logo', length: 500, nullable: true })
  logo: string;

  @Column({ name: "visibility", default: true })
  visibility: boolean;

  @OneToMany(
    (type) => CgpSpecialities,
    (cgpSpecialities) => cgpSpecialities.cgp,
  )
  cgpSpecialities: CgpSpecialities[];

  @OneToMany(
    (type) => CgpPracticalInfo,
    (cgpPracticalInfo) => cgpPracticalInfo.cgp,
  )
  cgpPracticalInfo: CgpPracticalInfo[];

  @OneToMany((type) => CgpTeams, (cgpTeams) => cgpTeams.cgp)
  cgpTeams: CgpTeams[];

  @OneToMany((type) => CgpClients, (cgpClients) => cgpClients.cgp)
  cgpClients: CgpClients[];

  @OneToMany((type) => CgpPartners, (cgpPartners) => cgpPartners.cgp)
  cgpPartners: CgpPartners[];

  @OneToMany((type) => CgpSubtopics, (cgpSubtopics) => cgpSubtopics.cgp)
  cgpSubtopics: CgpSubtopics[];

  @OneToMany((type) => CgpTags, (cgpTags) => cgpTags.cgp)
  cgpTags: CgpTags[];

  @OneToMany((type) => CgpArticles, (cgpArticles) => cgpArticles.cgp)
  cgpArticles: CgpArticles[];

    @ManyToOne(type => Users, users => users.cgp)
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    users: Users;

  @OneToMany((type) => Appointments, (appointments) => appointments.cgp, {
    cascade: true,
  })
  appointments: Appointments[];
}
