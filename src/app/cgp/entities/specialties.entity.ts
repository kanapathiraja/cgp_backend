import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { CgpSpecialities } from './cgp-specialities.entity';
import { Subtopics } from './subtopics.entity';
import { SubtopicTags } from './subtopic-tags.entity';
import { CgpArticlesTags } from './cgp-articles-tags.entity';
import { CgpArticlesSpecialities } from "./cgp-articles-specialities.entity";

@Entity({ name: 'specialties' })
export class Specialties {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: string;

  @IsNotEmpty()
  @Column({ type: 'text', name: 'specialty_name', nullable: true })
  specialtyName: string;

  // 0 = INACTIVE , 1 = ACTIVE
  @IsNotEmpty()
  @Column({ type: 'boolean', name: 'active', default: 1 })
  active: boolean;

  @Column({ type: 'integer', name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ type: 'integer', name: 'updated_by', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', select: false })
  updatedAt: Date;

  @Column({ type: 'text', name: 'title', nullable: true })
  title: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @OneToMany(
    (type) => CgpSpecialities,
    (cgpSpecialities) => cgpSpecialities.specialties,
    { cascade: true },
  )
  cgpSpecialities: CgpSpecialities[];

  @OneToMany((type) => Subtopics, (subtopics) => subtopics.specialties)
  subtopics: Subtopics[];

  @OneToMany((type) => SubtopicTags, (subtopicTags) => subtopicTags.specialties)
  subtopicTags: SubtopicTags[];

  @OneToMany(
    (type) => CgpArticlesSpecialities,
    (cgpArticlesSpecialities) => cgpArticlesSpecialities.specialties,
  )
  cgpArticlesSpecialities: CgpArticlesSpecialities[];
}
