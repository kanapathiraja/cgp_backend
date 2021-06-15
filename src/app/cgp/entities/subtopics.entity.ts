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
import { Specialties } from './specialties.entity';
import { CgpSpecialities } from './cgp-specialities.entity';
import { CgpSubtopics } from './cgp-subtopics.entity';
import { SubtopicTags } from './subtopic-tags.entity';
import { CgpArticlesTags } from './cgp-articles-tags.entity';
import { CgpArticlesSubtopics } from './cgp-articles-subtopics.entity';

@Entity({ name: 'subtopics' })
export class Subtopics {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: string;

  @IsNotEmpty()
  @Column({ type: 'text', name: 'subtopic_title', nullable: true })
  subtopicTitle: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

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

  @ManyToOne((type) => Specialties, (specialties) => specialties.subtopics)
  @JoinColumn({ name: 'specialty_id', referencedColumnName: 'id' })
  specialties: Specialties;

  @OneToMany((type) => CgpSubtopics, (cgpSubtopics) => cgpSubtopics.subtopics, {
    cascade: true,
  })
  cgpSubtopics: CgpSubtopics[];

  @OneToMany(
    (type) => CgpArticlesSubtopics,
    (cgpArticlesSubtopics) => cgpArticlesSubtopics.subtopics,
  )
  cgpArticlesSubtopics: CgpArticlesSubtopics[];
}
