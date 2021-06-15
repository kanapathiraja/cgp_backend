import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CgpArticles } from './cgp_articles.entity';
import { SubtopicTags } from './subtopic-tags.entity';
import { Subtopics } from './subtopics.entity';
import { Specialties } from './specialties.entity';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'cgp_articles_subtopics' })
export class CgpArticlesSubtopics {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @IsNotEmpty()
  @Column({ type: 'boolean', name: 'status', default: 1 })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    select: false,
    nullable: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    select: false,
    nullable: true,
  })
  updatedAt: Date;

  @ManyToOne(
    (type) => CgpArticles,
    (cgpArticles) => cgpArticles.cgpArticlesSubtopics,
  )
  @JoinColumn({ name: 'article_id', referencedColumnName: 'id' })
  cgpArticles: CgpArticles;

  @ManyToOne((type) => Subtopics, (subtopics) => subtopics.cgpArticlesSubtopics)
  @JoinColumn({ name: 'subtopic_id', referencedColumnName: 'id' })
  subtopics: Subtopics;
}
