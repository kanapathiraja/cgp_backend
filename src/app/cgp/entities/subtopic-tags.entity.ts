import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CgpTags } from './cgp-tags.entity';
import { Subtopics } from './subtopics.entity';
import { CgpArticlesTags } from './cgp-articles-tags.entity';
import { Specialties } from './specialties.entity';

@Entity({ name: 'subtopic_tags' })
export class SubtopicTags {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: string;

  @Column({ type: 'varchar', name: 'tag_title', nullable: true })
  tagTitle: string;

  // 0 = INACTIVE , 1 = ACTIVE
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

  @OneToMany((type) => CgpTags, (cgpTags) => cgpTags.subtopicTags, {
    cascade: true,
  })
  cgpTags: CgpTags[];

  @ManyToOne((type) => Specialties, (specialties) => specialties.subtopicTags)
  @JoinColumn({ name: 'specialty_id', referencedColumnName: 'id' })
  specialties: Specialties;

  @OneToMany(
    (type) => CgpArticlesTags,
    (cgpArticlesTags) => cgpArticlesTags.subtopicTags,
    { cascade: true },
  )
  cgpArticlesTags: CgpArticlesTags[];
}
